const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
(async () => {
  try {
    await connectDB();
    const Leaderboard = require('../models/Leaderboard');
    const rows = await Leaderboard.find({}).sort({ score: -1 }).limit(10).lean();
    console.log('Top leaderboard rows:');
    for (const r of rows) {
      console.log({ id: String(r._id), userId: String(r.userId), score: r.score, rank: r.rank, college: r.college, collegeRank: r.collegeRank });
    }
    process.exit(0);
  } catch (e) {
    console.error('Failed to print leaderboard', e);
    process.exit(1);
  }
})();
