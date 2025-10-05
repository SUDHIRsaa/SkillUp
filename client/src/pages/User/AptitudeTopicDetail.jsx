import { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/ui/Button';
import topicsIndex from '../../content/aptitude/topicsIndex';
import { useAuth } from '../../context/AuthContext';

function Fraction({ num, den }) {
  return (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center', margin: '0 6px' }}>
      <span style={{ display: 'block', lineHeight: 1 }}>{num}</span>
      <span style={{ display: 'block', borderTop: '1px solid currentColor', fontSize: '0.85em', lineHeight: 1 }}>{den}</span>
    </span>
  );
}

function renderFormulaLine(text) {
  // More robust inline fraction detection: replace occurrences of 'numerator/denominator' inside RHS
  const parts = text.split('=');
  if (parts.length === 1) return <span>{text}</span>;
  const lhs = parts[0].trim();
  let rhs = parts.slice(1).join('=').trim();

  const nodes = [];
  let lastIndex = 0;
  // match numerator (anything except slash) then '/' then denominator (no spaces or commas at end)
  const re = /([^\s\/]+)\/([^\s,\)]+)/g;
  let m;
  while ((m = re.exec(rhs)) !== null) {
    const matchStart = m.index;
    const matchEnd = re.lastIndex;
    // push preceding text
    if (matchStart > lastIndex) {
      nodes.push(rhs.slice(lastIndex, matchStart));
    }
    // push fraction node
    nodes.push(<Fraction key={nodes.length} num={m[1]} den={m[2]} />);
    lastIndex = matchEnd;
  }
  if (lastIndex < rhs.length) nodes.push(rhs.slice(lastIndex));

  return (
    <div>
      <span style={{ fontWeight: 600, marginRight: 8 }}>{lhs} =</span>
      <span>{nodes.map((n, i) => (typeof n === 'string' ? <span key={i}>{n}</span> : n))}</span>
    </div>
  );
}

export default function AptitudeTopicDetail() {
  const { main, sub } = useParams();
  const navigate = useNavigate();
  // helper to normalize titles/ids to slugs used by route paths
  const slugify = (str = '') => String(str).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  function wordsSet(str = '') {
    return new Set(String(str||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').split(/\s+/).filter(Boolean).map(w => w.replace(/s$/,'')));
  }

  const mainTopic = topicsIndex.find(t => t.id === main || slugify(t.title || t.id) === main || (t.slug && t.slug === main));

  function findSubtopicByParam(mt, subParam) {
    if (!mt || !subParam) return undefined;
    // strip parentheticals and normalize
    const stripped = String(subParam || '').replace(/\(.*?\)/g, '').trim();
    const norm = slugify(stripped);
    const candidates = mt.subtopics || [];
    // direct id or slug match
    for (const c of candidates) {
      const id = (c.id || '').toString();
      const title = (c.title || '').toString();
      if (!id && !title) continue;
      const s1 = slugify(id || title);
      const s2 = slugify(title || id);
      if (s1 === norm || s2 === norm) return c;
    }
    // try fuzzy match: check if normalized param contains the candidate slug or vice versa
    for (const c of candidates) {
      const id = (c.id || '').toString();
      const title = (c.title || '').toString();
      const s = slugify(title || id);
      if (!s) continue;
      if (norm.includes(s) || s.includes(norm)) return c;
      // also try removing dashes
      if (norm.replace(/-/g, '').includes(s.replace(/-/g, ''))) return c;
    }
    // word overlap fuzzy match (ignore plural s) with normalized score
    const paramWords = wordsSet(stripped);
    let best = null; let bestScore = 0;
    for (const c of candidates) {
      const txt = (c.title || c.id || '').toString();
      const candWords = wordsSet(txt);
      const intersect = [...paramWords].filter(w => candWords.has(w)).length;
      const unionMax = Math.max(paramWords.size, candWords.size, 1);
      const score = intersect / unionMax;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    if (bestScore >= 0.25) return best;

    // expanded-text fuzzy match: compare against notes, formula titles/items and MCQ text to capture cases like "Mixtures" mapping to an arithmetic subtopic
    let best2 = null; let bestScore2 = 0;
      for (const c of candidates) {
        const parts = [];
        if (c.title) parts.push(c.title);
        if (c.notes) parts.push(c.notes);
        if (Array.isArray(c.aliases)) parts.push(c.aliases.join(' '));
        if (Array.isArray(c.formulas)) {
          for (const f of c.formulas) {
            if (f.title) parts.push(f.title);
            if (Array.isArray(f.items)) parts.push(f.items.join(' '));
          }
        }
        if (Array.isArray(c.mcqs)) {
          for (const m of c.mcqs) if (m.q) parts.push(m.q);
        }
        const combined = parts.join(' ');
        const candWords = wordsSet(combined);
        const intersect = [...paramWords].filter(w => candWords.has(w)).length;
        const score = paramWords.size ? (intersect / paramWords.size) : 0;
        if (score > bestScore2) { bestScore2 = score; best2 = c; }
      }
      if (bestScore2 >= 0.5) return best2;
    // fallback to exact title match (case-insensitive)
    for (const c of candidates) {
      if ((c.title || '').toString().toLowerCase() === subParam.toString().toLowerCase()) return c;
    }
    return undefined;
  }

  const topic = findSubtopicByParam(mainTopic, sub);
  const [answers, setAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [serverMcqs, setServerMcqs] = useState([]);

  if (!topic) return (
    <Layout>
      <div className="w-full px-6 py-12">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Topic not found</h2>
            <p className="mt-2 text-sm text-gray-600">Return to topics to pick a valid subject.</p>
            <div className="mt-4">
              <Button as="a" href="/aptitude/topics">Back to Topics</Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );

  const { user } = useAuth();
  useEffect(() => {
    // fetch questions created by admins for this topic/subtopic
    (async () => {
      try {
        const params = new URLSearchParams();
        if (main) params.set('topic', main);
        if (sub) params.set('subtopic', sub);
        const res = await fetch(`/api/questions?${params.toString()}`);
        const data = await res.json();
        // convert server question docs to mcq-shaped objects
        const converted = (data.items || []).map(q => ({ q: q.statement, choices: q.options || [], answer: q.options ? q.options.findIndex(o => String(o).trim() === String(q.correctAnswer).trim()) : 0 }));
        setServerMcqs(converted || []);
      } catch (e) {
        console.warn('Failed to load server mcqs', e?.message || e);
      }
    })();
  }, [main, sub]);
  const onSelect = (qidx, choiceIdx) => {
    setAnswers((s) => ({ ...s, [qidx]: choiceIdx }));
  };

  return (
    <Layout>
      <div className="w-full px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold">{topic.title}</h1>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">{topic.description}</p>
            {topic.tricks && (
              <div className="mt-3">
                <div className="text-xs text-slate-300 uppercase tracking-wide">Quick Tricks</div>
                <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                  {topic.tricks.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/aptitude/topics')}>Back</Button>
            <Button onClick={() => setShowAnswers((s) => !s)}>{showAnswers ? 'Hide Answers' : 'Show Answers'}</Button>
            {user && (user.role === 'admin' || user.role === 'moderator') && (
              <Button variant="primary" onClick={() => navigate(`/admin/questions?topic=${main}&subtopic=${sub}`)}>Add Question</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Important Formulas & Notes" className="w-full">
            <div className="space-y-6 text-base text-gray-200">
              { (topic.formulas || []).length > 0 ? topic.formulas.map((section, sidx) => (
                <div key={sidx}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">{section.title}</div>
                    <div className="text-xs text-slate-300">Formula</div>
                  </div>
                  <div className="mt-2 space-y-2 leading-tight">
                    {section.items.map((it, idx) => (
                      <div key={idx} className="text-base bg-slate-800/30 p-2 rounded">
                        {typeof it === 'object' && it.latex ? (
                          <div dangerouslySetInnerHTML={{ __html: katex.renderToString(it.latex, { throwOnError: false }) }} />
                        ) : typeof section.latex === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: katex.renderToString(section.latex, { throwOnError: false }) }} />
                        ) : (
                          renderFormulaLine(typeof it === 'string' ? it : (it.text || ''))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-400">No formulas provided for this subtopic.</div>
              )}
              {topic.notes && (
                <div className="mt-4 text-sm text-gray-300">{topic.notes}</div>
              )}
            </div>
          </Card>

          <Card title="Practice MCQs" className="w-full">
            <div className="space-y-4">
              {( (topic.mcqs || []).concat(serverMcqs) ).map((q, qidx) => (
                <div key={qidx} className="p-4 border rounded bg-slate-900/40">
                  <div className="font-medium text-lg">{qidx + 1}. {q.q}</div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.choices.map((c, cidx) => (
                      <label key={cidx} className={`flex items-center gap-3 p-2 border rounded cursor-pointer ${answers[qidx] === cidx ? 'bg-emerald-900/40 border-emerald-500' : ''}`}>
                        <input type="radio" name={`q-${qidx}`} checked={answers[qidx] === cidx} onChange={() => onSelect(qidx, cidx)} />
                        <span className="text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                  {showAnswers && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium">Answer: </span>{q.choices[q.answer]}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <Button onClick={async () => {
                  // Use the rendered MCQs (local topic MCQs + server MCQs) so indexes align with `answers`
                  const allMcqs = (topic.mcqs || []).concat(serverMcqs || []);
                  const total = allMcqs.length;
                  let correct = 0;
                  allMcqs.forEach((q, idx) => { if (answers[idx] === q.answer) correct++; });
                  setShowAnswers(true);
                  try {
                    await fetch('/api/performance/attempt', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ total, correct, avgTime: null, topic: `${main}/${sub}` })
                    });
                  } catch (e) {
                    console.warn('Failed to record attempt', e?.message || e);
                  }
                }}>Show Answers</Button>
                <Button variant="secondary" onClick={() => { setAnswers({}); setShowAnswers(false); }}>Reset</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
