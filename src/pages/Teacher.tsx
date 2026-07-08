import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Student } from '../db';
import { getStats, type StudentStats } from '../gamification';
import { subjectsForClass, SUBJECT_META, type Question, type Subject } from '../data/types';
import { useApp } from '../AppState';
import { Modal } from '../components/Modal';
import { exportAll, importAll } from '../backup';

type Tab = 'overview' | 'builder' | 'data';

export function Teacher() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <>
      <h1 className="page-title">🧑‍🏫 Teacher Dashboard</h1>
      <p className="page-sub">Track every student, create your own quizzes, and back up all progress. Built for the classroom.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {([['overview', '📊 Class overview'], ['builder', '✏️ Quiz builder'], ['data', '💾 Backup & restore']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} className={`btn ${tab === t ? 'primary' : ''}`} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'builder' && <QuizBuilder />}
      {tab === 'data' && <DataTab />}
    </>
  );
}

/* ---------------- Class overview ---------------- */
function Overview() {
  const students = useLiveQuery(() => db.students.toArray(), [], []);
  const [detail, setDetail] = useState<Student | null>(null);

  if (students.length === 0) {
    return (
      <div className="empty">
        <div className="big">🧑‍🎓</div>
        <h2>No students yet</h2>
        <p>Add students from the profile menu (top-right) to start tracking their progress.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data">
          <thead>
            <tr><th>Student</th><th>Class</th><th>Level</th><th>XP</th><th>Streak</th><th>Quizzes</th><th>Avg</th><th>Chapters</th><th></th></tr>
          </thead>
          <tbody>
            {students.map((s) => <StudentRow key={s.id} student={s} onOpen={() => setDetail(s)} />)}
          </tbody>
        </table>
      </div>
      <p className="mini-xp" style={{ marginTop: 10 }}>Tap a student to see a subject-by-subject breakdown.</p>
      {detail && <StudentDetail student={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

function StudentRow({ student, onOpen }: { student: Student; onOpen: () => void }) {
  const stats = useLiveQuery(() => getStats(student.id!), [student.id], null);
  if (!stats) return <tr><td colSpan={9}>…</td></tr>;
  return (
    <tr style={{ cursor: 'pointer' }} onClick={onOpen}>
      <td><span style={{ marginRight: 8 }}>{student.avatar}</span><strong>{student.name}</strong></td>
      <td>{student.klass}</td>
      <td>🎯 {stats.level}</td>
      <td>{stats.totalXP}</td>
      <td>🔥 {stats.streak}</td>
      <td>{stats.quizCount}</td>
      <td>{stats.avgScore}%</td>
      <td>{stats.chaptersRead}</td>
      <td style={{ color: 'var(--brand)' }}>View →</td>
    </tr>
  );
}

function StudentDetail({ student, onClose }: { student: Student; onClose: () => void }) {
  // Average score per subject, computed from this student's attempts.
  const bySubject = useLiveQuery(async () => {
    const attempts = await db.quizAttempts.where('studentId').equals(student.id!).toArray();
    const map: Record<string, { correct: number; total: number; count: number }> = {};
    for (const a of attempts) {
      const m = (map[a.subject] ??= { correct: 0, total: 0, count: 0 });
      m.correct += a.score; m.total += a.total; m.count += 1;
    }
    return map;
  }, [student.id], {} as Record<string, { correct: number; total: number; count: number }>);

  const subjects = subjectsForClass(student.klass);

  return (
    <Modal title={`${student.avatar} ${student.name} · Class ${student.klass}`} onClose={onClose} wide>
      <p style={{ color: 'var(--ink-soft)', marginTop: 0 }}>Subject-wise quiz performance:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {subjects.map((subject) => {
          const d = bySubject[subject];
          const pct = d && d.total ? Math.round((d.correct / d.total) * 100) : 0;
          return (
            <div key={subject}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>{SUBJECT_META[subject as Subject].emoji} {subject}</span>
                <span className="mini-xp">{d ? `${pct}% over ${d.count} quiz${d.count > 1 ? 'zes' : ''}` : 'Not attempted'}</span>
              </div>
              <div className={`bar ${pct >= 70 ? 'accent' : pct >= 40 ? 'gold' : ''}`}><span style={{ width: `${d ? Math.max(3, pct) : 0}%` }} /></div>
            </div>
          );
        })}
      </div>
      <p className="mini-xp" style={{ marginTop: 16 }}>💡 Use this to spot which subjects a student needs the most help with.</p>
    </Modal>
  );
}

/* ---------------- Quiz builder ---------------- */
const BLANK: Question = { q: '', options: ['', '', '', ''], answer: 0 };

function QuizBuilder() {
  const { pushToast } = useApp();
  const existing = useLiveQuery(() => db.customQuizzes.reverse().sortBy('createdAt'), [], []);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [klass, setKlass] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([{ ...BLANK, options: ['', '', '', ''] }]);

  function updateQ(i: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  }
  function updateOpt(i: number, oi: number, val: string) {
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, options: q.options.map((o, k) => (k === oi ? val : o)) } : q)));
  }

  const valid = title.trim() && questions.every((q) => q.q.trim() && q.options.every((o) => o.trim()));

  async function save() {
    if (!valid) return;
    await db.customQuizzes.add({
      title: title.trim(), subject, klass,
      questions: questions.map((q) => ({ ...q, q: q.q.trim(), options: q.options.map((o) => o.trim()) })),
      createdAt: new Date().toISOString(),
    });
    pushToast('Quiz saved! Students can find it in the Quizzes tab.', '✅');
    setTitle(''); setQuestions([{ q: '', options: ['', '', '', ''], answer: 0 }]);
  }

  async function del(id: number) {
    if (confirm('Delete this quiz?')) await db.customQuizzes.delete(id);
  }

  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Create a new quiz</h3>
        <div className="field">
          <label>Quiz title</label>
          <input className="input" value={title} placeholder="e.g. Fractions practice" onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Subject</label>
            <select className="select" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
              {Object.keys(SUBJECT_META).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 110 }}>
            <label>Class</label>
            <select className="select" value={klass} onChange={(e) => setKlass(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
        </div>

        {questions.map((q, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong>Question {i + 1}</strong>
              {questions.length > 1 && <button className="btn danger" style={{ padding: '4px 10px' }} onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}>Remove</button>}
            </div>
            <input className="input" style={{ marginBottom: 8 }} placeholder="Question text" value={q.q} onChange={(e) => updateQ(i, { q: e.target.value })} />
            {q.options.map((o, oi) => (
              <label key={oi} className="checkbox-row" style={{ paddingLeft: 0 }}>
                <input type="radio" name={`ans-${i}`} checked={q.answer === oi} onChange={() => updateQ(i, { answer: oi })} title="Mark as correct answer" />
                <input className="input" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={o} onChange={(e) => updateOpt(i, oi, e.target.value)} />
              </label>
            ))}
            <p className="mini-xp" style={{ margin: '4px 0 0' }}>🔘 Select the radio button next to the correct answer.</p>
          </div>
        ))}
        <button className="btn ghost block" style={{ marginBottom: 12 }} onClick={() => setQuestions((qs) => [...qs, { q: '', options: ['', '', '', ''], answer: 0 }])}>➕ Add question</button>
        <button className="btn primary block big" disabled={!valid} onClick={save}>Save quiz</button>
        {!valid && <p className="mini-xp" style={{ marginTop: 8 }}>Fill in the title, every question, and all four options to save.</p>}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Your saved quizzes ({existing.length})</h3>
        {existing.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>No custom quizzes yet. Create one on the left — it appears instantly for students of that class.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {existing.map((q) => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px' }}>
                <div>
                  <strong>{q.title}</strong>
                  <div className="mini-xp">{SUBJECT_META[q.subject as Subject]?.emoji} {q.subject} · Class {q.klass} · {q.questions.length} Qs</div>
                </div>
                <button className="btn danger" style={{ padding: '6px 10px' }} onClick={() => del(q.id!)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Backup & restore ---------------- */
function DataTab() {
  const { pushToast } = useApp();
  const [busy, setBusy] = useState(false);

  async function doExport() {
    setBusy(true);
    try {
      const blob = await exportAll();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vidyasetu-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      pushToast('Backup downloaded!', '💾');
    } finally {
      setBusy(false);
    }
  }

  async function doImport(file: File) {
    if (!confirm('Importing will REPLACE all current data on this device with the backup. Continue?')) return;
    setBusy(true);
    try {
      await importAll(file);
      pushToast('Backup restored! Reloading…', '✅');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      alert('Could not read that file. Make sure it is a VidyaSetu backup.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>💾 Backup all data</h3>
        <p style={{ color: 'var(--ink-soft)' }}>
          Download every student, their progress, scores and your custom quizzes as a single file.
          Keep it safe or copy it to another computer.
        </p>
        <button className="btn primary block big" onClick={doExport} disabled={busy}>Download backup file</button>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>📂 Restore from backup</h3>
        <p style={{ color: 'var(--ink-soft)' }}>
          Load a backup file to move data to this device. <strong>This replaces</strong> everything currently stored here.
        </p>
        <label className="btn accent block big" style={{ textAlign: 'center', display: 'block' }}>
          Choose backup file…
          <input type="file" accept="application/json,.json" style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        </label>
      </div>
      <div className="card" style={{ gridColumn: '1 / -1', background: 'var(--surface-2)' }}>
        <strong>Why this matters:</strong> VidyaSetu stores everything in this browser on this device — nothing is sent to any server,
        so it works fully offline. Backups are how you keep data safe, share it between devices, or move to a new computer.
        <br /><br />
        <strong>📄 About book PDFs:</strong> Uploaded book files can be very large, so they are <em>not</em> included in this backup.
        Your book entries and all student progress are saved; after restoring on another device, just re-attach the PDFs in the Reading section.
      </div>
    </div>
  );
}
