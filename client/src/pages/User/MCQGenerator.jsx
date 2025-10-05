import { useState, useRef } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/ui/Button';
import http from '../../services/http';

function simpleMCQGen(text) {
  // improved heuristic: create up to 10 MCQs using sentence endings and a global word pool for distractors
  const sentences = (text || '').split(/[\.\n]+/).map(s => s.trim()).filter(Boolean);
  const wordsAll = (text || '').split(/\s+/).map(w => w.replace(/[^\w]/g, '')).filter(Boolean).map(w => w.trim()).filter(Boolean);
  const globalPool = Array.from(new Set(wordsAll)).filter(Boolean);
  const mcqs = [];
  for (let i = 0; i < Math.min(10, Math.max(1, sentences.length)); i++) {
    const s = sentences[i] || sentences[i % sentences.length] || '';
    const words = s.split(/\s+/).map(w => w.replace(/[^\w]/g, '')).filter(Boolean);
    if (words.length < 2) continue;
    const answer = words[words.length - 1];
    const question = words.slice(0, words.length - 1).join(' ') + ' ____.';

    const choices = [answer];
    const poolSentence = Array.from(new Set(words.slice(0, Math.max(0, words.length - 1))));
    const pool = poolSentence.concat(globalPool).filter(Boolean);
    while (choices.length < 4) {
      const candidate = pool[Math.floor(Math.random() * pool.length)] || (`Option${choices.length+1}`);
      if (!choices.includes(candidate)) choices.push(candidate);
    }
    for (let k = choices.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [choices[k], choices[j]] = [choices[j], choices[k]];
    }
    const correctIndex = Math.max(0, choices.indexOf(answer));
    mcqs.push({ q: question, choices, answer: correctIndex });
    if (mcqs.length >= 10) break;
  }
  return mcqs;
}

export default function MCQGenerator() {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const [docName, setDocName] = useState('');

  const uploadAndGenerateServer = async (file) => {
    if (!file) return;
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) return alert('File too large. Maximum allowed size is 5 MB.');
    setLoading(true);
    setMcqs([]);
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await http.post('/api/tools/upload-generate?type=mcqs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const items = res.data?.items || res.data?.mcqs || [];
      setMcqs(items);
      if (res.data?.fallback) alert('Server used local fallback (AI not configured or unavailable). Results may be limited.');
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert('Server generation failed: ' + msg);
    } finally { setLoading(false); }
  };

  const save = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user_mcqs') || '[]');
      const toSave = mcqs.map(m => ({ ...m, createdAt: new Date().toISOString(), id: `${Date.now()}_${Math.floor(Math.random()*10000)}` }));
      localStorage.setItem('user_mcqs', JSON.stringify([...stored, ...toSave]));
      alert(`Saved ${toSave.length} MCQs locally`);
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save MCQs locally');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Generate MCQs (PDF only)</h1>
        </div>
        <Card>
          <div className="mt-2 flex items-center gap-2">
            <input ref={fileRef} type="file" accept="application/pdf" onChange={e => { const f = e.target.files?.[0]; setDocName(f ? f.name : ''); }} className="hidden" />
            <button type="button" onClick={()=>fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
              <DocumentArrowUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <span className="truncate">{docName || 'Upload PDF to generate MCQs'}</span>
            </button>
            <button type="button" onClick={() => { const f = fileRef.current?.files?.[0]; if (f) uploadAndGenerateServer(f); else alert('Please pick a file first'); }} className="ml-2 px-3 py-2 rounded bg-blue-600 text-white text-sm">Upload & Generate (server)</button>
            <div className="text-xs text-gray-500">Only PDF uploads are supported for generation</div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={() => { setMcqs([]); setDocName(''); }}>Clear</Button>
            <Button variant="secondary" onClick={save} disabled={mcqs.length === 0}>Save</Button>
          </div>
        </Card>

        {mcqs.length > 0 && (
          <div className="mt-6 space-y-4">
            {mcqs.map((m, idx) => (
              <div key={idx} className="p-4 border rounded">
                <div className="font-medium mb-2">Q{idx+1}. {m.q}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {m.choices.map((c, ci) => (
                    <div key={ci} className={`p-2 border rounded ${ci === m.answer ? 'border-green-500' : ''}`}>{String.fromCharCode(65 + ci)}. {c}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
