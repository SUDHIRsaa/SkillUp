const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Question = require(path.join(__dirname, '..', 'models', 'Question'));

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillup';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB', uri);

  const txt = fs.readFileSync(path.join(__dirname, '..', 'last_extracted.txt'), 'utf8');
  // Split by Q<number>. markers
  const parts = txt.split(/\n(?=Q\d+\.)/g).map(s => s.trim()).filter(Boolean);
  const docs = [];
  for (const part of parts) {
    // parse question statement (first line after Qn.)
    const lines = part.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    // first line like 'Q1. The average...'
    const first = lines[0].replace(/^Q\d+\.\s*/i, '').trim();
    // find Topic and Subtopic if present
    let topic = '';
    let subtopic = '';
    for (const l of lines) {
      const m = l.match(/^Topic\s*:\s*(.+?)\s*(?:\||$)/i);
      if (m) topic = m[1].trim();
      const s = l.match(/Subtopic\s*:\s*(.+)/i);
      if (s) subtopic = s[1].trim();
    }
    // collect options lines starting with '-' or numeric markers
    const options = [];
    for (const l of lines) {
      const mo = l.match(/^[-\u2022\u2013\u2014]\s*(.+)/);
      if (mo) options.push(mo[1].trim());
    }
    // find Correct Answer line
    let correct = '';
    let explanation = '';
    for (const l of lines) {
      const mc = l.match(/^Correct Answer\s*:\s*(.+)/i);
      if (mc) correct = mc[1].trim();
      const me = l.match(/^Explanation\s*:\s*(.+)/i);
      if (me) explanation = me[1].trim();
    }
    // If options empty, try to parse lines that look like option lines without '-'
    if (options.length === 0) {
      for (const l of lines) {
        if (/^\d+\.|^[A-Da-d][\.)]/.test(l) || /^-\s*/.test(l)) {
          options.push(l.replace(/^\d+\.|^[A-Da-d][\.)]|^-\s*/, '').trim());
        }
      }
    }
    // normalize correct to index (string match)
    let correctIndex = '';
    if (correct) {
      // try match exact option text
      const idx = options.findIndex(o => o.replace(/\s+/g,' ').trim() === correct.replace(/\s+/g,' ').trim());
      if (idx >= 0) correctIndex = String(idx);
      else {
        // try if correct is like '5.6' or '1/2' and matches option
        const idx2 = options.findIndex(o => o.includes(correct));
        if (idx2 >= 0) correctIndex = String(idx2);
        else correctIndex = correct; // fallback keep as text
      }
    }

    docs.push({ statement: first, options: options.length ? options : ['', '', '', ''], correctAnswer: correctIndex || correct, explanation, difficulty: 'medium', topic, subtopic });
  }

  if (docs.length === 0) {
    console.log('No questions parsed');
    process.exit(0);
  }

  console.log('Inserting', docs.length, 'questions...');
  for (const d of docs) {
    try { await Question.create(d); } catch (e) { console.error('Insert failed', e && e.message); }
  }
  console.log('Done');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
