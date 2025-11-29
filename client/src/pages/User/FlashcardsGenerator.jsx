import React, { useState, useRef } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/ui/Button';
import http from '../../services/http';

export default function FlashcardsGenerator() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const [docName, setDocName] = useState('');

  const uploadAndGenerateServer = async (file) => {
    if (!file) return;
    const MAX = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX) return alert('File too large. Maximum allowed size is 5 MB.');
    setLoading(true);
    setCards([]);
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await http.post('/api/tools/upload-generate?type=flashcards', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const items = res.data?.items || res.data?.flashcards || [];
      const out = items.map(i => ({ q: i.front || i.q || i.question || '', a: i.back || i.a || i.answer || '' }));
      while (out.length < 5) out.push({ q: `Note ${out.length + 1}`, a: '—' });
      setCards(out);
      if (res.data?.fallback) alert('Server used local fallback (AI not configured or unavailable). Results may be limited.');
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert('Server generation failed: ' + msg);
    } finally { setLoading(false); }
  };

  const save = () => {
    const stored = JSON.parse(localStorage.getItem('user_flashcards') || '[]');
    localStorage.setItem('user_flashcards', JSON.stringify([...stored, ...cards]));
    alert('Saved flashcards locally');
  };

  function Flashcard({ card }) {
    const [open, setOpen] = useState(false);
    return (
      <div onClick={() => setOpen(o => !o)} className="p-4 border rounded cursor-pointer bg-white dark:bg-gray-900">
        <div className="font-medium mb-2">Q: {card.q}</div>
        <div className={`text-sm text-gray-700 dark:text-gray-300 ${open ? '' : 'blur-sm'}`}>A: {card.a || '—'}</div>
        <div className="text-xs text-gray-500 mt-2">Click to reveal</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Generate Flashcards (PDF only)</h1>
        </div>
        <Card>
          <div className="mt-2 flex items-center gap-2">
            <input ref={fileRef} type="file" accept="application/pdf" onChange={e => { const f = e.target.files?.[0]; setDocName(f ? f.name : ''); }} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
              <DocumentArrowUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <span className="truncate">{docName || 'Upload PDF to generate flashcards'}</span>
            </button>
            <button type="button" onClick={() => { const f = fileRef.current?.files?.[0]; if (f) uploadAndGenerateServer(f); else alert('Please pick a file first'); }} className="ml-2 px-3 py-2 rounded bg-blue-600 text-white text-sm">Upload & Generate (server)</button>
            <div className="text-xs text-gray-500">Only PDF uploads are supported for generation</div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={() => { setCards([]); setDocName(''); }}>Clear</Button>
            <Button variant="secondary" onClick={save} disabled={cards.length === 0}>Save</Button>
          </div>
        </Card>

        {cards.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((c, idx) => (
              <Flashcard key={idx} card={c} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
