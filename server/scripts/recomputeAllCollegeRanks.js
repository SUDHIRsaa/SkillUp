const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
const Leaderboard = require('../models/Leaderboard');

(async () => {
  try {
    await connectDB();
    const all = await Leaderboard.find({}).lean();
    const colleges = [...new Set(all.map(a => a.college).filter(Boolean))];
    for (const col of colleges) {
      const rows = await Leaderboard.find({ college: col }).sort({ score: -1 }).lean();
      for (let i = 0; i < rows.length; i++) {
        await Leaderboard.updateOne({ _id: rows[i]._id }, { $set: { collegeRank: i + 1 } });
      }
      console.log('Recomputed college ranks for', col, 'rows:', rows.length);
    }
    console.log('Done recomputing college ranks');
    process.exit(0);
  } catch (e) {
    console.error('Failed', e);
    process.exit(1);
  }
})();
