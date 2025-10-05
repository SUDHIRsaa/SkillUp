import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import SimpleLineChart from '../../components/Charts/SimpleLineChart';
import { fetchPerformance } from '../../services/performanceService';
import http from '../../services/http';

export default function Dashboard() {
  const [perf, setPerf] = useState({ dailyStats: [] });
  const [recentCode, setRecentCode] = useState([]);
  const [recentApt, setRecentApt] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setPerf(await fetchPerformance());
      } catch {}
      try {
        const r = await http.get('/api/coding/submissions/me');
        setRecentCode(r.data || []);
      } catch {}
      try {
        const r = await http.get('/api/performance/me');
        setRecentApt(r.data?.dailyStats?.slice(-5) || []);
      } catch {}
    })();
  }, []);

  const chartData = useMemo(() => (perf.dailyStats || []).slice(-7).map(d => ({ name: d.date.slice(5), value: d.accuracy || 0 })), [perf]);
  const today = (perf.dailyStats || []).slice(-1)[0];

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Welcome back">
          <p className="text-sm text-gray-700 dark:text-gray-200">Track your weekly accuracy, streaks, and challenges at a glance.</p>
        </Card>
        <Card title="Today">
          {today ? (
            <ul className="text-sm text-gray-700 dark:text-gray-200 list-disc pl-5 space-y-1">
              <li>Attempted: {today.total}</li>
              <li>Correct: {today.correct} ({today.accuracy}%)</li>
              <li>Avg time: {today.avgTime || 0}s</li>
            </ul>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300">No attempts yet today.</div>
          )}
        </Card>
        <Card title="Recent Code Submissions">
          <ul className="text-sm space-y-1 max-h-40 overflow-auto">
            {recentCode.slice(0,5).map(s => (
              <li key={s._id} className="flex items-center justify-between">
                <span className="truncate">{s.language} • {s.result}</span>
                <span className="text-gray-500">{new Date(s.timestamp).toLocaleDateString()}</span>
              </li>
            ))}
            {!recentCode.length && <li className="text-gray-600 dark:text-gray-300">No submissions yet.</li>}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Weekly Accuracy">
          <SimpleLineChart data={chartData} />
        </Card>
        <Card title="Recent Aptitude Attempts">
          <ul className="text-sm space-y-1 max-h-48 overflow-auto">
            {recentApt.map(d => (
              <li key={d.date} className="flex items-center justify-between">
                <span>{d.date}</span>
                <span className="text-gray-500">{d.correct}/{d.total} ({d.accuracy}%)</span>
              </li>
            ))}
            {!recentApt.length && <li className="text-gray-600 dark:text-gray-300">No history yet.</li>}
          </ul>
        </Card>
      </div>
    </Layout>
  );
}