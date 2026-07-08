// Global app state: the currently-selected student, a toast queue, and a
// badge-unlock celebration. Kept deliberately small — all real data lives
// in Dexie and is read via useLiveQuery where needed.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db, type Student } from './db';
import { awardXP, earnedBadges, getStats } from './gamification';
import type { XPEvent } from './db';

interface Toast { id: number; text: string; emoji: string }

interface AppCtx {
  studentId: number | null;
  setStudentId: (id: number | null) => void;
  toasts: Toast[];
  pushToast: (text: string, emoji?: string) => void;
  newBadge: { emoji: string; name: string } | null;
  clearBadge: () => void;
  // Award XP AND surface a toast + any newly-unlocked badge in one call.
  reward: (xp: number, kind: XPEvent['kind'], detail: string) => Promise<void>;
}

const Ctx = createContext<AppCtx | null>(null);

const LS_KEY = 'vidyasetu.activeStudent';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [studentId, setStudentIdRaw] = useState<number | null>(() => {
    const v = localStorage.getItem(LS_KEY);
    return v ? Number(v) : null;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newBadge, setNewBadge] = useState<{ emoji: string; name: string } | null>(null);

  const setStudentId = useCallback((id: number | null) => {
    setStudentIdRaw(id);
    if (id == null) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, String(id));
  }, []);

  // If the stored student was deleted, fall back to nothing.
  useEffect(() => {
    if (studentId == null) return;
    db.students.get(studentId).then((s) => {
      if (!s) setStudentId(null);
    });
  }, [studentId, setStudentId]);

  const pushToast = useCallback((text: string, emoji = '✨') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, emoji }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const reward = useCallback(
    async (xp: number, kind: XPEvent['kind'], detail: string) => {
      if (studentId == null) return;
      const before = new Set(earnedBadges(await getStats(studentId)).map((b) => b.id));
      await awardXP(studentId, xp, kind, detail);
      if (xp > 0) pushToast(`+${xp} XP · ${detail}`, '⭐');
      const after = earnedBadges(await getStats(studentId));
      const fresh = after.find((b) => !before.has(b.id));
      if (fresh) {
        // Slight delay so the XP toast shows first.
        setTimeout(() => setNewBadge({ emoji: fresh.emoji, name: fresh.name }), 500);
      }
    },
    [studentId, pushToast],
  );

  const value = useMemo<AppCtx>(
    () => ({ studentId, setStudentId, toasts, pushToast, newBadge, clearBadge: () => setNewBadge(null), reward }),
    [studentId, setStudentId, toasts, pushToast, newBadge, reward],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
}

export function useStudent(): Student | null {
  const { studentId } = useApp();
  const [student, setStudent] = useState<Student | null>(null);
  useEffect(() => {
    let alive = true;
    if (studentId == null) { setStudent(null); return; }
    db.students.get(studentId).then((s) => { if (alive) setStudent(s ?? null); });
    return () => { alive = false; };
  }, [studentId]);
  return student;
}
