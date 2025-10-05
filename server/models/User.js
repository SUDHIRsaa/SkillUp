const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  college: { type: String },
  year: { type: String },
  major: { type: String },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  performanceStats: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);