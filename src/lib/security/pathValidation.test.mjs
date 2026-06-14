import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  isPathWithinRoot,
  hasAllowedVideoExtension,
  isAllowedVideoPath,
} from './pathValidation.mjs';

const ROOT = path.resolve('/courses');
const ROOTS = [ROOT];

test('isPathWithinRoot accepts files inside the root', () => {
  assert.equal(isPathWithinRoot(path.join(ROOT, 'react', 'intro.mp4'), ROOT), true);
  assert.equal(isPathWithinRoot(ROOT, ROOT), true);
});

test('isPathWithinRoot rejects traversal escaping the root', () => {
  assert.equal(isPathWithinRoot(path.join(ROOT, '..', '..', 'etc', 'passwd'), ROOT), false);
  assert.equal(isPathWithinRoot('/etc/passwd', ROOT), false);
});

test('isPathWithinRoot rejects sibling dirs with a shared prefix', () => {
  // /courses-secret must not be treated as inside /courses
  assert.equal(isPathWithinRoot(path.resolve('/courses-secret/x.mp4'), ROOT), false);
});

test('hasAllowedVideoExtension is case-insensitive and extension-only', () => {
  assert.equal(hasAllowedVideoExtension('a.MP4'), true);
  assert.equal(hasAllowedVideoExtension('a.mkv'), true);
  assert.equal(hasAllowedVideoExtension('a.avi'), true);
  assert.equal(hasAllowedVideoExtension('a.txt'), false);
  assert.equal(hasAllowedVideoExtension('a.mp4.exe'), false);
  assert.equal(hasAllowedVideoExtension('passwd'), false);
});

test('isAllowedVideoPath accepts a valid in-root video', () => {
  assert.equal(isAllowedVideoPath(path.join(ROOT, 'react', 'intro.mp4'), ROOTS), true);
});

test('isAllowedVideoPath rejects traversal, non-video, and outside-root paths', () => {
  assert.equal(isAllowedVideoPath(path.join(ROOT, '..', '..', 'etc', 'passwd'), ROOTS), false);
  assert.equal(isAllowedVideoPath('/etc/passwd', ROOTS), false);
  assert.equal(isAllowedVideoPath(path.join(ROOT, 'notes.txt'), ROOTS), false);
});

test('isAllowedVideoPath rejects invalid inputs', () => {
  assert.equal(isAllowedVideoPath('', ROOTS), false);
  assert.equal(isAllowedVideoPath(null, ROOTS), false);
  assert.equal(isAllowedVideoPath(path.join(ROOT, 'a.mp4'), []), false);
});
