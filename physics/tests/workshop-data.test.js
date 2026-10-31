// Run with: node physics/tests/workshop-data.test.js (no external dependencies)
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'potential-workshop.js'),'utf8'),context);
const data=vm.runInContext('workshopProblems',context);
const sources=vm.runInContext('workshopSources',context);
const expected={
 'sign-a':[30,-90,90], 'sign-b':[-6,30,-30], 'reverse-voltage':[-80,20,25],
 'battery-reference':[-24,-24], 'battery-shift':[4,24,12], 'battery-charge':[9,36,-36],
 'plate-field':[5000,-100,200,-200], 'angle-field':[.05,-25,0], 'field-map':[-40,10,10],
 'work-same':[-120,120,-120], 'work-changing':[-60,40,60], 'work-other':[7,7,-8]
};
assert.equal(data.length,12);
assert.equal(new Set(data.map(p=>p.id)).size,12);
for(const p of data){
 assert.ok(expected[p.id],`Missing independent expected values for ${p.id}`);
 assert.deepEqual(Array.from(p.steps,s=>s.answer),expected[p.id],p.id);
 assert.ok(p.statement && p.title && p.category);
 if(p.source) assert.match(sources[p.source],/^https:\/\//);
 for(const s of p.steps){assert.ok(s.q&&s.explain&&s.hints.length>0);assert.ok(Number.isFinite(s.answer));}
}
assert.equal(data.reduce((n,p)=>n+p.steps.length,0),36);
assert.match(fs.readFileSync(path.join(root,'style.css'),'utf8'),/\.step-list li\[hidden\]\s*\{\s*display:\s*none/);
console.log('۱۲ مسئله، ۳۶ پاسخ، منابع و پنهان‌بودن گام‌ها بررسی شد.');
