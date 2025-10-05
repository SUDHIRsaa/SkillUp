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
    fd.append('file', file);
      fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Now from .env
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
      });
    const data = await res.json();
    if (data.secure_url) setForm(f => ({ ...f, imageUrl: data.secure_url }));
  };
  const [toast, setToast] = useState(null);

  

  

  
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

  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Create Question">
                <div className="space-y-3">
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