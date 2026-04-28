import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import WorkshopsPage from './pages/WorkshopsPage.jsx';
import SchoolsPage from './pages/SchoolsPage.jsx';
import AppShell from './components/AppShell.jsx';

function Protected({ children }) {
  const { admin, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (!admin)  return <Navigate to="/login" state={{ from: loc }} replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/dashboard"        element={<Protected><DashboardPage /></Protected>} />
      <Route path="/students"         element={<Protected><StudentsPage /></Protected>} />
      <Route path="/students/:id"     element={<Protected><StudentProfilePage /></Protected>} />
      <Route path="/leaderboard"      element={<Protected><LeaderboardPage /></Protected>} />
      <Route path="/workshops"        element={<Protected><WorkshopsPage /></Protected>} />
      <Route path="/schools"          element={<Protected><SchoolsPage /></Protected>} />
      <Route path="*"                 element={<Navigate to="/" replace />} />
    </Routes>
  );
}
