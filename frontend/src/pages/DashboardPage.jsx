import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../services/api';
import { StatCard, Loader, ErrorBox } from '../components/UI.jsx';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.error || 'Failed to load dashboard.'));
  }, []);

  if (err)   return <ErrorBox message={err} />;
  if (!data) return <Loader label="Loading dashboard…" />;

  const c = data.counts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time view of student activity across the platform.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students"        value={c.total_students.toLocaleString()} accent="brand"  hint="Total registered" />
        <StatCard label="Active"          value={c.active_students.toLocaleString()} accent="accent" hint="With current streak" />
        <StatCard label="Avg Score"       value={`${c.avg_score}%`}                  accent="amber"  hint="Across all tests" />
        <StatCard label="Workshops"       value={c.total_workshops}                  accent="rose"   hint="Currently scheduled" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-slate-900">Signups — last 14 days</div>
              <div className="text-xs text-slate-500">New student registrations per day</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={data.signup_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={s => s.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
          <div className="font-bold text-slate-900 mb-1">Top performers</div>
          <div className="text-xs text-slate-500 mb-4">By total points earned</div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={data.top_performers} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="points" fill="#2563eb" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900">Recently joined students</div>
            <div className="text-xs text-slate-500">Newest signups on the platform</div>
          </div>
          <Link to="/students" className="text-sm font-semibold text-brand-700 hover:text-brand-900">View all →</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {data.recent_students.length === 0 && (
            <div className="p-5 text-sm text-slate-500">No students registered yet.</div>
          )}
          {data.recent_students.map(s => (
            <Link key={s._id} to={`/students/${s._id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold">
                {(s.name || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                <div className="text-xs text-slate-500 truncate">{s.email}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{s.points}</div>
                <div className="text-xs text-slate-500">points</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
