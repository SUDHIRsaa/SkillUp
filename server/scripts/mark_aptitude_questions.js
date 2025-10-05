const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Question = require(path.join(__dirname, '..', 'models', 'Question'));

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillup';
  await mongoose.connect(uri);
  console.log('Connected to DB', uri);

  // Find recently inserted questions that look like aptitude items and tag them
  const candidates = await Question.find({}).sort({ _id: -1 }).limit(50).exec();
  let updated = 0;
  for (const q of candidates) {
    // If already tagged, skip
    if (q.isAptitude) continue;
    // Default mapping: treat these as Quantitative Aptitude
    q.mainTopic = 'Quantitative Aptitude';
    q.isAptitude = true;
    q.availableDaily = true;
    // if topic/subtopic already present, preserve; else try infer from statement/explanation
    if (!q.topic) q.topic = 'Number System';
    if (!q.subtopic) q.subtopic = '';
    // enrich notes: combine explanation and a short formula note
    const formulaNote = q.explanation ? `Explanation: ${q.explanation}` : '';
    q.notes = [`This question belongs to Quantitative Aptitude / ${q.topic}`, formulaNote].filter(Boolean).join('\n\n');
    await q.save();
    updated++;
  }
  console.log('Updated', updated, 'questions');
  process.exit(0);
}

main().catch(e=>{ console.error(e); process.exit(1); });
