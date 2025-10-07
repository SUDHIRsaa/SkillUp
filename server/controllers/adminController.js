const Performance = require('../models/Performance');
exports.listAptitudeSubmissions = async (req, res) => {
  try {
    const { q, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (from || to) {
      filter['dailyStats.date'] = {};
      if (from) filter['dailyStats.date'].$gte = from;
      if (to) filter['dailyStats.date'].$lte = to;
    }
    if (q) {
      // Search by user name/email later after join; first get all then filter by user
    }

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit)));

    const [itemsRaw, total] = await Promise.all([
      Performance.find(filter).sort({ _id: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).lean(),
      Performance.countDocuments(filter),
    ]);
    const userIds = itemsRaw.map(i => i.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();
    const userMap = Object.fromEntries(users.map(u => [String(u._id), u.name || u.email || '']));
    let items = itemsRaw.map(i => ({ ...i, userName: userMap[String(i.userId)] || String(i.userId) }));
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      items = items.filter(i => rx.test(i.userName) || rx.test(String(i.userId)));
    }
    res.json({ items, total, page: pageNum, limit: pageSize });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load aptitude submissions' });
  }
};
const User = require('../models/User');
const Question = require('../models/Question');
const AptitudeSubtopic = require('../models/AptitudeSubtopic');
// Avoid requiring client-side ES module directly. Provide a small fallback seed used to
// initialize aptitude subtopics if the DB is empty.
const TOPICS_SEED = [
  { slug: 'quantitative-aptitude', title: 'Quantitative Aptitude', subtopics: [
    'Number System (Divisibility, HCF & LCM, Remainders)',
    'Simplifications and Approximations',
    'Ratio, Proportion & Averages',
    'Percentage, Profit & Loss, Simple & Compound Interest',
    'Time, Speed & Distance, Boats & Streams',
    'Time & Work, Pipes & Cisterns',
    'Permutations & Combinations, Probability',
    'Mixtures & Alligations',
    'Data Interpretation (Bar Graphs, Pie Charts, Tables)',
    'Geometry, Mensuration (2D & 3D Shapes)',
    'Algebra (Equations, Inequalities)'
  ] }
];

exports.dashboard = async (req, res) => {
  const [users, questions] = await Promise.all([
    User.countDocuments(),
    Question.countDocuments(),
  ]);

  // Build last 14 days range (UTC)
  const days = 14;
  const end = new Date();
  const endUTC = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));
  const startUTC = new Date(endUTC); startUTC.setUTCDate(startUTC.getUTCDate() - (days - 1)); startUTC.setUTCHours(0,0,0,0);
  const dateFmt = (d) => d.toISOString().slice(0,10);
  const allDates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startUTC); d.setUTCDate(startUTC.getUTCDate() + i); return dateFmt(d);
  });

  // Aptitude daily unique solvers from Performance.dailyStats.date
  const aptitudeAgg = await Performance.aggregate([
    { $unwind: '$dailyStats' },
    { $match: { 'dailyStats.date': { $gte: dateFmt(startUTC), $lte: dateFmt(endUTC) } } },
    { $project: { userId: 1, date: '$dailyStats.date' } },
    { $group: { _id: { date: '$date', userId: '$userId' } } },
    { $group: { _id: '$_id.date', users: { $sum: 1 } } },
  ]).catch(()=>[]);

  // Coding feature removed in this deployment; report zeros
  const codingAgg = [];

  // New users per day from User.createdAt
  const usersAgg = await User.aggregate([
    { $match: { createdAt: { $gte: startUTC, $lte: endUTC } } },
    { $project: { date: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } } } },
    { $group: { _id: '$date', count: { $sum: 1 } } },
  ]).catch(()=>[]);

  const aptitudeMap = Object.fromEntries(aptitudeAgg.map(a => [a._id, a.users]));
  const codingMap = Object.fromEntries(codingAgg.map ? codingAgg.map(a => [a._id, a.users]) : []);
  const newUsersMap = Object.fromEntries(usersAgg.map(a => [a._id, a.count]));

  const comparison = allDates.map(d => ({ date: d, aptitude: aptitudeMap[d] || 0, coding: codingMap[d] || 0 }));
  const newUsersDaily = allDates.map(d => ({ date: d, users: newUsersMap[d] || 0 }));

  res.json({ users, questions, comparison, newUsersDaily });
};

exports.listUsers = async (req, res) => {
  const { q, role, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(String(q).trim(), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  if (role) filter.role = role;
  if (status === 'banned') filter.isBanned = true;
  if (status === 'active') filter.isBanned = { $ne: true };

  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit)));

  const [items, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, limit: pageSize });
};

exports.banUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true });
  res.json(user);
};

exports.unbanUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true });
  res.json(user);
};

exports.listSubmissions = async (req, res) => {
  // Submissions/coding feature removed in this deployment
  return res.status(410).json({ message: 'Submissions have been removed from this deployment.' });
};

// List or create aptitude subtopics. Seed from client topic data when empty.
exports.listAptitudeSubtopics = async (req, res) => {
  try {
    let items = await AptitudeSubtopic.find({}).sort({ mainTopic: 1, topic: 1, subtopic: 1 }).lean();
    if (!items || items.length === 0) {
      // Seed from client TOPICS if available
      const seed = [];
      for (const t of TOPICS_SEED) {
        const main = t.title || t.slug || 'Quantitative Aptitude';
        for (const s of (t.subtopics || [])) {
          seed.push({ mainTopic: main, topic: t.slug || t.title || '', subtopic: s, slug: `${t.slug || t.title}-${s.replace(/[^a-z0-9]+/ig,'-').toLowerCase()}` });
        }
      }
      if (seed.length > 0) {
        await AptitudeSubtopic.insertMany(seed);
        items = await AptitudeSubtopic.find({}).sort({ mainTopic: 1, topic: 1, subtopic: 1 }).lean();
      }
    }
    res.json({ items });
  } catch (e) {
    console.error('listAptitudeSubtopics error', e);
    res.status(500).json({ message: 'Failed to load aptitude subtopics' });
  }
};

exports.createAptitudeSubtopic = async (req, res) => {
  try {
    const { mainTopic = 'Quantitative Aptitude', topic = '', subtopic = '', slug } = req.body || {};
    const doc = new AptitudeSubtopic({
      mainTopic,
      topic,
      subtopic,
      slug: slug || `${(topic || mainTopic).toString().replace(/[^a-z0-9]+/ig, '-').toLowerCase()}-${subtopic.toString().replace(/[^a-z0-9]+/ig,'-').toLowerCase()}`,
    });
    if (req.user && req.user._id) doc.updatedBy = req.user._id;
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (e) {
    console.error('createAptitudeSubtopic error', e);
    res.status(500).json({ message: 'Failed to create subtopic' });
  }
};

exports.updateAptitudeSubtopic = async (req, res) => {
  try {
    const id = req.params.id;
    const body = { notes: req.body.notes || '' };
    if (req.user && req.user._id) body.updatedBy = req.user._id;
    const updated = await AptitudeSubtopic.findByIdAndUpdate(id, body, { new: true });
    res.json(updated);
  } catch (e) {
    console.error('updateAptitudeSubtopic error', e);
    res.status(500).json({ message: 'Failed to update subtopic' });
  }
};

// Upsert: if subtopic exists (by mainTopic+topic+subtopic) update notes, otherwise create it
exports.upsertAptitudeSubtopic = async (req, res) => {
  try {
    const { mainTopic = 'Quantitative Aptitude', topic = '', subtopic = '', notes = '', slug } = req.body || {};
    const filter = { mainTopic, topic, subtopic };
    const update = { notes };
    if (req.user && req.user._id) update.updatedBy = req.user._id;
    const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
    const doc = await AptitudeSubtopic.findOneAndUpdate(filter, { $set: update, $setOnInsert: { slug: slug || `${(topic || mainTopic).toString().replace(/[^a-z0-9]+/ig, '-').toLowerCase()}-${subtopic.toString().replace(/[^a-z0-9]+/ig,'-').toLowerCase()}` } }, opts);
    res.json(doc);
  } catch (e) {
    console.error('upsertAptitudeSubtopic error', e);
    res.status(500).json({ message: 'Failed to upsert subtopic' });
  }
};
