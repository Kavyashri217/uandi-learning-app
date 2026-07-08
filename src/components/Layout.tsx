import { NavLink, Outlet } from 'react-router-dom';
import { StudentSwitcher } from './StudentSwitcher';
import { useApp } from '../AppState';

const NAV = [
  { to: '/', icon: '🏠', label: 'Home', end: true },
  { to: '/library', icon: '📚', label: 'Reading' },
  { to: '/quizzes', icon: '📝', label: 'Quizzes' },
  { to: '/games', icon: '🎮', label: 'Games' },
  { to: '/progress', icon: '📊', label: 'Progress' },
  { to: '/teacher', icon: '🧑‍🏫', label: 'Teacher' },
];

export function Layout() {
  const { toasts, newBadge, clearBadge } = useApp();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">🌱</span>
          <div>
            <div className="brand-name">VidyaSetu</div>
            <div className="brand-sub">Learn · Play · Grow</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          Free & offline-friendly.<br />Built for NGO classrooms.<br />NCERT · KTBS aligned.
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>Learning dashboard</div>
          <StudentSwitcher />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div className="toast" key={t.id}><span>{t.emoji}</span>{t.text}</div>
        ))}
      </div>

      {newBadge && (
        <div className="badge-float" onClick={clearBadge}>
          <div className="inner">
            <div style={{ fontWeight: 700, color: 'var(--brand)', letterSpacing: 1 }}>NEW BADGE UNLOCKED!</div>
            <div className="be">{newBadge.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{newBadge.name}</div>
            <button className="btn primary" style={{ marginTop: 16 }} onClick={clearBadge}>Awesome! 🎉</button>
          </div>
        </div>
      )}
    </div>
  );
}
