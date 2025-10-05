const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Performance = require('../models/Performance');
const Leaderboard = require('../models/Leaderboard');

const SAMPLE_COLLEGE = 'Thakur College of Engineering and Technology';

(async () => {
  try {
    await connectDB();
    const usersToCreate = [];
    for (let i = 1; i <= 5; i++) {
      usersToCreate.push({
        name: `Sample User ${i}`,
        username: `sample${i}`,
        email: `sample${i}@example.com`,
        college: SAMPLE_COLLEGE,
        role: 'user'
      });
    }

    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 10);

    const created = [];
    for (const u of usersToCreate) {
      let user = await User.findOne({ $or: [{ email: u.email }, { username: u.username }] });
      if (user) {
        user.name = u.name;
        user.college = u.college;
        user.role = 'user';
        user.passwordHash = passwordHash;
        await user.save();
      } else {
        user = await User.create({ ...u, passwordHash });
      }
      created.push(user);
    }

    // Seed Performance entries with varying totals/correct so scores differ
    for (let i = 0; i < created.length; i++) {
      const u = created[i];
      const attempts = [];
      // make stronger users have more correct
      const days = 6;
      for (let d = 0; d < days; d++) {
        const base = 10 + i * 3; // incremental total
        const total = base + Math.floor(Math.random() * 5);
        const correct = Math.max(0, Math.floor(total * (0.5 + i * 0.1 + Math.random()*0.2)));
        attempts.push({ date: new Date(Date.now() - d * 86400000).toISOString().slice(0,10), topic: 'aptitude', total, correct, accuracy: total ? (correct/total) : 0, avgTime: 10 + Math.random()*30 });
      }
      await Performance.findOneAndUpdate({ userId: created[i]._id }, { $set: { attempts } }, { upsert: true });
    }

    // Recompute leaderboard: upsert rows and recalc ranks
    for (const u of created) {
      // compute totals
      const perf = await Performance.findOne({ userId: u._id }).lean();
      let totalAttempted = 0;
      let totalCorrect = 0;
      if (perf && Array.isArray(perf.attempts)) {
        for (const a of perf.attempts) {
          totalAttempted += Number(a.total) || 0;
          totalCorrect += Number(a.correct) || 0;
        }
      }
      const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      const ATTEMPT_CAP = 50;
      const attemptsNorm = Math.min(1, totalAttempted / ATTEMPT_CAP);
      const score = Math.round((accuracy * 100 * 0.7) + (attemptsNorm * 100 * 0.3));
      await Leaderboard.findOneAndUpdate({ userId: u._id }, { $set: { score, college: u.college || '' } }, { upsert: true });
    }

    // remove orphaned entries (not necessary but safe)
    const users = await User.find({ role: 'user', isBanned: { $ne: true } }).lean();
    const legitIds = users.map(x => String(x._id));
    const orphans = await Leaderboard.find({ userId: { $nin: legitIds } }).lean();
    for (const o of orphans) await Leaderboard.deleteOne({ _id: o._id });

    // recalc global ranks
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    for (let i = 0; i < all.length; i++) await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i+1 } });

    // calc college ranks
    const buckets = {};
    for (const r of all) {
      const c = r.college || '';
      buckets[c] = buckets[c] || [];
      buckets[c].push(r);
    }
    for (const c in buckets) {
      const arr = buckets[c].sort((a,b) => (b.score||0) - (a.score||0));
      for (let j = 0; j < arr.length; j++) await Leaderboard.updateOne({ _id: arr[j]._id }, { $set: { collegeRank: j+1 } });
    }

    console.log('Created/updated users:', created.map(u => ({ username: u.username, id: String(u._id) }))); 
    console.log('Password for all sample users:', password);
    process.exit(0);
  } catch (e) {
    console.error('Seed failed', e);
    process.exit(1);
  }
})();
