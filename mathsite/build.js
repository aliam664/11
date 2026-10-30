// ساخت نسخه‌ی تک‌فایلی (standalone.html) با تمام فونت‌ها، CSS و JS درون‌خطی
const fs = require('fs'), path = require('path');
const read = p => fs.readFileSync(path.join(__dirname, p));
const b64 = (p, mime) => `data:${mime};base64,${read(p).toString('base64')}`;

// KaTeX CSS با فونت‌های woff2 درون‌خطی (بقیه‌ی فرمت‌ها حذف می‌شوند)
let katexCss = read('vendor/katex/katex.min.css').toString();
katexCss = katexCss.replace(/url\(fonts\/([^)]+?)\.woff2\)\s*format\("woff2"\)(?:,\s*url\([^)]+\)\s*format\("[^"]+"\))*/g,
  (m, name) => `url(${b64('vendor/katex/fonts/' + name + '.woff2', 'font/woff2')}) format("woff2")`);

let fontsCss = read('css/fonts.css').toString()
  .replace(/url\('..\/fonts\/Vazirmatn-var.woff2'\)/, `url(${b64('fonts/Vazirmatn-var.woff2', 'font/woff2')})`);

let html = read('index.html').toString();
html = html
  .replace(/<link rel="stylesheet" href="vendor\/katex\/katex.min.css">/, () => `<style>${katexCss}</style>`)
  .replace(/<link rel="stylesheet" href="css\/fonts.css">/, () => `<style>${fontsCss}</style>`)
  .replace(/<link rel="stylesheet" href="css\/style.css">/, () => `<style>${read('css/style.css')}</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g, (m, src) => `<script>${read(src).toString().replace(/<\/script>/g, '<\\/script>')}</script>`);
// تصاویر assets/*.jpg را درون‌خطی می‌کنیم
html = html.replace(/assets\/([a-z0-9_-]+)\.jpg/g, (m, n) => b64('assets/' + n + '.jpg', 'image/jpeg'));
fs.writeFileSync(path.join(__dirname, 'standalone.html'), html);
console.log('standalone.html', (html.length / 1024).toFixed(0) + ' KB');
