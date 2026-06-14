import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeNoteHtml } from './sanitizeHtml.mjs';

test('preserves allowed formatting tags', () => {
  const input = '<b>bold</b> <i>italic</i> <u>under</u><br><div>line</div>';
  assert.equal(sanitizeNoteHtml(input), '<b>bold</b> <i>italic</i> <u>under</u><br><div>line</div>');
});

test('strips attributes from allowed tags (kills event handlers)', () => {
  assert.equal(sanitizeNoteHtml('<b onclick="alert(1)">x</b>'), '<b>x</b>');
  assert.equal(sanitizeNoteHtml('<div style="x" onmouseover="evil()">y</div>'), '<div>y</div>');
});

test('removes disallowed tags entirely', () => {
  assert.equal(sanitizeNoteHtml('<img src=x onerror="alert(1)">'), '');
  assert.equal(sanitizeNoteHtml('<a href="javascript:alert(1)">link</a>'), 'link');
});

test('removes script/style blocks including their contents', () => {
  assert.equal(sanitizeNoteHtml('hi<script>alert(1)</script>there'), 'hithere');
  assert.equal(sanitizeNoteHtml('a<style>body{}</style>b'), 'ab');
  // unclosed script tag is still neutralized
  assert.equal(sanitizeNoteHtml('ok<script>alert(1)'), 'ok');
});

test('strips HTML comments', () => {
  assert.equal(sanitizeNoteHtml('a<!-- [if IE]><script>x</script><![endif] -->b'), 'ab');
});

test('handles empty / non-string input', () => {
  assert.equal(sanitizeNoteHtml(''), '');
  assert.equal(sanitizeNoteHtml(null), '');
  assert.equal(sanitizeNoteHtml(undefined), '');
});

test('leaves plain text untouched', () => {
  assert.equal(sanitizeNoteHtml('just a normal note'), 'just a normal note');
});
