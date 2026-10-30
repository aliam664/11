// Build a self-contained offline physics site. The portal link still requires the full project.
const fs = require('fs'), path = require('path');
const root = __dirname;
const read = p => fs.readFileSync(path.resolve(root, p));
const url = p => 'data:font/woff2;base64,' + read(p).toString('base64');
let html = read('index.html').toString();
let katex = read('vendor/katex/dist/katex.min.css').toString().replace(
  /url\(fonts\/([^)]+?)\.woff2\)\s*format\("woff2"\)(?:,\s*url\([^)]+\)\s*format\("[^"]+"\))*/g,
  (_, name) => `url(${url('vendor/katex/dist/fonts/' + name + '.woff2')}) format("woff2")`
);
let css = read('style.css').toString().replace(/url\('([^']+\.woff2)'\)/g, (_, p) => `url('${url(p)}')`);
html = html.replace('<link rel="stylesheet" href="vendor/katex/dist/katex.min.css">', () => `<style>${katex}</style>`)
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`);
let scripts = '';
html = html.replace(/<script defer src="([^"]+)"><\/script>/g, (_, src) => {
  scripts += '<script>' + read(src).toString().replace(/<\/script>/gi, '<\\/script>') + '</script>\n';
  return '';
});
html = html.replace('</body>', scripts + '</body>').replace(/^[ \t]+$/gm, '');
fs.writeFileSync(path.join(root, 'standalone.html'), html);
console.log('Physics standalone:', Math.round(Buffer.byteLength(html) / 1024), 'KB');
