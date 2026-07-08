// JSON export/import of the entire local database. Because VidyaSetu is
// offline and server-less, this is the only way to move data between
// devices or keep it safe — essential on shared NGO computers.
//
// Note: `bookFiles` (the uploaded PDF blobs) are intentionally NOT part of
// the JSON backup — binary book files can be tens of MB each and would make
// the backup unusably large. Book *entries* (customBooks) are included, so
// after restoring on a new device the teacher just re-attaches the PDFs.
import { db } from './db';

const TABLES = ['students', 'quizAttempts', 'reading', 'gameScores', 'xpEvents', 'customQuizzes', 'customBooks'] as const;

interface Backup {
  app: 'vidyasetu';
  version: 1;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export async function exportAll(): Promise<Blob> {
  const data: Record<string, unknown[]> = {};
  for (const t of TABLES) data[t] = await (db as any)[t].toArray();
  const backup: Backup = { app: 'vidyasetu', version: 1, exportedAt: new Date().toISOString(), data };
  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
}

export async function importAll(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Backup;
  if (parsed.app !== 'vidyasetu' || !parsed.data) throw new Error('Not a VidyaSetu backup');
  await db.transaction('rw', db.tables, async () => {
    for (const t of TABLES) {
      await (db as any)[t].clear();
      const rows = parsed.data[t];
      if (Array.isArray(rows) && rows.length) await (db as any)[t].bulkAdd(rows);
    }
  });
}
