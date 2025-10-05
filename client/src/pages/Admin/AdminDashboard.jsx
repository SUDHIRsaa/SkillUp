import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminSidebar from '../../components/AdminSidebar';
import Card from '../../components/Card';
import { fetchAdminData } from '../../services/adminService';
import StarBorder from '../../components/StarBorder';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState({ users: 0, questions: 0, challenges: 0, comparison: [], newUsersDaily: [] });
  useEffect(() => { (async ()=>{ try { setData(await fetchAdminData()); } catch(e) { console.error(e); } })(); }, []);

  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StarBorder className=""><div className="p-4"><div className="text-sm text-gray-400 mb-1">Users</div><div className="text-4xl font-bold">{data.users}</div></div></StarBorder>
            <StarBorder className=""><div className="p-4"><div className="text-sm text-gray-400 mb-1">Questions</div><div className="text-4xl font-bold">{data.questions}</div></div></StarBorder>
            <StarBorder className=""><div className="p-4"><div className="text-sm text-gray-400 mb-1">Challenges</div><div className="text-4xl font-bold">{data.challenges}</div></div></StarBorder>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card title="Daily Aptitude vs Coding (last 14 days)">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.comparison}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aptitude" fill="#60a5fa" name="Aptitude solvers" radius={[4,4,0,0]} />
                    <Bar dataKey="coding" fill="#34d399" name="Coding solvers" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="New Users per day (last 14 days)">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.newUsersDaily}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line dataKey="users" type="monotone" stroke="#f472b6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}