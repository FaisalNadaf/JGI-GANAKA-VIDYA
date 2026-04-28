import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader, ErrorBox, Badge, inputCls, EmptyState } from '../components/UI.jsx';

export default function LeaderboardPage() {
  const [rows, setRows]       = useState([]);
  const [filters, setFilters] = useState({ courses: [], cities: [], institutes: [] });
  const [course, setCourse]   = useState('');
  const [city, setCity]       = useState('');
  const [inst, setInst]       = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    setLoading(true); setErr('');
    api.get('/leaderboard', { params: { course, city, institute: inst, limit: 50 } })
      .then(r => { setRows(r.data.rows); setFilters(r.data.filters); })
      .catch(e => setErr(e.response?.data?.error || 'Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, [course, city, inst]);

  function rankBadge(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Leaderboard</h1>
        <p className="text-sm text-slate-500 mt-1">Top students by points. Filter by course, city, or partner institute.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <select className={inputCls} value={course} onChange={e => setCourse(e.target.value)}>
            <option value="">All courses</option>
            {filters.courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <select className={inputCls} value={city} onChange={e => setCity(e.target.value)}>
            <option value="">All cities</option>
            {filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={inputCls} value={inst} onChange={e => setInst(e.target.value)}>
            <option value="">All institutes</option>
            {filters.institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      <ErrorBox message={err} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
        {loading && <Loader />}
        {!loading && rows.length === 0 && <EmptyState title="No students match these filters" />}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 w-20">Rank</th>
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Grade</th>
                  <th className="text-left px-5 py-3">City</th>
                  <th className="text-left px-5 py-3">Streak</th>
                  <th className="text-left px-5 py-3">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(r => (
                  <tr key={r._id} className={r.rank <= 3 ? 'bg-amber-50/40' : 'hover:bg-slate-50'}>
                    <td className="px-5 py-3 text-2xl font-bold">{rankBadge(r.rank)}</td>
                    <td className="px-5 py-3">
                      <Link to={`/students/${r._id}`} className="font-bold text-brand-700 hover:text-brand-900">{r.name}</Link>
                      <div className="text-xs text-slate-500">{r.email}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{r.grade || '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{r.village || '—'}</td>
                    <td className="px-5 py-3"><Badge color={r.streak_days > 0 ? 'green' : 'slate'}>🔥 {r.streak_days}</Badge></td>
                    <td className="px-5 py-3"><span className="font-extrabold text-slate-900">{r.points}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
