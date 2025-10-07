// tools/verify_topic_mappings.js
// Verifies every TOPICS subtopic maps to a subtopic entry in topicsIndex.js

function slugify(str = '') {
  return String(str).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const topicsIndexModule = require('../client/src/content/aptitude/topicsIndex.js');
const topicsIndex = topicsIndexModule.default || topicsIndexModule;
const TOPICS = require('../client/src/data/topics').TOPICS || require('../client/src/data/topics');

let allOk = true;
console.log('Loaded', topicsIndex.length, 'main topics from topicsIndex.js');
console.log('Loaded', TOPICS.length, 'main topics from TOPICS');

for (const mainMeta of TOPICS) {
  const mainSlug = mainMeta.slug;
  const mainLabel = mainMeta.label || mainMeta.slug;
  // flexible main match: match by id, slugified title/id, explicit slug, or slugified label
  const ti = topicsIndex.find(t =>
    t.id === mainSlug ||
    slugify(t.title || t.id) === mainSlug ||
    (t.slug && t.slug === mainSlug) ||
    slugify(t.title || t.id) === slugify(mainLabel) ||
    mainSlug.includes((t.id || '').toString())
  );
  if (!ti) {
    console.warn(`WARNING: No matching main topic in topicsIndex for TOPICS entry: ${mainSlug} (${mainLabel})`);
    allOk = false;
    continue;
  }
  const tiSub = ti.subtopics || [];
  for (const s of (mainMeta.subtopics || [])) {
    const rawLabel = typeof s === 'string' ? s : (s && (s.title || s.label || s.id)) || 'Subtopic';
    const stripped = rawLabel.replace(/\(.*?\)/g, '').trim();
    const norm = slugify(stripped);
    // try direct and case-insensitive matches first
    let matched = false;
    for (const sub of tiSub) {
      const candidate = (sub && (sub.title || sub.id)) || sub || '';
      const sslug = slugify(candidate.toString());
      if (sslug === norm || norm.includes(sslug) || sslug.includes(norm) || (candidate.toString().toLowerCase() === stripped.toString().toLowerCase())) {
        matched = true;
        break;
      }
    }
    // fuzzy word-overlap match
    if (!matched) {
      const wordsSet = str => new Set(String(str||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').split(/\s+/).filter(Boolean).map(w=>w.replace(/s$/,'')));
      const targetWords = wordsSet(stripped);
      let bestScore = 0;
      for (const sub of tiSub) {
        const candidate = (sub && (sub.title || sub.id)) || sub || '';
        const candWords = wordsSet(candidate.toString());
        const intersect = [...targetWords].filter(w => candWords.has(w)).length;
        const unionMax = Math.max(targetWords.size, candWords.size, 1);
        const score = intersect / unionMax;
        if (score > bestScore) bestScore = score;
      }
      if (bestScore >= 0.25) matched = true;
    }

    if (!matched) {
      console.error(`MISMATCH: ${mainSlug} -> subtopic label not found in topicsIndex: "${rawLabel}" (slug ${norm})`);
      allOk = false;
    }
  }
}

if (allOk) {
  console.log('\nAll TOPICS subtopics map to entries in topicsIndex.js');
  process.exit(0);
} else {
  console.error('\nOne or more mappings failed. See errors above.');
  process.exit(2);
}
