export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import { updateProgress } from '@/lib/db/repositories/videoRepository';

ensureDb();

export async function PUT(request, { params }) {
  const { id } = await params;
  const videoId = parseId(id);
  if (!videoId) return err('Invalid video id');
  const { progress } = await request.json();
  try {
    return ok(updateProgress(videoId, Math.round(progress)));
  } catch (e) {
    return err(e.message, 404);
  }
}
