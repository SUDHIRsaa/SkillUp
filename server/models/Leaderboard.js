// Leaderboard model
const mongoose = require('mongoose');
const LeaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  rank: { type: Number, default: null },
  college: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);