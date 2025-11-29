import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminSidebar from '../../components/AdminSidebar';
import Card from '../../components/Card';
import Input from '../../components/ui/Input';
import { MagnifyingGlassIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import http from '../../services/http';

export default function AptitudeSubmissions() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const onExport = () => {
    const header = ['User','Date','Total','Correct','Accuracy','AvgTime'];
    const lines = [];
    rows.forEach(r => (r.dailyStats||[]).forEach(d => {
      lines.push([r.userName||r.userId, d.date, d.total, d.correct, d.accuracy, d.avgTime].join(','));
    }));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'aptitude_submissions.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const load = async (p = page) => {
    try {
      const res = await http.get('/api/admin/aptitude', { params: { q, from, to, page: p, limit } });
      const data = res.data || {};
      setRows(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch {}
  };
  useEffect(() => { load(1); }, [q, from, to, limit]);
  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-6 py-4">
          <Card title="Aptitude Submissions">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">{total} users</div>
              <button className="px-2 py-1 border rounded" onClick={onExport}>Export CSV</button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Input placeholder="Search user" value={q} onChange={e=>setQ(e.target.value)} icon={MagnifyingGlassIcon} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} icon={CalendarDaysIcon} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              <Input type="date" value={to} onChange={e=>setTo(e.target.value)} icon={CalendarDaysIcon} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
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
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Correct</th>
                    <th className="py-2 pr-4">Accuracy</th>
                    <th className="py-2 pr-4">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td className="py-6 text-center text-gray-500" colSpan={6}>No records found</td></tr>
                  )}
                  {rows.flatMap(r => (r.dailyStats || []).map(d => (
                    <tr key={(r.userId || '') + (d.date || '')} className="border-b last:border-0">
                      <td className="py-2 pr-4">{r.userName || r.userId}</td>
                      <td className="py-2 pr-4">{d.date}</td>
                      <td className="py-2 pr-4">{d.total}</td>
                      <td className="py-2 pr-4">{d.correct}</td>
                      <td className="py-2 pr-4">{d.accuracy}%</td>
                      <td className="py-2 pr-4">{d.avgTime}s</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <div>Page {page} / {Math.max(1, Math.ceil(total / limit))} • {total} users</div>
              <div className="flex gap-2">
                <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
                <button className="px-2 py-1 border rounded" disabled={page>=Math.max(1, Math.ceil(total/limit))} onClick={()=>load(page+1)}>Next</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
