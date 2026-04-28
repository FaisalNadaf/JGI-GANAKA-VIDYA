import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { Loader, ErrorBox, Badge, btnPrimary, btnGhost, EmptyState } from '../components/UI.jsx';

export default function StudentProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr]   = useState('');

  useEffect(() => {
    setData(null); setErr('');
    api.get(`/students/${id}`)
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.error || 'Failed to load student.'));
  }, [id]);

  if (err)   return <ErrorBox message={err} />;
  if (!data) return <Loader label="Loading profile…" />;

  const s = data.student;
  const trend = data.point_trend.map((t, i) => ({ x: i + 1, points: t.points }));

  return (
    <div className="space-y-6">
      <div>
        <Link to="/students" className="text-sm text-brand-700 hover:text-brand-900">← Back to students</Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-2xl font-extrabold">
            {(s.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900">{s.name}</h1>
            <div className="text-sm text-slate-500">{s.email} · {s.phone || 'no phone'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {s.grade   && <Badge color="brand">{s.grade}</Badge>}
              {s.village && <Badge color="slate">📍 {s.village}</Badge>}
              {s.language&& <Badge color="indigo">🗣 {s.language.toUpperCase()}</Badge>}
              {s.rank    && <Badge color="amber">Rank #{s.rank}</Badge>}
            </div>
          </div>
          <div className="flex gap-2 self-start">
            <a href={`mailto:${s.email}`} className={btnPrimary}>📧 Email</a>
            <a href={`tel:${s.phone}`} className={btnGhost} onClick={e => { if (!s.phone) { e.preventDefault(); alert('No phone number on file.'); } }}>📞 Call</a>
          </div>
        </div>

        {/* Inline KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { l: 'Points',         v: s.points,           c: 'brand' },
            { l: 'Streak',         v: `🔥 ${s.streak_days}`, c: 'green' },
            { l: 'Courses Enrolled', v: s.enrolled_count,  c: 'amber' },
            { l: 'Completed',      v: s.completed_count,  c: 'rose'  },
          ].map(k => (
            <div key={k.l} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="text-[11px] uppercase font-bold tracking-wide text-slate-500">{k.l}</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-col: courses + chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
          <div className="font-bold text-slate-900 mb-1">Enrolled courses</div>
          <div className="text-xs text-slate-500 mb-3">Progress: {s.progress_percent}%</div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
            <div className="h-full bg-brand-500" style={{ width: `${s.progress_percent}%` }} />
          </div>
          {s.enrolled_courses?.length ? (
            <ul className="space-y-2">
              {s.enrolled_courses.map((c, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                  <div className="w-8 h-8 rounded-md bg-brand-100 text-brand-700 grid place-items-center text-sm font-bold">{i + 1}</div>
                  <div className="text-sm font-semibold text-slate-800 flex-1">{c}</div>
                </li>
              ))}
            </ul>
          ) : <EmptyState title="No courses enrolled yet" />}

          {s.weak_subjects?.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Weak areas</div>
              <div className="flex flex-wrap gap-2">
                {s.weak_subjects.map(w => <Badge key={w} color="rose">{w}</Badge>)}
              </div>
            </div>
          )}
          {s.badges?.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Badges earned</div>
              <div className="flex flex-wrap gap-2">
                {s.badges.map(b => <Badge key={b} color="amber">🏅 {b}</Badge>)}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
          <div className="font-bold text-slate-900 mb-1">Points trend</div>
          <div className="text-xs text-slate-500 mb-3">Last 30 point-earning events</div>
          {trend.length ? (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="points" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState title="No point activity yet" />}
        </div>
      </div>

      {/* Test history */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="font-bold text-slate-900">Test history</div>
          <div className="text-xs text-slate-500">Last 20 attempts</div>
        </div>
        {data.test_history.length === 0 ? (
          <EmptyState title="No test history" hint="This student hasn't submitted any tests yet." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Test</th>
                <th className="text-left px-5 py-3">Score</th>
                <th className="text-left px-5 py-3">%</th>
                <th className="text-left px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.test_history.map(t => (
                <tr key={t._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{t.title}</td>
                  <td className="px-5 py-3 text-slate-700">{t.score}/{t.max_score}</td>
                  <td className="px-5 py-3"><Badge color={t.percent >= 60 ? 'green' : t.percent >= 40 ? 'amber' : 'rose'}>{t.percent}%</Badge></td>
                  <td className="px-5 py-3 text-xs text-slate-500">{t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
