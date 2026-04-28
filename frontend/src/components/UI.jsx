// Tiny UI helpers reused across pages.

export function StatCard({ label, value, hint, accent = 'brand' }) {
  const palette = {
    brand: 'from-brand-500 to-brand-700',
    accent: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-orange-600',
    rose:  'from-rose-500 to-rose-700',
  }[accent] || 'from-brand-500 to-brand-700';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${palette} text-white grid place-items-center text-xl font-bold`}>
        {label.slice(0,1)}
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
        <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</div>
        {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
      </div>
    </div>
  );
}

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="py-12 text-center text-slate-500">
      <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin"></div>
      <div className="mt-2 text-sm">{label}</div>
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 p-3 text-sm">
      {message}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="py-12 text-center text-slate-500">
      <div className="text-4xl mb-2">📭</div>
      <div className="font-semibold text-slate-700">{title}</div>
      {hint && <div className="text-sm mt-1">{hint}</div>}
    </div>
  );
}

export function Badge({ children, color = 'slate' }) {
  const map = {
    slate:  'bg-slate-100 text-slate-700',
    brand:  'bg-brand-100 text-brand-700',
    green:  'bg-emerald-100 text-emerald-700',
    amber:  'bg-amber-100 text-amber-700',
    rose:   'bg-rose-100 text-rose-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  }[color] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${map}`}>{children}</span>;
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size] || 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${w} max-h-[90vh] overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
        <header className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button className="text-slate-400 hover:text-slate-700 text-xl leading-none" onClick={onClose}>×</button>
        </header>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">{footer}</footer>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
      {children}
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';
export const btnPrimary =
  'px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-50';
export const btnGhost =
  'px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition';
export const btnDanger =
  'px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition';
