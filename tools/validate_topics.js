const fs = require('fs');
const path = require('path');
const src = path.resolve(__dirname, '..', 'client', 'src', 'content', 'aptitude', 'topicsIndex.js');
const text = fs.readFileSync(src, 'utf8');

function findBetween(str, startIdx, openChar, closeChar) {
  let depth = 0;
  let i = startIdx;
  for (; i < str.length; i++) {
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) return str.slice(startIdx, i + 1);
    }
  }
  return null;
}

// crude parse: locate each subtopics: [ ... ] block inside topics array
const topicsArrMatch = text.match(/const\s+topics\s*=\s*\[/m);
if (!topicsArrMatch) {
  console.error('Could not find topics array'); process.exit(2);
}
const topicsStart = topicsArrMatch.index + topicsArrMatch[0].length - 1;
const topicsBlock = findBetween(text, topicsStart, '[', ']');
if (!topicsBlock) { console.error('Failed to extract topics block'); process.exit(2); }

// find each "subtopics:" occurrence and extract the following array
const report = [];
let idx = 0;
while (true) {
  const subIdx = topicsBlock.indexOf('subtopics:', idx);
  if (subIdx === -1) break;
  const arrayStart = topicsBlock.indexOf('[', subIdx);
  const arrText = findBetween(topicsBlock, arrayStart, '[', ']');
  if (!arrText) break;
  // split top-level objects by searching for "{" at depth 1
  const objs = [];
  let i = 0;
  while (i < arrText.length) {
    if (arrText[i] === '{') {
      const obj = findBetween(arrText, i, '{', '}');
      if (!obj) break;
      objs.push(obj);
      i += obj.length;
    } else i++;
  }
  // for each obj, count formulas and mcqs
  objs.forEach(o => {
    const titleMatch = o.match(/title:\s*['"]([^'\"]+)['"]/);
    const idMatch = o.match(/id:\s*['"]([^'\"]+)['"]/);
    const name = titleMatch ? titleMatch[1] : (idMatch ? idMatch[1] : '<unknown>');
    const formulasMatch = o.match(/formulas:\s*\[/);
    let formulasCount = 0;
    if (formulasMatch) {
      const fStart = o.indexOf('[', formulasMatch.index);
      const fBlock = findBetween(o, fStart, '[', ']');
      if (fBlock) {
        // count occurrences of '{' at depth 1 in fBlock
        let depth = 0; let count = 0;
        for (let j=0;j<fBlock.length;j++) {
          if (fBlock[j] === '{') { depth++; if (depth === 1) count++; }
          else if (fBlock[j] === '}') depth--;
        }
        formulasCount = count;
      }
    }
    const mcqsMatch = o.match(/mcqs:\s*\[/);
    let mcqsCount = 0;
    if (mcqsMatch) {
      const mStart = o.indexOf('[', mcqsMatch.index);
      const mBlock = findBetween(o, mStart, '[', ']');
      if (mBlock) {
        // count occurrences of '{' at depth 1
        let depth = 0; let count = 0;
        for (let j=0;j<mBlock.length;j++) {
          if (mBlock[j] === '{') { depth++; if (depth === 1) count++; }
          else if (mBlock[j] === '}') depth--;
        }
        mcqsCount = count;
      }
    }
    report.push({ name, formulasCount, mcqsCount });
  });
  idx = arrayStart + arrText.length;
}

console.log('Subtopic validation report:');
let problems = 0;
report.forEach(r => {
  const fOK = r.formulasCount >= 5;
  const mOK = r.mcqsCount >= 5;
  if (!fOK || !mOK) problems++;
  console.log(`- ${r.name}: formulas=${r.formulasCount} mcqs=${r.mcqsCount}${(!fOK||!mOK)?' <-- needs more':''}`);
});
if (problems === 0) console.log('\nAll subtopics have >=5 formulas and >=5 MCQs.');
else console.log(`\nFound ${problems} subtopics missing required content.`);
process.exit(problems === 0 ? 0 : 1);
