const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Performance = require('../models/Performance');
const Leaderboard = require('../models/Leaderboard');

(async () => {
  try {
    await connectDB();
    const usernames = ['sample1','sample2','sample3','sample4','sample5'];
    const users = await User.find({ username: { $in: usernames } }).lean();
    if (!users || users.length === 0) {
      console.log('No sample users found');
      process.exit(0);
    }
    const ids = users.map(u => u._id);
    await User.deleteMany({ _id: { $in: ids } });
    await Performance.deleteMany({ userId: { $in: ids } });
    await Leaderboard.deleteMany({ userId: { $in: ids } });
    console.log('Removed sample users and related data:', users.map(u=>u.username));
    // Recompute ranks after removal
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    for (let i = 0; i < all.length; i++) await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i+1 } });
    // recompute college ranks
    const colleges = [...new Set(all.map(a => a.college).filter(Boolean))];
    for (const col of colleges) {
      const list = all.filter(a => (a.college || '') === col).sort((a,b) => (b.score||0) - (a.score||0));
      for (let j = 0; j < list.length; j++) await Leaderboard.updateOne({ _id: list[j]._id }, { $set: { collegeRank: j+1 } });
    }
    console.log('Recomputed ranks after cleanup');
    process.exit(0);
  } catch (e) {
    console.error('Cleanup failed', e);
    process.exit(1);
  }
})();
