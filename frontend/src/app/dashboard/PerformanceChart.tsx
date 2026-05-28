"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const defaultData = [
  { name: 'Jan', score: 65 }, { name: 'Feb', score: 72 },
  { name: 'Mar', score: 80 }, { name: 'Apr', score: 78 },
  { name: 'May', score: 88 },
];

export const PerformanceChart = ({ data = defaultData }: { data?: { name: string; score: number }[] }) => (
  <div className="h-64 w-full bg-slate-900 p-4 rounded-2xl border border-white/10">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
        <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
