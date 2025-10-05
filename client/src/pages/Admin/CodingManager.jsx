import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminSidebar from '../../components/AdminSidebar';
import Card from '../../components/Card';
import http from '../../services/http';
import Input from '../../components/ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function CodingManager() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const onExport = () => {
    const header = ['Statement','Difficulty','Tags'];
    const rowsCsv = rows.map(c => [JSON.stringify(c.statement||''), c.difficulty||'', (c.tags||[]).join('|')].join(','));
    const csv = [header.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'challenges.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const [form, setForm] = useState({ statement: '', constraints: '', difficulty: 'easy', tags: '', testCases: '' });
  const load = async (p = page) => { 
    const res = await http.get('/api/coding/challenges', { params: { q, difficulty: difficultyFilter, tag: tagFilter, page: p, limit } }); 
    const data = res.data || {}; setRows(data.items || []); setTotal(data.total || 0); setPage(data.page || p);
  };
  const onDelete = async (id) => { await http.delete(`/api/coding/challenges/${id}`); await load(); };
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ statement: '', constraints: '', difficulty: 'easy', tags: '', testCases: '' });
  const onEdit = (c) => {
    setEditId(c._id);
    setEditForm({
      statement: c.statement,
      constraints: c.constraints,
      difficulty: c.difficulty,
  tags: (c.tags || []).join(', '),
      testCases: (c.testCases || []).map(tc => `${tc.input} => ${tc.output}`).join('\n'),
    });
  };
  const onEditChange = (e) => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onSaveEdit = async () => {
    const payload = {
      statement: editForm.statement,
      constraints: editForm.constraints,
      difficulty: editForm.difficulty,
  tags: editForm.tags.split(',').map(s=>s.trim()).filter(Boolean),
      testCases: editForm.testCases.split('\n').map(l=>{ const [input, output] = l.split('=>'); return { input: (input||'').trim(), output: (output||'').trim() }; }).filter(tc=>tc.input)
    };
    await http.put(`/api/coding/challenges/${editId}`, payload);
    setEditId(null);
    await load();
  };
  useEffect(() => { load(1); }, [q, difficultyFilter, tagFilter, limit]);
  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onCreate = async () => {
    const payload = {
      statement: form.statement,
      constraints: form.constraints,
      difficulty: form.difficulty,
  tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
      testCases: form.testCases.split('\n').map(l=>{ const [input, output] = l.split('=>'); return { input: (input||'').trim(), output: (output||'').trim() }; }).filter(tc=>tc.input)
    };
    await http.post('/api/coding/challenges', payload);
  setForm({ statement: '', constraints: '', difficulty: 'easy', tags: '', testCases: '' });
    await load();
  };

  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Create Challenge">
              <div className="space-y-2">
                <textarea className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 px-3 py-2" name="statement" placeholder="Problem statement" value={form.statement} onChange={onChange} />
                <textarea className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 px-3 py-2" name="constraints" placeholder="Constraints" value={form.constraints} onChange={onChange} />
                <Input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={onChange} />
                <Select name="difficulty" value={form.difficulty} onChange={onChange}>
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </Select>
                <div className="text-xs text-gray-600">Hidden Test Cases (used for Submit): one per line as "input =&gt; output"</div>
                <textarea className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 px-3 py-2" name="testCases" placeholder="One per line: input => output" value={form.testCases} onChange={onChange} />
                <Button onClick={onCreate}>Create</Button>
              </div>
            </Card>
            <Card title="Challenges">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">{total} challenges</div>
                <button className="px-2 py-1 border rounded" onClick={onExport}>Export CSV</button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Input placeholder="Search statement/constraints" value={q} onChange={e=>setQ(e.target.value)} icon={MagnifyingGlassIcon} className="" />
                <select className="border rounded px-2 py-1" value={difficultyFilter} onChange={e=>setDifficultyFilter(e.target.value)}>
                  <option value="">All difficulties</option>
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
                <Input placeholder="Tag" value={tagFilter} onChange={e=>setTagFilter(e.target.value)} className="border rounded px-2 py-1" />
                <select className="border rounded px-2 py-1" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="space-y-2 max-h=[60vh] overflow-auto">
                {rows.length === 0 && (
                  <div className="text-sm text-gray-500 py-6 text-center">No challenges found</div>
                )}
                {rows.map(c => (
                  <div key={c._id} className="border rounded p-3">
                    {editId === c._id ? (
                      <div className="space-y-2">
                        <textarea className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 px-3 py-2" name="statement" placeholder="Problem statement" value={editForm.statement} onChange={onEditChange} />
                        <textarea className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 px-3 py-2" name="constraints" placeholder="Constraints" value={editForm.constraints} onChange={onEditChange} />
                        <Input name="tags" placeholder="Tags (comma separated)" value={editForm.tags} onChange={onEditChange} />
                        <Select name="difficulty" value={editForm.difficulty} onChange={onEditChange}>
                          <option value="easy">easy</option>
                          <option value="medium">medium</option>
                          <option value="hard">hard</option>
                        </Select>
                        <div className="text-xs text-gray-600">Hidden Test Cases (used for Submit): one per line as "input =&gt; output"</div>
                        <textarea className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 px-3 py-2" name="testCases" placeholder="One per line: input => output" value={editForm.testCases} onChange={onEditChange} />
                        <div className="flex gap-2 pt-2">
                          <Button onClick={onSaveEdit}>Save</Button>
                          <Button variant="secondary" onClick={()=>setEditId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">{c.statement?.slice(0, 120)}</div>
                        <div className="text-xs text-gray-500">{c.difficulty} • {c.tags?.join(', ')}</div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="secondary" onClick={()=>onEdit(c)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={()=>onDelete(c._id)}>Delete</Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div>Page {page} / {Math.max(1, Math.ceil(total / limit))} • {total} challenges</div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
                  <button className="px-2 py-1 border rounded" disabled={page>=Math.max(1, Math.ceil(total/limit))} onClick={()=>load(page+1)}>Next</button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}