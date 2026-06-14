export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import { getById, removeFolder } from '@/lib/db/repositories/folderRepository';

ensureDb();

export async function GET(_, { params }) {
  const { id } = await params;
  const folderId = parseId(id);
  if (!folderId) return err('Invalid folder id');
  const folder = getById(folderId);
  if (!folder) return err('Folder not found', 404);
  return ok(folder);
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  const folderId = parseId(id);
  if (!folderId) return err('Invalid folder id');
  removeFolder(folderId);
  return ok({ detail: 'Folder removed.' });
}

