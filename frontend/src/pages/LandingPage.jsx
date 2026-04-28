import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-extrabold">IP</div>
            <div className="font-bold text-slate-900">Institute Partner Portal</div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <a href="#about" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">About</a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">Benefits</a>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-emerald-50 -z-10" />
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold tracking-wide uppercase">
              For Coaching Institutes & Colleges
            </span>
            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Reach the right rural students with{' '}
              <span className="text-brand-600">verified data</span>.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              The Institute Partner Portal connects you with motivated learners on the
              Atmanirbhar Bharat student platform. View real performance data, organize
              workshops at local schools, and run mentorship programs — all from one
              clean dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-lg shadow-brand-600/20">
                Sign in to your portal →
              </Link>
              <a href="#benefits" className="px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">
                See benefits
              </a>
            </div>
            <div className="mt-8 flex items-center gap-8 text-xs text-slate-500">
              <div><div className="text-2xl font-extrabold text-slate-900">100%</div>real student data</div>
              <div><div className="text-2xl font-extrabold text-slate-900">4</div>indian languages</div>
              <div><div className="text-2xl font-extrabold text-slate-900">0</div>setup fees</div>
            </div>
          </div>

          {/* Mock dashboard tile */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-200/40 to-emerald-200/40 rounded-3xl blur-2xl -z-10" />
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">📊</div>
                <div>
                  <div className="font-bold text-slate-900">Dashboard preview</div>
                  <div className="text-xs text-slate-500">Real data from your students</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { l: 'Students',    v: '1,240', c: 'bg-brand-50 text-brand-700' },
                  { l: 'Active',      v: '890',   c: 'bg-emerald-50 text-emerald-700' },
                  { l: 'Avg Score',   v: '72%',   c: 'bg-amber-50 text-amber-700' },
                  { l: 'Workshops',   v: '12',    c: 'bg-rose-50 text-rose-700' },
                ].map(s => (
                  <div key={s.l} className={`rounded-lg p-3 ${s.c}`}>
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{s.l}</div>
                    <div className="text-2xl font-extrabold mt-1">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-32 bg-gradient-to-tr from-brand-100 to-emerald-100 rounded-lg flex items-end p-2 gap-1">
                {[28,42,35,55,48,72,65,80].map((h,i) => (
                  <div key={i} className="flex-1 bg-brand-600 rounded-t" style={{height: `${h}%`}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="text-sm font-bold text-brand-600 uppercase tracking-wide">What is this platform</div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Bridging online learning with offline trust.</h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              The Atmanirbhar Bharat Rural Learning Platform helps students from villages
              and small towns earn points by completing courses and tests. Partnered
              institutes can convert those points into real discounts on their offline
              programs. This portal is where you, the institute partner, see who is
              learning, who is excelling, and how to engage them next.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-sm font-bold text-brand-600 uppercase tracking-wide">For institutes</div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Everything you need to engage students.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Real performance data',  body: 'View live ranks, points, streaks, and weak subjects for every student on the platform.' },
              { icon: '📞', title: 'Direct contact',          body: 'Email or call students to invite them for workshops and mentorship — no third party.' },
              { icon: '🎤', title: 'Run workshops anywhere',  body: 'Create seminars, workshops and mentorship sessions at partner schools and colleges.' },
              { icon: '🏆', title: 'Multi-axis leaderboards', body: 'Filter rankings by course, city, or institute affiliation in two clicks.' },
              { icon: '🏫', title: 'Local school directory',  body: 'Maintain your network of partner schools and colleges, with contact info in one place.' },
              { icon: '🔔', title: 'Built-in notifications',  body: 'Auto-invite filtered students to events with a single click — they get a notification.' },
            ].map(b => (
              <div key={b.title} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition">
                <div className="text-3xl">{b.icon}</div>
                <div className="font-bold text-slate-900 mt-3">{b.title}</div>
                <div className="text-sm text-slate-600 mt-1 leading-relaxed">{b.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold">Ready to see who's learning?</h2>
          <p className="mt-3 text-brand-100 text-lg">
            Sign in with your institute admin account to start exploring.
          </p>
          <Link to="/login"
            className="inline-block mt-8 px-8 py-3 rounded-lg bg-white text-brand-700 font-bold hover:bg-brand-50 transition shadow-lg">
            Sign in to portal →
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <div>© {new Date().getFullYear()} Atmanirbhar Bharat Initiative</div>
          <div>Institute Partner Portal v1.0</div>
        </div>
      </footer>
    </div>
  );
}
