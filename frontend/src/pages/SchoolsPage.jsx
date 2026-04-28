import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader, ErrorBox, Badge, inputCls, btnPrimary, btnGhost, btnDanger,
         Modal, Field, EmptyState } from '../components/UI.jsx';

export default function SchoolsPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [editing, setEditing] = useState(null);
  const [search, setSearch]   = useState('');

  async function load() {
    setLoading(true); setErr('');
    try { setItems((await api.get('/schools')).data.schools); }
    catch (e) { setErr(e.response?.data?.error || 'Failed to load schools.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save(form) {
    if (form._id) await api.put(`/schools/${form._id}`, form);
    else          await api.post('/schools', form);
    setEditing(null);
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this school/college?')) return;
    await api.delete(`/schools/${id}`);
    load();
  }

  const visible = items.filter(s => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [s.name, s.city, s.state, s.contact_name, s.contact_email]
      .filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Schools & colleges</h1>
          <p className="text-sm text-slate-500 mt-1">Your network of partner institutions for workshops & mentorship.</p>
        </div>
        <button className={btnPrimary} onClick={() => setEditing({})}>+ Add institution</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-4">
        <input className={inputCls} placeholder="Search by name, city, state or contact…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <ErrorBox message={err} />

      {loading && <Loader />}

      {!loading && visible.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft">
          <EmptyState title="No schools or colleges yet" hint="Add your first partner institution to start scheduling events there." />
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(s => (
            <div key={s._id} className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge color={s.type === 'college' ? 'indigo' : 'brand'}>{s.type}</Badge>
                {s.workshop_count > 0 && <Badge color="amber">🎤 {s.workshop_count} events</Badge>}
              </div>
              <h3 className="font-bold text-slate-900">{s.name}</h3>
              <div className="text-sm text-slate-500">{s.city}{s.state && `, ${s.state}`}</div>

              <div className="mt-4 text-xs text-slate-600 space-y-1">
                {s.contact_name  && <div>👤 {s.contact_name}</div>}
                {s.contact_phone && <div>📞 <a className="text-brand-700 hover:text-brand-900" href={`tel:${s.contact_phone}`}>{s.contact_phone}</a></div>}
                {s.contact_email && <div>📧 <a className="text-brand-700 hover:text-brand-900" href={`mailto:${s.contact_email}`}>{s.contact_email}</a></div>}
                {s.notes         && <div className="mt-2 italic text-slate-500">"{s.notes}"</div>}
              </div>

              <div className="mt-4 flex gap-2">
                <button className={btnGhost}  onClick={() => setEditing(s)}>Edit</button>
                <button className={btnDanger} onClick={() => remove(s._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <SchoolModal existing={editing._id ? editing : null}
          onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function SchoolModal({ existing, onClose, onSave }) {
  const [form, setForm] = useState(() => existing ? { ...existing } : {
    name: '', type: 'school', city: '', state: '',
    contact_name: '', contact_phone: '', contact_email: '', notes: '',
  });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.city) return alert('Name and city are required.');
    setBusy(true);
    try { await onSave(form); } finally { setBusy(false); }
  }

  return (
    <Modal open={true} onClose={onClose} title={existing ? 'Edit institution' : 'Add school / college'} size="md"
      footer={
        <>
          <button className={btnGhost}   onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </>
      }>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input className={inputCls} value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="school">School</option>
              <option value="college">College</option>
            </select>
          </Field>
          <Field label="State">
            <input className={inputCls} value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })} />
          </Field>
        </div>
        <Field label="City">
          <input className={inputCls} value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })} required />
        </Field>
        <Field label="Contact name">
          <input className={inputCls} value={form.contact_name}
            onChange={e => setForm({ ...form, contact_name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact phone">
            <input className={inputCls} value={form.contact_phone}
              onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
          </Field>
          <Field label="Contact email">
            <input className={inputCls} type="email" value={form.contact_email}
              onChange={e => setForm({ ...form, contact_email: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className={inputCls} rows="2" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
