// Performance model placeholder
const mongoose = require('mongoose');
const PerformanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  // daily aggregated stats (existing)
  dailyStats: Array,
  // record individual attempts for topic-wise tracking
  attempts: [
    {
      date: { type: String }, // ISO date dayKey
      topic: { type: String },
      total: Number,
      correct: Number,
      accuracy: Number,
      avgTime: Number
    }
  ]
});
module.exports = mongoose.model('Performance', PerformanceSchema);