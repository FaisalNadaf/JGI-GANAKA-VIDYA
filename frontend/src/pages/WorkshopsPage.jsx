import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader, ErrorBox, Badge, inputCls, btnPrimary, btnGhost, btnDanger,
         Modal, Field, EmptyState } from '../components/UI.jsx';

const TYPE_COLOR = { workshop: 'brand', seminar: 'indigo', mentorship: 'green' };
const GRADES = ['Class 8','Class 9','Class 10','Class 11','Class 12','PUC-1','PUC-2','Degree-1','Degree-2','Degree-3'];

export default function WorkshopsPage() {
  const [items, setItems]     = useState([]);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = create, {existing}= edit

  async function load() {
    setLoading(true); setErr('');
    try {
      const [a, b, c] = await Promise.all([
        api.get('/workshops'),
        api.get('/schools'),
        api.get('/courses'),
      ]);
      setItems(a.data.workshops);
      setSchools(b.data.schools);
      setCourses(c.data.courses);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to load workshops.');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save(form) {
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      date: form.date,
      location: form.location,
      school_id: form.school_id || null,
      target_grades: form.target_grades,
      target_courses: form.target_courses,
    };
    if (form._id) await api.put(`/workshops/${form._id}`, payload);
    else          await api.post('/workshops', payload);
    setEditing(null);
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this workshop?')) return;
    await api.delete(`/workshops/${id}`);
    load();
  }

  async function invite(id) {
    try {
      const r = await api.post(`/workshops/${id}/invite`, {});
      alert(`Invitations sent to ${r.data.invited_count} student(s).`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to send invitations.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Workshops & mentorship</h1>
          <p className="text-sm text-slate-500 mt-1">Create workshops, seminars and mentorship sessions; auto-invite filtered students.</p>
        </div>
        <button className={btnPrimary} onClick={() => setEditing({})}>+ New event</button>
      </div>

      <ErrorBox message={err} />

      {loading && <Loader />}

      {!loading && items.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft">
          <EmptyState title="No events yet" hint="Click 'New event' to schedule your first workshop." />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(w => (
            <div key={w._id} className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={TYPE_COLOR[w.type] || 'brand'}>{w.type}</Badge>
                    <span className="text-xs text-slate-500">{new Date(w.date).toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{w.title}</h3>
                  {w.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{w.description}</p>}
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <div>📍 {w.location || '—'}{w.school_name && ` · ${w.school_name}`}</div>
                <div>🎯 {w.target_grades?.length ? w.target_grades.join(', ') : 'All grades'}</div>
                <div>👥 {w.invited_count} invited</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className={btnPrimary} onClick={() => invite(w._id)}>📣 Send invites</button>
                <button className={btnGhost}   onClick={() => setEditing(w)}>Edit</button>
                <button className={btnDanger}  onClick={() => remove(w._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <WorkshopModal
          existing={editing._id ? editing : null}
          schools={schools} courses={courses}
          onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function WorkshopModal({ existing, schools, courses, onClose, onSave }) {
  const [form, setForm] = useState(() => existing ? {
    _id: existing._id,
    title: existing.title || '',
    description: existing.description || '',
    type: existing.type || 'workshop',
    date: existing.date ? new Date(existing.date).toISOString().slice(0, 10) : '',
    location: existing.location || '',
    school_id: existing.school_id || '',
    target_grades: existing.target_grades || [],
    target_courses: existing.target_courses || [],
  } : {
    title: '', description: '', type: 'workshop', date: '', location: '',
    school_id: '', target_grades: [], target_courses: [],
  });
  const [busy, setBusy] = useState(false);

  function toggle(key, value) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value]
    }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title || !form.date) return alert('Title and date are required.');
    setBusy(true);
    try { await onSave(form); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={true} onClose={onClose} title={existing ? 'Edit event' : 'Create event'} size="lg"
      footer={
        <>
          <button className={btnGhost}   onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </>
      }>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title">
          <input className={inputCls} value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
        </Field>
        <Field label="Description">
          <textarea className={inputCls} rows="3" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="mentorship">Mentorship</option>
            </select>
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} required />
          </Field>
        </div>
        <Field label="Location (free-form)">
          <input className={inputCls} value={form.location} placeholder="e.g. School auditorium, Patna"
            onChange={e => setForm({ ...form, location: e.target.value })} />
        </Field>
        <Field label="Linked school / college">
          <select className={inputCls} value={form.school_id}
            onChange={e => setForm({ ...form, school_id: e.target.value })}>
            <option value="">— None —</option>
            {schools.map(s => <option key={s._id} value={s._id}>{s.name} ({s.city})</option>)}
          </select>
        </Field>
        <Field label="Target grades" hint="Students with these grades will be auto-invited.">
          <div className="flex flex-wrap gap-2">
            {GRADES.map(g => (
              <button type="button" key={g}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  form.target_grades.includes(g)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => toggle('target_grades', g)}>{g}</button>
            ))}
          </div>
        </Field>
        <Field label="Target courses" hint="Students enrolled in any of these courses will be auto-invited.">
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto scrollbar">
            {courses.map(c => (
              <button type="button" key={c._id}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  form.target_courses.includes(c._id)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => toggle('target_courses', c._id)}>{c.title}</button>
            ))}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
