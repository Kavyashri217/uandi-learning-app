import { useMemo, useState } from 'react';
import { PAIR_THEMES, type PairTheme } from '../../data/games';
import { shuffle } from '../../data/quizzes';
import { GameOver } from './GameOver';

interface Card { key: string; pairId: number; label: string }

// Take 6 pairs from a theme -> 12 cards, shuffled.
function buildDeck(theme: PairTheme): Card[] {
  const chosen = shuffle(theme.pairs).slice(0, 6);
  const cards: Card[] = [];
  chosen.forEach(([a, b], i) => {
    cards.push({ key: `${i}-a`, pairId: i, label: a });
    cards.push({ key: `${i}-b`, pairId: i, label: b });
  });
  return shuffle(cards);
}

export function MemoryMatch() {
  const [theme, setTheme] = useState<PairTheme | null>(null);
  if (!theme) return <ThemePicker onPick={setTheme} />;
  return <Board key={theme.id} theme={theme} onChangeTheme={() => setTheme(null)} />;
}

function ThemePicker({ onPick }: { onPick: (t: PairTheme) => void }) {
  return (
    <div className="card game-stage" style={{ maxWidth: 560, margin: '20px auto' }}>
      <div style={{ fontSize: 50 }}>🃏</div>
      <h1>Memory Match</h1>
      <p style={{ color: 'var(--ink-soft)' }}>Pick a theme, then flip cards to find matching pairs. Fewer flips = more points!</p>
      <div className="grid cols-2" style={{ marginTop: 14 }}>
        {PAIR_THEMES.map((t) => (
          <button key={t.id} className="tile" onClick={() => onPick(t)} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30 }}>{t.emoji}</div>
            <div className="tile-title" style={{ margin: '6px 0 0' }}>{t.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Board({ theme, onChangeTheme }: { theme: PairTheme; onChangeTheme: () => void }) {
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => buildDeck(theme), [theme, seed]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const won = matched.size === deck.length && deck.length > 0;

  function flip(i: number) {
    if (busy || flipped.includes(i) || matched.has(i)) return;
    const nf = [...flipped, i];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nf;
      if (deck[a].pairId === deck[b].pairId) {
        setMatched((prev) => new Set([...prev, a, b]));
        setFlipped([]);
      } else {
        setBusy(true);
        setTimeout(() => { setFlipped([]); setBusy(false); }, 800);
      }
    }
  }

  if (won) {
    // Perfect game is 6 moves; award more XP for fewer wasted flips.
    const score = Math.max(20, 100 - (moves - 6) * 5);
    const xp = Math.round(score / 2);
    return <GameOver gameId="memory-match" gameName="Memory Match" emoji="🃏" score={score} xp={xp}
      detail={`Memory Match: solved in ${moves} moves`} onReplay={() => { setSeed((s) => s + 1); setMatched(new Set()); setFlipped([]); setMoves(0); }} />;
  }

  return (
    <div className="card game-stage" style={{ maxWidth: 560, margin: '10px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn ghost" onClick={onChangeTheme} style={{ padding: '6px 12px' }}>← Themes</button>
        <span className="chip">{theme.emoji} {theme.name}</span>
        <span className="chip">🔄 {moves} moves</span>
      </div>
      <div className="mem-grid">
        {deck.map((c, i) => {
          const show = flipped.includes(i) || matched.has(i);
          return (
            <button key={c.key} className={`mem-card ${matched.has(i) ? 'matched' : show ? 'flipped' : ''}`}
              onClick={() => flip(i)} disabled={matched.has(i)}>
              {show ? c.label : '?'}
            </button>
          );
        })}
      </div>
      <p style={{ color: 'var(--ink-soft)', marginTop: 16 }}>Matched {matched.size / 2} of {deck.length / 2} pairs</p>
    </div>
  );
}
