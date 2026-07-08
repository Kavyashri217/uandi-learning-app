import type { Question, Subject } from '../types';
import { mathematics } from './mathematics';
import { science } from './science';
import { english } from './english';
import { hindi } from './hindi';
import { kannada } from './kannada';
import { social } from './social';
import { computer } from './computer';

const BANKS: Record<Subject, Record<number, Question[]>> = {
  Mathematics: mathematics,
  Science: science,
  English: english,
  Hindi: hindi,
  Kannada: kannada,
  'Social Science': social,
  'Computer Science': computer,
};

// Computer Science is authored in 2-class bands keyed by 1,3,5,7,9,11.
function computerBandKey(klass: number): number {
  return klass - ((klass - 1) % 2);
}

/** Returns the question bank for a subject+class, or [] if none exists. */
export function getQuestions(subject: Subject, klass: number): Question[] {
  const bank = BANKS[subject];
  if (!bank) return [];
  if (subject === 'Computer Science') return bank[computerBandKey(klass)] ?? [];
  return bank[klass] ?? [];
}

/** True if a real (non-empty) bank exists for this subject+class. */
export function hasQuiz(subject: Subject, klass: number): boolean {
  return getQuestions(subject, klass).length > 0;
}

/** Fisher-Yates shuffle returning a new array. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
