const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { sign } = require('../utils/jwtHelper');

exports.register = async (req, res) => {
  const started = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    // Accept both flat fields and nested `profile` object from client
    let { name, email, phone, password, username, college, year, major, profile } = req.body;
    if (profile && typeof profile === 'object') {
      college = college || profile.college;
      year = year || profile.year;
      major = major || profile.major;
      // allow username in profile payload too
      username = username || profile.username;
    }
    // Normalize inputs
    name = typeof name === 'string' ? name.trim() : name;
    // normalize email to lowercase for consistent uniqueness checks
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    username = typeof username === 'string' ? username.trim() : username;
    phone = typeof phone === 'string' ? phone.trim() : phone;

    // Check for existing users by any of the identifying fields
    const exists = await User.findOne({ $or: [
      email ? { email } : null,
      phone ? { phone } : null,
      username ? { username } : null
    ].filter(Boolean) });
    if (exists) {
      // determine which fields are actually conflicting so client can show helpful messages
      const conflicts = [];
      try {
        if (email && exists.email && String(exists.email).toLowerCase() === String(email).toLowerCase()) conflicts.push('email');
        if (phone && exists.phone && String(exists.phone) === String(phone)) conflicts.push('phone');
        if (username && exists.username && String(exists.username) === String(username)) conflicts.push('username');
      } catch (e) {
        // ignore comparison errors
      }
      console.warn('[auth/register] conflict', { conflicts, email: !!email, phone: !!phone, username: !!username });
      const msg = conflicts.length ? `${conflicts.join(', ')} already in use` : 'User already exists';
      return res.status(400).json({ message: msg, conflicts });
    }
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await User.create({ name, email, phone, username, college, year, major, passwordHash });
    // Ensure leaderboard entry exists for the new user (score 0 by default)
    try {
      await Leaderboard.findOneAndUpdate(
        { userId: user._id },
        { $set: { score: 0, college: user.college || '' } },
        { upsert: true }
      );
      // recalc global ranks quickly
      const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
      for (let i = 0; i < all.length; i++) {
        await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i + 1 } });
      }
      // recompute college ranks for the user's college if provided
      if (user.college) {
        const collegeRows = await Leaderboard.find({ college: user.college }).sort({ score: -1 }).lean();
        for (let i = 0; i < collegeRows.length; i++) {
          await Leaderboard.updateOne({ _id: collegeRows[i]._id }, { $set: { collegeRank: i + 1 } });
        }
      }
    } catch (e) {
      console.warn('[auth/register] failed to create leaderboard entry', e?.message || e);
    }
    const duration = Date.now() - started;
    console.info('[auth/register] ok', { userId: String(user._id), ms: duration });
    // generate token and return user info (so client can show profile immediately)
    const token = sign({ id: user._id, role: user.role, name: user.name });
    const lb = await Leaderboard.findOne({ userId: user._id }).lean().catch(() => null);
    const rankInfo = lb ? { rank: lb.rank || null, collegeRank: lb.collegeRank || null, score: lb.score || 0 } : { rank: null, collegeRank: null, score: 0 };
    return res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone, college: user.college, year: user.year, major: user.major, username: user.username, ...rankInfo } });
  } catch (e) {
    const duration = Date.now() - started;
    console.error('[auth/register] error', { ms: duration, err: e?.message || String(e) });
    return res.status(500).json({ message: 'Register failed' });
  }
};


exports.loginWithPassword = async (req, res) => {
  let { email, phone, username, password } = req.body;
  email = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
  phone = typeof phone === 'string' ? phone.trim() : undefined;
  username = typeof username === 'string' ? username.trim() : undefined;
  const or = [];
  if (email) or.push({ email });
  if (phone) or.push({ phone });
  if (username) or.push({ username });
  const user = await User.findOne({ $or: or });
  if (!user || !user.passwordHash) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  if (user.isBanned) return res.status(403).json({ message: 'User banned' });
  const token = sign({ id: user._id, role: user.role, name: user.name });
  // attach latest leaderboard ranks if available
  const lb = await Leaderboard.findOne({ userId: user._id }).lean().catch(() => null);
  const rankInfo = lb ? { rank: lb.rank || null, collegeRank: lb.collegeRank || null, score: lb.score || 0 } : { rank: null, collegeRank: null, score: 0 };
  res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone, college: user.college, year: user.year, major: user.major, username: user.username, ...rankInfo } });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone, college: user.college, year: user.year, major: user.major, username: user.username });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load user' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, username, email, phone, college, year, major, currentPassword, newPassword } = req.body;
    // Uniqueness checks for email/username/phone if changed
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: 'User not found' });
    const oldCollege = me.college || '';
    const or = [];
    if (email && email !== me.email) or.push({ email });
    if (username && username !== me.username) or.push({ username });
    if (phone && phone !== me.phone) or.push({ phone });
    if (or.length) {
      const exists = await User.findOne({ $or: or });
      if (exists) return res.status(400).json({ message: 'Email/Phone/Username already in use' });
    }
    me.name = name ?? me.name;
    me.username = username ?? me.username;
    me.email = email ?? me.email;
    me.phone = phone ?? me.phone;
    me.college = college ?? me.college;
    me.year = year ?? me.year;
    me.major = major ?? me.major;
    // Password change
    if (newPassword) {
      if (me.passwordHash) {
        const ok = await bcrypt.compare(currentPassword || '', me.passwordHash);
        if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
      }
      if (String(newPassword).length < 6) return res.status(400).json({ message: 'New password too short' });
      me.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    await me.save();
    // Update user's leaderboard college if profile changed
    try {
      await Leaderboard.findOneAndUpdate({ userId: me._id }, { $set: { college: me.college || '' } }, { upsert: true });
      // recompute college ranks for both old and new college (if changed)
      const newCollege = me.college || '';
      if (oldCollege && oldCollege !== newCollege) {
        const oldRows = await Leaderboard.find({ college: oldCollege }).sort({ score: -1 }).lean();
        for (let i = 0; i < oldRows.length; i++) await Leaderboard.updateOne({ _id: oldRows[i]._id }, { $set: { collegeRank: i + 1 } });
      }
      if (newCollege) {
        const newRows = await Leaderboard.find({ college: newCollege }).sort({ score: -1 }).lean();
        for (let i = 0; i < newRows.length; i++) await Leaderboard.updateOne({ _id: newRows[i]._id }, { $set: { collegeRank: i + 1 } });
      }
    } catch (e) {
      console.warn('[auth/updateProfile] failed to update leaderboard college', e?.message || e);
    }
    res.json({ id: me._id, name: me.name, role: me.role, email: me.email, phone: me.phone, college: me.college, year: me.year, major: me.major, username: me.username });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
exports.checkAvailability = async (req, res) => {
  const { email, username, phone } = req.query;
  if (!email && !username && !phone) return res.status(400).json({ message: 'email, username or phone required' });
  const q = [];
  if (email) q.push({ email });
  if (username) q.push({ username });
  if (phone) q.push({ phone });
  const existing = await User.findOne({ $or: q });
  return res.json({ available: !existing });
};
