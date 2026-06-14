export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import { getSubfolders } from '@/lib/db/repositories/folderRepository';

ensureDb();

export async function GET(_, { params }) {
  const { id } = await params;
  const folderId = parseId(id);
  if (!folderId) return err('Invalid folder id');
  const subs = getSubfolders(folderId);
  if (!subs.length) return err('No subfolders found', 404);
  return ok(subs);
}
