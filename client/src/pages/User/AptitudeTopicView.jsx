import { useEffect, useState } from 'react';
import topicsIndex from '../../content/aptitude/topicsIndex';

const slugify = (str = '') => String(str).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function findSubSlugForMain(topicSlug, subLabel) {
  const main = topicsIndex.find(t => t.id === topicSlug || slugify(t.title || t.id) === topicSlug || (t.slug && t.slug === topicSlug));
  if (!main) return slugify(subLabel);

  // normalize label: remove trailing parentheticals like "(Bar Graphs)" and extra punctuation
  const stripped = (subLabel || '').toString().replace(/\(.*?\)/g, '').trim();
  const norm = slugify(stripped);

  // try direct slug/title/id match first
  for (const s of (main.subtopics || [])) {
    const sslug = slugify(s.title || s.id || s);
    if (sslug === norm) return sslug;
    if ((s.id || '').toString().toLowerCase() === stripped.toString().toLowerCase()) return slugify(s.id || s.title || s);
    if ((s.title || '').toString().toLowerCase() === stripped.toString().toLowerCase()) return sslug;
  }

  // Fuzzy match using word-overlap scoring
  const targetWords = wordsSet(stripped);
  let best = { score: 0, slug: null };
  for (const s of (main.subtopics || [])) {
    const candidate = (s && (s.title || s.id)) || s || '';
    const candWords = wordsSet(candidate.toString());
    const intersect = [...targetWords].filter(w => candWords.has(w)).length;
    const unionMax = Math.max(targetWords.size, candWords.size, 1);
    const score = intersect / unionMax;
    if (score > best.score) {
      best = { score, slug: slugify(candidate) };
    }
  }
  // if reasonable overlap, return best candidate
  if (best.score >= 0.25 && best.slug) return best.slug;

  // last resort: try containment checks on normalized slugs
  for (const s of (main.subtopics || [])) {
    const sslug = slugify(s.title || s.id || s);
    if (norm.includes(sslug) || sslug.includes(norm)) return sslug;
  }

  // fallback: use slug of the provided label
  return norm;
}

function wordsSet(str = '') {
  return new Set(String(str||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').split(/\s+/).filter(Boolean).map(w => w.replace(/s$/,'')));
}
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { TOPICS } from '../../data/topics';

export default function AptitudeTopicView() {
  const { main } = useParams();
  const navigate = useNavigate();
  const topic = TOPICS.find(t => t.slug === main);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (topic) setItems(topic.subtopics || []);
  }, [topic]);

  if (!topic) return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Topic not found</h2>
          <p className="mt-2 text-sm text-gray-600">Return to topics to pick a valid subject.</p>
          <div className="mt-4"><Button as="a" href="/aptitude/topics">Back to Topics</Button></div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold">{topic.label}</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">Subtopics and formulas for {topic.label}.</p>
          </div>
          <div>
            <Button variant="secondary" onClick={() => navigate('/aptitude/topics')}>Back</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((s, i) => {
            const subSlug = findSubSlugForMain(main, s);
            const label = typeof s === 'string' ? s : (s && (s.title || s.label || s.id)) || 'Subtopic';
            return (
              <div key={subSlug || i} className="rounded-2xl p-6 cursor-pointer" onClick={() => navigate(`/aptitude/topics/${main}/${subSlug}`)} style={{ minHeight: 140 }}>
              <div className="relative p-6 bg-slate-800 rounded-2xl h-full flex flex-col justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{label}</div>
                  <div className="text-sm text-gray-300 mt-2">Click to view formulas and practice</div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/aptitude/topics/${main}/${subSlug}`); }}>Explore</Button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </Layout>
  );
}
