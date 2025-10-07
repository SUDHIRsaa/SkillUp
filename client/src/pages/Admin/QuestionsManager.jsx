import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminSidebar from '../../components/AdminSidebar';
import Card from '../../components/Card';
import http from '../../services/http';
import { TOPICS } from '../../data/topics';
import { getSubtopicOptions, formatMainTitle } from '../../utils/topicMatcher';
import Input from '../../components/ui/Input';
import { useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

export default function QuestionsManager() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const onExport = () => {
    const header = ['Statement','Difficulty','Image'];
    const rowsCsv = rows.map(q => [JSON.stringify(q.statement||''), q.difficulty||'', q.imageUrl||''].join(','));
    const csv = [header.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'questions.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const [form, setForm] = useState({ statement: '', imageUrl: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'easy', mainTopic: '', topic: '', subtopic: '' });
  const load = async (p = page) => {
    const res = await http.get('/api/questions', { params: { q, difficulty: difficultyFilter, page: p, limit } });
    const data = res.data || {};
    setRows(data.items || []);
    setTotal(data.total || 0);
    setPage(data.page || p);
  };
  const onDelete = async (id) => { await http.delete(`/api/questions/${id}`); await load(); };
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ statement: '', imageUrl: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'easy', topic: '', subtopic: '' });
  const onEdit = (q) => { setEditId(q._id); setEditForm({ ...q }); };
  const onEditChange = (e) => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onEditOption = (i, v) => setEditForm(f => ({ ...f, options: f.options.map((o, idx)=> idx===i? v : o) }));
  const onSaveEdit = async () => { await http.put(`/api/questions/${editId}`, editForm); setEditId(null); await load(); };
  useEffect(() => { load(1); }, [q, difficultyFilter, limit]);
  // prefill topic/subtopic from query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const main = params.get('main');
      const t = params.get('topic');
      const s = params.get('subtopic');
      if (main || t || s) setForm(f => ({ ...f, mainTopic: main || f.mainTopic, topic: t || f.topic, subtopic: s || f.subtopic }));
    } catch (e) {}
  }, []);
  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onOption = (i, v) => setForm(f => ({ ...f, options: f.options.map((o, idx)=> idx===i? v : o) }));
  const fileRef = useRef();
  const onUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  const fd = new FormData();
  // Exact env keys must be referenced here — include the server-style names and keep VITE fallbacks.
  // Note: browser builds only get VITE_ prefixed vars; server uses process.env.CLOUDINARY_*.
  const uploadPreset = import.meta.env.CLOUDINARY_UPLOAD_PRESET ?? import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME ?? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  // variables intentionally read above; server-side upload endpoint will be used for actual uploading
  fd.append('file', file);
    try {
      // Upload via server endpoint which uses server-side CLOUDINARY_* env vars
      const res = await fetch(`/api/upload/image`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.ok && data.secure_url) setForm(f => ({ ...f, imageUrl: data.secure_url }));
      else setToast({ type: 'error', message: data.message || 'Upload failed' });
    } catch (err) {
      setToast({ type: 'error', message: 'Image upload failed. Please provide image URL manually.' });
    }
  };
  const [toast, setToast] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState(`[
  {
    "statement": "What is the ratio of the total sales of branch B2 for both years to the total sales of branch B4 for both years?",
    "options": ["7:9","14:18","13:18","140:180"],
    "correctAnswer": "7:9",
    "explanation": "B2 total = 75+65=140; B4 total = 85+95=180; ratio 140:180 -> 7:9.",
    "difficulty": "easy",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  },
  {
    "statement": "What is the difference between B3 sales in 2001 and B3 sales in 2000?",
    "options": ["15","10","20","25"],
    "correctAnswer": "15",
    "explanation": "B3: 110 (2001) - 95 (2000) = 15.",
    "difficulty": "easy",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  },
  {
    "statement": "What is the combined sales of branches B1 and B6 in 2001?",
    "options": ["185","190","175","195"],
    "correctAnswer": "185",
    "explanation": "B1 (2001) = 105; B6 (2001) = 80; combined = 185.",
    "difficulty": "easy",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  },
  {
    "statement": "Which branch recorded the least sales in 2001?",
    "options": ["B2","B6","B4","B5"],
    "correctAnswer": "B2",
    "explanation": "2001 values: B1=105, B2=65, B3=110, B4=95, B5=95, B6=80; smallest is B2 with 65.",
    "difficulty": "easy",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  },
  {
    "statement": "What is the ratio of B1 to B6 sales in 2000?",
    "options": ["8:7","4:3","80:70","16:14"],
    "correctAnswer": "8:7",
    "explanation": "B1 (2000)=80, B6 (2000)=70; ratio 80:70 -> 8:7.",
    "difficulty": "easy",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  },
  {
    "statement": "By what percent did sales of branch B5 increase from 2000 to 2001?",
    "options": ["26.67%","20%","25%","27%"],
    "correctAnswer": "26.67%",
    "explanation": "B5: 75 -> 95. Increase = 20/75 = 26.666...%",
    "difficulty": "medium",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  },
  {
    "statement": "Which branch had the highest absolute growth in sales from 2000 to 2001?",
    "options": ["B3","B1","B4","B5"],
    "correctAnswer": "B1",
    "explanation": "Growth: B1 +25, B2 -10, B3 +15, B4 +10, B5 +20, B6 +10. Highest absolute growth is B1 (+25).",
    "difficulty": "medium",
    "mainTopic": "data-interpretation",
    "topic": "bar-graph"
  ,"imageUrl": "/images/bar-graph.svg"
  }
]`);

  

  

  
  const [availableSubtopics, setAvailableSubtopics] = useState([]);

  useEffect(() => {
    setAvailableSubtopics(getSubtopicOptions(form.mainTopic).map(o => o.value));
  }, [form.mainTopic]);

  const onCreate = async () => {
    const payload = { ...form };
    if (form.mainTopic) {
      // normalize main topic title for server payload
      payload.mainTopic = formatMainTitle(form.mainTopic) || form.mainTopic;
      // if main is quantitative (legacy slug), preserve aptitude flags
      if (form.mainTopic === 'quantitative-aptitude' || form.mainTopic === 'quantitative') {
        payload.isAptitude = true;
        payload.availableDaily = true;
      }
    }
    await http.post('/api/questions', payload);
    setForm({ statement: '', imageUrl: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'easy', mainTopic: '', topic: '', subtopic: '' });
    await load();
  };

  const onBulkImport = async () => {
    let arr;
    try {
      arr = JSON.parse(bulkJson);
      if (!Array.isArray(arr)) throw new Error('Provide an array of question objects');
    } catch (e) {
      setToast({ type: 'error', message: 'Invalid JSON: ' + (e.message || e) });
      return;
    }
    let success = 0;
    let failed = 0;
    for (const qItem of arr) {
      try {
        await http.post('/api/questions', qItem);
        success++;
      } catch (err) {
        failed++;
        console.error('Bulk insert failed for item', qItem, err?.response?.data || err?.message || err);
      }
    }
    setToast({ type: 'success', message: `Imported ${success} questions, ${failed} failed` });
    setBulkOpen(false);
    await load();
  };

  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Create Question">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div />
                    <div className="flex gap-2">
                      <button type="button" className="text-sm px-3 py-1 border rounded" onClick={()=>setBulkOpen(o=>!o)}>{bulkOpen? 'Close Bulk Import' : 'Bulk Import (10-12)'}</button>
                    </div>
                  </div>
                  {bulkOpen && (
                    <div className="mb-3">
                      <label className="text-sm font-medium">Bulk import JSON (array of questions)</label>
                      <textarea value={bulkJson} onChange={(e)=>setBulkJson(e.target.value)} className="block w-full mt-1 h-56 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 p-2 text-xs" />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={onBulkImport}>Import</Button>
                        <Button variant="secondary" onClick={()=>{ setBulkOpen(false); setBulkJson(''); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium">Image (optional)</label>
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" ref={fileRef} onChange={(e)=>{ const f = e.target.files[0]; onUploadImage(e); }} className="hidden" />
                        <button type="button" onClick={()=>fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
                          <PhotoIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                          <span>{form.imageUrl ? 'Change image' : 'Choose image...'}</span>
                        </button>
                        {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-14 rounded border" />}
                      </div>
                      <Input placeholder="Image URL (optional)" name="imageUrl" value={form.imageUrl} onChange={onChange} className="mt-1" />
                    </div>
                  </div>

                  <Input placeholder="Statement" name="statement" value={form.statement} onChange={onChange} label="Question statement" />

                  <div className="grid grid-cols-2 gap-3">
                    <Select name="mainTopic" value={form.mainTopic} onChange={onChange} className="w-full">
                      <option value="">Select main topic (optional)</option>
                      {TOPICS.map(t => (<option key={t.slug} value={t.slug}>{t.label}</option>))}
                    </Select>
                    <Select name="subtopic" value={form.subtopic} onChange={onChange} className="w-full">
                      <option value="">Select subtopic (optional)</option>
                      {availableSubtopics.map((s, i) => (<option key={i} value={s}>{s}</option>))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {form.options.map((o,i)=>(
                      <Input key={i} placeholder={`Option ${i+1}`} value={o} onChange={(e)=>onOption(i, e.target.value)} />
                    ))}
                  </div>

                  <Input placeholder="Correct answer" name="correctAnswer" value={form.correctAnswer} onChange={onChange} label="Correct answer (exact text)" />

                  <label className="block text-sm font-medium">Explanation</label>
                  <textarea className="block w-full rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2" placeholder="Explanation" name="explanation" value={form.explanation} onChange={onChange} />

                  <Select name="difficulty" value={form.difficulty} onChange={onChange}>
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </Select>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={onCreate}>Create</Button>
                    <Button variant="secondary" onClick={()=>setForm({ statement: '', imageUrl: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'easy', mainTopic: '', topic: '', subtopic: '' })}>Reset</Button>
                  </div>
                </div>
            </Card>
            <Card title="Questions">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">{total} questions</div>
                <button className="px-2 py-1 border rounded" onClick={onExport}>Export CSV</button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Input placeholder="Search statement/explanation" value={q} onChange={e=>setQ(e.target.value)} icon={() => null} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <select className="rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" value={difficultyFilter} onChange={e=>setDifficultyFilter(e.target.value)}>
                  <option value="">All difficulties</option>
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
                <select className="rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-auto">
                {rows.length === 0 && (
                  <div className="text-sm text-gray-500 py-6 text-center">No questions found</div>
                )}
                {rows.map(q => (
                  <div key={q._id} className="border rounded p-3">
                    {editId === q._id ? (
                      <div className="space-y-2">
                        <Input placeholder="Statement" name="statement" value={editForm.statement} onChange={onEditChange} />
                        <Input placeholder="Image URL (optional)" name="imageUrl" value={editForm.imageUrl} onChange={onEditChange} />
                        <div className="flex gap-2">
                          <Select name="topic" value={editForm.topic} onChange={onEditChange}>
                            <option value="">Select topic (optional)</option>
                            <option value="math">Math</option>
                            <option value="logic">Logic</option>
                            <option value="verbal">Verbal</option>
                            <option value="time">Time Management</option>
                          </Select>
                          <Input placeholder="Subtopic (optional)" name="subtopic" value={editForm.subtopic} onChange={onEditChange} />
                        </div>
                        {editForm.options.map((o,i)=>(
                          <Input key={i} placeholder={`Option ${i+1}`} value={o} onChange={(e)=>onEditOption(i, e.target.value)} />
                        ))}
                        <Input placeholder="Correct answer" name="correctAnswer" value={editForm.correctAnswer} onChange={onEditChange} />
                        <textarea className="block w-full rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2" placeholder="Explanation" name="explanation" value={editForm.explanation} onChange={onEditChange} />
                        <Select name="difficulty" value={editForm.difficulty} onChange={onEditChange}>
                          <option value="easy">easy</option>
                          <option value="medium">medium</option>
                          <option value="hard">hard</option>
                        </Select>
                        <div className="flex gap-2 pt-2">
                          <Button onClick={onSaveEdit}>Save</Button>
                          <Button variant="secondary" onClick={()=>setEditId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">{q.statement}</div>
                        <div className="text-xs text-gray-500">{q.difficulty} {q.topic ? `• ${q.topic}${q.subtopic ? ` / ${q.subtopic}` : ''}` : ''}</div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="secondary" onClick={()=>onEdit(q)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={()=>onDelete(q._id)}>Delete</Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div>Page {page} / {Math.max(1, Math.ceil(total / limit))} • {total} questions</div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
                  <button className="px-2 py-1 border rounded" disabled={page>=Math.max(1, Math.ceil(total/limit))} onClick={()=>load(page+1)}>Next</button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </Layout>
  );
}