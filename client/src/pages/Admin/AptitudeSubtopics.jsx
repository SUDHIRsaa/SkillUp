import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminSidebar from '../../components/AdminSidebar';
import Card from '../../components/Card';
import http from '../../services/http';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { TOPICS } from '../../data/topics';
import { getSubtopicOptions, formatMainTitle } from '../../utils/topicMatcher';
import Select from '../../components/ui/Select';

export default function AptitudeSubtopics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get('/api/admin/subtopics');
      setItems(res.data.items || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (it) => { setEditing(it._id); setDraft(it.notes || ''); };
  const cancel = () => { setEditing(null); setDraft(''); };
  const save = async () => {
    if (!editing) return;
    await http.put(`/api/admin/subtopics/${editing}`, { notes: draft });
    setEditing(null);
    setDraft('');
    await load();
  };

  const [newMain, setNewMain] = useState('');
  const [newSub, setNewSub] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('');
  const createSubtopic = async () => {
    if (!newMain || !newSub) {
      setStatusType('error'); setStatusMsg('Please select a topic and subtopic before creating.');
      setTimeout(()=>setStatusMsg(''), 3000);
      return;
    }
    // Call server endpoint if available; server seeds automatically so we attempt to create a record via admin update if exists
    try {
      const mainTitle = formatMainTitle(newMain) || newMain;
      const payload = { mainTopic: mainTitle, topic: newMain, subtopic: newSub, notes: newNotes };
      const up = await http.post('/api/admin/subtopics/upsert', payload);
      if (up && up.data) {
        setStatusType('success'); setStatusMsg('Subtopic created/updated successfully');
      } else {
        setStatusType('error'); setStatusMsg('Failed to create/update subtopic');
      }
      setNewMain(''); setNewSub(''); setNewNotes('');
      await load();
      setTimeout(()=>{ setStatusMsg(''); setStatusType(''); }, 3000);
    } catch (e) {
      console.warn('Failed to create subtopic', e?.message || e);
      setStatusType('error'); setStatusMsg('Failed to create/update subtopic');
      await load();
      setTimeout(()=>{ setStatusMsg(''); setStatusType(''); }, 5000);
    }
  };

  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card title="Aptitude Subtopics">
              <div className="space-y-4">
                {/* Create new subtopic: select main topic then subtopic then add notes */}
                <div className="border rounded p-3 bg-white dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 dark:text-gray-300">Main topic</label>
                      <Select value={newMain} onChange={e=>{ setNewMain(e.target.value); setNewSub(''); }}>
                        <option value="">-- Select main topic --</option>
                        {TOPICS.map(t => (<option key={t.slug} value={t.slug}>{t.title}</option>))}
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 dark:text-gray-300">Subtopic</label>
                      {(() => {
                        const opts = getSubtopicOptions(newMain);
                        if (opts && opts.length) {
                          return (
                            <Select value={newSub} onChange={e=>setNewSub(e.target.value)}>
                              <option value="">-- Select subtopic --</option>
                              {opts.map(st => (
                                <option key={st.value} value={st.value}>{st.label}</option>
                              ))}
                            </Select>
                          );
                        }
                        return (
                          <Input placeholder="Enter subtopic title" value={newSub} onChange={e=>setNewSub(e.target.value)} />
                        );
                      })()}
                    </div>
                    <div className="w-full sm:w-auto">
                      <Button size="sm" onClick={createSubtopic}>Create</Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 dark:text-gray-300">Notes (optional)</label>
                    <textarea rows={4} className="block w-full rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2" value={newNotes} onChange={e=>setNewNotes(e.target.value)} placeholder="Add admin notes or formulas for this subtopic (optional)" />
                  </div>
                  {statusMsg && (
                    <div className={`mt-3 text-sm ${statusType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{statusMsg}</div>
                  )}
                </div>
                {loading && (<div className="text-sm text-gray-500">Loading...</div>)}
                {!loading && items.length === 0 && (<div className="text-sm text-gray-500">No subtopics found.</div>)}
                {items.map(it => (
                  <div key={it._id} className="border rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{it.mainTopic} • {it.topic} / {it.subtopic}</div>
                        <div className="text-xs text-gray-500">Last updated: {it.updatedAt ? new Date(it.updatedAt).toLocaleString() : 'never'}</div>
                      </div>
                      <div className="flex gap-2">
                        {editing === it._id ? (
                          <>
                            <Button size="sm" onClick={save}>Save</Button>
                            <Button size="sm" variant="secondary" onClick={cancel}>Cancel</Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => startEdit(it)}>Edit notes</Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      {editing === it._id ? (
                        <textarea className="block w-full rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2" rows={6} value={draft} onChange={e=>setDraft(e.target.value)} />
                      ) : (
                        <div className="prose max-w-none text-sm text-gray-700 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: it.notes ? it.notes.replace(/\n/g,'<br/>') : '<i>No notes yet</i>' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
