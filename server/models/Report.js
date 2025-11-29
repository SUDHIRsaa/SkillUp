// Report model placeholder
const mongoose = require('mongoose');
const ReportSchema = new mongoose.Schema({
  reportedBy: mongoose.Schema.Types.ObjectId,
  targetType: String,
  reason: String,
  status: String
});
module.exports = mongoose.model('Report', ReportSchema);