import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import http from '../../services/http';

export default function Leaderboard() {
  const [scope, setScope] = useState('global');
  const [college, setCollege] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    // Add a timestamp cache-buster and request no-cache to avoid stale 304 responses
    const res = await http.get('/api/leaderboard', { params: { scope, college, _ts: Date.now() }, headers: { 'Cache-Control': 'no-cache' } });
    try {
      setRows(res.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [scope, college]);

  return (
    <Layout>
      <Card title="Leaderboards" actions={
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-brand-600 focus:ring-brand-600"
            value={scope}
            onChange={e => { setScope(e.target.value); if (e.target.value !== 'college') setCollege(''); }}
          >
            <option value="global">Global</option>
            <option value="college">College</option>
          </select>
          {scope === 'college' && (
            <input
              className="border rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-brand-600 focus:ring-brand-600"
              placeholder="College name"
              value={college}
              onChange={e => setCollege(e.target.value)}
              onBlur={load}
            />
          )}
          <button className="px-3 py-1 bg-brand-600 text-white rounded" onClick={load}>Refresh</button>
        </div>
      }>
        <div className="overflow-auto">
          {loading && <div className="p-4 text-sm text-gray-500">Loading leaderboards...</div>}
          {error && <div className="p-4 text-sm text-red-500">Error: {error}</div>}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Rank</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">College</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr className="border-b"><td className="py-4" colSpan={4}>No leaderboard entries yet.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={r._id || i} className="border-b last:border-0">
                  <td className="py-2 pr-4">{r.rank || i+1}</td>
                  <td className="py-2 pr-4">{r.user?.name || 'Unknown'}{r.user?.username ? ` (${r.user.username})` : ''}</td>
                  <td className="py-2 pr-4">{r.score}</td>
                  <td className="py-2 pr-4">{r.college || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}