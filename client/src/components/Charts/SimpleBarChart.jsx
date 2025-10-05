import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SimpleBarChart({ data, height }) {
  // If parent passes explicit height, use that; otherwise allow ResponsiveContainer to size to parent
  const containerHeight = height || '100%';
  return (
    <div style={{ width: '100%', height: containerHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e7ea" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e6e7ea', color: '#111827' }} />
          <Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
