import { useLiveQuery } from 'dexie-react-hooks';
import { useApp, useStudent } from '../AppState';
import { BADGES, earnedBadges, getStats, levelFromXP, xpForLevel } from '../gamification';
import { db, todayStr } from '../db';

export function Progress() {
  const { studentId } = useApp();
  const student = useStudent();
  const stats = useLiveQuery(async () => (studentId ? await getStats(studentId) : null), [studentId], null);
  const attempts = useLiveQuery(
    async () => (studentId ? (await db.quizAttempts.where('studentId').equals(studentId).reverse().sortBy('date')).slice(0, 8) : []),
    [studentId], [],
  );

  if (!student || !stats) return null;
  const earned = new Set(earnedBadges(stats).map((b) => b.id));
  const level = stats.level;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.round(((stats.totalXP - base) / (next - base)) * 100);

  return (
    <>
      <h1 className="page-title">📊 {student.name}'s Progress</h1>
      <p className="page-sub">Level {level} · {stats.totalXP} XP · {earned.size} of {BADGES.length} badges earned</p>

      <div className="stat-row" style={{ marginBottom: 22 }}>
        <div className="stat-box"><div className="stat-num">🔥 {stats.streak}</div><div className="stat-label">Day streak (best {stats.maxStreak})</div></div>
        <div className="stat-box"><div className="stat-num">{stats.quizCount}</div><div className="stat-label">Quizzes taken</div></div>
        <div className="stat-box"><div className="stat-num">{stats.avgScore}%</div><div className="stat-label">Average score</div></div>
        <div className="stat-box"><div className="stat-num">{stats.perfectCount}</div><div className="stat-label">Perfect scores</div></div>
        <div className="stat-box"><div className="stat-num">{stats.chaptersRead}</div><div className="stat-label">Chapters read</div></div>
        <div className="stat-box"><div className="stat-num">{stats.gamesPlayed}</div><div className="stat-label">Games played</div></div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <strong>Level {level}</strong>
          <span className="mini-xp">{stats.totalXP - base} / {next - base} XP to Level {level + 1}</span>
        </div>
        <div className="bar gold"><span style={{ width: `${Math.max(3, pct)}%` }} /></div>
      </div>

      <ActivityHeatmap days={stats.activeDays} />

      <h2 style={{ marginTop: 26, fontSize: 20 }}>🏅 Badges</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
        {BADGES.map((b) => (
          <div key={b.id} className={`badge-card ${earned.has(b.id) ? '' : 'locked'}`}>
            <div className="badge-emoji">{earned.has(b.id) ? b.emoji : '🔒'}</div>
            <div className="badge-name">{b.name}</div>
            <div className="badge-desc">{b.desc}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 26, fontSize: 20 }}>📝 Recent quiz results</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {attempts.length === 0 ? (
          <p style={{ padding: 20, color: 'var(--ink-soft)', margin: 0 }}>No quizzes yet. Head to the Quizzes tab to start!</p>
        ) : (
          <table className="data">
            <thead><tr><th>Quiz</th><th>Score</th><th>XP</th><th>When</th></tr></thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td><strong style={{ color: a.score === a.total ? 'var(--accent)' : 'inherit' }}>{a.score}/{a.total}</strong></td>
                  <td>+{a.xp}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// Simple 5-week activity grid (GitHub-style) built from active days.
function ActivityHeatmap({ days }: { days: Set<string> }) {
  const cells: { date: string; active: boolean }[] = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = todayStr(d);
    cells.push({ date: ds, active: days.has(ds) });
  }
  return (
    <div className="card">
      <strong>🗓️ Last 5 weeks of learning</strong>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginTop: 12, maxWidth: 280 }}>
        {cells.map((c) => (
          <div key={c.date} title={c.date}
            style={{ aspectRatio: '1', borderRadius: 5, background: c.active ? 'var(--accent)' : 'var(--surface-2)', border: '1px solid var(--line)' }} />
        ))}
      </div>
      <p className="mini-xp" style={{ marginTop: 10 }}>Green squares are days {`you learned`} something. Keep the streak alive! 🔥</p>
    </div>
  );
}
