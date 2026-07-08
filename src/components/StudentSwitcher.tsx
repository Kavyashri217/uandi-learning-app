// The topbar identity control: shows the active student, lets the teacher
// switch between children, and create/delete profiles. On a shared NGO
// computer this is the key that scopes every bit of progress.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useApp } from '../AppState';
import { getStats } from '../gamification';
import { Modal } from './Modal';

const AVATARS = ['🦊', '🐯', '🐨', '🦁', '🐼', '🐸', '🦉', '🐧', '🦄', '🐬', '🌟', '🚀', '🌈', '🦋', '🐢', '🦖'];

export function StudentSwitcher() {
  const { studentId, setStudentId } = useApp();
  const [open, setOpen] = useState(false);
  const students = useLiveQuery(() => db.students.toArray(), [], []);
  const active = students.find((s) => s.id === studentId);
  const xp = useLiveQuery(async () => (studentId ? (await getStats(studentId)).totalXP : 0), [studentId], 0);

  return (
    <>
      <button className="student-pill" onClick={() => setOpen(true)}>
        <span className="avatar-circle">{active?.avatar ?? '👤'}</span>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span>{active ? active.name : 'Choose student'}</span>
          {active && <span className="mini-xp">Class {active.klass} · {xp} XP</span>}
        </span>
        <span style={{ opacity: 0.5, marginLeft: 4 }}>▾</span>
      </button>
      {open && <SwitcherModal onClose={() => setOpen(false)} />}
    </>
  );
}

function SwitcherModal({ onClose }: { onClose: () => void }) {
  const { studentId, setStudentId } = useApp();
  const students = useLiveQuery(() => db.students.toArray(), [], []);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [klass, setKlass] = useState(5);
  const [avatar, setAvatar] = useState(AVATARS[0]);

  async function create() {
    const nm = name.trim();
    if (!nm) return;
    const id = await db.students.add({ name: nm, klass, avatar, createdAt: new Date().toISOString() });
    setStudentId(id as number);
    setAdding(false);
    setName('');
  }

  async function remove(id: number, nm: string) {
    if (!confirm(`Delete ${nm} and all their progress? This cannot be undone.`)) return;
    await Promise.all([
      db.students.delete(id),
      db.quizAttempts.where('studentId').equals(id).delete(),
      db.reading.where('studentId').equals(id).delete(),
      db.gameScores.where('studentId').equals(id).delete(),
      db.xpEvents.where('studentId').equals(id).delete(),
    ]);
    if (studentId === id) setStudentId(null);
  }

  return (
    <Modal title={adding ? 'Add a student' : 'Students'} onClose={onClose}>
      {!adding && (
        <>
          {students.length === 0 && (
            <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '10px 0' }}>
              No students yet. Add your first learner to begin!
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {students.map((s) => (
              <div
                key={s.id}
                className="checkbox-row"
                style={{
                  border: '1px solid var(--line)', borderRadius: 12,
                  background: s.id === studentId ? '#f2effe' : 'var(--surface)',
                  borderColor: s.id === studentId ? 'var(--brand)' : 'var(--line)',
                }}
              >
                <button
                  onClick={() => { setStudentId(s.id!); onClose(); }}
                  className="btn ghost"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-start', border: 'none' }}
                >
                  <span className="avatar-circle">{s.avatar}</span>
                  <span style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div className="mini-xp">Class {s.klass}</div>
                  </span>
                </button>
                <button className="btn danger" style={{ padding: '6px 10px' }} onClick={() => remove(s.id!, s.name)}>Delete</button>
              </div>
            ))}
          </div>
          <button className="btn primary block" onClick={() => setAdding(true)}>➕ Add student</button>
        </>
      )}

      {adding && (
        <>
          <div className="field">
            <label>Name</label>
            <input className="input" value={name} autoFocus placeholder="e.g. Ananya"
              onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} />
          </div>
          <div className="field">
            <label>Class</label>
            <select className="select" value={klass} onChange={(e) => setKlass(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Pick an avatar</label>
            <div className="avatar-picker">
              {AVATARS.map((a) => (
                <button key={a} className={`avatar-opt ${a === avatar ? 'active' : ''}`} onClick={() => setAvatar(a)}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn primary" style={{ flex: 1 }} onClick={create} disabled={!name.trim()}>Create profile</button>
          </div>
        </>
      )}
    </Modal>
  );
}
