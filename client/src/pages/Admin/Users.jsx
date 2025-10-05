import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { listUsers, banUser, unbanUser } from '../../services/adminService';

export default function Users() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const load = async (p = page) => {
    try {
      const res = await listUsers({ q, role, status, page: p, limit });
      setRows(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
    } catch {}
  };
  useEffect(() => { load(1); }, [q, role, status, limit]);

  const onBan = async (id, banned) => {
    try { banned ? await unbanUser(id) : await banUser(id); await load(); } catch {}
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const onExport = () => {
    const header = ['Name','Email','Phone','Role','Status'];
    const rowsCsv = rows.map(u => [u.name, u.email||'', u.phone||'', u.role, u.isBanned?'Banned':'Active'].join(','));
    const csv = [header.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Card title="Users">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Input placeholder="Search name/email/phone" value={q} onChange={e=>setQ(e.target.value)} icon={MagnifyingGlassIcon} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          <select className="rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="moderator">moderator</option>
          </select>
          <select className="rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <select className="rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">{total} users</div>
          <button className="px-2 py-1 border rounded" onClick={onExport}>Export CSV</button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>No users found</td></tr>
              )}
              {rows.map((u) => (
                <tr key={u._id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4">{u.email || '-'}</td>
                  <td className="py-2 pr-4">{u.phone || '-'}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">{u.isBanned ? 'Banned' : 'Active'}</td>
                  <td className="py-2 pr-4">
                    <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => onBan(u._id, u.isBanned)}>
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div>Page {page} / {totalPages} • {total} users</div>
          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
            <button className="px-2 py-1 border rounded" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next</button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}