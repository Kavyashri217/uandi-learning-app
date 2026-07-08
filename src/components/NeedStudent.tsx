import { useState } from 'react';
import { useApp } from '../AppState';
import { StudentSwitcher } from './StudentSwitcher';

// Guard shown on pages that need an active student. Instead of a dead end
// it nudges the teacher to pick/create one via the same switcher.
export function NeedStudent({ children }: { children: React.ReactNode }) {
  const { studentId } = useApp();
  if (studentId != null) return <>{children}</>;
  return (
    <div className="empty">
      <div className="big">👋</div>
      <h2 style={{ marginBottom: 6 }}>Choose a student to begin</h2>
      <p style={{ maxWidth: 420, margin: '0 auto 18px' }}>
        Pick an existing learner or add a new one. Everything they read, play and score
        is saved to their own profile on this device.
      </p>
      <div style={{ display: 'inline-block' }}><StudentSwitcher /></div>
    </div>
  );
}
