import { useEffect, useRef, useState } from 'react';
import { genMathQuestion, type MathQ } from '../../data/games';
import { GameOver } from './GameOver';

const DURATION = 60;

export function MathSprint({ klass }: { klass: number }) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'over'>('intro');
  const [q, setQ] = useState<MathQ>(() => genMathQuestion(klass));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0); // streak of correct answers
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (phase !== 'play') return;
    if (time <= 0) { setPhase('over'); return; }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, time]);

  function start() {
    setScore(0); setStreak(0); setBest(0); setTime(DURATION); setRound(0);
    setQ(genMathQuestion(klass)); setPhase('play');
  }

  function answer(val: number) {
    if (phase !== 'play') return;
    if (val === q.answer) {
      const ns = streak + 1;
      setStreak(ns); setBest((b) => Math.max(b, ns));
      setScore((s) => s + 1 + Math.min(4, Math.floor(ns / 3))); // small streak bonus
      setFlash('ok');
    } else {
      setStreak(0);
      setFlash('no');
    }
    setTimeout(() => setFlash(null), 180);
    setRound((r) => r + 1);
    setQ(genMathQuestion(klass));
  }

  if (phase === 'intro') return <Intro onStart={start} />;
  if (phase === 'over') {
    const xp = Math.round(score * 2 + best * 3);
    return <GameOver gameId="math-sprint" gameName="Math Sprint" emoji="⚡" score={score} xp={xp}
      detail={`Math Sprint: ${score} points`} onReplay={start} />;
  }

  return (
    <div className="card game-stage" style={{ maxWidth: 520, margin: '10px auto', outline: flash === 'ok' ? '3px solid var(--accent)' : flash === 'no' ? '3px solid var(--danger)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="chip">⭐ {score}</span>
        <span className="chip">🔥 {streak}</span>
        <span className="chip" style={{ color: time <= 10 ? 'var(--danger)' : undefined }}>⏱ {time}s</span>
      </div>
      <div className="bar" style={{ marginBottom: 24 }}><span style={{ width: `${(time / DURATION) * 100}%` }} /></div>
      <div style={{ fontSize: 40, fontWeight: 800, margin: '10px 0 26px' }}>{q.q}</div>
      <div className="grid cols-2">
        {q.options.map((o, i) => (
          <button key={i} className="btn big" style={{ padding: '20px', fontSize: 24 }} onClick={() => answer(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="card game-stage" style={{ maxWidth: 480, margin: '30px auto' }}>
      <div style={{ fontSize: 60 }}>⚡</div>
      <h1>Math Sprint</h1>
      <p style={{ color: 'var(--ink-soft)' }}>Solve as many as you can in {DURATION} seconds. Build a streak for bonus points!</p>
      <button className="btn primary big" onClick={onStart} style={{ marginTop: 10 }}>Start ▶</button>
    </div>
  );
}
