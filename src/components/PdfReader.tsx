import { useEffect, useState } from 'react';

// Full-screen reader for an attached book file. Uses a blob URL + the
// browser's built-in PDF/image viewer via an <iframe>, so it needs no
// external library and works completely offline.
export function PdfReader({ file, title, onClose }: { file: Blob; title: string; onClose: () => void }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="reader-overlay">
      <div className="reader-bar">
        <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📖 {title}</strong>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {url && <a className="btn ghost" href={url} target="_blank" rel="noreferrer">Open in new tab ↗</a>}
          <button className="btn primary" onClick={onClose}>Close ✕</button>
        </div>
      </div>
      {url ? (
        <iframe className="reader-frame" src={url} title={title} />
      ) : (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#fff' }}>Loading…</div>
      )}
    </div>
  );
}
