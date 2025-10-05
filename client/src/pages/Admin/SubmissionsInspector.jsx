import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { listAdminSubmissions } from '../../services/adminService';

export default function SubmissionsInspector() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('');
  const [result, setResult] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const load = async (p = page) => {
    try {
      const res = await listAdminSubmissions({ q, lang, result, page: p, limit });
      setRows(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
    } catch {}
  };
  useEffect(() => { load(1); }, [q, lang, result, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const onExport = () => {
    const header = ['User','Challenge','Language','Result','Time'];
    const rowsCsv = rows.map(s => [s.userId, s.challengeId, s.language, JSON.stringify(s.result||''), s.timestamp].join(','));
    const csv = [header.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'submissions.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Card title="Recent Submissions">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">{total} submissions</div>
          <button className="px-2 py-1 border rounded" onClick={onExport}>Export CSV</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Input placeholder="Search user/challenge" value={q} onChange={e=>setQ(e.target.value)} icon={MagnifyingGlassIcon} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          <Input placeholder="Language" value={lang} onChange={e=>setLang(e.target.value)} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          <Input placeholder="Result contains" value={result} onChange={e=>setResult(e.target.value)} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          <select className="rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Challenge</th>
                <th className="py-2 pr-4">Lang</th>
                <th className="py-2 pr-4">Result</th>
                <th className="py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No submissions found</td></tr>
              )}
              {rows.map((s, i) => (
                <tr key={s._id || i} className="border-b last:border-0">
                  <td className="py-2 pr-4">{s.userId}</td>
                  <td className="py-2 pr-4">{s.challengeId}</td>
                  <td className="py-2 pr-4">{s.language}</td>
                  <td className="py-2 pr-4">{s.result}</td>
                  <td className="py-2 pr-4">{new Date(s.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div>Page {page} / {totalPages} • {total} submissions</div>
          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
            <button className="px-2 py-1 border rounded" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next</button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}