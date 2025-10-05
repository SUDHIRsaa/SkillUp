import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { fetchPerformance } from '../../services/performanceService';

export default function AptitudeHistory() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async ()=>{
    try {
      const res = await fetchPerformance();
      setStats(res?.dailyStats || []);
    } finally { setLoading(false); }
  })(); }, []);

  const exportCsv = () => {
    const headers = ['Date','Total','Correct','Accuracy','AvgTime'];
    const rows = stats.map(s => [s.date, s.total, s.correct, s.accuracy, s.avgTime]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aptitude-history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Aptitude History</h1>
        <button onClick={exportCsv} className="px-3 py-1.5 text-sm rounded bg-brand-600 text-white">Export CSV</button>
      </div>
      <Card>
        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : stats.length === 0 ? (
          <div className="text-sm text-gray-600">No aptitude attempts recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Accuracy</th>
                  <th className="py-2 pr-4">Avg Time (s)</th>
                </tr>
              </thead>
              <tbody>
                {stats.slice().reverse().map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="py-2 pr-4">{s.date}</td>
                    <td className="py-2 pr-4">{s.correct}/{s.total}</td>
                    <td className="py-2 pr-4">{s.accuracy}%</td>
                    <td className="py-2 pr-4">{s.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}
