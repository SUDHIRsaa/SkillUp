// Coding Challenge model placeholder
const mongoose = require('mongoose');
const CodingChallengeSchema = new mongoose.Schema({
  statement: String,
  constraints: String,
  // Hidden test cases used on Submit
  testCases: Array,
  // Optional sample cases shown/used for Run
  sampleCases: { type: Array, default: [] },
  difficulty: String,
  tags: [String]
});
module.exports = mongoose.model('CodingChallenge', CodingChallengeSchema);