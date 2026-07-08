import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp, useStudent } from '../../AppState';
import { GAME_META } from '../../data/games';
import { db } from '../../db';

export function GamesHome() {
  const { studentId } = useApp();
  const student = useStudent();
  const bests = useLiveQuery(async () => {
    if (!studentId) return {};
    const scores = await db.gameScores.where('studentId').equals(studentId).toArray();
    const best: Record<string, number> = {};
    for (const s of scores) best[s.gameId] = Math.max(best[s.gameId] ?? 0, s.score);
    return best;
  }, [studentId], {} as Record<string, number>);

  return (
    <>
      <h1 className="page-title">🎮 Learning Games</h1>
      <p className="page-sub">
        Play, learn and earn XP! Games adjust to Class {student?.klass ?? '—'}, so they grow with you.
      </p>

      <div className="grid cols-2">
        {Object.entries(GAME_META).map(([id, m]) => (
          <Link key={id} to={`/games/${id}`} className="tile" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ fontSize: 44 }}>{m.emoji}</div>
            <div style={{ flex: 1 }}>
              <div className="tile-title" style={{ margin: 0 }}>{m.name}</div>
              <div className="tile-desc">{m.desc}</div>
              <div className="chip" style={{ marginTop: 8, fontSize: 12 }}>🏆 Best: {bests[id] ?? 0}</div>
            </div>
            <div style={{ fontSize: 24, color: 'var(--brand)' }}>▶</div>
          </Link>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20, background: 'var(--surface-2)' }}>
        <strong>💡 How XP works:</strong> Every game rewards effort. Score more to earn more XP,
        keep a daily streak, and unlock badges on your Progress page!
      </div>
    </>
  );
}
