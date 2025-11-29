// ProblemVersion model placeholder
const mongoose = require('mongoose');
const ProblemVersionSchema = new mongoose.Schema({
  problemId: mongoose.Schema.Types.ObjectId,
  version: Number,
  data: Object,
  timestamp: Date
});
module.exports = mongoose.model('ProblemVersion', ProblemVersionSchema);