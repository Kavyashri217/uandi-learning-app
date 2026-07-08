// Shared domain types + the class/subject matrix for the whole app.

export type Subject =
  | 'Kannada'
  | 'English'
  | 'Hindi'
  | 'Mathematics'
  | 'Science'
  | 'Social Science'
  | 'Computer Science';

export interface Question {
  q: string;
  options: string[];
  answer: number; // index into options
  explanation?: string;
}

// klass -> questions. For Computer Science the bank is keyed by the
// first class of a 2-class band (1,3,5,7,9,11) since the syllabus is
// broadly shared across those pairs.
export type Bank = Record<number, Question[]>;

export const ALL_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const SUBJECT_META: Record<Subject, { emoji: string; color: string }> = {
  Kannada: { emoji: '🌺', color: '#e17055' },
  English: { emoji: '📖', color: '#0984e3' },
  Hindi: { emoji: '🪔', color: '#d63031' },
  Mathematics: { emoji: '🔢', color: '#6c5ce7' },
  Science: { emoji: '🔬', color: '#00b894' },
  'Social Science': { emoji: '🌍', color: '#e84393' },
  'Computer Science': { emoji: '💻', color: '#2d3436' },
};

/** Which subjects exist for a given class (used by Library + Quizzes). */
export function subjectsForClass(klass: number): Subject[] {
  const list: Subject[] = [];
  if (klass <= 10) list.push('Kannada');
  list.push('English', 'Hindi', 'Mathematics');
  if (klass >= 3) list.push('Science');
  if (klass >= 6) list.push('Social Science');
  list.push('Computer Science');
  return list;
}

/** EVS for 3-5, Science after that — purely a display label. */
export function scienceLabel(klass: number): string {
  return klass >= 3 && klass <= 5 ? 'EVS (Science)' : 'Science';
}
