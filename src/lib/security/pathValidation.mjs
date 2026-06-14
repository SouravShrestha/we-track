import path from 'path';

// Video file types the app is allowed to serve. Mirrors the scanner's
// VIDEO_EXTENSIONS in folderRepository.js.
export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi'];

// True when `candidatePath` resolves to a location inside `rootPath`
// (or is the root itself). Resolving both sides collapses any `..`
// segments, so traversal attempts like `root/../../etc/passwd` are caught.
export function isPathWithinRoot(candidatePath, rootPath) {
  if (!candidatePath || !rootPath) return false;
  const resolvedRoot = path.resolve(rootPath);
  const resolvedCandidate = path.resolve(candidatePath);
  if (resolvedCandidate === resolvedRoot) return true;
  const rootWithSep = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep;
  return resolvedCandidate.startsWith(rootWithSep);
}

export function hasAllowedVideoExtension(candidatePath) {
  if (typeof candidatePath !== 'string') return false;
  return ALLOWED_VIDEO_EXTENSIONS.includes(path.extname(candidatePath).toLowerCase());
}

// Gate for the video-streaming endpoint: a client-supplied path is only
// allowed when it has a recognised video extension AND lives under one of
// the registered main-folder roots. `roots` is an array of absolute
// directory paths (the `path` column of `main_folders`).
export function isAllowedVideoPath(candidatePath, roots) {
  if (typeof candidatePath !== 'string' || candidatePath.length === 0) return false;
  if (!Array.isArray(roots) || roots.length === 0) return false;
  if (!hasAllowedVideoExtension(candidatePath)) return false;
  return roots.some((root) => isPathWithinRoot(candidatePath, root));
}
