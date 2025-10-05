const AuditLog = require('../models/AuditLog');

exports.log = async (actor, action, meta = {}) => {
  try {
    await AuditLog.create({ adminId: actor?.id, action, timestamp: new Date(), ...meta });
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
};
