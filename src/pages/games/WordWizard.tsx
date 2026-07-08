import { useMemo, useState } from 'react';
import { bandForClass, WORDS, type WordEntry } from '../../data/games';
import { shuffle } from '../../data/quizzes';
import { GameOver } from './GameOver';

const ROUNDS = 8;

function scramble(word: string): string {
  let s = word;
  // Ensure the scramble is actually different from the original.
  for (let i = 0; i < 10 && s === word; i++) s = shuffle(word.split('')).join('');
  return s;
}

export function WordWizard({ klass }: { klass: number }) {
  const band = bandForClass(klass);
  const [phase, setPhase] = useState<'play' | 'over'>('play');
  const [seed, setSeed] = useState(0);
  const deck = useMemo<WordEntry[]>(() => shuffle(WORDS[band]).slice(0, ROUNDS), [band, seed]);

  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const entry = deck[idx];
  const scrambled = useMemo(() => scramble(entry.word), [entry]);

  function submit() {
    if (reveal) return;
    if (guess.trim().toUpperCase() === entry.word) {
      setScore((s) => s + (hintUsed ? 1 : 2));
      setReveal(true);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
    }
  }

  function next() {
    if (idx + 1 < deck.length) {
      setIdx(idx + 1); setGuess(''); setReveal(false); setHintUsed(false);
    } else {
      setPhase('over');
    }
  }

  function replay() {
    setSeed((s) => s + 1); setIdx(0); setGuess(''); setScore(0); setReveal(false); setHintUsed(false); setPhase('play');
  }

  if (phase === 'over') {
    const xp = score * 4;
    return <GameOver gameId="word-wizard" gameName="Word Wizard" emoji="🔤" score={score} xp={xp}
      detail={`Word Wizard: ${score} points`} onReplay={replay} />;
  }

  return (
    <div className="card game-stage" style={{ maxWidth: 520, margin: '10px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="q-counter">Word {idx + 1} / {deck.length}</span>
        <span className="chip">⭐ {score}</span>
      </div>
      <div className="bar" style={{ marginBottom: 24 }}><span style={{ width: `${(idx / deck.length) * 100}%` }} /></div>

      <p style={{ color: 'var(--ink-soft)', margin: 0 }}>Unscramble this word:</p>
      <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 6, margin: '14px 0', color: 'var(--brand)' }}>
        {reveal ? entry.word : scrambled}
      </div>

      {!reveal && (
        <>
          <input
            className="input" value={guess} autoFocus placeholder="Type your answer"
            style={{ textAlign: 'center', fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', borderColor: wrong ? 'var(--danger)' : undefined, maxWidth: 320, margin: '0 auto 14px' }}
            onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn ghost" onClick={() => setHintUsed(true)} disabled={hintUsed}>💡 Hint</button>
            <button className="btn ghost" onClick={() => setReveal(true)}>Skip / Reveal</button>
            <button className="btn primary" onClick={submit} disabled={!guess.trim()}>Check ✓</button>
          </div>
          {hintUsed && <p style={{ marginTop: 14, fontStyle: 'italic', color: 'var(--ink-soft)' }}>Hint: {entry.hint}</p>}
        </>
      )}

      {reveal && (
        <>
          <p style={{ fontWeight: 600, color: guess.trim().toUpperCase() === entry.word ? 'var(--accent)' : 'var(--ink-soft)' }}>
            {guess.trim().toUpperCase() === entry.word ? `✅ Correct! +${hintUsed ? 1 : 2}` : `The word was ${entry.word}`}
          </p>
          <button className="btn primary big" onClick={next}>{idx + 1 < deck.length ? 'Next word →' : 'Finish 🎯'}</button>
        </>
      )}
    </div>
  );
}
