# we-track

A self-hosted web app to track your progress through locally stored video courses. It scans folders on your filesystem, reads video durations automatically, and lets you track watch progress, add notes, and tag courses — all stored locally in a SQLite database.

---

## Features

- **Auto-scan** course folders — no manual entry of videos
- **Progress tracking** per video (0–100%)
- **Resume from last played** video per course
- **Notes** on individual videos
- **Tags** for organising courses
- **Automatic cleanup** of missing files when folders are re-scanned
- Runs entirely **offline** — no accounts, no cloud

---

## Expected Folder Structure

The app understands up to four levels of nesting. Register a **Main Folder** (a parent directory containing multiple courses) and the app scans everything inside it automatically.

### Pattern A — chapters contain videos directly

```
Main Folder/
└── My Course/               ← course (folder)
    ├── 01 - Introduction/   ← chapter (subfolder)
    │   ├── 01 intro.mp4
    │   └── 02 overview.mp4
    └── 02 - Deep Dive/
        ├── 01 concepts.mp4
        └── 02 practice.mp4
```

### Pattern B — chapters contain lesson subdirectories

```
Main Folder/
└── My Course/               ← course (folder)
    └── 01 - Introduction/   ← chapter (subfolder)
        ├── Lesson 1/        ← lesson
        │   └── video.mp4
        └── Lesson 2/
            └── video.mp4
```

> Supported video formats: `.mp4`, `.mkv`, `.avi`

---

## Quick Start (Docker)

To run the pre-built image without needing the source code, run the following commands:

```bash
docker pull ghcr.io/souravshrestha/we-track:latest
docker run -d --name we-track -p 3000:3000 -v /Users/sourav/Documents:/Documents ghcr.io/souravshrestha/we-track:latest
```

> **Note:** You can replace `/Users/sourav/Documents` with the path to the folder containing your courses.

---

## Running Locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev      # development (http://localhost:3000)
npm start        # production
```

The SQLite database is stored at:
```
~/Library/Application Support/WeTrack/we_track_db.db
```

---

## Running with Docker

**Prerequisites:** Docker + Docker Compose

```bash
docker compose up --build
```

Open `http://localhost:3000`.

- Your **home directory** is mounted read-only into the container at the same path (`/Users/...`), so the folder picker works exactly as it does locally.
- The SQLite database is persisted in a named Docker volume (`we-track-data`).
- **Paths are case-sensitive** inside the container (Linux filesystem). Enter the path exactly as it appears on disk — e.g. `/Users/sourav/Documents/Learning/Courses`, not `/users/sourav/documents/learning/courses`.

To stop and remove containers (data is preserved in the volume):
```bash
docker compose down
```

To also delete all saved data:
```bash
docker compose down -v
```

---

## Getting Started

1. Start the app and open `http://localhost:3000`
2. Go to **Settings** (or the main folders section) and add a **Main Folder** — the parent directory that contains your courses
3. The app scans and lists all course folders inside it
4. Click a course to see its chapters and videos
5. Play a video in your local media player — mark progress manually, or it tracks automatically if integrated
6. Add tags and notes as you go
