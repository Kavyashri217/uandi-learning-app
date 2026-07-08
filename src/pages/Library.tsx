import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp, useStudent } from '../AppState';
import { booksForClass, PORTALS, type Book } from '../data/books';
import { SUBJECT_META, subjectsForClass, type Subject } from '../data/types';
import { db, type BookFile, type ReadingProgress } from '../db';
import { Modal } from '../components/Modal';
import { PdfReader } from '../components/PdfReader';

const XP_PER_CHAPTER = 15;
const MAX_FILE_MB = 100;

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Library() {
  const student = useStudent();
  const [klass, setKlass] = useState<number | null>(null);
  const [addingBook, setAddingBook] = useState(false);
  const activeClass = klass ?? student?.klass ?? 5;

  // Custom (teacher-added) books for this class, merged into the catalog.
  const customBooks = useLiveQuery(
    () => db.customBooks.where('klass').equals(activeClass).toArray(),
    [activeClass],
    [],
  );
  const custom: Book[] = customBooks.map((cb) => ({
    id: `custom-${cb.id}`, klass: cb.klass, subject: cb.subject as Subject,
    title: cb.title, chapters: cb.chapters, source: 'Custom',
  }));

  const books = [...booksForClass(activeClass), ...custom];
  const bySubject = books.reduce<Record<string, Book[]>>((acc, b) => {
    (acc[b.subject] ??= []).push(b);
    return acc;
  }, {});

  return (
    <>
      <h1 className="page-title">📚 Reading Library</h1>
      <p className="page-sub">
        Add the real textbook PDFs here so students can read them right inside the app — no internet needed.
        Tick chapters as you finish them to track progress and earn XP.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Choose a class</div>
          <button className="btn primary" onClick={() => setAddingBook(true)}>➕ Add your own book</button>
        </div>
        <div className="class-grid" style={{ marginTop: 10 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
            <button key={c} className={`class-btn ${c === activeClass ? 'active' : ''}`} onClick={() => setKlass(c)}>
              {c}
              {student?.klass === c && <small>current</small>}
            </button>
          ))}
        </div>
        <div className="link-row">
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', alignSelf: 'center' }}>Download free PDFs from:</span>
          {Object.values(PORTALS).map((p) => (
            <a key={p.url} className="link-btn" href={p.url} target="_blank" rel="noreferrer">🔗 {p.name}</a>
          ))}
        </div>
      </div>

      {Object.entries(bySubject).map(([subject, list]) => (
        <div key={subject} style={{ marginBottom: 24 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 19 }}>
            <span>{SUBJECT_META[subject as Subject].emoji}</span> {subject}
          </h2>
          <div className="grid auto">
            {list.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      ))}

      {addingBook && <AddBookModal klass={activeClass} onClose={() => setAddingBook(false)} />}
    </>
  );
}

function BookCard({ book }: { book: Book }) {
  const { studentId, reward } = useApp();
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<{ blob: Blob; title: string } | null>(null);

  const progress = useLiveQuery<ReadingProgress | undefined>(
    () => (studentId ? db.reading.where({ studentId, bookId: book.id }).first() : Promise.resolve(undefined)),
    [studentId, book.id],
  );
  // Only the COUNT here — we avoid loading big blobs for every card in the grid.
  const fileCount = useLiveQuery(() => db.bookFiles.where('bookId').equals(book.id).count(), [book.id], 0);

  const read = progress?.chaptersRead.length ?? 0;
  const pct = Math.round((read / book.chapters) * 100);
  const meta = SUBJECT_META[book.subject];

  return (
    <>
      <div className="tile" onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="tile-emoji">{meta.emoji}</span>
          <span style={{ display: 'flex', gap: 6 }}>
            {fileCount > 0 && <span className="chip" style={{ fontSize: 11, background: '#e6faf4', color: '#05795f', borderColor: '#b6ebdd' }}>📄 {fileCount}</span>}
            <span className="chip" style={{ fontSize: 11 }}>{book.source}</span>
          </span>
        </div>
        <div className="tile-title" style={{ minHeight: 44 }}>{book.title}</div>
        <div className="bar accent" style={{ margin: '8px 0 6px' }}><span style={{ width: `${pct}%` }} /></div>
        <div className="tile-desc">{read} / {book.chapters} chapters {read >= book.chapters && '✅'}</div>
      </div>

      {open && (
        <ChapterModal
          book={book}
          progress={progress}
          onClose={() => setOpen(false)}
          onRead={(f) => setReading({ blob: f.blob, title: f.label })}
          onToggle={async (ch, checked) => {
            if (!studentId) return;
            const existing = await db.reading.where({ studentId, bookId: book.id }).first();
            const cur = existing?.chaptersRead ?? [];
            const ever = existing?.everRead ?? [];
            const nextRead = checked ? [...new Set([...cur, ch])] : cur.filter((c) => c !== ch);
            const isNewEver = checked && !ever.includes(ch);
            const nextEver = isNewEver ? [...ever, ch] : ever;
            const row: ReadingProgress = {
              id: existing?.id,
              studentId, bookId: book.id,
              chaptersRead: nextRead,
              everRead: nextEver,
              updatedAt: new Date().toISOString(),
            };
            await db.reading.put(row);
            if (isNewEver) await reward(XP_PER_CHAPTER, 'reading', `Read a chapter of ${book.title.split('—')[0].trim()}`);
          }}
        />
      )}

      {reading && <PdfReader file={reading.blob} title={reading.title} onClose={() => setReading(null)} />}
    </>
  );
}

function ChapterModal({
  book, progress, onClose, onToggle, onRead,
}: {
  book: Book;
  progress: ReadingProgress | undefined;
  onClose: () => void;
  onToggle: (ch: number, checked: boolean) => void;
  onRead: (file: BookFile) => void;
}) {
  const { pushToast } = useApp();
  const read = new Set(progress?.chaptersRead ?? []);
  const files = useLiveQuery(() => db.bookFiles.where('bookId').equals(book.id).toArray(), [book.id], []);
  const portal = book.source === 'KTBS' ? PORTALS.KTBS : PORTALS.NCERT;
  const isCustom = book.source === 'Custom';

  async function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    for (const f of Array.from(fileList)) {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { alert(`"${f.name}" is not a PDF and was skipped.`); continue; }
      if (f.size > MAX_FILE_MB * 1024 * 1024) { alert(`"${f.name}" is larger than ${MAX_FILE_MB} MB and was skipped.`); continue; }
      await db.bookFiles.add({
        bookId: book.id,
        label: f.name.replace(/\.pdf$/i, ''),
        fileName: f.name, type: f.type || 'application/pdf', size: f.size, blob: f,
        addedAt: new Date().toISOString(),
      });
    }
    pushToast('Book file added!', '📄');
  }

  async function removeFile(id: number) {
    if (confirm('Remove this file? The book stays; only the PDF is deleted.')) await db.bookFiles.delete(id);
  }

  async function deleteCustomBook() {
    if (!confirm(`Delete "${book.title}" and its files? This cannot be undone.`)) return;
    const cbId = Number(book.id.replace('custom-', ''));
    await db.customBooks.delete(cbId);
    await db.bookFiles.where('bookId').equals(book.id).delete();
    await db.reading.filter((r) => r.bookId === book.id).delete();
    onClose();
  }

  return (
    <Modal title={book.title} onClose={onClose}>
      <p style={{ color: 'var(--ink-soft)', marginTop: 0 }}>
        Class {book.klass} · {book.subject} · {book.source}
      </p>

      {/* Attached book files */}
      <div style={{ fontWeight: 700, marginBottom: 8 }}>📄 Book files</div>
      {files.length > 0 ? (
        files.map((f) => (
          <div key={f.id} className="file-row">
            <span style={{ fontSize: 22 }}>📕</span>
            <div className="fname">
              <strong>{f.label}</strong>
              <span className="mini-xp">{fmtSize(f.size)}</span>
            </div>
            <button className="btn primary" style={{ padding: '8px 14px' }} onClick={() => onRead(f)}>📖 Read</button>
            <button className="btn danger" style={{ padding: '8px 10px' }} onClick={() => removeFile(f.id!)}>✕</button>
          </div>
        ))
      ) : (
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '0 0 8px' }}>
          No PDF added yet. Download the book below, then add its PDF here so students can read it offline.
        </p>
      )}

      <label className="file-drop" style={{ marginBottom: 16 }}>
        ➕ Add PDF{files.length ? '(s)' : ''} — tap to choose a file
        <input type="file" accept="application/pdf,.pdf" multiple style={{ display: 'none' }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      </label>

      {!isCustom && (
        <a className="link-btn" href={portal.url} target="_blank" rel="noreferrer" style={{ marginBottom: 16 }}>
          🔗 Download this book from {portal.name}
        </a>
      )}

      {/* Chapter progress */}
      <div style={{ fontWeight: 700, margin: '18px 0 6px' }}>✅ Mark chapters as read (+{XP_PER_CHAPTER} XP each):</div>
      <div style={{ maxHeight: 260, overflow: 'auto' }}>
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
          <label key={ch} className="checkbox-row">
            <input type="checkbox" checked={read.has(ch)} onChange={(e) => onToggle(ch, e.target.checked)} />
            <span>Chapter {ch}</span>
          </label>
        ))}
      </div>

      {isCustom && (
        <button className="btn danger block" style={{ marginTop: 16 }} onClick={deleteCustomBook}>
          🗑️ Delete this book
        </button>
      )}
    </Modal>
  );
}

function AddBookModal({ klass, onClose }: { klass: number; onClose: () => void }) {
  const { pushToast } = useApp();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('English');
  const [bookClass, setBookClass] = useState(klass);
  const [chapters, setChapters] = useState(10);
  const [file, setFile] = useState<File | null>(null);

  const subjects = subjectsForClass(bookClass);

  async function save() {
    const t = title.trim();
    if (!t) return;
    const id = await db.customBooks.add({
      klass: bookClass, subject, title: t, chapters: Math.max(1, chapters), addedAt: new Date().toISOString(),
    });
    if (file) {
      await db.bookFiles.add({
        bookId: `custom-${id}`, label: file.name.replace(/\.pdf$/i, ''),
        fileName: file.name, type: file.type || 'application/pdf', size: file.size, blob: file,
        addedAt: new Date().toISOString(),
      });
    }
    pushToast('Book added to the library!', '📚');
    onClose();
  }

  return (
    <Modal title="Add your own book" onClose={onClose}>
      <div className="field">
        <label>Book title</label>
        <input className="input" value={title} autoFocus placeholder="e.g. Story Time Reader" onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Subject</label>
          <select className="select" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 110 }}>
          <label>Class</label>
          <select className="select" value={bookClass} onChange={(e) => setBookClass(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Number of chapters (for progress tracking)</label>
        <input className="input" type="number" min={1} max={60} value={chapters} onChange={(e) => setChapters(Number(e.target.value))} />
      </div>
      <div className="field">
        <label>PDF file (optional — you can add it later)</label>
        <label className="file-drop">
          {file ? `📄 ${file.name}` : '➕ Choose a PDF'}
          <input type="file" accept="application/pdf,.pdf" style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" style={{ flex: 1 }} onClick={save} disabled={!title.trim()}>Add book</button>
      </div>
    </Modal>
  );
}
