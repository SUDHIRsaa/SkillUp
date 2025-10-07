const router = require('express').Router();
const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const Performance = require('../models/Performance');

// constants used for scoring (keep in sync with performance scoring logic)
const ATTEMPT_CAP = 50;

// Seed leaderboard with sample entries for testing
router.post('/seed-leaderboard', async (req, res) => {
  return res.status(410).json({ ok: false, message: 'Seeding disabled in this deployment' });
});

// Refresh leaderboard ranks (recalculate global ranks)
router.post('/refresh-leaderboard', async (req, res, next) => {
  try {
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    for (let i = 0; i < all.length; i++) {
      await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i + 1 } });
    }
    return res.json({ ok: true, refreshed: all.length });
  } catch (e) {
    next(e);
  }
});

// Debug diagnostics for leaderboard health
router.get('/debug-leaderboard', async (req, res, next) => {
  try {
    const total = await Leaderboard.countDocuments();
    // find duplicate userId entries
    const dupAgg = await Leaderboard.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
      { $project: { userId: '$_id', count: 1, ids: 1, _id: 0 } }
    ]);

    // find orphaned entries where user does not exist
    const allRows = await Leaderboard.find({}).lean();
    const userIds = allRows.map((r) => r.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('_id role banned college').lean();
    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const orphaned = allRows.filter((r) => !userMap.has(String(r.userId))).map((r) => ({ id: r._id, userId: r.userId }));

    // entries pointing to admin/moderator/banned
    const badRoleEntries = [];
    for (const r of allRows) {
      const u = userMap.get(String(r.userId));
      if (!u) continue;
      if (u.role !== 'user' || u.banned) {
        badRoleEntries.push({ leaderboardId: r._id, userId: r.userId, role: u.role, banned: !!u.banned });
      }
    }

    const zeroScore = allRows.filter((r) => !r.score || r.score === 0).length;

    return res.json({
      ok: true,
      totalLeaderboardRows: total,
      duplicateUserEntries: dupAgg,
      orphanedEntries: orphaned,
      entriesWithNonUserOrBanned: badRoleEntries,
      zeroScoreRows: zeroScore
    });
  } catch (e) {
    next(e);
  }
});

// Recompute / dedupe / re-index leaderboard based on authoritative User + Performance data
router.post('/recompute-leaderboard', async (req, res, next) => {
  try {
    // fetch all legitimate users (role:user and not banned)
    const users = await User.find({ role: 'user', banned: { $ne: true } }).lean();

    // build new/updated rows for each user by computing score from Performance
    const results = [];
    for (const u of users) {
      // compute totals from Performance attempts
      const perf = await Performance.findOne({ userId: u._id }).lean();
      let totalAttempted = 0;
      let totalCorrect = 0;
      if (perf) {
        if (Array.isArray(perf.attempts)) {
          for (const a of perf.attempts) {
            totalAttempted += Number(a.total) || 0;
            totalCorrect += Number(a.correct) || 0;
          }
        }
        // try to consume dailyStats if attempts absent
        if (totalAttempted === 0 && Array.isArray(perf.dailyStats)) {
          for (const d of perf.dailyStats) {
            totalAttempted += Number(d.total) || 0;
            totalCorrect += Number(d.correct) || 0;
          }
        }
      }

      const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      const attemptsNorm = Math.min(1, totalAttempted / ATTEMPT_CAP);
      const score = Math.round((accuracy * 100 * 0.7) + (attemptsNorm * 100 * 0.3));

      const up = await Leaderboard.findOneAndUpdate(
        { userId: u._id },
        { $set: { score, college: u.college || '' } },
        { upsert: true, new: true }
      );
      results.push({ userId: u._id, leaderboardId: up._id, score });
    }

    // remove orphaned / admin / moderator / banned entries
    const legitUserIds = users.map((u) => String(u._id));
    const toRemove = await Leaderboard.find({ $or: [ { userId: { $exists: false } }, { userId: { $nin: legitUserIds } } ] }).select('_id userId').lean();
    const removedIds = [];
    if (toRemove && toRemove.length) {
      for (const r of toRemove) {
        removedIds.push(String(r._id));
        await Leaderboard.deleteOne({ _id: r._id });
      }
    }

    // dedupe: ensure only one entry per user (keep highest score)
    const dupGroups = await Leaderboard.aggregate([
      { $group: { _id: '$userId', ids: { $push: { id: '$_id', score: '$score' } }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    const deduped = [];
    for (const g of dupGroups) {
      // choose id with highest score, remove others
      const items = g.ids.sort((a, b) => (b.score || 0) - (a.score || 0));
      const keep = items[0].id;
      const remove = items.slice(1).map((it) => it.id);
      for (const rId of remove) {
        await Leaderboard.deleteOne({ _id: rId });
        deduped.push(String(rId));
      }
    }

    // recalc ranks global + college
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    const collegeBuckets = {};
    for (let i = 0; i < all.length; i++) {
      const row = all[i];
      await Leaderboard.updateOne({ _id: row._id }, { $set: { rank: i + 1 } });
      const col = row.college || '';
      collegeBuckets[col] = collegeBuckets[col] || [];
      collegeBuckets[col].push(row);
    }
    // set college ranks
    for (const col in collegeBuckets) {
      const arr = collegeBuckets[col].sort((a,b) => (b.score || 0) - (a.score || 0));
      for (let j = 0; j < arr.length; j++) {
        await Leaderboard.updateOne({ _id: arr[j]._id }, { $set: { collegeRank: j + 1 } });
      }
    }

    return res.json({ ok: true, recomputed: results.length, removed: removedIds.length, deduped: deduped.length });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
