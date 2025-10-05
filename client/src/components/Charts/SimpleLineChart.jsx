import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SimpleLineChart({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
          <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e5e7eb' }} />
          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
