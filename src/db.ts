// All persistence lives in IndexedDB via Dexie — the app is fully
// local-first: no server, no accounts, data stays on the device.
import Dexie, { type Table } from 'dexie';
import type { Question } from './data/types';

export interface Student {
  id?: number;
  name: string;
  klass: number; // 1..12
  avatar: string; // emoji
  createdAt: string;
}

export interface QuizAttempt {
  id?: number;
  studentId: number;
  quizId: string; // e.g. "Mathematics-4" or "custom-7"
  title: string;
  subject: string;
  klass: number;
  score: number;
  total: number;
  xp: number;
  date: string; // ISO
}

export interface ReadingProgress {
  id?: number;
  studentId: number;
  bookId: string;
  chaptersRead: number[]; // currently ticked chapters
  everRead: number[]; // chapters that ever earned XP (anti-farming guard)
  updatedAt: string;
}

export interface GameScore {
  id?: number;
  studentId: number;
  gameId: string; // 'math-sprint' | 'word-wizard' | 'memory-match' | 'rapid-fire'
  score: number;
  xp: number;
  date: string;
}

// One row per XP-earning action. Streaks are computed from the distinct
// `day` values, total XP is the sum — so this table is the single
// source of truth for all gamification.
export interface XPEvent {
  id?: number;
  studentId: number;
  xp: number;
  kind: 'quiz' | 'game' | 'reading';
  detail: string;
  day: string; // YYYY-MM-DD (local)
  at: string; // full ISO timestamp
}

export interface CustomQuiz {
  id?: number;
  title: string;
  subject: string;
  klass: number;
  questions: Question[];
  createdAt: string;
}

// A PDF (or other file) the teacher has attached to a book. The actual
// file is stored as a Blob in IndexedDB so it stays on the device and
// works fully offline. bookId matches either a catalog Book id or a
// custom book's `custom-<id>`. A book can have several files (e.g. one
// per chapter, or a full-book PDF).
export interface BookFile {
  id?: number;
  bookId: string;
  label: string; // shown to students, e.g. "Full book" or "Chapter 3"
  fileName: string;
  type: string; // MIME type
  size: number; // bytes
  blob: Blob;
  addedAt: string;
}

// A book the teacher added themselves (not in the preset NCERT/KTBS catalog).
export interface CustomBook {
  id?: number;
  klass: number;
  subject: string;
  title: string;
  chapters: number;
  addedAt: string;
}

export class VidyaDB extends Dexie {
  students!: Table<Student, number>;
  quizAttempts!: Table<QuizAttempt, number>;
  reading!: Table<ReadingProgress, number>;
  gameScores!: Table<GameScore, number>;
  xpEvents!: Table<XPEvent, number>;
  customQuizzes!: Table<CustomQuiz, number>;
  bookFiles!: Table<BookFile, number>;
  customBooks!: Table<CustomBook, number>;

  constructor() {
    super('vidyasetu');
    this.version(1).stores({
      students: '++id, name',
      quizAttempts: '++id, studentId, quizId, date',
      reading: '++id, studentId, [studentId+bookId]',
      gameScores: '++id, studentId, gameId, date',
      xpEvents: '++id, studentId, day, at',
      customQuizzes: '++id, klass, subject',
    });
    // v2 adds attachable book files + teacher-created books. Dexie migrates
    // existing data automatically; the new tables just start empty.
    this.version(2).stores({
      students: '++id, name',
      quizAttempts: '++id, studentId, quizId, date',
      reading: '++id, studentId, [studentId+bookId]',
      gameScores: '++id, studentId, gameId, date',
      xpEvents: '++id, studentId, day, at',
      customQuizzes: '++id, klass, subject',
      bookFiles: '++id, bookId',
      customBooks: '++id, klass, subject',
    });
  }
}

export const db = new VidyaDB();

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
