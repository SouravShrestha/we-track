export const dynamic = 'force-dynamic';
import { ok, err, ensureDb } from '@/lib/apiHelper';
import { scanFolder } from '@/lib/db/repositories/folderRepository';

ensureDb();

export async function POST(request) {
  const { folder_path } = await request.json();
  if (!folder_path) return err('folder_path is required');
  try {
    return ok(scanFolder(folder_path));
  } catch (e) {
    console.error('Folder scan failed:', e);
    return err('Failed to scan the specified folder.', 500);
  }
}
