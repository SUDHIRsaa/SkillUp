import { useEffect, useState } from 'react';

import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { fetchPerformance } from '../../services/performanceService';
import SimpleBarChart from '../../components/Charts/SimpleBarChart.jsx';
import { UserIcon, AtSymbolIcon, PhoneIcon, AcademicCapIcon, BuildingLibraryIcon, IdentificationIcon, BriefcaseIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);

  useEffect(() => { (async ()=>{
    try {
      const res = await fetchPerformance();
      setStats(res?.dailyStats || []);
    } catch {}
  })(); }, []);

  const chartData = stats.map(s => ({ name: s.date?.slice(5), value: s.accuracy || 0 }));

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Profile" actions={<a className="px-3 py-1.5 text-sm rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" href="/profile/edit">Edit</a>}>
          <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-500"/>
              <span className="font-medium">Name:</span> <span className="text-blue-700 dark:text-blue-300">{user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <IdentificationIcon className="h-5 w-5 text-violet-500"/>
              <span className="font-medium">Username:</span> <span className="text-violet-700 dark:text-violet-300">{user?.username || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <AtSymbolIcon className="h-5 w-5 text-green-500"/>
              <span className="font-medium">Email:</span> <span className="text-green-700 dark:text-green-300">{user?.email || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-5 w-5 text-yellow-500"/>
              <span className="font-medium">Phone:</span> <span className="text-yellow-700 dark:text-yellow-300">{user?.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="h-5 w-5 text-pink-500"/>
              <span className="font-medium">College:</span> <span className="text-pink-700 dark:text-pink-300">{user?.college ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-indigo-500"/>
              <span className="font-medium">Year:</span> <span className="text-indigo-700 dark:text-indigo-300">{user?.year ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-teal-500"/>
              <span className="font-medium">Major:</span> <span className="text-teal-700 dark:text-teal-300">{user?.major ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-gray-500"/>
              <span className="font-medium">Role:</span> <span className="text-gray-700 dark:text-gray-300">{user?.role}</span>
            </div>
          </div>
        </Card>
        <Card title="Stats">
          <div className="text-3xl font-semibold text-brand-600">{stats.length} days</div>
          <div className="text-sm text-gray-600">of recorded practice</div>
        </Card>
        <Card title="Actions">
          <a className="inline-block px-4 py-2 bg-brand-600 text-white rounded" href="/aptitude">Practice now</a>
        </Card>
      </div>
      <div className="mt-6">
        <Card title="Accuracy over time">
          <div className="w-full" style={{ height: '280px' }}>
            <SimpleBarChart data={chartData} height={280} />
          </div>
        </Card>
      </div>
      <div className="mt-6">
        <Card title="Aptitude History (last 30 days)" actions={<a className="px-3 py-1.5 text-sm rounded bg-brand-600 text-white" href="/aptitude/history">View All</a>}>
          {stats.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">No aptitude attempts recorded yet.</div>
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
                  {stats.slice(-30).reverse().map((s, i) => (
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
      </div>
    </Layout>
  );
}