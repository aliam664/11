/* مسیر سه درس نخست؛ مستقل از تسلط درس‌های قبلی */
window.ChapterUI = (() => {
  const D = window.CHAPTER, E = window.Engine;
  const R = String.raw;
  const state = () => E.state.chapter = E.state.chapter || { done:{}, best:null };
  const rm = el => window.renderMath && window.renderMath(el);
  const lesson = id => D.lessons.find(l => l.id === id);
  const problems = id => D.problems.filter(p => p.lesson === id);
  const saved = id => state().done[id];
  const labels = {solid:'مستقل', ok:'با راهنمایی', assisted:'با نمایش پاسخ'};
  const arrow = '<span aria-hidden="true">←</span>';
  function shell(title, eyebrow, subtitle) {
    return `<div class="chapter-crumb"><a href="#/chapter">فصل اول</a><span> / </span><span>${title}</span></div><header class="chapter-head"><div><span class="chapter-kicker">${eyebrow}</span><h2>${title}</h2><p>${subtitle}</p></div><div class="chapter-orbit" aria-hidden="true"><span>∑</span><i>√</i><b>x²</b></div></header>`;
  }
  function problemCards(list) {
    return list.map((p, i) => `<a class="chapter-problem" href="#/chapter/work/${p.id}"><span class="chapter-problem-no">${String(i+1).padStart(2,'0')}</span><span class="chapter-problem-body"><small>${p.level} · ${p.cps.length} گام</small><strong>${p.title}</strong><em>${saved(p.id) ? '✓ انجام‌شده · '+labels[saved(p.id)] : 'آمادهٔ تمرین'}</em></span><span class="chapter-arrow">↗</span></a>`).join('');
  }
  function landing(view) {
    const done = Object.keys(state().done).filter(id => D.problems.some(p => p.id === id)).length;
    view.innerHTML = `<div class="chapter-page"><section class="chapter-hero"><div class="chapter-hero-copy"><span class="chapter-kicker">حسابان ۱ · فصل اول</span><h2>سه درس،<br><span>یک مسیر روشن.</span></h2><p>از یک مثال شروع کن؛ مفهوم را کشف کن و با مسئله‌های مرحله‌ای، خودت به پاسخ برس.</p><div class="chapter-actions"><a class="chapter-primary" href="#/chapter/lesson/sequence">شروع مسیر ${arrow}</a><button class="chapter-secondary" type="button" id="chapterSeeLessons">دیدن درس‌ها ↓</button></div><div class="chapter-hero-meta"><span>۳ درس عمیق</span><span>۱۵ مسئلهٔ چندگامی</span><span>آزمون مستقل</span></div></div><div class="chapter-visual" aria-hidden="true"><div class="chapter-visual-circle"><span class="chapter-eq">a + b</span><span class="chapter-sum">∑</span><span class="chapter-root">√x</span><span class="chapter-formula">x² − Sx + P</span></div><div class="chapter-float">یادگیری، گام به گام <b>✦</b></div></div></section>
    <div class="chapter-overview"><div><small>پیشرفت کارگاه</small><strong>${done}<span> / ${D.problems.length}</span></strong><p>مسئلهٔ کامل‌شده</p></div><div class="chapter-progress-track"><i style="width:${done/D.problems.length*100}%"></i></div><a href="#/chapter/test">سنجش مستقل ${arrow}</a></div>
    <div class="chapter-section-head" id="chapter-lessons"><div><span class="chapter-eyebrow">نقشهٔ یادگیری</span><h3>از کجا شروع کنیم؟</h3><p>هر درس با یک مثال حل‌شده شروع می‌شود.</p></div><span class="chapter-section-num">01 — 03</span></div>
    <div class="chapter-lesson-grid">${D.lessons.map(l => {const ps=problems(l.id), n=ps.filter(p=>saved(p.id)).length; return `<a class="chapter-lesson-card" href="#/chapter/lesson/${l.id}"><div class="chapter-card-top"><span class="chapter-icon">${l.icon}</span><span class="chapter-card-num">درس ${l.number}</span></div><h3>${l.title}</h3><p>${l.subtitle}</p><div class="chapter-card-bottom"><span>${n} از ${ps.length} تمرین</span><b>${arrow}</b></div></a>`;}).join('')}</div>
    <div class="chapter-bottom-banner"><div><span class="chapter-eyebrow">با مسئله یاد بگیر</span><h3>می‌خواهی آموخته‌هایت را محک بزنی؟</h3><p>ارزیابی شش‌سؤالی، مستقل و بدون راهنمایی است. نتیجه از پیشرفت درس‌های قدیمی جداست.</p></div><a class="chapter-primary" href="#/chapter/test">رفتن به آزمون ${arrow}</a></div>
    <p class="chapter-disclaimer">تمرین‌ها تألیفی‌اند و از تیپ‌های مشاهده‌شده الهام گرفته‌اند؛ ادعای فراوانی آماری یا تطبیق خط‌به‌خط با چاپ فعلی کتاب نداریم. اطلاعات پیشرفت در همین مرورگر ذخیره می‌شود.</p></div>`;
    rm(view);
    view.querySelector('#chapterSeeLessons').onclick = () => view.querySelector('#chapter-lessons').scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  function lessonPage(view,id) {
    const l=lesson(id); if (!l) return landing(view);
    const ps=problems(id);
    view.innerHTML=`<div class="chapter-page">${shell(l.title,'درس '+l.number+' · اول مثال، بعد مفهوم',l.subtitle)}
    <div class="chapter-reading-layout"><article class="chapter-reading"><section class="chapter-panel chapter-example"><div class="chapter-panel-label"><span>✦</span> مثال حل‌شده</div><h3>از یک مسئله شروع کنیم</h3>${l.example}</section>
    <section class="chapter-panel"><div class="chapter-panel-label"><span>◈</span> مفهوم و فرمول</div><h3>حالا ایده را تعمیم بدهیم</h3>${l.concepts.map(([t,c])=>`<div class="chapter-concept"><h4>${t}</h4><div>${c}</div></div>`).join('')}</section>
    <section class="chapter-panel"><div class="chapter-panel-label"><span>↗</span> انتخاب روش</div><h3>چرا این روش؟</h3><ul class="chapter-list">${l.methods.map(t=>`<li>${t}</li>`).join('')}</ul></section>
    <section class="chapter-panel chapter-caution"><div class="chapter-panel-label"><span>!</span> دام‌های رایج</div><h3>قبل از نوشتن جواب نهایی</h3><ul class="chapter-list">${l.traps.map(t=>`<li>${t}</li>`).join('')}</ul></section>
    <section class="chapter-panel"><div class="chapter-panel-label"><span>↗</span> منابع و محدوده</div><p>این درس از منابع زیر و تحقیق‌های قبلی الهام گرفته است. تمرین‌ها تألیفی‌اند؛ صفحه‌بندی و تطبیق کامل با چاپ فعلی کتاب تأیید نشده است.</p><div class="chapter-sources">${l.sources.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a>`).join('')}</div></section></article>
    <aside class="chapter-aside"><div class="chapter-aside-card"><span class="chapter-eyebrow">مسیر تمرین</span><h3>حالا نوبت توست</h3><p>یک سؤال در هر گام؛ اگر لازم بود راهنمایی کوچک بگیر.</p><a class="chapter-primary" href="#/chapter/work/${ps[0].id}">شروع تمرین ${arrow}</a>${l.legacy ? `<a class="chapter-old-link" href="${l.legacy}">درس‌های عمیق‌تر درجهٔ دوم ↗</a>`:''}</div></aside></div>
    <div class="chapter-section-head"><div><span class="chapter-eyebrow">کارگاه درس ${l.number}</span><h3>با هم حل کنیم</h3><p>از تمرین پایه شروع کن و به چالش برس.</p></div></div><div class="chapter-problem-grid">${problemCards(ps)}</div><div class="chapter-next"><a href="#/chapter">← بازگشت به نقشه</a><a href="#/chapter/test">آزمون مستقل ↗</a></div></div>`;
    rm(view);
  }
  function workPage(view,id) {
    const p=D.problems.find(p=>p.id===id); if(!p) return landing(view);
    const l=lesson(p.lesson), list=problems(p.lesson), idx=list.indexOf(p), next=list[idx+1];
    view.innerHTML=`<div class="chapter-page">${shell(p.title,'کارگاه · '+l.title,`${p.level} · ${p.cps.length} گام · راهنمایی تدریجی`)}<div class="chapter-work-layout"><section class="chapter-panel chapter-work"><div class="chapter-panel-label"><span>✦</span> مسئلهٔ تألیفی</div><h3>خودت حل کن</h3><p class="chapter-work-intro">هر بار فقط یک گام باز می‌شود. بعد از اشتباه، راهنمایی کوچکی می‌گیری؛ پاسخ فقط با درخواست خودت نمایش داده می‌شود.</p><div id="chapterChallenge"></div><div id="chapterFinish"></div></section><aside class="chapter-aside"><div class="chapter-aside-card"><span class="chapter-eyebrow">یک قدم در هر بار</span><h3>یادگیری واقعی</h3><p>پاسخ عددی، کسر و اعداد فارسی پذیرفته می‌شوند. مجموعه را با کاما جدا کن.</p><a class="chapter-old-link" href="#/chapter/lesson/${l.id}">مرور درس ${l.title} ↗</a></div></aside></div></div>`;
    rm(view);
    E.mountChallenge(view.querySelector('#chapterChallenge'),p, result=>{
      const scores={assisted:1,ok:2,solid:3}, old=saved(id);
      if (!old || scores[result.quality]>scores[old]) state().done[id]=result.quality;
      E.save();
      const finish=view.querySelector('#chapterFinish');
      finish.innerHTML=`<div class="chapter-completion"><strong>این مسئله تمام شد ✦</strong><p>بهترین وضعیت ثبت‌شده: ${labels[state().done[id]]}. می‌توانی دوباره مستقل امتحان کنی.</p><div class="chapter-actions">${next?`<a class="chapter-primary" href="#/chapter/work/${next.id}">مسئلهٔ بعد ${arrow}</a>`:`<a class="chapter-primary" href="#/chapter/lesson/${l.id}">بازگشت به درس ${arrow}</a>`}<button class="chapter-secondary" id="chapterRetry">تلاش دوباره ↻</button></div></div>`;
      view.querySelector('#chapterRetry').onclick=()=>workPage(view,id);
    });
  }
  function testPage(view) {
    let i=0, responses=[];
    function draw() {
      const q=D.quiz[i];
      view.innerHTML=`<div class="chapter-page">${shell('سنجش مستقل','ارزیابی · بدون راهنمایی','شش سؤال تازه از هر سه درس؛ یک سؤال در هر نوبت.')}<section class="chapter-panel chapter-test"><div class="chapter-test-progress"><span>سؤال ${i+1} از ${D.quiz.length}</span><span>${lesson(q.lesson).title}</span></div><div class="chapter-progress-track"><i style="width:${i/D.quiz.length*100}%"></i></div><h3 class="chapter-test-question">${q.q}</h3>${q.options?`<div class="chapter-test-options">${q.options.map((o,j)=>`<label><input type="radio" name="chapter-option" value="${j}"><span>${o}</span></label>`).join('')}</div>`:`<label class="chapter-input-label" for="chapterAnswer">پاسخ تو ${q.type==='set'?'(جواب‌ها را با کاما جدا کن)':''}</label><input id="chapterAnswer" class="cp-input" dir="ltr" autocomplete="off" placeholder="پاسخ را بنویس">`}<div id="chapterError" role="status"></div><button id="chapterSubmit" class="chapter-primary">${i===D.quiz.length-1?'ثبت و دیدن نتیجه':'ثبت و سؤال بعد'} ${arrow}</button><p class="chapter-test-note">در آزمون راهنمایی وجود ندارد؛ پاسخ‌نامه بعد از پایان، فقط با انتخاب تو باز می‌شود.</p></section></div>`;
      rm(view);
      view.querySelector('#chapterSubmit').onclick=()=>{
        const input=q.options ? view.querySelector('input[name="chapter-option"]:checked') : view.querySelector('#chapterAnswer');
        if(!input || !input.value.trim()){view.querySelector('#chapterError').textContent='اول پاسخت را وارد یا انتخاب کن.';return;}
        const ok=q.options ? Number(input.value)===q.correct : E.check(q,input.value).ok;
        responses.push({ok,answer:input.value}); i++;
        if(i<D.quiz.length) draw(); else finish();
      };
      const inp=view.querySelector('#chapterAnswer'); if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter') view.querySelector('#chapterSubmit').click();});
    }
    function finish() {
      const count=responses.filter(r=>r.ok).length, pct=Math.round(count/D.quiz.length*100);
      state().best = Math.max(state().best === null ? 0 : state().best,pct); E.save();
      view.innerHTML=`<div class="chapter-page">${shell('نتیجهٔ سنجش','پایان ارزیابی','این نتیجه مربوط به همین آزمون است؛ نمرهٔ تمرین‌های راهنمایی‌شده را تغییر نمی‌دهد.')}<section class="chapter-panel chapter-result"><div class="chapter-result-score">${count}<small> / ${D.quiz.length}</small></div><h3>${pct>=80?'آفرین، مستقل پیش رفتی!':'مسیر مرور تو روشن شد'}</h3><p>امتیاز این نوبت ${pct}٪ · بهترین امتیاز ثبت‌شده ${state().best}٪</p><div class="chapter-review-list">${D.quiz.map((q,j)=>`<details><summary>${j+1}. ${lesson(q.lesson).title} · ${responses[j].ok?'درست':'نیاز به مرور'} <span>مشاهدهٔ راه‌حل</span></summary><div><p>${q.q}</p><p>${q.sol}</p><a href="#/chapter/lesson/${q.lesson}">مرور این درس ↗</a></div></details>`).join('')}</div><div class="chapter-actions"><button class="chapter-primary" id="chapterAgain">تلاش دوباره ↻</button><a class="chapter-secondary" href="#/chapter">نقشهٔ درس‌ها</a></div><p class="chapter-test-note">تلاش دوباره از همین سؤال‌هاست؛ نتیجهٔ تکرار، ارزیابی تازه محسوب نمی‌شود.</p></section></div>`;
      rm(view); view.querySelector('#chapterAgain').onclick=()=>testPage(view);
    }
    draw();
  }
  function render(view, path) {
    if(!path) return landing(view);
    const parts=path.split('/');
    if(parts[0]==='lesson') return lessonPage(view,parts[1]);
    if(parts[0]==='work') return workPage(view,parts[1]);
    if(parts[0]==='test') return testPage(view);
    landing(view);
  }
  return {render};
})();
