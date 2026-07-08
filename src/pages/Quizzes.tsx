import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useStudent } from '../AppState';
import { subjectsForClass, SUBJECT_META, type Subject } from '../data/types';
import { getQuestions } from '../data/quizzes';
import { db } from '../db';

export function Quizzes() {
  const student = useStudent();
  const [klass, setKlass] = useState<number | null>(null);
  const activeClass = klass ?? student?.klass ?? 5;
  const subjects = subjectsForClass(activeClass);
  const customQuizzes = useLiveQuery(
    () => db.customQuizzes.where('klass').equals(activeClass).toArray(),
    [activeClass],
    [],
  );

  return (
    <>
      <h1 className="page-title">📝 Quizzes</h1>
      <p className="page-sub">Pick a subject and test what you know. Each quiz gives instant feedback, explanations, and XP.</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Choose a class</div>
        <div className="class-grid">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
            <button key={c} className={`class-btn ${c === activeClass ? 'active' : ''}`} onClick={() => setKlass(c)}>
              {c}
              {student?.klass === c && <small>current</small>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid auto">
        {subjects.map((subject) => {
          const count = getQuestions(subject as Subject, activeClass).length;
          const meta = SUBJECT_META[subject as Subject];
          const disabled = count === 0;
          const inner = (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="tile-emoji">{meta.emoji}</span>
                {!disabled && <span className="chip" style={{ fontSize: 12 }}>{count} Qs</span>}
              </div>
              <div className="tile-title">{subject}</div>
              <div className="tile-desc">{disabled ? 'Coming soon for this class' : `Class ${activeClass} · tap to start`}</div>
            </>
          );
          return disabled ? (
            <div key={subject} className="tile" style={{ opacity: 0.5, cursor: 'not-allowed' }}>{inner}</div>
          ) : (
            <Link key={subject} className="tile" to={`/quizzes/${encodeURIComponent(subject)}/${activeClass}`}>{inner}</Link>
          );
        })}
      </div>

      {customQuizzes.length > 0 && (
        <>
          <h2 style={{ marginTop: 28, fontSize: 19 }}>🧑‍🏫 Teacher-made quizzes</h2>
          <div className="grid auto">
            {customQuizzes.map((q) => (
              <Link key={q.id} className="tile" to={`/quizzes/custom/${q.id}`}>
                <div className="tile-emoji">✏️</div>
                <div className="tile-title">{q.title}</div>
                <div className="tile-desc">{q.subject} · {q.questions.length} questions</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
