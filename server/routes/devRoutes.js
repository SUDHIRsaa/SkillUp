const router = require('express').Router();
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const mongoose = require('mongoose');
const Performance = require('../models/Performance');

// Dev-only: seed users + leaderboard entries for local testing (disabled)
router.post('/seed-leaderboard', async (req, res) => {
  return res.status(410).json({ ok: false, message: 'Dev seeding endpoints are disabled in this deployment' });
});

// Dev-only: seed synthetic Performance entries for existing users (disabled)
router.post('/seed-performance', async (req, res) => {
  return res.status(410).json({ ok: false, message: 'Dev seeding endpoints are disabled in this deployment' });
});

module.exports = router;
