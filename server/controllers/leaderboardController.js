
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const Performance = require('../models/Performance');


exports.list = async (req, res, next) => {
  try {
  // prevent client/browser caching for leaderboard responses — always return fresh ranks
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  const { scope = 'global', college } = req.query;
  // If searching by college, use case-insensitive exact match
  const filter = (scope === 'college' && college) ? { college: { $regex: `^${college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } } : {};
  // Find leaderboard entries and join user info when possible
  // If scope=college we prefer ordering by collegeRank; otherwise global score
  let sort = { score: -1 };
  if (scope === 'college' && college) sort = { collegeRank: 1 };
    let items = await Leaderboard.find(filter).sort(sort).limit(100).lean();

    // Attach user info for the rows and filter out non-user roles (admins/mods) or banned users
    const attachAndFilter = async (rows) => {
      const userIds = rows.map(i => i.userId).filter(Boolean);
      if (!userIds.length) return [];
      const users = await User.find({ _id: { $in: userIds } }).select('name username role isBanned college').lean();
      const userMap = {};
      users.forEach(u => { userMap[String(u._id)] = u; });
      // keep only rows that map to a normal (role=user) and not banned
      return rows
        .map(item => ({ ...item, user: userMap[String(item.userId)] || null }))
        .filter(r => r.user && r.user.role === 'user' && !r.user.isBanned);
    };

  let filtered = await attachAndFilter(items);

    // If there are no leaderboard rows (or all existing rows were admin/moderator/banned), attempt to bootstrap from existing users
    if (!filtered || filtered.length === 0) {
      console.info('[leaderboard] no rows found, attempting to bootstrap from users');
      try {
          // only include normal users (exclude admins/moderators and banned accounts)
          const users = await User.find({ role: 'user', isBanned: { $ne: true } }).select('name username college').limit(500).lean();
        if (users && users.length) {
          const created = [];
          for (const u of users) {
              // derive score from historical performance when available
              let score = 0;
              try {
                const perf = await Performance.findOne({ userId: u._id }).lean();
                if (perf) {
                  // compute total correct and total attempted
                  let totalCorrect = 0;
                  let totalAttempted = 0;
                  if (Array.isArray(perf.attempts)) {
                    for (const a of perf.attempts) {
                      totalCorrect += Number(a.correct || 0);
                      totalAttempted += Number(a.total || 0);
                    }
                  }
                  if (Array.isArray(perf.dailyStats)) {
                    for (const d of perf.dailyStats) {
                      totalCorrect += Number(d.correct || 0);
                      totalAttempted += Number(d.total || 0);
                    }
                  }
                  const accuracy = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
                  const ATTEMPT_CAP = 50;
                  const attemptsNorm = Math.min(1, totalAttempted / ATTEMPT_CAP);
                  score = Math.round((accuracy * 0.7) + (attemptsNorm * 100 * 0.3));
                }
              } catch (e) {
                console.warn('[leaderboard] failed to compute historical score for', String(u._id), e?.message || e);
              }
              // upsert so we don't duplicate if something was created concurrently
              const doc = await Leaderboard.findOneAndUpdate(
                { userId: u._id },
                { $setOnInsert: { userId: u._id, score: score || 0, college: u.college || '' } },
                { upsert: true, new: true }
              );
              // if the row existed but score is outdated (0) and we computed a score, update it
              if (doc && (doc.score === 0 && (score || 0) > 0)) {
                await Leaderboard.updateOne({ _id: doc._id }, { $set: { score } });
              }
              created.push(doc);
          }
          // recalc ranks
          const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
          for (let i = 0; i < all.length; i++) {
            await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i + 1 } });
          }
          items = await Leaderboard.find(filter).sort({ score: -1 }).limit(100).lean();
          console.info(`[leaderboard] bootstrapped ${created.length} rows`);
        } else {
          console.info('[leaderboard] no users found to bootstrap from');
        }
      } catch (e) {
        console.error('[leaderboard] bootstrap failed', e?.message || e);
      }
    }
    // Re-attach and filter after possible bootstrap
    items = await Leaderboard.find(filter).sort(sort).limit(100).lean();
    filtered = await attachAndFilter(items);
    // If requesting college scope and collegeRank is missing for returned rows, compute collegeRank for that college
    if (scope === 'college' && college && filtered && filtered.length) {
      const missing = filtered.some(r => r.collegeRank === undefined || r.collegeRank === null);
      if (missing) {
        // compute and persist college ranks for matching college
        const collegeRows = await Leaderboard.find({ college: { $regex: `^${college.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, $options: 'i' } }).sort({ score: -1 }).lean();
        for (let i = 0; i < collegeRows.length; i++) {
          await Leaderboard.updateOne({ _id: collegeRows[i]._id }, { $set: { collegeRank: i + 1 } });
        }
        // reload items and filtered
        items = await Leaderboard.find(filter).sort({ collegeRank: 1 }).limit(100).lean();
        filtered = await attachAndFilter(items);
      }
    }
    if (!filtered || filtered.length === 0) return res.json([]);

    // tidy up fields
    const out = filtered.map(item => ({ _id: item._id, user: { name: item.user.name, username: item.user.username }, score: item.score || 0, college: item.college || '', rank: item.rank || null, collegeRank: item.collegeRank || null }));
    return res.json(out);
  } catch (e) {
    next(e);
  }
};
