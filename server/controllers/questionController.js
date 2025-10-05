exports.update = async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update question' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete question' });
  }
};
const Question = require('../models/Question');

// helper: generate a random MCQ object
function makeRandomMCQ(i) {
  const topics = ['math','logic','verbal','time','misc'];
  const stems = [
    'What is the result of',
    'Choose the correct option for',
    'Which of the following is true about',
    'Identify the correct answer for',
    'Compute the value of'
  ];
  const ops = ['2+2','5*3','10/2','7-3','3^2','sqrt(16)','12%5'];
  const topic = topics[i % topics.length];
  const q = `${stems[i % stems.length]} ${ops[i % ops.length]}?`;
  const choices = ['42','4','8','10'].map((c, idx) => `${c}`);
  // pick a plausible correct answer index
  const correctIndex = (i % 3) + 1;
  return {
    statement: q,
    options: choices,
    correctAnswer: choices[correctIndex] || choices[0],
    explanation: `Auto-generated example question #${i+1}`,
    difficulty: ['easy','medium','hard'][i % 3],
    topic,
    mainTopic: topic === 'math' ? 'Quantitative Aptitude' : '',
    isAptitude: true,
    availableDaily: false
  };
}

// Admin helper: bulk create 10-15 random MCQs
exports.bulkCreate = async (req, res) => {
  try {
    const min = 10, max = 15;
    let n = Number(req.body.count) || Math.floor(Math.random() * (max - min + 1)) + min;
    n = Math.max(min, Math.min(max, n));
    const docs = [];
    for (let i = 0; i < n; i++) docs.push(makeRandomMCQ(i));
    const created = await Question.insertMany(docs);
    res.status(201).json({ ok: true, created: created.length, items: created });
  } catch (e) {
    console.error('bulkCreate failed', e);
    res.status(500).json({ ok: false, message: 'Failed to bulk create questions' });
  }
};

exports.list = async (req, res) => {
  const { difficulty, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  // support filtering by main topic slug or topic identifier and subtopic id
  if (req.query.topic) filter.topic = String(req.query.topic);
  if (req.query.subtopic) filter.subtopic = String(req.query.subtopic);
  if (difficulty) filter.difficulty = difficulty;
  if (q) {
    const rx = new RegExp(String(q).trim(), 'i');
    filter.$or = [{ statement: rx }, { explanation: rx }];
  }
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
  const [items, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize),
    Question.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, limit: pageSize });
};

exports.daily = async (req, res) => {
  const { count, date } = req.query;
  const requested = Math.max(1, Math.min(20, Number(count) || 5));
  const today = new Date().toISOString().slice(0,10);
  const dayKey = (date && /^\d{4}-\d{2}-\d{2}$/.test(String(date))) ? String(date) : today;
  try {
    // If user already has a submission today, indicate completed
    const Performance = require('../models/Performance');
    if (dayKey === today) {
      const done = await Performance.findOne({ userId: req.user.id, 'dailyStats.date': today }).lean();
      if (done) return res.status(204).end();
    }
  } catch {}
  // deterministic by date: use hash of YYYY-MM-DD to offset
  const seed = dayKey.split('-').join('');
  const filter = { availableDaily: true };
  if (req.query.mainTopic) filter.mainTopic = String(req.query.mainTopic);
  const all = await Question.find(filter).limit(500);
  if (!all.length) return res.json([]);
  let idx = 0;
  for (let i=0;i<seed.length;i++) idx = (idx + seed.charCodeAt(i)) % all.length;
  const n = Math.min(requested, all.length); // ensure we don't repeat when fewer questions exist
  const out = [];
  for (let i=0;i<n;i++) out.push(all[(idx + i) % all.length]);
  res.json(out);
};

exports.create = async (req, res) => {
  const q = await Question.create(req.body);
  res.status(201).json(q);
};

exports.update = async (req, res) => {
  const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(q);
};

exports.remove = async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
