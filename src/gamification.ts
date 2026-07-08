// XP, levels, streaks and badges. Everything derives from the xpEvents
// table plus a handful of counters, so there is no state to get out of sync.
import { db, todayStr, type XPEvent } from './db';
import { BOOKS } from './data/books';

export async function awardXP(
  studentId: number,
  xp: number,
  kind: XPEvent['kind'],
  detail: string,
) {
  if (xp <= 0) return;
  await db.xpEvents.add({
    studentId,
    xp,
    kind,
    detail,
    day: todayStr(),
    at: new Date().toISOString(),
  });
}

// Level L is reached at 100·(L−1)² XP: level 2 at 100, 3 at 400, 4 at 900…
// Quadratic growth keeps early levels fast (motivating) and later ones earned.
export function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}
export function xpForLevel(level: number): number {
  return 100 * (level - 1) ** 2;
}

/** Current streak: consecutive active days ending today or yesterday. */
export function currentStreak(days: Set<string>): number {
  const d = new Date();
  if (!days.has(todayStr(d))) d.setDate(d.getDate() - 1); // streak survives until end of today
  let streak = 0;
  while (days.has(todayStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function longestStreak(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const s of sorted) {
    const cur = new Date(s + 'T00:00:00');
    if (prev && cur.getTime() - prev.getTime() === 86400000) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export interface StudentStats {
  totalXP: number;
  level: number;
  streak: number;
  maxStreak: number;
  quizCount: number;
  perfectCount: number;
  avgScore: number; // 0-100
  gamesPlayed: number;
  booksCompleted: number;
  chaptersRead: number;
  activeDays: Set<string>;
}

export async function getStats(studentId: number): Promise<StudentStats> {
  const [events, attempts, games, reading, customBooks] = await Promise.all([
    db.xpEvents.where('studentId').equals(studentId).toArray(),
    db.quizAttempts.where('studentId').equals(studentId).toArray(),
    db.gameScores.where('studentId').equals(studentId).toArray(),
    db.reading.where('studentId').equals(studentId).toArray(),
    db.customBooks.toArray(),
  ]);
  const totalXP = events.reduce((s, e) => s + e.xp, 0);
  const activeDays = new Set(events.map((e) => e.day));
  const perfectCount = attempts.filter((a) => a.total > 0 && a.score === a.total).length;
  const avgScore = attempts.length
    ? Math.round(
        (attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100,
      )
    : 0;
  // A book counts as completed once every listed chapter has been read.
  // Look up chapter counts across both the fixed catalog and custom books.
  const chaptersById = new Map<string, number>();
  for (const b of BOOKS) chaptersById.set(b.id, b.chapters);
  for (const cb of customBooks) chaptersById.set(`custom-${cb.id}`, cb.chapters);
  const booksCompleted = reading.filter((r) => {
    const chapters = chaptersById.get(r.bookId);
    return chapters != null && r.chaptersRead.length >= chapters;
  }).length;
  const chaptersRead = reading.reduce((s, r) => s + r.chaptersRead.length, 0);
  return {
    totalXP,
    level: levelFromXP(totalXP),
    streak: currentStreak(activeDays),
    maxStreak: longestStreak(activeDays),
    quizCount: attempts.length,
    perfectCount,
    avgScore,
    gamesPlayed: games.length,
    booksCompleted,
    chaptersRead,
    activeDays,
  };
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  earned: (s: StudentStats) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-steps', name: 'First Steps', emoji: '👣', desc: 'Earn your first XP', earned: (s) => s.totalXP > 0 },
  { id: 'quiz-rookie', name: 'Quiz Rookie', emoji: '📝', desc: 'Finish your first quiz', earned: (s) => s.quizCount >= 1 },
  { id: 'quiz-master', name: 'Quiz Master', emoji: '🧠', desc: 'Finish 10 quizzes', earned: (s) => s.quizCount >= 10 },
  { id: 'quiz-legend', name: 'Quiz Legend', emoji: '🎓', desc: 'Finish 25 quizzes', earned: (s) => s.quizCount >= 25 },
  { id: 'perfect-1', name: 'Perfect Score!', emoji: '💯', desc: 'Get every question right in a quiz', earned: (s) => s.perfectCount >= 1 },
  { id: 'perfect-5', name: 'Perfectionist', emoji: '🌟', desc: '5 perfect quizzes', earned: (s) => s.perfectCount >= 5 },
  { id: 'streak-3', name: 'On Fire', emoji: '🔥', desc: '3-day learning streak', earned: (s) => s.maxStreak >= 3 },
  { id: 'streak-7', name: 'Week Warrior', emoji: '⚡', desc: '7-day learning streak', earned: (s) => s.maxStreak >= 7 },
  { id: 'streak-30', name: 'Unstoppable', emoji: '🚀', desc: '30-day learning streak', earned: (s) => s.maxStreak >= 30 },
  { id: 'reader-1', name: 'Page Turner', emoji: '📚', desc: 'Read 5 chapters', earned: (s) => s.chaptersRead >= 5 },
  { id: 'bookworm', name: 'Bookworm', emoji: '🐛', desc: 'Complete a whole book', earned: (s) => s.booksCompleted >= 1 },
  { id: 'librarian', name: 'Little Librarian', emoji: '🏛️', desc: 'Complete 5 books', earned: (s) => s.booksCompleted >= 5 },
  { id: 'gamer', name: 'Game On', emoji: '🎮', desc: 'Play 10 games', earned: (s) => s.gamesPlayed >= 10 },
  { id: 'scholar', name: 'Scholar', emoji: '🏅', desc: 'Earn 500 XP', earned: (s) => s.totalXP >= 500 },
  { id: 'champion', name: 'Champion', emoji: '🏆', desc: 'Earn 2,000 XP', earned: (s) => s.totalXP >= 2000 },
  { id: 'legend', name: 'Living Legend', emoji: '👑', desc: 'Earn 5,000 XP', earned: (s) => s.totalXP >= 5000 },
];

export function earnedBadges(stats: StudentStats): Badge[] {
  return BADGES.filter((b) => b.earned(stats));
}
