const Performance = require('../models/Performance');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  const doc = await Performance.findOne({ userId: req.user.id });
  res.json(doc || { userId: req.user.id, dailyStats: [] });
};

exports.submitAttempt = async (req, res) => {
  const { total, correct, avgTime, topic } = req.body;
  const date = new Date();
  const dayKey = date.toISOString().slice(0, 10);
  let doc = await Performance.findOne({ userId: req.user.id });
  if (!doc) doc = await Performance.create({ userId: req.user.id, dailyStats: [] });
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const idx = doc.dailyStats.findIndex(d => d.date === dayKey);
  const entry = { date: dayKey, total, correct, accuracy, avgTime };
  if (idx >= 0) doc.dailyStats[idx] = entry; else doc.dailyStats.push(entry);
  // record per-attempt topic entry
  try {
    doc.attempts = doc.attempts || [];
    doc.attempts.push({ date: dayKey, topic: topic || '', total, correct, accuracy, avgTime });
  } catch (e) {
    console.error('Failed to push attempt', e?.message || e);
  }
  await doc.save();
  try {
    // Update leaderboard: use a composite score of accuracy and total attempts
    const user = await User.findById(req.user.id).lean();
    const college = user?.college || '';
    // Determine user's total attempts across all time (sum of attempts in Performance doc)
    const totalAttempts = (doc.attempts || []).reduce((s, a) => s + (a.total || 0), 0) + (doc.dailyStats || []).reduce((s, d) => s + (d.total || 0), 0);
    // Normalize attempts to a 0..1 range using a soft cap (e.g., 50 attempts)
    const ATTEMPT_CAP = 50;
    const attemptsNorm = Math.min(1, totalAttempts / ATTEMPT_CAP);
    // Composite scoring: 70% accuracy, 30% attempts volume
    const score = Math.round((accuracy * 0.7) + (attemptsNorm * 100 * 0.3));
  if ((process.env.NODE_ENV || 'development') !== 'production') console.log(`[performance] updating leaderboard for user ${req.user.id} score=${score} accuracy=${accuracy} attempts=${totalAttempts} college=${college}`);
    await Leaderboard.findOneAndUpdate({ userId: req.user.id }, { $set: { score, college } }, { upsert: true, new: true });

    // Recalculate ranks globally and per-college
    const all = await Leaderboard.find({}).sort({ score: -1 }).lean();
    for (let i = 0; i < all.length; i++) {
      await Leaderboard.updateOne({ _id: all[i]._id }, { $set: { rank: i + 1 } });
  if (i < 5 && (process.env.NODE_ENV || 'development') !== 'production') console.log(`[performance] rank ${i+1} user=${String(all[i].userId)} score=${all[i].score}`);
    }
    // Per-college ranks: recompute only for the user's college to keep this operation small
    const userCollege = college || '';
    if (userCollege) {
      const collegeRows = await Leaderboard.find({ college: userCollege }).sort({ score: -1 }).lean();
      for (let i = 0; i < collegeRows.length; i++) {
        await Leaderboard.updateOne({ _id: collegeRows[i]._id }, { $set: { collegeRank: i + 1 } });
      }
    }
    // Recalculate ranks within colleges (store college ranks in rank field only reflects global rank; if needed, add collegeRank)
  } catch (e) {
    console.error('Failed updating leaderboard', e?.message || e);
  }
  res.json({ ok: true, stats: doc });
};
