import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader, ErrorBox, Badge, inputCls, EmptyState } from '../components/UI.jsx';

export default function StudentsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // filters
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [perf, setPerf]     = useState('');
  const [sort, setSort]     = useState('points_desc');
  const [page, setPage]     = useState(1);
  const limit = 50;

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses || [])).catch(() => {});
  }, []);

  // Debounce search.
  const [searchDebounced, setSearchDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true); setErr('');
    api.get('/students', {
      params: { search: searchDebounced, course, performance: perf, sort, page, limit }
    })
      .then(r => { setRows(r.data.students); setTotal(r.data.total); })
      .catch(e => setErr(e.response?.data?.error || 'Failed to load students.'))
      .finally(() => setLoading(false));
  }, [searchDebounced, course, perf, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 mt-1">Browse and filter every learner registered on the platform.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <input className={inputCls} placeholder="Search by name, email, phone…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className={inputCls} value={course} onChange={e => { setCourse(e.target.value); setPage(1); }}>
            <option value="">All courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <select className={inputCls} value={perf} onChange={e => { setPerf(e.target.value); setPage(1); }}>
            <option value="">All performance levels</option>
            <option value="high">High (≥ 500 pts)</option>
            <option value="mid">Medium (100–499 pts)</option>
            <option value="low">Low (&lt; 100 pts)</option>
          </select>
          <select className={inputCls} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="points_desc">Sort: Points (high → low)</option>
            <option value="points_asc">Sort: Points (low → high)</option>
            <option value="streak_desc">Sort: Longest streak</option>
            <option value="name_asc">Sort: Name (A → Z)</option>
            <option value="recent">Sort: Recently joined</option>
          </select>
        </div>
      </div>

      <ErrorBox message={err} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 text-sm text-slate-600 flex items-center justify-between">
          <span><span className="font-bold text-slate-900">{total}</span> students</span>
          <span className="text-xs">Page {page} of {totalPages}</span>
        </div>

        {loading && <Loader />}
        {!loading && rows.length === 0 && <EmptyState title="No students match these filters" />}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Contact</th>
                  <th className="text-left px-5 py-3">Grade</th>
                  <th className="text-left px-5 py-3">Points</th>
                  <th className="text-left px-5 py-3">Streak</th>
                  <th className="text-left px-5 py-3">Courses</th>
                  <th className="text-left px-5 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-500 text-xs">#{s.rank ?? '—'}</td>
                    <td className="px-5 py-3">
                      <Link to={`/students/${s._id}`} className="font-semibold text-brand-700 hover:text-brand-900">{s.name}</Link>
                      <div className="text-xs text-slate-500">{s.village || '—'}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700">{s.email}</div>
                      <div className="text-xs text-slate-500">{s.phone || '—'}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{s.grade || '—'}</td>
                    <td className="px-5 py-3"><Badge color="brand">{s.points}</Badge></td>
                    <td className="px-5 py-3"><Badge color={s.streak_days > 0 ? 'green' : 'slate'}>🔥 {s.streak_days}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700 text-xs">{s.enrolled_count} enrolled</div>
                      <div className="text-xs text-slate-500">{s.completed_count} completed</div>
                    </td>
                    <td className="px-5 py-3 w-40">
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${s.progress_percent}%` }} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{s.progress_percent}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button className="px-3 py-1.5 text-sm rounded-md bg-slate-100 disabled:opacity-50"
              disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
            <button className="px-3 py-1.5 text-sm rounded-md bg-slate-100 disabled:opacity-50"
              disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
