import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../AppState';
import { db } from '../../db';

// Shown when a game ends. Persists the score + awards XP exactly once
// (guarded by a ref so React StrictMode's double-invoke can't double-count).
export function GameOver({
  gameId, gameName, emoji, score, xp, detail, onReplay,
}: {
  gameId: string;
  gameName: string;
  emoji: string;
  score: number;
  xp: number;
  detail: string;
  onReplay: () => void;
}) {
  const { studentId, reward } = useApp();
  const navigate = useNavigate();
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current || studentId == null) return;
    saved.current = true;
    (async () => {
      await db.gameScores.add({ studentId, gameId, score, xp, date: new Date().toISOString() });
      await reward(xp, 'game', detail);
    })();
  }, [studentId, gameId, score, xp, detail, reward]);

  return (
    <div className="card game-stage" style={{ maxWidth: 480, margin: '30px auto' }}>
      <div style={{ fontSize: 60 }}>{emoji}</div>
      <h1 style={{ margin: '4px 0' }}>{gameName}</h1>
      <p style={{ fontSize: 18, color: 'var(--ink-soft)', margin: '4px 0 2px' }}>Your score</p>
      <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--brand)' }}>{score}</div>
      <p className="chip" style={{ margin: '10px 0 20px' }}>⭐ +{xp} XP earned</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn ghost" onClick={() => navigate('/games')}>All games</button>
        <button className="btn primary" onClick={onReplay}>Play again 🔁</button>
      </div>
    </div>
  );
}
