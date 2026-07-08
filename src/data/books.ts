// The reading library catalog. NCERT and Karnataka (KTBS) publish all
// textbooks free online, so each card tracks chapter-level progress here
// and links out to the official portals for the actual book content.
// Chapter counts are close approximations — they exist to give students
// a satisfying tick-off tracker, and the teacher marks whatever their
// class actually uses.
import type { Subject } from './types';

export interface Book {
  id: string;
  klass: number;
  subject: Subject;
  title: string;
  chapters: number;
  source: 'NCERT' | 'KTBS' | 'Custom';
}

export const PORTALS = {
  NCERT: { name: 'NCERT Textbooks', url: 'https://ncert.nic.in/textbook.php' },
  EPATHSHALA: { name: 'ePathshala', url: 'https://epathshala.nic.in/' },
  DIKSHA: { name: 'DIKSHA', url: 'https://diksha.gov.in/' },
  KTBS: { name: 'Karnataka Textbooks (KTBS)', url: 'https://ktbs.karnataka.gov.in/' },
};

let seq = 0;
function b(klass: number, subject: Subject, title: string, chapters: number, source: 'NCERT' | 'KTBS' = 'NCERT'): Book {
  return { id: `bk${++seq}-${klass}-${subject.slice(0, 3).toLowerCase()}`, klass, subject, title, chapters, source };
}

export const BOOKS: Book[] = [
  // ---- Class 1
  b(1, 'English', 'Mridang — English Textbook', 12),
  b(1, 'Hindi', 'सारंगी (Sarangi)', 12),
  b(1, 'Mathematics', 'Joyful Mathematics', 13),
  b(1, 'Kannada', 'ಕನ್ನಡ ಪಠ್ಯಪುಸ್ತಕ — Kannada Reader 1', 12, 'KTBS'),
  // ---- Class 2
  b(2, 'English', 'Mridang — English Textbook 2', 12),
  b(2, 'Hindi', 'सारंगी 2 (Sarangi)', 12),
  b(2, 'Mathematics', 'Joyful Mathematics 2', 13),
  b(2, 'Kannada', 'ಕನ್ನಡ ಪಠ್ಯಪುಸ್ತಕ — Kannada Reader 2', 12, 'KTBS'),
  // ---- Class 3
  b(3, 'English', 'Santoor — English Textbook', 12),
  b(3, 'Hindi', 'वीणा (Veena)', 12),
  b(3, 'Mathematics', 'Maths Mela', 12),
  b(3, 'Science', 'Our Wondrous World (EVS)', 12),
  b(3, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 3', 14, 'KTBS'),
  // ---- Class 4
  b(4, 'English', 'Santoor — English Textbook 4', 12),
  b(4, 'Hindi', 'वीणा 4 (Veena)', 12),
  b(4, 'Mathematics', 'Maths Mela 4', 12),
  b(4, 'Science', 'Our Wondrous World 4 (EVS)', 12),
  b(4, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 4', 14, 'KTBS'),
  // ---- Class 5
  b(5, 'English', 'Santoor — English Textbook 5', 12),
  b(5, 'Hindi', 'वीणा 5 (Veena)', 12),
  b(5, 'Mathematics', 'Maths Mela 5', 12),
  b(5, 'Science', 'Our Wondrous World 5 (EVS)', 12),
  b(5, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 5', 14, 'KTBS'),
  // ---- Class 6
  b(6, 'English', 'Poorvi — English Textbook', 10),
  b(6, 'Hindi', 'मल्हार (Malhar)', 13),
  b(6, 'Mathematics', 'Ganita Prakash', 10),
  b(6, 'Science', 'Curiosity — Science Textbook', 12),
  b(6, 'Social Science', 'Exploring Society: India and Beyond', 14),
  b(6, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 6', 16, 'KTBS'),
  // ---- Class 7
  b(7, 'English', 'Poorvi — English Textbook 7', 10),
  b(7, 'Hindi', 'मल्हार 7 (Malhar)', 13),
  b(7, 'Mathematics', 'Ganita Prakash 7', 10),
  b(7, 'Science', 'Curiosity — Science Textbook 7', 12),
  b(7, 'Social Science', 'Exploring Society: India and Beyond 7', 14),
  b(7, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 7', 16, 'KTBS'),
  // ---- Class 8
  b(8, 'English', 'Poorvi — English Textbook 8', 10),
  b(8, 'Hindi', 'मल्हार 8 (Malhar)', 13),
  b(8, 'Mathematics', 'Ganita Prakash 8', 10),
  b(8, 'Science', 'Curiosity — Science Textbook 8', 12),
  b(8, 'Social Science', 'Exploring Society: India and Beyond 8', 14),
  b(8, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 8', 16, 'KTBS'),
  // ---- Class 9
  b(9, 'English', 'Beehive', 9),
  b(9, 'English', 'Moments (Supplementary Reader)', 9),
  b(9, 'Hindi', 'क्षितिज भाग 1 (Kshitij)', 13),
  b(9, 'Mathematics', 'Mathematics — Class 9', 12),
  b(9, 'Science', 'Science — Class 9', 12),
  b(9, 'Social Science', 'India and the Contemporary World – I (History)', 5),
  b(9, 'Social Science', 'Contemporary India – I (Geography)', 6),
  b(9, 'Social Science', 'Democratic Politics – I', 5),
  b(9, 'Social Science', 'Economics', 4),
  b(9, 'Computer Science', 'Information & Communication Technology', 8),
  b(9, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 9', 16, 'KTBS'),
  // ---- Class 10
  b(10, 'English', 'First Flight', 9),
  b(10, 'English', 'Footprints Without Feet (Supplementary)', 9),
  b(10, 'Hindi', 'क्षितिज भाग 2 (Kshitij)', 13),
  b(10, 'Mathematics', 'Mathematics — Class 10', 14),
  b(10, 'Science', 'Science — Class 10', 13),
  b(10, 'Social Science', 'India and the Contemporary World – II (History)', 5),
  b(10, 'Social Science', 'Contemporary India – II (Geography)', 7),
  b(10, 'Social Science', 'Democratic Politics – II', 5),
  b(10, 'Social Science', 'Understanding Economic Development', 5),
  b(10, 'Kannada', 'ಸಿರಿ ಕನ್ನಡ — Siri Kannada 10', 16, 'KTBS'),
  // ---- Class 11
  b(11, 'English', 'Hornbill', 8),
  b(11, 'English', 'Snapshots (Supplementary)', 6),
  b(11, 'Hindi', 'आरोह भाग 1 (Aroh)', 14),
  b(11, 'Mathematics', 'Mathematics — Class 11', 14),
  b(11, 'Science', 'Physics Part 1 & 2 — Class 11', 14),
  b(11, 'Science', 'Chemistry Part 1 & 2 — Class 11', 9),
  b(11, 'Science', 'Biology — Class 11', 19),
  b(11, 'Social Science', 'Indian Constitution at Work (Political Science)', 10),
  b(11, 'Social Science', 'Fundamentals of Physical Geography', 15),
  b(11, 'Social Science', 'Indian Economic Development', 8),
  b(11, 'Computer Science', 'Computer Science with Python — Class 11', 12),
  // ---- Class 12
  b(12, 'English', 'Flamingo', 14),
  b(12, 'English', 'Vistas (Supplementary)', 7),
  b(12, 'Hindi', 'आरोह भाग 2 (Aroh)', 14),
  b(12, 'Mathematics', 'Mathematics Part 1 & 2 — Class 12', 13),
  b(12, 'Science', 'Physics Part 1 & 2 — Class 12', 14),
  b(12, 'Science', 'Chemistry Part 1 & 2 — Class 12', 10),
  b(12, 'Science', 'Biology — Class 12', 13),
  b(12, 'Social Science', 'Politics in India Since Independence', 9),
  b(12, 'Social Science', 'Fundamentals of Human Geography', 10),
  b(12, 'Social Science', 'Introductory Macroeconomics', 6),
  b(12, 'Computer Science', 'Computer Science with Python — Class 12', 13),
];

export function booksForClass(klass: number): Book[] {
  return BOOKS.filter((bk) => bk.klass === klass);
}
