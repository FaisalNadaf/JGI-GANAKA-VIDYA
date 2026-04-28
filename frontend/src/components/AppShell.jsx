import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',   icon: '📊' },
  { to: '/students',    label: 'Students',    icon: '🎓' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/workshops',   label: 'Workshops',   icon: '🎤' },
  { to: '/schools',     label: 'Schools',     icon: '🏫' },
];

export default function AppShell({ children }) {
  const { admin, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    nav('/login', { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform
                         ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-extrabold">IP</div>
          <div className="ml-3">
            <div className="font-bold text-slate-900 leading-tight">Partner Portal</div>
            <div className="text-xs text-slate-500">Institute Console</div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-400 mb-1">Signed in as</div>
          <div className="text-sm font-semibold text-slate-900 truncate">{admin?.name}</div>
          <div className="text-xs text-slate-500 truncate">{admin?.institute_name}</div>
          <button onClick={handleLogout}
            className="mt-3 w-full text-sm font-medium px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <div className="ml-2 lg:ml-0 font-semibold text-slate-700">{admin?.institute_name || 'Institute Console'}</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-sm text-slate-500">{admin?.email}</div>
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white grid place-items-center font-bold">
              {(admin?.name || '?').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
