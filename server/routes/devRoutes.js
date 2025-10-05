const router = require('express').Router();
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const mongoose = require('mongoose');
const Performance = require('../models/Performance');

// Dev-only: seed users + leaderboard entries for local testing
router.post('/seed-leaderboard', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ ok: false, message: 'Not allowed in production' });

    // ensure some users exist
    let users = await User.find({}).limit(20).lean();
    if (!users || users.length === 0) {
      const created = [];
      for (let i = 1; i <= 12; i++) {
        const u = await User.create({
          name: `Test User ${i}`,
          username: `testuser${i}`,
          email: `testuser${i}@example.com`,
          college: `TestCollege${(i % 3) + 1}`
        });
        created.push(u);
      }
      users = created;
    }

    // create/update leaderboard entries for these users
    const items = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const score = Math.floor(Math.random() * 100);
      const doc = await Leaderboard.findOneAndUpdate(
        { userId: u._id },
        { $set: { score, college: u.college || '' } },
        { upsert: true, new: true }
      );
      items.push(doc);
    }

    // recalc ranks
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    for (let i = 0; i < all.length; i++) {
      await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i + 1 } });
    }

    return res.json({ ok: true, seeded: items.length, users: users.length });
  } catch (e) {
    next(e);
  }
});

// Dev-only: seed synthetic Performance entries for existing users
router.post('/seed-performance', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ ok: false, message: 'Not allowed in production' });

    const users = await User.find({}).limit(50).lean();
    if (!users || users.length === 0) return res.json({ ok: false, message: 'No users to seed' });

    const created = [];
    for (const u of users) {
      const attempts = [];
      // create 5-12 day entries
      const days = 5 + Math.floor(Math.random() * 8);
      for (let d = 0; d < days; d++) {
        const total = 5 + Math.floor(Math.random() * 20);
        const correct = Math.floor(Math.random() * (total + 1));
        attempts.push({ date: new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().slice(0,10), topic: 'general', total, correct, accuracy: total ? (correct/total) : 0, avgTime: 10 + Math.random()*30 });
      }

      const doc = await Performance.findOneAndUpdate({ userId: u._id }, { $set: { attempts } }, { upsert: true, new: true });
      created.push({ userId: u._id, attempts: attempts.length });
    }

    return res.json({ ok: true, seeded: created.length });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
