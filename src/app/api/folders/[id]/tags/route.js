export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import { getForFolder, addToFolder, removeFromFolder } from '@/lib/db/repositories/tagRepository';

ensureDb();

export async function GET(_, { params }) {
  const { id } = await params;
  const folderId = parseId(id);
  if (!folderId) return err('Invalid folder id');
  return ok(getForFolder(folderId));
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const folderId = parseId(id);
  if (!folderId) return err('Invalid folder id');
  const { tag_name } = await request.json();
  if (!tag_name) return err('tag_name is required');
  return ok(addToFolder(folderId, tag_name));
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const folderId = parseId(id);
  if (!folderId) return err('Invalid folder id');
  const { tag_name } = await request.json();
  if (!tag_name) return err('tag_name is required');
  return ok(removeFromFolder(folderId, tag_name));
}
