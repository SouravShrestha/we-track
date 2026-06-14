// Minimal, dependency-free allowlist sanitizer for note content.
//
// Notes are authored in a contentEditable editor (AddNote.jsx) that emits a
// small set of presentational tags (<b>/<i>/<u>/<div>/<br>) via
// document.execCommand. We keep that formatting but:
//   - drop every tag that is not on the allowlist (img, a, svg, script, ...),
//   - strip ALL attributes from allowed tags (kills onerror=, style=, href=,
//     and other event-handler / javascript: vectors),
//   - remove the *contents* of dangerous elements (script/style/etc.) entirely.
//
// This is intentionally conservative. It is NOT a general-purpose HTML
// sanitizer; if dependency installation becomes possible, prefer a vetted
// library such as DOMPurify / isomorphic-dompurify.

const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'br', 'p', 'div', 'span', 'ul', 'ol', 'li',
]);

// Elements whose text content must never be rendered.
const DANGEROUS_BLOCKS = ['script', 'style', 'iframe', 'object', 'embed', 'noscript'];

export function sanitizeNoteHtml(html) {
  if (typeof html !== 'string' || html.length === 0) return '';

  let out = html;

  // 1. Remove dangerous elements together with their contents
  //    (e.g. <script>...</script>), including unclosed variants.
  for (const tag of DANGEROUS_BLOCKS) {
    out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*?(?:</${tag}>|$)`, 'gi'), '');
  }

  // 2. Strip HTML comments (can be used to smuggle conditional markup).
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  // 3. Walk every remaining tag. Allowed tags are re-emitted with no
  //    attributes; everything else is removed. Because allowed tags lose all
  //    attributes, no event handlers / javascript: URLs can survive.
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    return match[1] === '/' ? `</${tag}>` : `<${tag}>`;
  });

  return out;
}
