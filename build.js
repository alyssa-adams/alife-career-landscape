/* Inline every <script src> into a single self-contained slides.html.
   The deck has to open with the network unplugged, and it has to be one file
   that can be dropped into Discord for 550 people who then get to drag the
   sliders themselves. */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const src = fs.readFileSync(path.join(root, 'deck', 'slides-src.html'), 'utf8');

const out = src.replace(/[ \t]*<script src="([^"]+)"><\/script>\n?/g, (_, rel) => {
  const file = path.resolve(root, 'deck', rel);
  const code = fs.readFileSync(file, 'utf8');
  return `<script>\n/* ==== ${path.basename(file)} ==== */\n${code}\n</script>\n`;
});

if (/<script src=/.test(out)) throw new Error('an external script survived inlining');

const dest = path.join(root, 'slides.html');
fs.writeFileSync(dest, out);
const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`slides.html written — ${kb} KB, fully self-contained`);
