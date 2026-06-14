export const dynamic = 'force-dynamic';
import { ok, err, ensureDb, parseId } from '@/lib/apiHelper';
import { create, getForVideo } from '@/lib/db/repositories/noteRepository';

ensureDb();

export async function GET(_, { params }) {
  const { id } = await params;
  const videoId = parseId(id);
  if (!videoId) return err('Invalid video id');
  return ok(getForVideo(videoId));
}

export async function POST(request, { params }) {
  const { id } = await params;
  const videoId = parseId(id);
  if (!videoId) return err('Invalid video id');
  const { content } = await request.json();
  if (!content) return err('content is required');
  try {
    return ok(create(videoId, content));
  } catch (e) {
    return err(e.message, 404);
  }
}
