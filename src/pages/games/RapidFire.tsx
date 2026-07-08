import { useEffect, useMemo, useState } from 'react';
import { bandForClass, TRUE_FALSE, type TFStatement } from '../../data/games';
import { shuffle } from '../../data/quizzes';
import { GameOver } from './GameOver';

const ROUNDS = 10;
const PER_Q = 8; // seconds per statement

export function RapidFire({ klass }: { klass: number }) {
  const band = bandForClass(klass);
  const [seed, setSeed] = useState(0);
  const deck = useMemo<TFStatement[]>(() => shuffle(TRUE_FALSE[band]).slice(0, ROUNDS), [band, seed]);

  const [phase, setPhase] = useState<'play' | 'over'>('play');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(PER_Q);
  const [feedback, setFeedback] = useState<null | boolean>(null);

  const cur = deck[idx];

  useEffect(() => {
    if (phase !== 'play' || feedback != null) return;
    if (time <= 0) { lockIn(null); return; }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, time, feedback]);

  function lockIn(ans: boolean | null) {
    if (feedback != null) return;
    const correct = ans === cur.answer;
    if (correct) setScore((s) => s + 1);
    setFeedback(correct);
    setTimeout(() => {
      if (idx + 1 < deck.length) { setIdx(idx + 1); setTime(PER_Q); setFeedback(null); }
      else setPhase('over');
    }, 900);
  }

  function replay() {
    setSeed((s) => s + 1); setIdx(0); setScore(0); setTime(PER_Q); setFeedback(null); setPhase('play');
  }

  if (phase === 'over') {
    const xp = score * 5;
    return <GameOver gameId="rapid-fire" gameName="Rapid Fire" emoji="🔥" score={score} xp={xp}
      detail={`Rapid Fire: ${score}/${deck.length} correct`} onReplay={replay} />;
  }

  return (
    <div className="card game-stage" style={{ maxWidth: 560, margin: '10px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="q-counter">{idx + 1} / {deck.length}</span>
        <span className="chip">⭐ {score}</span>
        <span className="chip" style={{ color: time <= 3 ? 'var(--danger)' : undefined }}>⏱ {time}s</span>
      </div>
      <div className="bar" style={{ marginBottom: 26 }}><span style={{ width: `${(time / PER_Q) * 100}%` }} /></div>

      <div style={{
        fontSize: 26, fontWeight: 700, lineHeight: 1.4, minHeight: 120, display: 'grid', placeItems: 'center',
        padding: '10px 6px',
        color: feedback == null ? 'var(--ink)' : feedback ? 'var(--accent)' : 'var(--danger)',
      }}>
        {feedback == null ? cur.s : feedback ? '✅ Correct!' : `❌ It was ${cur.answer ? 'TRUE' : 'FALSE'}`}
      </div>

      <div className="grid cols-2" style={{ marginTop: 10 }}>
        <button className="btn accent big" style={{ padding: 22, fontSize: 22 }} disabled={feedback != null} onClick={() => lockIn(true)}>👍 TRUE</button>
        <button className="btn danger big" style={{ padding: 22, fontSize: 22 }} disabled={feedback != null} onClick={() => lockIn(false)}>👎 FALSE</button>
      </div>
    </div>
  );
}
