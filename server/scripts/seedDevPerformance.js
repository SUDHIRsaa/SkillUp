// Seed synthetic Performance entries for existing users (CLI script)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
const Performance = require('../models/Performance');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const users = await User.find({}).limit(200).lean();
    if (!users || users.length === 0) {
      console.log('No users found to seed performance');
      process.exit(0);
    }
    const created = [];
    for (const u of users) {
      const attempts = [];
      const days = 5 + Math.floor(Math.random() * 8);
      for (let d = 0; d < days; d++) {
        const total = 5 + Math.floor(Math.random() * 20);
        const correct = Math.floor(Math.random() * (total + 1));
        attempts.push({ date: new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().slice(0,10), topic: 'general', total, correct, accuracy: total ? (correct/total) : 0, avgTime: 10 + Math.random()*30 });
      }
      await Performance.findOneAndUpdate({ userId: u._id }, { $set: { attempts } }, { upsert: true });
      created.push(String(u._id));
    }
    console.log('Seeded Performance for', created.length, 'users');
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed', e);
    process.exit(1);
  }
})();
