import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../AppState';
import { getQuestions, shuffle } from '../data/quizzes';
import type { Question, Subject } from '../data/types';
import { db } from '../db';

const XP_CORRECT = 10;
const XP_PERFECT_BONUS = 25;
const MAX_QUESTIONS = 10;

interface Loaded {
  title: string;
  subject: string;
  klass: number;
  quizId: string;
  questions: Question[];
}

export function QuizPlay() {
  const params = useParams();
  const navigate = useNavigate();
  const { studentId, reward, pushToast } = useApp();

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load either a built-in subject quiz or a custom quiz by id.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (params.id) {
        const q = await db.customQuizzes.get(Number(params.id));
        if (!alive) return;
        if (!q) { setNotFound(true); return; }
        setLoaded({
          title: q.title, subject: q.subject, klass: q.klass, quizId: `custom-${q.id}`,
          questions: shuffle(q.questions).slice(0, MAX_QUESTIONS),
        });
      } else if (params.subject && params.klass) {
        const subject = decodeURIComponent(params.subject) as Subject;
        const klass = Number(params.klass);
        const all = getQuestions(subject, klass);
        if (!all.length) { setNotFound(true); return; }
        setLoaded({
          title: `${subject} · Class ${klass}`, subject, klass, quizId: `${subject}-${klass}`,
          questions: shuffle(all).slice(0, MAX_QUESTIONS),
        });
      }
    })();
    return () => { alive = false; };
  }, [params.id, params.subject, params.klass]);

  if (notFound) {
    return (
      <div className="empty">
        <div className="big">🤔</div>
        <h2>Quiz not found</h2>
        <Link className="btn primary" to="/quizzes">Back to quizzes</Link>
      </div>
    );
  }
  if (!loaded) return null;

  return <Runner key={loaded.quizId} loaded={loaded} studentId={studentId!} reward={reward} pushToast={pushToast} onExit={() => navigate('/quizzes')} />;
}

function Runner({
  loaded, studentId, reward, pushToast, onExit,
}: {
  loaded: Loaded;
  studentId: number;
  reward: (xp: number, kind: 'quiz', detail: string) => Promise<void>;
  pushToast: (t: string, e?: string) => void;
  onExit: () => void;
}) {
  const { questions } = loaded;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // Randomise option order per question, but remember where the right answer went.
  const shuffledOptions = useMemo(
    () =>
      questions.map((q) => {
        const order = shuffle(q.options.map((_, i) => i));
        return { order, answerPos: order.indexOf(q.answer) };
      }),
    [questions],
  );

  const q = questions[idx];
  const opt = shuffledOptions[idx];

  function choose(pos: number) {
    if (picked != null) return;
    setPicked(pos);
    if (pos === opt.answerPos) setScore((s) => s + 1);
  }

  async function next() {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setDone(true);
      const perfect = score === questions.length;
      const xp = score * XP_CORRECT + (perfect ? XP_PERFECT_BONUS : 0);
      await db.quizAttempts.add({
        studentId, quizId: loaded.quizId, title: loaded.title, subject: loaded.subject,
        klass: loaded.klass, score, total: questions.length, xp, date: new Date().toISOString(),
      });
      await reward(xp, 'quiz', `${loaded.subject} quiz: ${score}/${questions.length}`);
      if (perfect) setTimeout(() => pushToast('Perfect score! Bonus +25 XP', '💯'), 300);
    }
  }

  if (done) {
    const perfect = score === questions.length;
    const pct = Math.round((score / questions.length) * 100);
    const msg = perfect ? 'Perfect! Outstanding! 🌟' : pct >= 70 ? 'Great job! 🎉' : pct >= 40 ? 'Good effort — keep practising! 💪' : "Don't give up — try again! 🌱";
    return (
      <div className="card" style={{ maxWidth: 560, margin: '20px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 60 }}>{perfect ? '🏆' : pct >= 40 ? '🎉' : '🌱'}</div>
        <h1 style={{ margin: '4px 0' }}>{score} / {questions.length}</h1>
        <div className="bar accent" style={{ maxWidth: 300, margin: '10px auto' }}><span style={{ width: `${pct}%` }} /></div>
        <p style={{ fontSize: 18, fontWeight: 600 }}>{msg}</p>
        <p className="chip" style={{ marginBottom: 20 }}>⭐ +{score * XP_CORRECT + (perfect ? XP_PERFECT_BONUS : 0)} XP earned</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn ghost" onClick={onExit}>Back to quizzes</button>
          <button className="btn primary" onClick={() => window.location.reload()}>Try again 🔁</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 620, margin: '10px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <button className="btn ghost" onClick={onExit} style={{ padding: '6px 12px' }}>← Exit</button>
        <span className="q-counter">Question {idx + 1} of {questions.length}</span>
        <span className="chip">Score: {score}</span>
      </div>
      <div className="bar" style={{ marginBottom: 20 }}><span style={{ width: `${(idx / questions.length) * 100}%` }} /></div>

      <h2 style={{ fontSize: 21, lineHeight: 1.35, marginTop: 0 }}>{q.q}</h2>

      <div style={{ marginTop: 18 }}>
        {opt.order.map((origIdx, pos) => {
          let cls = 'quiz-option';
          if (picked != null) {
            if (pos === opt.answerPos) cls += ' correct';
            else if (pos === picked) cls += ' wrong';
          }
          return (
            <button key={pos} className={cls} disabled={picked != null} onClick={() => choose(pos)}>
              <span style={{ fontWeight: 800, marginRight: 10, color: 'var(--brand)' }}>{String.fromCharCode(65 + pos)}</span>
              {q.options[origIdx]}
            </button>
          );
        })}
      </div>

      {picked != null && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 14,
            background: picked === opt.answerPos ? '#e6faf4' : '#fdeceb',
            color: picked === opt.answerPos ? '#05795f' : '#b3392e', fontWeight: 600,
          }}>
            {picked === opt.answerPos ? '✅ Correct!' : `❌ Not quite. The answer is ${q.options[q.answer]}.`}
            {q.explanation && <div style={{ marginTop: 6, fontWeight: 400 }}>{q.explanation}</div>}
          </div>
          <button className="btn primary block big" onClick={next}>
            {idx + 1 < questions.length ? 'Next question →' : 'See results 🎯'}
          </button>
        </div>
      )}
    </div>
  );
}
