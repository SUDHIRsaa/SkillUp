const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Performance = require('../models/Performance');
const Leaderboard = require('../models/Leaderboard');

const ATTEMPT_CAP = 50;

(async () => {
  try {
    await connectDB();
    const users = await User.find({ role: 'user', isBanned: { $ne: true } }).lean();
    console.log('Found users to recompute:', users.length);
    const results = [];
    for (const u of users) {
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
      await Leaderboard.findOneAndUpdate({ userId: u._id }, { $set: { score, college: u.college || '' } }, { upsert: true, new: true });
      results.push({ userId: u._id, score });
    }
    // remove orphaned/admin rows
    const legitUserIds = users.map(u => String(u._id));
    const orphans = await Leaderboard.find({ userId: { $nin: legitUserIds } }).lean();
    for (const o of orphans) {
      await Leaderboard.deleteOne({ _id: o._id });
    }
    // dedupe keep highest
    const dupGroups = await Leaderboard.aggregate([
      { $group: { _id: '$userId', ids: { $push: { id: '$_id', score: '$score' } }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    for (const g of dupGroups) {
      const items = g.ids.sort((a,b) => (b.score || 0) - (a.score || 0));
      const remove = items.slice(1).map(i => i.id);
      for (const r of remove) await Leaderboard.deleteOne({ _id: r });
    }
    // recalc global and college ranks
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    for (let i = 0; i < all.length; i++) await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i+1 } });
    const byCollege = {};
    for (const r of all) {
      const c = r.college || '';
      byCollege[c] = byCollege[c] || [];
      byCollege[c].push(r);
    }
    for (const c in byCollege) {
      const arr = byCollege[c].sort((a,b) => (b.score||0) - (a.score||0));
      for (let j = 0; j < arr.length; j++) await Leaderboard.updateOne({ _id: arr[j]._id }, { $set: { collegeRank: j+1 } });
    }

    console.log('Recompute complete. Rows updated:', results.length);
    process.exit(0);
  } catch (e) {
    console.error('Recompute failed', e);
    process.exit(1);
  }
})();
