const topicsIndex = require('../client/src/content/aptitude/topicsIndex.js').default;
const slugify = (str='') => String(str).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
//hh
function wordsSet(str='') { return new Set(String(str||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').split(/\s+/).filter(Boolean).map(w=>w.replace(/s$/,''))); }
function findMain(main){ return topicsIndex.find(t => t.id === main || slugify(t.title||t.id)===main || (t.slug && t.slug===main)); }
function findSubtopicByParam(mt, subParam){ if(!mt || !subParam) return undefined; const stripped = String(subParam||'').replace(/\(.*?\)/g,'').trim(); const norm = slugify(stripped); const candidates = mt.subtopics||[]; for(const c of candidates){ const id=(c.id||'').toString(); const title=(c.title||'').toString(); if(!id && !title) continue; const s1 = slugify(id||title); const s2 = slugify(title||id); if(s1===norm||s2===norm) return c; } for(const c of candidates){ const id=(c.id||'').toString(); const title=(c.title||'').toString(); const s = slugify(title||id); if(!s) continue; if(norm.includes(s)||s.includes(norm)) return c; if(norm.replace(/-/g,'').includes(s.replace(/-/g,''))) return c; } const paramWords = wordsSet(stripped); let best=null, bestScore=0; for(const c of candidates){ const txt=(c.title||c.id||'').toString(); const candWords = wordsSet(txt); const intersect=[...paramWords].filter(w=>candWords.has(w)).length; const unionMax = Math.max(paramWords.size, candWords.size,1); const score = intersect/unionMax; if(score>bestScore){ bestScore=score; best=c; } } if(bestScore>=0.25) return best; for(const c of candidates){ if((c.title||'').toString().toLowerCase() === subParam.toString().toLowerCase()) return c; } return undefined; }

// expanded-text fuzzy match (same logic used by the component)
function findSubtopicByParamExpanded(mt, subParam) {
  const found = findSubtopicByParam(mt, subParam);
  if (found) return found;
  const stripped = String(subParam||'').replace(/\(.*?\)/g,'').trim();
  const paramWords = wordsSet(stripped);
  let best2 = null; let bestScore2 = 0;
  const candidates = mt.subtopics || [];
  for (const c of candidates) {
    const parts = [];
  if (c.title) parts.push(c.title);
  if (c.notes) parts.push(c.notes);
  if (Array.isArray(c.aliases)) parts.push(c.aliases.join(' '));
    if (Array.isArray(c.formulas)) {
      for (const f of c.formulas) { if (f.title) parts.push(f.title); if (Array.isArray(f.items)) parts.push(f.items.join(' ')); }
    }
    if (Array.isArray(c.mcqs)) { for (const m of c.mcqs) if (m.q) parts.push(m.q); }
    const combined = parts.join(' ');
    const candWords = wordsSet(combined);
    const intersect = [...paramWords].filter(w => candWords.has(w)).length;
    const score = paramWords.size ? (intersect / paramWords.size) : 0;
    if (score > bestScore2) { bestScore2 = score; best2 = c; }
  }
  if (bestScore2 >= 0.5) return best2;
  return undefined;
}

const samples = [
  ['quantitative','Number System (Divisibility, HCF & LCM, Remainders)'],
  ['quantitative','Mixtures & Alligations'],
  ['logical','Blood Relations'],
  ['verbal','Synonyms & Antonyms'],
  ['quantitative','Geometry, Mensuration (2D & 3D Shapes)'],
  ['logical','Puzzles & Seating Arrangements']
];

for(const [main, sub] of samples){ const mt = findMain(main); const found = findSubtopicByParam(mt, sub); console.log('MAIN=',main,'SUB=',sub,'=>', found ? (found.title||found.id) : 'NOT FOUND'); }
for(const [main, sub] of samples){ const mt = findMain(main); const found2 = findSubtopicByParamExpanded(mt, sub); console.log('EXPANDED MAIN=',main,'SUB=',sub,'=>', found2 ? (found2.title||found2.id) : 'NOT FOUND'); }
