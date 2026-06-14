import { getDb } from '../database.js';
import { sanitizeNoteHtml } from '../../security/sanitizeHtml.mjs';

function nowIso() {
  return new Date().toISOString();
}

export function create(videoId, content) {
  const db = getDb();
  if (!db.prepare('SELECT id FROM videos WHERE id = ?').get(videoId)) throw new Error('Video not found');
  const now = nowIso();
  const clean = sanitizeNoteHtml(content);
  const r = db.prepare('INSERT INTO notes (video_id, content, created_at, updated_at) VALUES (?, ?, ?, ?)').run(videoId, clean, now, now);
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(r.lastInsertRowid);
}

export function getForVideo(videoId) {
  return getDb().prepare('SELECT * FROM notes WHERE video_id = ? ORDER BY created_at DESC').all(videoId);
}

export function remove(noteId) {
  const db = getDb();
  if (!db.prepare('SELECT id FROM notes WHERE id = ?').get(noteId)) throw new Error('Note not found');
  db.prepare('DELETE FROM notes WHERE id = ?').run(noteId);
  return { detail: 'Note deleted successfully.' };
}

export function update(noteId, content) {
  const db = getDb();
  if (!db.prepare('SELECT id FROM notes WHERE id = ?').get(noteId)) throw new Error('Note not found');
  db.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?').run(sanitizeNoteHtml(content), nowIso(), noteId);
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
}
