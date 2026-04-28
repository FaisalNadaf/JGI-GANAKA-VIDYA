import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ErrorBox, Field, inputCls, btnPrimary } from '../components/UI.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const dest = loc.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('admin@pw.in');
  const [pw, setPw]       = useState('admin1234');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await login(email.trim().toLowerCase(), pw);
      nav(dest, { replace: true });
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-extrabold">IP</div>
            <div className="font-bold text-slate-900">Institute Partner Portal</div>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Use the credentials provided by your institute admin.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Email">
              <input className={inputCls} type="email" autoComplete="username" required
                value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pw.in" />
            </Field>
            <Field label="Password">
              <input className={inputCls} type="password" autoComplete="current-password" required
                value={pw} onChange={e => setPw(e.target.value)} />
            </Field>
            <ErrorBox message={err} />
            <button className={`${btnPrimary} w-full py-2.5`} type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="font-bold text-slate-700 mb-1">Demo accounts (after running seed.js):</div>
            <div className="font-mono text-[11px] leading-5">
              admin@pw.in / admin1234<br/>
              admin@aakash.in / admin1234<br/>
              admin@byjus.in / admin1234
            </div>
          </div>
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="hidden lg:flex bg-gradient-to-br from-brand-600 to-brand-900 text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="text-brand-100 text-sm hover:text-white">← Back to home</Link>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Welcome back to your<br />student insights console.</h2>
          <p className="mt-4 text-brand-100">
            Live performance data. Direct outreach. Workshop scheduling. All in one
            secure portal — built for the institutes shaping rural India's next
            generation of learners.
          </p>
        </div>
        <div className="text-xs text-brand-200">© {new Date().getFullYear()} Atmanirbhar Bharat Initiative</div>
      </div>
    </div>
  );
}
