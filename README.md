# 🌱 VidyaSetu — Learn · Play · Grow

A free, **offline-first** learning app for students of **Class 1 to 12**, built for NGO
classrooms. Everything runs in the browser on the device — no internet, no accounts,
no server, and no data ever leaves the computer.

> _VidyaSetu_ (ವಿದ್ಯಾ ಸೇತು) means **"bridge of knowledge."**

## ✨ What's inside

| Section | What it does |
|---|---|
| 📚 **Reading** | NCERT & Karnataka (KTBS) textbook library for all classes & subjects — Kannada, English, Hindi, Mathematics, Science, Social Science, Computer Science. **Upload the real book PDFs** and students read them in a built-in offline viewer. Add your own books too. Chapter-by-chapter progress tracking. |
| 📝 **Quizzes** | 440+ built-in multiple-choice questions across every subject, class-wise, with instant feedback, explanations and XP. Options are shuffled every attempt. |
| 🎮 **Games** | Four learning games — **Math Sprint**, **Word Wizard**, **Memory Match**, **Rapid Fire** — that auto-adjust difficulty to the student's class. |
| 📊 **Progress** | Per-student XP, levels, daily streaks, a 5-week activity heat-map, 16 unlockable badges, and a quiz report card. |
| 🧑‍🏫 **Teacher (LMS)** | Class overview with per-student & per-subject analytics, a **custom quiz builder**, and one-click **backup / restore** of all data. |

## 🎯 Gamification

- **XP** for every quiz answer, chapter read and game played.
- **Levels** grow quadratically (Level _n_ at 100·(n−1)² XP).
- **Streaks** count consecutive days of learning.
- **16 badges** from _First Steps_ to _Living Legend_.
- Chapter XP is awarded only once per chapter (no farming by re-ticking).

## 🚀 Running it

```bash
npm install
npm run dev      # start the dev server (http://localhost:5174)
```

To create a distributable copy:

```bash
npm run build    # outputs a self-contained app in dist/
```

The build uses a **hash router** and relative asset paths, so you can copy the `dist/`
folder to any computer (or a USB stick) and open `index.html` directly in a browser —
**no web server needed.**

## 👩‍🏫 First-time setup for volunteers

1. Open the app and click the profile menu (top-right) → **Add student**.
2. Add each child with their name, class and an avatar.
3. Switch between children from the same menu on a shared computer.
4. Periodically use **Teacher → Backup & restore → Download backup file** to keep their
   progress safe, or to move it to another device.

## 🔧 Tech

Vite · React · TypeScript · React Router · Dexie (IndexedDB). All data is stored locally
in the browser via IndexedDB; the backup file is plain JSON.

## 📖 Book content & PDFs

The app ships with the book _catalog_ (titles, subjects, chapter counts) but not the book
_files_ — those are hosted free by the government. Download the PDFs from the official
portals ([NCERT](https://ncert.nic.in/textbook.php),
[ePathshala](https://epathshala.nic.in/), [DIKSHA](https://diksha.gov.in/),
[KTBS](https://ktbs.karnataka.gov.in/)) and **add them to each book** in the Reading section.
Once added, the PDF is stored on the device (IndexedDB) and opens in a built-in reader with
no internet needed. You can also **add your own books** that aren't in the catalog.

> **Backups:** uploaded PDF files are _not_ included in the JSON backup (they can be tens of
> MB each). Book entries and all student progress are — after restoring on a new device, just
> re-attach the PDFs.
