// Submission model placeholder
const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  challengeId: mongoose.Schema.Types.ObjectId,
  code: String,
  language: String,
  result: String,
  runtime: String,
  timestamp: Date
});
module.exports = mongoose.model('Submission', SubmissionSchema);