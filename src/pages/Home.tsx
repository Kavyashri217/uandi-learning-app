import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp, useStudent } from '../AppState';
import { getStats, levelFromXP, xpForLevel, earnedBadges } from '../gamification';
import { db } from '../db';
import { NeedStudent } from '../components/NeedStudent';

export function Home() {
  return (
    <NeedStudent>
      <Dashboard />
    </NeedStudent>
  );
}

function Dashboard() {
  const { studentId } = useApp();
  const student = useStudent();
  const stats = useLiveQuery(async () => (studentId ? await getStats(studentId) : null), [studentId], null);
  const recent = useLiveQuery(
    async () =>
      studentId
        ? (await db.xpEvents.where('studentId').equals(studentId).reverse().sortBy('at')).slice(0, 6)
        : [],
    [studentId],
    [],
  );

  if (!student || !stats) return null;

  const level = stats.level;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.round(((stats.totalXP - base) / (next - base)) * 100);
  const badges = earnedBadges(stats);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const modules = [
    { to: '/library', emoji: '📚', title: 'Reading', desc: 'NCERT & KTBS books, class 1–12' },
    { to: '/quizzes', emoji: '📝', title: 'Quizzes', desc: 'Test yourself across all subjects' },
    { to: '/games', emoji: '🎮', title: 'Games', desc: 'Learn while you play & earn XP' },
    { to: '/progress', emoji: '📊', title: 'My Progress', desc: 'Badges, streaks & report card' },
  ];

  return (
    <>
      <div
        className="card"
        style={{
          background: 'linear-gradient(120deg, #6c5ce7, #8e7bff)',
          color: '#fff', border: 'none', marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, opacity: 0.85 }}>{greeting}, {student.avatar}</div>
            <h1 style={{ margin: '2px 0 8px', fontSize: 30 }}>{student.name}!</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>🎯 Level {level}</span>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>🔥 {stats.streak}-day streak</span>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>🏅 {badges.length} badges</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', minWidth: 180 }}>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{stats.totalXP}</div>
            <div style={{ opacity: 0.85, marginBottom: 8 }}>total XP</div>
            <div className="bar gold" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <span style={{ width: `${Math.max(4, pct)}%` }} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{next - stats.totalXP} XP to Level {level + 1}</div>
          </div>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 24 }}>
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="tile">
            <div className="tile-emoji">{m.emoji}</div>
            <div className="tile-title">{m.title}</div>
            <div className="tile-desc">{m.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>📈 Quick stats</h3>
          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">{stats.quizCount}</div><div className="stat-label">Quizzes done</div></div>
            <div className="stat-box"><div className="stat-num">{stats.avgScore}%</div><div className="stat-label">Avg. score</div></div>
            <div className="stat-box"><div className="stat-num">{stats.chaptersRead}</div><div className="stat-label">Chapters read</div></div>
            <div className="stat-box"><div className="stat-num">{stats.gamesPlayed}</div><div className="stat-label">Games played</div></div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🕒 Recent activity</h3>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)' }}>Nothing yet — start reading, take a quiz, or play a game to earn your first XP!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recent.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{e.kind === 'quiz' ? '📝' : e.kind === 'game' ? '🎮' : '📚'} {e.detail}</span>
                  <strong style={{ color: 'var(--accent)' }}>+{e.xp}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
