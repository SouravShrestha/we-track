export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import { remove, update } from '@/lib/db/repositories/noteRepository';

ensureDb();

export async function DELETE(_, { params }) {
  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) return err('Invalid note id');
  try {
    return ok(remove(noteId));
  } catch (e) {
    return err(e.message, 404);
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) return err('Invalid note id');
  const { content } = await request.json();
  if (!content) return err('content is required');
  try {
    return ok(update(noteId, content));
  } catch (e) {
    return err(e.message, 404);
  }
}
