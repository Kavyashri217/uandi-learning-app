import { useParams, Link } from 'react-router-dom';
import { useStudent } from '../../AppState';
import { MathSprint } from './MathSprint';
import { WordWizard } from './WordWizard';
import { MemoryMatch } from './MemoryMatch';
import { RapidFire } from './RapidFire';

export function GamePlay() {
  const { gameId } = useParams();
  const student = useStudent();
  const klass = student?.klass ?? 5;

  return (
    <div>
      <Link className="btn ghost" to="/games" style={{ marginBottom: 8 }}>← All games</Link>
      {gameId === 'math-sprint' && <MathSprint klass={klass} />}
      {gameId === 'word-wizard' && <WordWizard klass={klass} />}
      {gameId === 'memory-match' && <MemoryMatch />}
      {gameId === 'rapid-fire' && <RapidFire klass={klass} />}
      {!['math-sprint', 'word-wizard', 'memory-match', 'rapid-fire'].includes(gameId ?? '') && (
        <div className="empty"><div className="big">🎮</div><h2>Game not found</h2></div>
      )}
    </div>
  );
}
