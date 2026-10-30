/* ==========================================================
   منطق برنامه (نسخه‌ی ۳): درس مرحله‌ای، حل مشارکتی، ارزیابی، مرور فاصله‌دار
   ========================================================== */
(function () {
  const E = window.Engine, PR = window.PRACTICE || {}, AS = window.ASSESS || {};

  /* ───── آماده‌سازی داده‌ها ───── */
  const byId = {};
  window.LESSONS.forEach(l => { byId[l.id] = l; });
  Object.keys(window.EXTRAS || {}).forEach(id => { if (byId[id]) Object.assign(byId[id], window.EXTRAS[id]); });

  const unitOf = {};
  window.UNITS.forEach(u => u.ids.forEach(id => { unitOf[id] = u; }));
  const L = [...window.UNITS.flatMap(u => u.ids), ...window.MIX_ORDER].map(id => byId[id]).filter(Boolean);
  let ln = 0, mn = 0;
  L.forEach(l => {
    l.recall = l.recall || []; l.summary = l.summary || []; l.exam = l.exam || [];
    l.why = l.why || {}; l.methods = l.methods || []; l.checks = l.checks || [];
    l.pitfalls = l.pitfalls || [];
    if (l.group === 'lesson') { l.n = ++ln; l.icon = String(l.n); l.unit = unitOf[l.id]; }
    else { l.n = ++mn; l.icon = l.level === 'easy' ? '★' : l.level === 'mid' ? '★★' : '★★★'; }
  });
  const lessons = L.filter(l => l.group === 'lesson'), mixes = L.filter(l => l.group === 'mix');
  const qById = {};
  Object.keys(AS).forEach(u => AS[u].qs.forEach(q => { qById[q.id] = q; }));

  const view = document.getElementById('view');
  const nav = document.getElementById('nav');
  const sidebar = document.getElementById('sidebar');
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───── رندر فرمول ───── */
  window.renderMath = function (el) {
    if (!window.renderMathInElement) return;
    renderMathInElement(el, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false,
    });
  };
  const rm = el => window.renderMath(el);

  /* ───── اعلان و جشن ───── */
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.classList.add('out'), 2400); setTimeout(() => t.remove(), 2900);
  }
  function confetti() {
    const em = ['🎉', '✨', '⭐', '🎊', '💜', '🌟'];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span'); s.className = 'confetti'; s.textContent = em[i % em.length];
      s.style.left = (Math.random() * 100) + 'vw'; s.style.animationDelay = (Math.random() * .5) + 's';
      s.style.fontSize = (16 + Math.random() * 18) + 'px';
      document.body.appendChild(s); setTimeout(() => s.remove(), 2600);
    }
  }

  /* ───── تسلط ───── */
  const mastery = l => E.mastery(l);
  const overall = () => Math.round(L.reduce((s, l) => s + mastery(l), 0) / L.length);
  const mword = m => m >= 80 ? 'مسلط' : m >= 40 ? 'در حال یادگیری' : m > 0 ? 'شروع شده' : 'شروع نشده';
  const mcls = m => m >= 80 ? 'hi' : m >= 40 ? 'mid' : m > 0 ? 'lo' : 'zero';
  const stageOf = id => E.state.stages[id] || {};
  const assessBest = id => (E.state.assess[id] && E.state.assess[id].best) || 0;
  const ensureCard = id => {
    const k = 'l:' + id;
    if (!E.state.srs[k]) { E.state.srs[k] = { box: 0, due: Date.now() + 0.5 * 86400000, seen: 0 }; E.save(); }
  };
  function suggest() {
    const due = E.srsDue().length;
    if (due) return { href: '#/review', label: `🔁 مرور ${due} کارت موعدرسیده`, why: 'مرورِ به‌موقع جلوی فراموشی را می‌گیرد.' };
    const weak = lessons.filter(l => { const m = mastery(l); return m > 0 && m < 60; }).sort((a, b) => mastery(a) - mastery(b))[0];
    if (weak) return { href: '#/lesson/' + weak.id, label: `ادامه: ${weak.title}`, why: `تسلطت در این درس ${mastery(weak)}٪ است؛ بیا تثبیتش کنیم.` };
    const nxt = L.find(l => mastery(l) < 80);
    if (nxt) return { href: '#/lesson/' + nxt.id, label: (L.some(l => mastery(l) > 0) ? 'درس بعدی: ' : 'شروع: ') + nxt.title, why: 'با یک مثال حل‌شده شروع می‌کنیم.' };
    return { href: '#/assess/final', label: '🏆 آزمون نهایی', why: 'همه‌ی درس‌ها را مسلط شده‌ای؛ وقت امتحان واقعی است.' };
  }

  /* ───── نوار کناری ───── */
  function buildNav() {
    const dueN = E.srsDue().length;
    const item = (href, ico, title, id, extra = '', done = false) =>
      `<a href="${href}" data-id="${id}" class="${done ? 'done' : ''}">
         <span class="ico">${ico}</span><span class="t">${title}</span>${extra}<span class="tick">✓</span></a>`;
    const lessonItem = (l, title) => { const m = mastery(l); return item('#/lesson/' + l.id, l.icon, title || l.title, l.id, m > 0 ? `<span class="mp ${mcls(m)}">${m}٪</span>` : '', m >= 80); };
    nav.innerHTML =
      item('#/', '🏠', 'خانه', 'home') +
      window.UNITS.map(u => `<div class="nav-title">واحد ${u.id}: ${u.title}</div>` +
        u.ids.map(id => byId[id]).filter(Boolean).map(l => lessonItem(l)).join('') +
        item('#/assess/u' + u.id, '📝', `آزمون واحد ${u.id}`, 'assess-u' + u.id, assessBest('u' + u.id) ? `<span class="mp ${mcls(assessBest('u' + u.id))}">${assessBest('u' + u.id)}٪</span>` : '', assessBest('u' + u.id) >= 80)).join('') +
      '<div class="nav-title">مثال‌های ترکیبی</div>' +
      mixes.map(l => lessonItem(l, `<small class="lv ${l.level}">${l.levelName}</small> ${l.title}`)).join('') +
      '<div class="nav-title">مرور و ارزیابی</div>' +
      item('#/review', '🔁', 'مرور فاصله‌دار', 'review', dueN ? `<span class="mp due">${dueN}</span>` : '') +
      item('#/assess/final', '🏆', 'آزمون نهایی', 'assess-final', assessBest('final') ? `<span class="mp ${mcls(assessBest('final'))}">${assessBest('final')}٪</span>` : '', assessBest('final') >= 80) +
      item('#/formulas', '📒', 'فرمول‌نامه', 'formulas') +
      item('#/tools', '🧰', 'ابزارهای تعاملی', 'tools');
    const o = overall();
    $('progText').textContent = o + '٪';
    $('progBar').style.width = o + '%';
    rm(nav);
    filterNav();
  }
  function filterNav() {
    const q = ($('navSearch').value || '').trim().toLowerCase();
    nav.querySelectorAll('a').forEach(a => { a.style.display = (!q || a.textContent.toLowerCase().includes(q) || a.dataset.id === 'home') ? '' : 'none'; });
    nav.querySelectorAll('.nav-title').forEach(t => { t.style.display = q ? 'none' : ''; });
  }
  function markActive(id) {
    nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.id === id));
    const act = nav.querySelector('a.active'); if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
  }
  let curNavId = 'home';

  /* ───── خانه ───── */
  const PIPE = [
    ['🧪', 'مثال حل‌شده', 'با یک مثال کوتاه شروع می‌کنیم؛ قبل از بعضی گام‌ها حدس می‌زنی.'],
    ['💡', 'مفهوم و تعریف', 'از مثال، ایده‌ی کلی و بعد تعریف رسمی را بیرون می‌کشیم.'],
    ['🤔', 'چرا؟', 'دلیل هر گام و مقایسه‌ی روش‌ها؛ بدون فرمول حفظی.'],
    ['🧱', 'پیش‌نیازها', 'اگر جایی نمی‌دانی، همان‌جا مرور هدفمند می‌گیری.'],
    ['🤝', 'حل مشارکتی', 'مسئله‌ی مشابه را خودت حل می‌کنی؛ راهنمایی‌ها تدریجی و کوچک‌اند.'],
    ['🪜', 'تمرین پلکانی', 'متوسط، بعد دشوار؛ هر مسئله با ایده‌ای تازه.'],
    ['🏁', 'ارزیابی واقعی', 'سؤال‌های جدید، بدون راهنمایی؛ و مرور فاصله‌دار برای ماندگاری.'],
  ];
  function home() {
    const o = overall(), mastered = L.filter(l => mastery(l) >= 80).length, due = E.srsDue().length;
    const passed = ['u1', 'u2', 'u3', 'final'].filter(k => assessBest(k) >= 80).length;
    const sg = suggest();
    const lcard = l => { const m = mastery(l); return `
      <a href="#/lesson/${l.id}" class="mc ${mcls(m)}">
        ${l.img ? `<img src="${l.img}" alt="" loading="lazy">` : ''}
        <span class="n">درس ${l.n} · ⏱ ${l.time || 8} دقیقه</span>
        <h3>${l.title}</h3><p>${l.sub}</p>
        <div class="mrow"><div class="mbar"><i style="width:${m}%"></i></div><b class="mval">${m}٪</b></div>
        <small class="mw">${mword(m)}</small></a>`; };
    view.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <span class="hero-tag">یادگیری فعال · مثال ← مفهوم ← تمرین ← ارزیابی</span>
          <h2>معادله‌ی درجه دوم، جمع و ضرب ریشه‌ها و تغییر متغیر</h2>
          <p>اینجا فقط نمی‌خوانی؛ حدس می‌زنی، حل می‌کنی، اشتباهت را خودت پیدا می‌کنی و در پایان با سؤال‌های تازه و بدون راهنمایی سنجیده می‌شوی.</p>
          <div class="hero-btns">
            <a class="cta" href="${sg.href}">${sg.label} ←</a>
            <a class="cta ghost" href="#/formulas">📒 فرمول‌نامه</a>
          </div>
          <p class="hero-why">💬 ${sg.why}</p>
        </div>
        <img class="hero-img" src="assets/hero.jpg" alt="دانش‌آموز در حال یادگیری معادله‌ی درجه دوم">
      </section>

      <div class="stats-row">
        <div class="stat"><b>${o}٪</b><span>تسلط کلی</span></div>
        <div class="stat"><b>${mastered}/${L.length}</b><span>درس مسلط‌شده</span></div>
        <div class="stat"><b>${due}</b><span>کارت مرور امروز</span></div>
        <div class="stat"><b>${passed}/4</b><span>آزمون قبول‌شده (۸۰٪+)</span></div>
      </div>

      <div class="method-box pipe">
        <h3>🧭 مسیر هر درس (روشی که با یادگیری تو هماهنگ است)</h3>
        <div class="pipe-grid">${PIPE.map((p, i) => `<div class="pipe-step"><span class="pi">${p[0]}</span><b>${i + 1}. ${p[1]}</b><small>${p[2]}</small></div>`).join('')}</div>
        <p class="pipe-note">اگر جایی گیر کردی ناراحت نشو: «راهنمایی» بزن، یا به پیش‌نیاز برگرد. هر درس وقتی «مسلط» حساب می‌شود که خودت مسئله‌ی تازه حل کنی، نه فقط توضیح را بخوانی.</p>
      </div>

      ${window.UNITS.map(u => `
        <section class="unit">
          <div class="unit-head"><span class="unit-ico">${u.icon}</span>
            <div><h3>واحد ${u.id}: ${u.title}</h3><p>${u.desc}</p></div></div>
          <div class="map">${u.ids.map(id => byId[id]).filter(Boolean).map(lcard).join('')}
            <a href="#/assess/u${u.id}" class="mc assess-card"><span class="n">ارزیابی واقعی</span><h3>📝 آزمون واحد ${u.id}</h3>
              <p>${AS['u' + u.id] ? AS['u' + u.id].qs.length : ''} سؤال تازه، بدون راهنمایی</p>
              <div class="mrow"><div class="mbar"><i style="width:${assessBest('u' + u.id)}%"></i></div><b class="mval">${assessBest('u' + u.id) ? assessBest('u' + u.id) + '٪' : '—'}</b></div></a>
          </div>
        </section>`).join('')}

      <section class="unit">
        <div class="unit-head"><span class="unit-ico">🎯</span>
          <div><h3>مثال‌های ترکیبی (آسان ← متوسط ← سخت)</h3><p>چند روش را با هم به کار می‌بریم: مثال حل‌شده + یک مسئله‌ی مشابه برای خودت</p></div></div>
        <div class="map">${mixes.map(l => { const m = mastery(l); return `
          <a href="#/lesson/${l.id}" class="mc ${mcls(m)}">
            <span class="badge ${l.level}">${l.levelName}</span>
            <h3>${l.title}</h3><p>${l.sub}</p>
            <div class="mrow"><div class="mbar"><i style="width:${m}%"></i></div><b class="mval">${m}٪</b></div></a>`; }).join('')}</div>
      </section>

      <div class="final-card">
        <div><h3>🏆 آزمون نهایی</h3><p>ترکیب تصادفی از هر سه واحد؛ بدون راهنمایی. بهترین نتیجه‌ی تو: <b>${assessBest('final') ? assessBest('final') + '٪' : '—'}</b></p></div>
        <a class="cta" href="#/assess/final">شروع آزمون ←</a>
      </div>
      <p class="reset-row"><button class="linkbtn" id="resetBtn">پاک کردن پیشرفت و شروع دوباره</button></p>`;
    rm(view);
    $('resetBtn').onclick = () => {
      if (!confirm('همه‌ی پیشرفت و نتیجه‌ها پاک شود؟')) return;
      ['stages', 'srs', 'assess'].forEach(k => { Object.keys(E.state[k]).forEach(x => delete E.state[k][x]); });
      E.save(); buildNav(); home(); markActive('home');
    };
  }

  /* ───── درس: مرحله‌ها ───── */
  const liList = a => a.map(x => `<li>${x}</li>`).join('');
  let keyHandler = null, curStage = 'ex';
  const STAGES = [
    ['ex', '🧪', 'مثال'], ['concept', '💡', 'مفهوم'], ['why', '🤔', 'چرا؟'],
    ['pre', '🧱', 'پیش‌نیاز'], ['collab', '🤝', 'حل مشارکتی'], ['ladder', '🪜', 'تمرین'], ['test', '🏁', 'ارزیابی'],
  ];

  function lessonPage(id) {
    const idx = L.findIndex(l => l.id === id);
    if (idx < 0) return home();
    const l = L[idx], prev = L[idx - 1], next = L[idx + 1], p = PR[l.id] || {};
    const isMix = l.group === 'mix';
    const stageIds = isMix ? ['ex', 'collab'] : STAGES.map(s => s[0]);
    const badge = isMix
      ? `<span class="badge ${l.level}">مثال ترکیبی · ${l.levelName}</span>`
      : `<span class="badge">درس ${l.n} · واحد ${l.unit ? l.unit.id : ''}</span>`;

    view.innerHTML = `
      ${l.img ? `<figure class="banner"><img src="${l.img}" alt="${l.imgAlt || ''}"><figcaption>${l.imgAlt || ''}</figcaption></figure>` : ''}
      <header class="lesson-head">${badge}<h2>${l.title}</h2><p>${l.sub}</p>
        <div class="lmast"><div class="mbar big"><i id="lBar"></i></div><span id="lMast"></span></div></header>
      <div class="stages" id="stages">${stageIds.map(sid => {
        const s = STAGES.find(x => x[0] === sid); const lab = isMix && sid === 'collab' ? 'مسئله‌ی مشابه' : isMix ? 'مثال حل‌شده' : s[2];
        return `<button class="stg" data-s="${sid}"><span class="si">${s[1]}</span><span class="sl">${lab}</span><i class="sd">✓</i></button>`; }).join('')}</div>
      <div id="stageBody"></div>
      <div class="lesson-nav">
        ${prev ? `<a href="#/lesson/${prev.id}">→ ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="#/lesson/${next.id}">${next.title} ←</a>` : '<a href="#/assess/final">🏆 آزمون نهایی ←</a>'}
      </div>`;

    const body = $('stageBody'), panes = {};
    const refresh = () => {
      const s = stageOf(l.id), m = mastery(l);
      $('lBar').style.width = m + '%'; $('lBar').parentElement.className = 'mbar big ' + mcls(m);
      $('lMast').textContent = `تسلط در این درس: ${m}٪ · ${mword(m)}`;
      const done = { ex: s.ex, concept: s.concept, why: s.why, pre: s.pre !== undefined, collab: s.collab > 0, ladder: s.hard > 0, test: l.unit && assessBest('u' + l.unit.id) > 0 };
      view.querySelectorAll('.stg').forEach(b => { b.classList.toggle('on', b.dataset.s === curStage); b.classList.toggle('ok', !!done[b.dataset.s]); });
      const keep = curNavId; buildNav(); markActive(keep);
    };
    const nextBtn = (to, label) => `<div class="stage-next"><button class="btn" data-go="${to}">${label} ←</button></div>`;
    const nextOf = sid => { const i = stageIds.indexOf(sid); return stageIds[i + 1]; };
    const lblOf = sid => { const s = STAGES.find(x => x[0] === sid); return s ? s[1] + ' ' + s[2] : ''; };

    /* مرحله‌ی ۱: مثال حل‌شده */
    function buildEx(pane) {
      pane.innerHTML = `
        <section class="card problem"><h3>📌 مسئله‌ی نمونه</h3>${l.problem}
          <p class="try-note">🧠 چند لحظه فکر کن: خودت از کجا شروع می‌کردی؟ بعد حل را قدم‌به‌قدم ببین${p.predict ? '؛ قبل از بعضی گام‌ها از تو می‌پرسم «گام بعد چیست؟»' : ''}.</p></section>
        <div class="stepper-bar">
          <h3>🪜 حل گام‌به‌گام</h3>
          <button class="btn ghost" id="stReset">↺ از اول</button>
          <button class="btn ghost" id="stPrev">→ گام قبل</button>
          <button class="btn ghost" id="stAll">نمایش همه</button>
          <button class="btn" id="stNext">شروع ←</button>
        </div>
        <div class="dots" id="dots">${l.steps.map(() => '<i></i>').join('')}</div>
        <p class="kbd-hint">میان‌بر: کلید <kbd>←</kbd> گام بعد، کلید <kbd>→</kbd> گام قبل</p>
        <div id="steps" class="timeline">
          ${l.steps.map((s, i) => `<article class="step">
            <div class="num">${i + 1}</div><h4>${s.t}</h4>${s.h}
            ${s.tip ? `<div class="tip">💬 ${s.tip}</div>` : ''}
            ${l.why[i] ? `<details class="why"><summary>🤔 چرا این کار را می‌کنیم؟</summary><div>${l.why[i]}</div></details>` : ''}</article>`).join('')}
        </div>
        <section class="card answer" id="answerBox" style="display:none"><h3>✅ پاسخ نهایی</h3>${l.answer}</section>
        ${l.plot ? `<div id="plotBox" style="display:none">${l.plot()}</div>` : ''}
        <div id="after" style="display:none">
          ${l.checks.map(c => `<details class="check"><summary>${c.t}</summary>${c.h}</details>`).join('')}
          ${isMix ? extraCards() : ''}
          ${nextBtn(nextOf('ex'), 'مرحله‌ی بعد: ' + (isMix ? '🤝 مسئله‌ی مشابه برای خودت' : lblOf('concept')))}
        </div>`;
      rm(pane);
      stepper(pane);
    }
    function extraCards() {
      return `${l.summary.length ? `<section class="card summary"><h3>📋 خلاصه</h3><div class="sum-grid">${l.summary.map(s => `<div class="sum-chip">${s}</div>`).join('')}</div></section>` : ''}
        ${l.exam.length ? `<section class="card exam"><h3>🎓 نکته‌ی امتحانی</h3><ul>${liList(l.exam)}</ul></section>` : ''}
        ${l.methods.length ? `<section class="card methods"><h3>🔗 روش‌های به‌کار رفته</h3><div class="mlinks">${l.methods.map(m => byId[m] ? `<a href="#/lesson/${m}">درس ${byId[m].n}: ${byId[m].title}</a>` : '').join('')}</div></section>` : ''}
        ${l.pitfalls.length ? `<section class="card pitfall"><h3>⚠️ اشتباهات رایج</h3><ul>${liList(l.pitfalls)}</ul></section>` : ''}`;
    }
    function stepper(pane) {
      const steps = [...pane.querySelectorAll('.step')], dots = [...pane.querySelectorAll('#dots i')];
      const nextB = $('stNext'), prevB = $('stPrev'), ids = ['answerBox', 'plotBox', 'after'];
      const pred = p.predict || {};
      let k = 0, pending = false; const asked = {};
      const update = () => {
        steps.forEach((s, i) => s.classList.toggle('show', i < k));
        dots.forEach((d, i) => d.classList.toggle('on', i < k));
        nextB.disabled = k >= steps.length || pending; prevB.disabled = k <= 0 || pending;
        nextB.textContent = k === 0 ? 'شروع ←' : 'گام بعد ←';
        const fin = k >= steps.length;
        ids.forEach(x => { const e = $(x); if (e) e.style.display = fin ? 'block' : 'none'; });
        if (fin && !stageOf(l.id).ex) { E.setStage(l.id, 'ex', 1); refresh(); }
      };
      const go = d => {
        if (pending) return;
        if (d > 0 && k < steps.length && pred[k] && !asked[k]) {
          const at = k; pending = true; update();
          const blk = E.predictBlock(pred[at], () => {
            asked[at] = true; pending = false; blk.classList.add('answered');
            k = at + 1; update(); rm(steps[at]);
            steps[at].scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
          steps[at].parentNode.insertBefore(blk, steps[at]); rm(blk);
          blk.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        const nk = Math.max(0, Math.min(steps.length, k + d));
        if (nk === k) return; k = nk; update();
        const t = k > 0 ? steps[k - 1] : null;
        if (d > 0 && t) t.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      nextB.onclick = () => go(1); prevB.onclick = () => go(-1);
      $('stAll').onclick = () => { pending = false; pane.querySelectorAll('.predict:not(.answered)').forEach(b => b.remove()); Object.keys(pred).forEach(x => { asked[x] = true; }); k = steps.length; update(); };
      $('stReset').onclick = () => { if (pending) return; k = 0; update(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
      keyHandler = e => {
        if (curStage !== 'ex' || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(-1); }
      };
      document.addEventListener('keydown', keyHandler);
      update();
    }

    /* مرحله‌ی ۲: مفهوم و تعریف */
    function buildConcept(pane) {
      pane.innerHTML = `
        <section class="card intro"><h3>👀 از مثال به مفهوم</h3>
          <p>در مثال بالا ببین چه چیزی تکرار شد؛ همان «ایده»‌ی درس است. اول با زبان ساده، بعد با تعریف دقیق ریاضی.</p></section>
        <section class="card idea"><h3>💡 ایده‌ی اصلی</h3>${l.idea}</section>
        ${p.formal ? `<section class="card formal"><h3>📐 تعریف رسمی</h3>${p.formal}</section>` : ''}
        ${l.summary.length ? `<section class="card summary"><h3>📋 خلاصه‌ی درس</h3><div class="sum-grid">${l.summary.map(s => `<div class="sum-chip">${s}</div>`).join('')}</div></section>` : ''}
        ${nextBtn('why', 'مرحله‌ی بعد: ' + lblOf('why'))}`;
      rm(pane);
    }

    /* مرحله‌ی ۳: چرا؟ و مقایسه */
    function buildWhy(pane) {
      const whys = l.steps.map((s, i) => l.why[i] ? `<details class="why" open><summary>گام ${i + 1}: ${s.t}</summary><div>${l.why[i]}</div></details>` : '').join('');
      const cmp = p.compare ? `<section class="card compare"><h3>⚖️ مقایسه‌ی روش‌ها</h3>
        <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>روش</th><th>چگونه؟</th><th>مزیت</th><th>محدودیت</th></tr></thead>
        <tbody>${p.compare.rows.map((r, i) => `<tr><td><b>${r[0]}</b>${i === 0 ? '<span class="std">استاندارد</span>' : ''}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>
        <p class="advice">🧭 ${p.compare.advice}</p></section>` : '';
      pane.innerHTML = `
        ${whys ? `<section class="card whys"><h3>🤔 دلیل هر گام</h3><p class="muted">اگر گامی را «فقط انجام می‌دهی»، هنوز یاد نگرفته‌ای. ببین چرا کار می‌کند:</p>${whys}</section>` : ''}
        ${cmp}
        ${l.pitfalls.length ? `<section class="card pitfall"><h3>⚠️ اشتباهات رایج (قبل از تمرین بخوان)</h3><ul>${liList(l.pitfalls)}</ul></section>` : ''}
        ${l.exam.length ? `<section class="card exam"><h3>🎓 نکته‌ی امتحانی</h3><ul>${liList(l.exam)}</ul></section>` : ''}
        ${l.methods.length ? `<section class="card methods"><h3>🔗 روش‌های مرتبط</h3><div class="mlinks">${l.methods.map(m => byId[m] ? `<a href="#/lesson/${m}">درس ${byId[m].n}: ${byId[m].title}</a>` : '').join('')}</div></section>` : ''}
        ${nextBtn('pre', 'مرحله‌ی بعد: ' + lblOf('pre'))}`;
      rm(pane);
    }

    /* مرحله‌ی ۴: پیش‌نیاز */
    function buildPre(pane) {
      pane.innerHTML = `
        ${l.recall.length ? `<section class="card recall"><h3>🧠 یادآوری سریع</h3><ul>${liList(l.recall)}</ul></section>` : ''}
        <section class="card"><h3>🧱 چند سؤال کوتاه پیش‌نیاز</h3>
          <p class="muted">این سؤال‌ها نمره‌ی منفی ندارند؛ فقط نشان می‌دهند کجا باید قبل از حل مرور کنی.</p><div id="mcqBox"></div></section>
        <div id="preAfter"></div>`;
      E.mountMCQ($('mcqBox'), p.prereq || [], (c, n) => {
        E.setStage(l.id, 'pre', c / n, true); refresh();
        const links = (l.methods || []).filter(m => byId[m]);
        $('preAfter').innerHTML = (c < n && links.length ? `<section class="card methods"><h3>📚 اگر هنوز مطمئن نیستی، این درس‌ها را مرور کن</h3><div class="mlinks">${links.map(m => `<a href="#/lesson/${m}">درس ${byId[m].n}: ${byId[m].title}</a>`).join('')}</div></section>` : '') + nextBtn('collab', 'مرحله‌ی بعد: ' + lblOf('collab'));
        rm($('preAfter'));
      });
      rm(pane);
    }

    /* مرحله‌ی ۵: حل مشارکتی */
    function buildCollab(pane) {
      const s = stageOf(l.id);
      pane.innerHTML = `
        <section class="card coach"><h3>🤝 حالا نوبت توست</h3>
          <p>این مسئله شبیه مثال است. من فقط یک سؤال در هر مرحله می‌پرسم و تو جواب می‌دهی. اگر اشتباه شد، اول یک راهنمایی کوچک می‌دهم تا خودت اشتباه را پیدا کنی؛ «نشانم بده» آخرین راه است.
          ${s.collab ? `<br><b>✔ قبلاً این مرحله را کامل کرده‌ای؛ برای تثبیت می‌توانی دوباره حل کنی.</b>` : ''}</p></section>
        <div id="collabBox"></div><div id="collabAfter"></div>`;
      E.mountChallenge($('collabBox'), p.collab, r => {
        const first = !stageOf(l.id).collab;
        E.setStage(l.id, 'collab', r.value, true); ensureCard(l.id); refresh();
        if (first) { toast('آفرین! حل مشارکتی ثبت شد.'); if (r.quality !== 'assisted') confetti(); }
        const nx = isMix
          ? (next ? `<div class="stage-next"><a class="btn" href="#/lesson/${next.id}">${next.title} ←</a></div>` : '')
          : nextBtn('ladder', 'مرحله‌ی بعد: ' + lblOf('ladder'));
        $('collabAfter').innerHTML = nx;
        if (isMix) $('collabAfter').insertAdjacentHTML('afterbegin', extraCards());
        rm($('collabAfter'));
      });
    }

    /* مرحله‌ی ۶: پلکان */
    function buildLadder(pane) {
      const s = stageOf(l.id);
      pane.innerHTML = `
        <div id="ladLock"></div>
        <div id="ladBody" style="display:none">
          <div class="ladder-h"><span class="lv-chip mid">سطح ۲ · متوسط</span><span class="muted">یک ایده‌ی تازه نسبت به مسئله‌ی قبل؛ بدون توضیح اضافه.</span></div>
          <div id="midBox"></div>
          <div id="hardWrap" style="display:none">
            <div class="ladder-h"><span class="lv-chip hard">سطح ۳ · دشوار</span><span class="muted">باید دو ایده را با هم ترکیب کنی.</span></div>
            <div id="hardBox"></div>
          </div>
          <div id="ladAfter"></div>
        </div>`;
      const startLadder = () => {
        $('ladLock').innerHTML = ''; $('ladBody').style.display = 'block';
        E.mountChallenge($('midBox'), p.ladder.mid, r => {
          E.setStage(l.id, 'mid', r.value, true); refresh();
          $('hardWrap').style.display = 'block';
          E.mountChallenge($('hardBox'), p.ladder.hard, r2 => {
            E.setStage(l.id, 'hard', r2.value, true); refresh();
            const m = mastery(l);
            $('ladAfter').innerHTML = `<div class="chal-done ${m >= 80 ? 'solid' : 'ok'}"><b>${m >= 80 ? '🏆 در این درس به سطح «مسلط» رسیدی!' : '👍 تمرین‌ها تمام شد؛ برای تسلط کامل، «حل مشارکتی» را بدون نشان‌دادن پاسخ انجام بده.'}</b><span>تسلط فعلی: ${m}٪</span></div>` + nextBtn('test', 'مرحله‌ی بعد: ' + lblOf('test'));
            if (m >= 80) confetti();
          });
        });
      };
      if (!s.collab) {
        $('ladLock').innerHTML = `<section class="card lock"><h3>🔒 پیشنهاد: اول «حل مشارکتی»</h3>
          <p>تمرین پلکانی مسئله‌های متفاوت و بدون همراهی زیاد است. بهتر است ابتدا مرحله‌ی قبل را انجام دهی؛ ولی تصمیم با خودت است.</p>
          <button class="btn ghost" data-go="collab">برو به حل مشارکتی</button> <button class="btn" id="ladGo">با این حال شروع می‌کنم</button></section>`;
        $('ladGo').onclick = startLadder;
      } else startLadder();
    }

    /* مرحله‌ی ۷: ارزیابی */
    function buildTest(pane) {
      const u = l.unit, k = u ? 'u' + u.id : null;
      pane.innerHTML = `
        <section class="card assess-intro"><h3>🏁 ارزیابی واقعی</h3>
          <p>یادگیری یعنی بتوانی مسئله‌ی <b>تازه</b> را <b>بدون راهنمایی</b> حل کنی. آزمون واحد ${u ? u.id : ''} فقط سؤال‌های جدید دارد و پاسخ‌ها تا پایان نشان داده نمی‌شوند.</p>
          <p>بهترین نتیجه‌ی تو: <b>${k && assessBest(k) ? assessBest(k) + '٪' : 'هنوز شرکت نکرده‌ای'}</b></p>
          <div class="hero-btns"><a class="btn" href="#/assess/${k}">📝 آزمون ${u ? u.title : ''} ←</a>
          <a class="btn ghost" href="#/review">🔁 مرور فاصله‌دار</a></div></section>
        <section class="card"><h3>📆 برای ماندگاری</h3><p>کارت مرور این درس به‌طور خودکار ساخته شد؛ فردا یک مسئله‌ی مشابه از آن برایت می‌آید تا چیزی فراموش نشود. ${E.state.srs['l:' + l.id] ? '' : '(بعد از «حل مشارکتی» ساخته می‌شود.)'}</p></section>`;
    }

    const builders = { ex: buildEx, concept: buildConcept, why: buildWhy, pre: buildPre, collab: buildCollab, ladder: buildLadder, test: buildTest };
    function show(sid) {
      if (!stageIds.includes(sid)) return;
      curStage = sid;
      if (!panes[sid]) { const d = document.createElement('div'); d.className = 'pane'; body.appendChild(d); panes[sid] = d; builders[sid](d); }
      Object.keys(panes).forEach(x => { panes[x].style.display = x === sid ? 'block' : 'none'; });
      if (sid === 'concept' && !stageOf(l.id).concept) E.setStage(l.id, 'concept', 1);
      if (sid === 'why' && !stageOf(l.id).why) E.setStage(l.id, 'why', 1);
      refresh();
      const bar = $('stages'); if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('stages').addEventListener('click', e => { const b = e.target.closest('.stg'); if (b) show(b.dataset.s); });
    body.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) show(b.dataset.go); });

    // مرحله‌ی شروع: اگر مثال دیده شده، از مرحله‌ی بعدی ادامه بده
    const s0 = stageOf(l.id);
    const order = isMix ? [['collab', s0.collab]] : [['concept', s0.concept], ['pre', s0.pre !== undefined], ['collab', s0.collab], ['ladder', s0.hard]];
    const start = !s0.ex ? 'ex' : (order.find(o => !o[1]) || ['ex'])[0];
    rm($('stages'));
    show(start);
    rm(view.querySelector('.lesson-head'));
  }

  /* ───── فرمول‌نامه ───── */
  function formulasPage() {
    view.innerHTML = `
      <header class="lesson-head"><span class="badge">مرور</span><h2>📒 فرمول‌نامه</h2>
        <p>همه‌ی فرمول‌های مهم در یک صفحه؛ برای مرور سریع. (هر فرمول در درس‌ها با دلیلش آمده است.)</p>
        <div class="chips"><button class="btn ghost" id="printBtn">🖨️ چاپ / ذخیره PDF</button></div></header>
      ${window.FORMULAS.map(g => `<section class="fgroup"><h3>${g.group}</h3>
        <div class="fgrid">${g.items.map(it => `<div class="fcard"><h4>${it.t}</h4>
          <div class="fmath">$$${it.f}$$</div>${it.n ? `<p>${it.n}</p>` : ''}</div>`).join('')}</div></section>`).join('')}`;
    rm(view);
    $('printBtn').onclick = () => window.print();
  }

  /* ───── ارزیابی ───── */
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const phOf = q => q.ph || (q.type === 'set' ? 'جواب‌ها را با کاما جدا کن' : q.type === 'prop' || q.type === 'list' ? 'اعداد را با کاما جدا کن' : 'پاسخ');
  function assessPage(id) {
    let qs, title;
    if (id === 'final') { title = '🏆 آزمون نهایی'; qs = ['u1', 'u2', 'u3'].flatMap(u => shuffle(AS[u].qs).slice(0, 2)); }
    else if (AS[id]) { title = '📝 آزمون ' + AS[id].title; qs = AS[id].qs; }
    else return home();
    const draw = () => {
      view.innerHTML = `
        <header class="lesson-head"><span class="badge">ارزیابی واقعی</span><h2>${title}</h2>
          <p>${qs.length} سؤال تازه. <b>بدون راهنمایی</b>؛ پاسخ و راه‌حل بعد از «تحویل» نمایش داده می‌شود. اگر پاسخ را نمی‌دانی خالی بگذار؛ حدس زدن هم اشکال ندارد.</p>
          <div class="chips"><span class="chip">🏆 بهترین: ${assessBest(id) ? assessBest(id) + '٪' : '—'}</span><span class="chip">قبولی ≥ ۸۰٪</span></div></header>
        <div id="aq">${qs.map((q, i) => `<section class="card aqcard" data-i="${i}" data-qid="${q.id}"><h3>سؤال ${i + 1}</h3><p>${q.q}</p>
          <input class="cp-input" dir="ltr" placeholder="${esc(phOf(q))}" autocomplete="off"><div class="aq-res"></div></section>`).join('')}</div>
        <div class="stage-next"><button class="btn" id="aSubmit">تحویل و دیدن نتیجه ✓</button></div>
        <div id="aResult"></div>`;
      rm(view);
      $('aSubmit').onclick = () => {
        const cards = [...view.querySelectorAll('.aqcard')]; let ok = 0; const weak = [];
        cards.forEach((c, i) => {
          const q = qs[i], inp = c.querySelector('input'); const val = inp.value;
          const res = E.check(q, val); inp.disabled = true;
          if (res.ok) ok++; else weak.push(q.lesson);
          E.srsUpdate('q:' + q.id, res.ok);
          c.classList.add(res.ok ? 'good' : 'bad');
          c.querySelector('.aq-res').innerHTML = `<div class="msg ${res.ok ? 'ok' : 'bad'}">${res.ok ? '✅ درست' : (val.trim() ? '❌ نادرست' : '⬜ بدون پاسخ')}${!res.ok && val.trim() ? ` — پاسخ تو: <bdi dir="ltr">${esc(val)}</bdi>` : ''}</div>
            <details class="check" ${res.ok ? '' : 'open'}><summary>راه‌حل</summary>${q.sol}${res.ok ? '' : `<p><a href="#/lesson/${q.lesson}">📚 مرور درس «${byId[q.lesson].title}» ←</a></p>`}</details>`;
          rm(c);
        });
        const pct = Math.round(ok / qs.length * 100);
        const cur = E.state.assess[id] || {};
        E.state.assess[id] = { best: Math.max(cur.best || 0, pct), last: pct, weak: [...new Set(weak)], n: (cur.n || 0) + 1 }; E.save();
        const uniqWeak = [...new Set(weak)];
        $('aResult').innerHTML = `<section class="card result"><h3>🏁 نتیجه: ${ok} از ${qs.length} (${pct}٪)</h3>
          <p>${pct >= 80 ? 'عالی! سؤال‌های تازه را مستقل حل کردی؛ این یعنی یادگیری واقعی. 🌟' : pct >= 60 ? 'نزدیک شدی. اشتباه‌ها را در راه‌حل‌ها ببین و درس‌های زیر را مرور کن.' : 'مشکلی نیست؛ این آزمون نشان داد دقیقاً کجا مرور لازم است. درس‌های زیر را با مثال و حل مشارکتی دوباره بگذران.'}</p>
          ${uniqWeak.length ? `<div class="mlinks">${uniqWeak.map(w => `<a href="#/lesson/${w}">📚 ${byId[w].title}</a>`).join('')}</div>` : ''}
          <div class="hero-btns"><button class="btn" id="aAgain">↺ ${id === 'final' ? 'آزمون نهایی با سؤال‌های جدید' : 'دوباره'}</button><a class="btn ghost" href="#/review">🔁 مرور فاصله‌دار</a></div></section>`;
        rm($('aResult'));
        $('aSubmit').disabled = true;
        $('aAgain').onclick = () => { if (id === 'final') qs = ['u1', 'u2', 'u3'].flatMap(u => shuffle(AS[u].qs).slice(0, 2)); draw(); window.scrollTo(0, 0); };
        if (pct >= 80) confetti();
        buildNav(); markActive(curNavId);
        $('aResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
    };
    draw();
  }

  /* ───── مرور فاصله‌دار (لایتنر) ───── */
  function reviewPage() {
    const all = E.state.srs, keys = Object.keys(all);
    const boxes = E.DAYS.map((d, i) => ({ d, n: keys.filter(k => all[k].box === i).length }));
    const dueNow = () => E.srsDue();
    view.innerHTML = `
      <header class="lesson-head"><span class="badge">مرور</span><h2>🔁 مرور فاصله‌دار</h2>
        <p>مغز چیزی را که به‌موقع دوباره به یادش بیاوری، برای مدت طولانی نگه می‌دارد. اگر درست جواب بدهی کارت به جعبه‌ی بعدی می‌رود و دیرتر برمی‌گردد؛ اگر نه، فردا دوباره می‌بینی.</p></header>
      <div class="leitner">${boxes.map((b, i) => `<div class="lbox"><b>${b.n}</b><span>جعبه ${i + 1}</span><small>${b.d < 1 ? '۱۲ ساعت' : b.d + ' روز'}</small></div>`).join('')}</div>
      <div id="rvBody"></div>`;
    const bodyEl = $('rvBody'); let count = 0;
    function nextCard() {
      const due = dueNow();
      if (!due.length) {
        const upcoming = keys.map(k => all[k].due).filter(t => t > Date.now()).sort((a, b) => a - b)[0];
        bodyEl.innerHTML = `<section class="card result"><h3>${count ? '🎉 مرور امروز تمام شد!' : keys.length ? '😌 فعلاً کارتی موعدرسیده نیست' : '📭 هنوز کارتی ندارم'}</h3>
          <p>${keys.length ? (upcoming ? 'کارت بعدی حدود ' + Math.max(1, Math.round((upcoming - Date.now()) / 3600000)) + ' ساعت دیگر آماده می‌شود.' : '') : 'بعد از انجام «حل مشارکتی» در هر درس یا شرکت در آزمون‌ها، کارت مرور ساخته می‌شود.'}</p>
          <a class="btn" href="${suggest().href}">${suggest().label} ←</a></section>`;
        rm(bodyEl); if (count) confetti(); buildNav(); markActive(curNavId); return;
      }
      const key = due[0], [type, rid] = [key.slice(0, 1), key.slice(2)];
      bodyEl.innerHTML = `<div class="rv-head">کارت ${count + 1} · ${due.length} کارت مانده</div><div id="rvCard"></div><div id="rvNext"></div>`;
      const card = $('rvCard'), nxt = $('rvNext');
      const finish = ok => {
        E.srsUpdate(key, ok); count++;
        nxt.innerHTML = `<div class="stage-next"><button class="btn" id="rvGo">${dueNow().length ? 'کارت بعد ←' : 'پایان مرور ←'}</button></div>`;
        $('rvGo').onclick = nextCard; nxt.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      if (type === 'l' && byId[rid] && PR[rid]) {
        const l = byId[rid], p = PR[rid], seen = all[key].seen || 0;
        const variants = [p.ladder && p.ladder.mid, p.ladder && p.ladder.hard, p.collab].filter(Boolean);
        const ch = variants[seen % variants.length] || p.collab;
        card.innerHTML = `<section class="card coach"><h3>🔁 مرور: ${l.title}</h3><p>یک مسئله‌ی مشابه؛ خودت حل کن. اگر مجبور شدی پاسخ را ببینی، کارت فردا برمی‌گردد.</p></section><div id="rvCh"></div>`;
        rm(card);
        E.mountChallenge($('rvCh'), ch, r => finish(r.quality !== 'assisted'));
      } else if (type === 'q' && qById[rid]) {
        const q = qById[rid];
        card.innerHTML = `<section class="card aqcard"><h3>🔁 مرور (بدون راهنمایی)</h3><p>${q.q}</p>
          <input class="cp-input" dir="ltr" placeholder="${esc(phOf(q))}" autocomplete="off"> <button class="btn" id="rvChk">بررسی ✓</button><div class="aq-res"></div></section>`;
        rm(card);
        $('rvChk').onclick = () => {
          const inp = card.querySelector('input'); const res = E.check(q, inp.value);
          if (res.empty) return; inp.disabled = true; $('rvChk').disabled = true;
          card.querySelector('.aq-res').innerHTML = `<div class="msg ${res.ok ? 'ok' : 'bad'}">${res.ok ? '✅ درست!' : '❌ این بار نشد؛ کارت فردا دوباره می‌آید.'}</div><details class="check" ${res.ok ? '' : 'open'}><summary>راه‌حل</summary>${q.sol}</details>`;
          rm(card); finish(res.ok);
        };
      } else { delete E.state.srs[key]; E.save(); nextCard(); }
    }
    nextCard();
  }

  /* ───── ابزارها ───── */
  function toolsPage() {
    view.innerHTML = `
      <header class="lesson-head"><span class="badge">ابزار</span><h2>🧰 ابزارهای تعاملی</h2>
      <p>با مثال‌های خودتان تمرین کنید و جواب‌هایتان را بسنجید.</p></header>
      <div id="t3"></div>
      <div class="tool-grid"><div id="t1"></div><div id="t2"></div><div id="t4"></div></div>`;
    Tools.explorer($('t3')); Tools.builder($('t1')); Tools.analyzer($('t2')); Tools.biquad($('t4'));
    rm(view);
  }

  /* ───── مسیریابی ───── */
  function route() {
    const h = location.hash || '#/';
    let id = 'home', m;
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    curStage = 'ex';
    if ((m = h.match(/^#\/lesson\/(.+)$/))) { id = decodeURIComponent(m[1]); curNavId = id; lessonPage(id); }
    else if ((m = h.match(/^#\/assess\/(.+)$/))) { id = 'assess-' + m[1]; curNavId = id; assessPage(m[1]); }
    else if (h === '#/review') { id = 'review'; curNavId = id; reviewPage(); }
    else if (h === '#/tools') { id = 'tools'; curNavId = id; toolsPage(); }
    else if (h === '#/formulas') { id = 'formulas'; curNavId = id; formulasPage(); }
    else { curNavId = 'home'; home(); }
    buildNav(); markActive(curNavId);
    sidebar.classList.remove('open');
    window.scrollTo(0, 0);
  }

  /* ───── راه‌اندازی ───── */
  $('menuToggle').onclick = () => sidebar.classList.toggle('open');
  $('navSearch').addEventListener('input', filterNav);
  const saved = (() => { try { return localStorage.getItem('quad-theme'); } catch (e) { return null; } })();
  if (saved) document.documentElement.dataset.theme = saved;
  $('themeBtn').onclick = () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('quad-theme', t); } catch (e) { /* ignore */ }
  };
  const topProg = $('topProg'), toTop = $('toTop');
  window.addEventListener('scroll', () => {
    const h = document.documentElement; const max = h.scrollHeight - h.clientHeight;
    topProg.style.width = (max > 0 ? h.scrollTop / max * 100 : 0) + '%';
    toTop.classList.toggle('show', h.scrollTop > 500);
  }, { passive: true });
  toTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  window.addEventListener('hashchange', route);
  route();
})();
