export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import * as repo from '@/lib/db/repositories/mainFolderRepository';

ensureDb();

export async function DELETE(_, { params }) {
  const { id } = await params;
  const mainFolderId = parseId(id);
  if (!mainFolderId) return err('Invalid main folder id');
  repo.remove(mainFolderId);
  return ok({ detail: 'Main folder removed.' });
}
