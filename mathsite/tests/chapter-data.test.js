const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/chapter-data.js'), 'utf8'), context);
const {lessons, problems, quiz} = context.window.CHAPTER;
assert.equal(lessons.length, 3);
assert.equal(problems.length, 15);
assert.equal(quiz.length, 6);
assert.equal(new Set(problems.map(p => p.id)).size, problems.length);
for (const l of lessons) {
  assert.equal(problems.filter(p => p.lesson === l.id).length, 5);
  assert.ok(l.example && l.concepts.length >= 3 && l.sources.length);
}
for (const p of problems) {
  assert.ok(lessons.some(l => l.id === p.lesson));
  assert.ok(p.cps.length >= 3);
  for (const cp of p.cps) {
    assert.ok(cp.ask && cp.ans && cp.explain && cp.hints.length >= 2);
    assert.ok(['num','set','list'].includes(cp.type));
  }
}
for (const l of lessons) assert.equal(quiz.filter(q => q.lesson === l.id).length, 2);
const html = fs.readFileSync(path.join(root, 'standalone.html'), 'utf8');
assert.ok(html.includes('window.CHAPTER ='));
assert.ok(html.includes('window.ChapterUI ='));
assert.ok(html.includes('.chapter-hero{'));
assert.ok(!html.includes('href="css/chapter.css"'));
console.log(`OK: ${lessons.length} lessons, ${problems.length} guided problems, ${problems.reduce((n,p)=>n+p.cps.length,0)} steps, ${quiz.length} assessment questions, standalone bundled`);
