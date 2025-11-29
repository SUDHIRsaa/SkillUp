// AuditLog model placeholder
const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  adminId: mongoose.Schema.Types.ObjectId,
  action: String,
  timestamp: Date
});
module.exports = mongoose.model('AuditLog', AuditLogSchema);