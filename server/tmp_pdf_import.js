require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const connectDB = require('./config/db');
const Question = require('./models/Question');

// Robust MCQ parser: finds question blocks like "1. What ...?\nA. ...\nB. ...\nC. ...\nD. ...\nAnswer: B"
function parseMCQsFromText(text) {
  const out = [];
  // Normalize spaces
  const norm = text.replace(/\u00A0/g, ' ').replace(/\r/g, '\n');
  // Use a regex to capture question number + statement + four options + optional answer
  // This regex is intentionally permissive to handle linebreaks and variations.
  const blockRe = /(?:^|\n)\s*(?:\d{1,3}[.)\s]+)?([\s\S]{10,}?\?)\s*(?:\n|\r|\r\n)\s*(?:A[.)\s]+)([\s\S]*?)(?:\n)\s*(?:B[.)\s]+)([\s\S]*?)(?:\n)\s*(?:C[.)\s]+)([\s\S]*?)(?:\n)\s*(?:D[.)\s]+)([\s\S]*?)(?:\n|$)(?:[\s\S]*?Answer[:\s]*([A-D]|[a-d]|1|2|3|4))?/gmi;
  let m;
  while ((m = blockRe.exec(norm)) !== null) {
    let stmt = m[1] ? m[1].trim() : '';
    // Clean leading numbering from statement
    stmt = stmt.replace(/^[0-9]+[.)\s]+/, '').trim();
    const optA = (m[2] || '').trim().replace(/^[Aa][.)\s]*/, '').trim();
    const optB = (m[3] || '').trim().replace(/^[Bb][.)\s]*/, '').trim();
    const optC = (m[4] || '').trim().replace(/^[Cc][.)\s]*/, '').trim();
    const optD = (m[5] || '').trim().replace(/^[Dd][.)\s]*/, '').trim();
    let answerRaw = (m[6] || '').toString().trim();
    let correct = '';
    if (answerRaw) {
      const map = { 'A': optA, 'B': optB, 'C': optC, 'D': optD, '1': optA, '2': optB, '3': optC, '4': optD };
      const key = answerRaw[0].toUpperCase();
      correct = map[key] || '';
    }
    out.push({ statement: stmt, options: [optA, optB, optC, optD], correctAnswer: correct });
  }

  // If we didn't find any blocks with the regex, try a fallback: find question lines and collect following A-D lines
  if (out.length === 0) {
    const lines = norm.split(/\n/).map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/\?$|\?\s*$/)) {
        // look ahead for A/B/C/D
        const a = lines[i+1] && lines[i+1].match(/^[Aa][.)\s]+(.*)$/) ? RegExp.$1.trim() : null;
        const b = lines[i+2] && lines[i+2].match(/^[Bb][.)\s]+(.*)$/) ? RegExp.$1.trim() : null;
        const c = lines[i+3] && lines[i+3].match(/^[Cc][.)\s]+(.*)$/) ? RegExp.$1.trim() : null;
        const d = lines[i+4] && lines[i+4].match(/^[Dd][.)\s]+(.*)$/) ? RegExp.$1.trim() : null;
        if (a && b && c && d) {
          // check for Answer line after options
          let ans = '';
          if (lines[i+5] && lines[i+5].match(/Answer[:\s]*([A-D1-4a-d])/i)) ans = RegExp.$1;
          const map = { 'A': a, 'B': b, 'C': c, 'D': d, '1': a, '2': b, '3': c, '4': d };
          const correct = ans ? (map[ans.toUpperCase()] || '') : '';
          out.push({ statement: line.replace(/^[0-9]+[.)\s]+/, '').trim(), options: [a,b,c,d], correctAnswer: correct });
        }
      }
    }
  }

  return out;
}

async function importPdfQuestions() {
  try {
    // Prefer working from the extracted text file to simplify parsing
    const textFile = path.join(__dirname, 'tmp', 'pdf_text.txt');
    let text = '';
    if (fs.existsSync(textFile)) {
      console.log('Using extracted text file:', textFile);
      text = fs.readFileSync(textFile, 'utf8');
    } else {
      const pdfPath = path.resolve('c:/Users/sudhi/Downloads/4dVSbAcGcyEum3Zr4JxVKf.pdf');
      if (!fs.existsSync(pdfPath)) {
        console.error('PDF not found at', pdfPath);
        process.exit(1);
      }
      const buffer = fs.readFileSync(pdfPath);
      const data = await pdf(buffer);
      text = data.text || '';
    }
    const parsed = parseMCQsFromText(text);
    console.log('Parsed questions from PDF (regex fallback):', parsed.length);
    // If the regex-based parser didn't find the expected blocks, try splitting by Q<number>)
    if (parsed.length < 5) {
      const blocks = text.split(/\n(?=Q\d+\))/g).map(b => b.trim()).filter(Boolean);
      const blocks2 = [];
      for (const b of blocks) {
        // remove leading Qn) if present
        const bb = b.replace(/^Q\d+\)\s*/i, '').trim();
        blocks2.push(bb);
      }
      const parsed2 = [];
      for (const blk of blocks2) {
        // split lines
        const lines = blk.split(/\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) continue;
        // statement: lines until a line that starts with A.
        let stmtLines = [];
        let idx = 0;
        while (idx < lines.length && !/^[A|a][\.)\s]/.test(lines[idx])) {
          stmtLines.push(lines[idx]); idx++; }
        const statement = stmtLines.join(' ').replace(/^\d+[.)\s]+/, '').trim();
        // find options A-D
        const opts = { A: '', B: '', C: '', D: '' };
        for (; idx < lines.length; idx++) {
          const line = lines[idx];
          const m = line.match(/^([A-Da-d])[\.)\s]+(.*)$/);
          if (m) {
            const key = m[1].toUpperCase();
            opts[key] = m[2].trim();
            continue;
          }
          // Answer line
          const ma = line.match(/^Answer[:\s]*([A-D1-4a-d])/i);
          if (ma) {
            // attach answer marker at the end
            opts._ans = ma[1];
            break;
          }
        }
        // If answer not found yet, search remaining lines
        if (!opts._ans) {
          for (let j = idx; j < lines.length; j++) {
            const ma = lines[j].match(/^Answer[:\s]*([A-D1-4a-d])/i);
            if (ma) { opts._ans = ma[1]; break; }
          }
        }
        // map answer to text
        let correct = '';
        if (opts._ans) {
          const k = opts._ans[0].toUpperCase();
          const map = { 'A': opts.A, 'B': opts.B, 'C': opts.C, 'D': opts.D, '1': opts.A, '2': opts.B, '3': opts.C, '4': opts.D };
          correct = map[k] || '';
        }
        // only accept if statement and options present
        if (statement && opts.A && opts.B && opts.C && opts.D) {
          parsed2.push({ statement, options: [opts.A, opts.B, opts.C, opts.D], correctAnswer: correct });
        }
      }
      if (parsed2.length > parsed.length) {
        console.log('Parsed questions from Q-split:', parsed2.length);
        parsed.splice(0, parsed.length, ...parsed2);
      }
    }
    console.log('Final parsed count:', parsed.length);
    if (!parsed.length) {
      console.error('No MCQs parsed. Aborting.');
      process.exit(1);
    }

    await connectDB();
    let inserted = 0;
    for (const p of parsed) {
      // Build payload
      const payload = {
        statement: p.statement,
        options: p.options,
        correctAnswer: p.correctAnswer || '',
        explanation: '',
        difficulty: 'medium',
        mainTopic: 'verbal',
        topic: 'grammar'
      };
      // Upsert to avoid duplicates: match by exact statement
      const exists = await Question.findOne({ statement: payload.statement }).lean();
      if (exists) continue;
      await Question.create(payload);
      inserted++;
    }
    console.log('Inserted new questions:', inserted);
    // final count for verbal/grammar
    const total = await Question.countDocuments({ mainTopic: 'verbal', topic: 'grammar' });
    console.log('Total grammar questions in DB:', total);
    return { parsed: parsed.length, inserted, total };
  } catch (e) {
    console.error('Import failed:', e?.message || e);
    process.exit(1);
  }
}

(async () => {
  const res = await importPdfQuestions();
  console.log('Done:', res);
  process.exit(0);
})();
