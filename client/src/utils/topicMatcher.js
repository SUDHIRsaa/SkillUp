import { TOPICS } from '../data/topics';

// Utility helpers to normalize MAIN topic and subtopic lists across the app.
// This keeps admin pages resilient to TOPICS.subtopics being either an
// array of strings or array of objects { id, title }.

export function findMainBySlug(slug) {
  if (!slug) return null;
  return TOPICS.find(t => t.slug === slug) || null;
}

export function formatMainTitle(slug) {
  const m = findMainBySlug(slug);
  if (!m) return '';
  return m.title || m.label || '';
}

// Return subtopic options in normalized shape: { value, label }
export function getSubtopicOptions(mainSlug) {
  const main = findMainBySlug(mainSlug);
  if (!main || !Array.isArray(main.subtopics)) return [];
  return main.subtopics.map(st => {
    if (!st) return null;
    if (typeof st === 'string') return { value: st, label: st };
    return { value: st.title || st.id || '', label: st.title || st.id || '' };
  }).filter(Boolean);
}

// Return a simple array of subtopic values (string) for small select lists
export function getSubtopicValues(mainSlug) {
  return getSubtopicOptions(mainSlug).map(o => o.value);
}

export default { findMainBySlug, formatMainTitle, getSubtopicOptions, getSubtopicValues };
