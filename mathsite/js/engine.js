/* ==========================================================
   موتور یادگیری:
   - ذخیره‌ی وضعیت (پیشرفت، تسلط، مرور فاصله‌دار)
   - بررسی پاسخ‌های تایپی (عدد، کسر، مجموعه، ضرایب متناسب، رادیکال)
   - مسئله‌های مشارکتی با راهنمایی تدریجی و تحلیل اشتباه
   - پیش‌نیازسنجی، پیش‌بینی گام بعد
   ========================================================== */
window.Engine = (function () {
  const KEY = 'quad-v3';
  let state = null;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
  state = state || {};
  state.stages = state.stages || {}; state.srs = state.srs || {}; state.assess = state.assess || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* حافظه‌ی موقت */ } };

  const QUALITY = { solid: 1, ok: 0.75, assisted: 0.4 };

  /* ───── پیشرفت و تسلط ───── */
  function stage(id) { return (state.stages[id] = state.stages[id] || {}); }
  function setStage(id, key, val, keepMax) {
    const s = stage(id);
    s[key] = keepMax && typeof s[key] === 'number' ? Math.max(s[key], val) : val;
    save();
  }
  function mastery(l) {
    const s = state.stages[l.id] || {};
    let m = 0;
    if (l.group === 'mix') m = (s.ex ? 30 : 0) + 70 * (s.collab || 0);
    else m = (s.ex ? 20 : 0) + 10 * (s.pre || 0) + 25 * (s.collab || 0) + 20 * (s.mid || 0) + 25 * (s.hard || 0);
    return Math.round(m);
  }

  /* ───── مرور فاصله‌ای ───── */
  const DAYS = [0.5, 1, 3, 7, 14, 30];
  function srsUpdate(qid, ok) {
    const e = state.srs[qid] || { box: 0 };
    e.box = ok ? Math.min(e.box + 1, DAYS.length - 1) : 0;
    e.due = Date.now() + DAYS[e.box] * 86400000;
    e.seen = (e.seen || 0) + 1;
    state.srs[qid] = e; save();
  }
  const srsDue = () => Object.keys(state.srs).filter(k => state.srs[k].due <= Date.now());

  /* ───── نرمال‌سازی و بررسی پاسخ ───── */
  const FA = '۰۱۲۳۴۵۶۷۸۹', AR = '٠١٢٣٤٥٦٧٨٩';
  function norm(s) {
    return String(s).trim().toLowerCase()
      .replace(/[۰-۹]/g, c => FA.indexOf(c)).replace(/[٠-٩]/g, c => AR.indexOf(c))
      .replace(/[−–—]/g, '-').replace(/٫/g, '.').replace(/[×·]/g, '*')
      .replace(/√\s*\(?\s*(\d+)\s*\)?/g, 'sqrt$1').replace(/sqrt\s*\(\s*(\d+)\s*\)/g, 'sqrt$1')
      .replace(/\s+/g, ' ');
  }
  function canon(tok) {
    tok = norm(tok).replace(/\s+/g, '').replace(/^\+/, '');
    const f = Tools.parse(tok);
    if (f) return f.n + '/' + f.d;
    const m = tok.match(/^([+-]?)(\d*)\*?sqrt(\d+)$/);
    if (m) { const k = m[2] || '1'; return (m[1] === '-' ? '-' : '') + (k === '1' ? '' : k) + 'sqrt' + m[3]; }
    return tok;
  }
  function tokens(s, expandPM) {
    s = norm(s).replace(/(^|[\s,;،؛])[a-z]\d?\s*=\s*/g, '$1');
    const parts = s.split(/\s*(?:,|،|;|؛|\bor\b|یا|و)\s*|\s+/).filter(Boolean);
    const out = [];
    parts.forEach(p => {
      const m = p.match(/^(?:±|\+-)(.+)$/);
      if (m && expandPM) { out.push(canon(m[1]), canon('-' + m[1])); } else out.push(canon(p));
    });
    return out;
  }
  const uniq = a => [...new Set(a)].sort();
  function keyOf(type, v) {
    if (type === 'num') { const t = tokens(String(v), false); return t.length === 1 ? t[0] : canon(String(v)); }
    if (type === 'set') return uniq(tokens(Array.isArray(v) ? v.join(',') : v, true)).join('|');
    if (type === 'list' || type === 'prop') return tokens(Array.isArray(v) ? v.join(',') : v, false).join('|');
    if (type === 'str') return norm(v).replace(/\s+/g, '');
    return String(v);
  }
  function check(cp, input) {
    const t = cp.type;
    if (t === 'choice') return { ok: +input === cp.ans, key: String(input) };
    if (input === undefined || String(input).trim() === '') return { ok: false, empty: true };
    const key = keyOf(t, input);
    if (t === 'num') {
      if ([].concat(cp.ans).some(a => keyOf('num', a) === key)) return { ok: true, key };
      if (cp.tol !== undefined) {
        const f = Tools.parse(norm(input).replace(/\s+/g, ''));
        if (f && Math.abs(f.n / f.d - cp.val) <= cp.tol) return { ok: true, key };
      }
      return { ok: false, key };
    }
    if (t === 'set') return { ok: key === keyOf('set', cp.ans), key };
    if (t === 'list') return { ok: key === keyOf('list', cp.ans), key };
    if (t === 'str') return { ok: [].concat(cp.ans).some(a => keyOf('str', a) === key) || (cp.tol !== undefined && (() => { const f = Tools.parse(norm(input).replace(/\s+/g, '')); return f && Math.abs(f.n / f.d - cp.val) <= cp.tol; })()), key };
    if (t === 'prop') {
      const u = tokens(input, false).map(x => Tools.parse(x)), a = cp.ans.map(x => Tools.parse(String(x)));
      if (u.length !== a.length || u.some(x => !x)) return { ok: false, key };
      if (cp.int && u.some(x => x.d !== 1)) return { ok: false, key, note: 'int' };
      const i = a.findIndex(x => x.n !== 0);
      if (u[i].n === 0) return { ok: false, key };
      // نسبت r = u_i / a_i ، باید u_j = r * a_j
      const r = { n: u[i].n * a[i].d, d: u[i].d * a[i].n };
      const ok = a.every((aj, j) => u[j].n * r.d * aj.d === r.n * aj.n * u[j].d);
      return { ok, key };
    }
    return { ok: false, key };
  }
  function findTrap(cp, res) {
    if (!cp.traps) return null;
    return cp.traps.find(tr => (cp.type === 'choice' ? tr.a === +res.key : keyOf(cp.type, tr.a) === res.key)) || null;
  }

  /* ───── مسئله‌ی مشارکتی با راهنمایی تدریجی ───── */
  const HLAB = ['🔎 جای احتمالی اشتباه', '💡 راهنمایی کوچک', '🧭 راهنمایی بزرگ‌تر'];
  function mountChallenge(root, ch, done) {
    root.classList.add('chal');
    root.innerHTML = `<div class="chal-q">${ch.q}</div><div class="cps"></div><div class="chal-end"></div>`;
    const cpsEl = root.querySelector('.cps'), endEl = root.querySelector('.chal-end');
    const stats = { wrong: 0, hints: 0, reveals: 0 };
    const rm = el => window.renderMath && window.renderMath(el);
    rm(root);

    function open(i) {
      const cp = ch.cps[i];
      const el = document.createElement('div'); el.className = 'cp';
      const ph = cp.ph || (cp.type === 'set' ? 'جواب‌ها را با کاما جدا کن، مثل: 1, -2' : cp.type === 'prop' || cp.type === 'list' ? 'اعداد را با کاما جدا کن، مثل: 1, -2, 3' : 'پاسخ خود را بنویس');
      el.innerHTML = `
        <div class="cp-head"><span class="cp-n">${i + 1}</span><div class="cp-ask">${cp.ask}</div></div>
        <div class="cp-in">${cp.type === 'choice'
          ? `<div class="cp-opts">${cp.opts.map((o, j) => `<button class="opt" data-j="${j}"><span class="oi">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div>`
          : `<input class="cp-input" dir="ltr" placeholder="${ph}" autocomplete="off"><button class="btn cp-check">بررسی ✓</button>`}</div>
        <div class="cp-tools"><button class="btn ghost cp-hint">💡 راهنمایی</button><button class="btn ghost cp-show">🏳️ نشانم بده</button></div>
        <div class="cp-fb"></div>`;
      cpsEl.appendChild(el); rm(el);
      const fb = el.querySelector('.cp-fb'), input = el.querySelector('.cp-input');
      const hints = cp.hints || [];
      let shown = 0, wrongHere = 0, finished = false;
      const msg = (kind, html) => { const d = document.createElement('div'); d.className = 'msg ' + kind; d.innerHTML = html; fb.appendChild(d); rm(d); };
      const lock = () => {
        finished = true;
        el.querySelectorAll('input,button').forEach(b => { b.disabled = true; });
        el.classList.add('closed');
      };
      const next = () => { if (i + 1 < ch.cps.length) open(i + 1); else finish(); };
      const hint = auto => {
        if (finished) return;
        if (shown < hints.length) { msg('hint', `<b>${HLAB[Math.min(shown, 2)]}:</b> ${hints[shown]}`); shown++; stats.hints++; }
        else if (!auto) msg('note', 'راهنمای بیشتری ندارم. اگر گیر کرده‌ای «نشانم بده» را بزن تا با هم دلیل را بررسی کنیم.');
        else msg('note', 'اگر هنوز گیر کرده‌ای، «نشانم بده» را بزن تا دلیل را کامل با هم ببینیم.');
      };
      const submit = val => {
        if (finished) return;
        const res = check(cp, val);
        if (res.empty) { msg('note', 'اول پاسخت را بنویس.'); return; }
        if (res.ok) {
          msg('ok', '✅ <b>درست!</b> ' + (cp.ok || ''));
          if (wrongHere) msg('note', `🧠 با ${wrongHere} بار تلاش خودت اشتباه را پیدا کردی؛ همین مهم است.`);
          lock(); next(); return;
        }
        stats.wrong++; wrongHere++;
        const trap = findTrap(cp, res);
        msg('bad', '❌ هنوز درست نیست.');
        if (res.note === 'int') msg('trap', '🎯 ضرایب معادله باید <b>عدد صحیح</b> باشند؛ مخرج‌ها را حذف کن.');
        else if (trap) { msg('trap', '🎯 ' + trap.h); if (shown < 1) { shown = 1; stats.hints++; } }
        else hint(true);
      };
      if (cp.type === 'choice') {
        el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          if (finished) return; const j = +b.dataset.j;
          if (check(cp, j).ok) { b.classList.add('right'); submit(j); }
          else { b.classList.add('wrong'); b.disabled = true; submit(j); }
        });
      } else {
        el.querySelector('.cp-check').onclick = () => submit(input.value);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(input.value); });
        setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { /* */ } }, 50);
      }
      el.querySelector('.cp-hint').onclick = () => hint(false);
      el.querySelector('.cp-show').onclick = () => {
        if (finished) return;
        stats.reveals++;
        msg('explain', '📖 <b>بیا با هم بررسی کنیم:</b> ' + (cp.explain || '') + (cp.show ? `<div class="ans-line">پاسخ: ${cp.show}</div>` : ''));
        if (cp.type === 'choice') el.querySelectorAll('.opt')[cp.ans].classList.add('right');
        lock(); next();
      };
    }

    function finish() {
      const q = stats.reveals ? 'assisted' : (stats.wrong <= 1 && stats.hints === 0 ? 'solid' : 'ok');
      const txt = { solid: '🌟 عالی! تقریباً بدون راهنمایی و مستقل حل کردی.', ok: '👍 خوب! بدون دیدن پاسخ و با کمی راهنمایی حل کردی.', assisted: '🔁 این مسئله را با کمک دیدن توضیح تمام کردی؛ بعداً دوباره و مستقل امتحانش کن.' }[q];
      endEl.innerHTML = `<div class="chal-done ${q}"><b>${txt}</b><span>اشتباه: ${stats.wrong} · راهنمایی: ${stats.hints} · نمایش پاسخ: ${stats.reveals}</span></div>`;
      if (done) done({ quality: q, value: QUALITY[q], ...stats });
    }
    open(0);
  }

  /* ───── سؤال‌های پیش‌نیاز (چندگزینه‌ای با مرور هدفمند) ───── */
  function mountMCQ(root, items, done) {
    const rm = el => window.renderMath && window.renderMath(el);
    root.innerHTML = items.map((it, i) => `
      <div class="mcq" data-i="${i}"><div class="mcq-q"><b>${i + 1}.</b> ${it.q}</div>
        <div class="opts">${it.o.map((o, j) => `<button class="opt" data-j="${j}"><span class="oi">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div>
        <div class="mcq-fb"></div></div>`).join('') + '<div class="mcq-sum"></div>';
    rm(root);
    let answered = 0, correct = 0;
    root.querySelectorAll('.mcq').forEach(card => {
      const it = items[+card.dataset.i];
      card.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        if (card.dataset.done) return;
        const j = +b.dataset.j; card.dataset.done = 1; answered++;
        card.querySelectorAll('.opt').forEach((x, xj) => { x.disabled = true; if (xj === it.a) x.classList.add('right'); else if (xj === j) x.classList.add('wrong'); });
        const fb = card.querySelector('.mcq-fb');
        if (j === it.a) { correct++; fb.innerHTML = '✅ درست! ' + (it.ok || ''); fb.className = 'mcq-fb good'; }
        else {
          fb.className = 'mcq-fb bad';
          fb.innerHTML = `❌ اشکالی ندارد؛ بیا همین پیش‌نیاز را مرور کنیم:<div class="review">📚 ${it.review}${it.link ? ` <a href="#/lesson/${it.link}">← مرور مفصل</a>` : ''}</div>`;
        }
        rm(fb);
        if (answered === items.length) {
          const sum = root.querySelector('.mcq-sum');
          sum.innerHTML = correct === items.length
            ? '<div class="chal-done solid"><b>🌟 پیش‌نیازها آماده‌اند! برو سراغ مرحله‌ی «حل مشارکتی».</b></div>'
            : `<div class="chal-done ok"><b>${correct} از ${items.length} درست. مرورهای بالا را بخوان و بعد ادامه بده؛ پیش‌نیاز ضعیف، حل را سخت می‌کند.</b></div>`;
          if (done) done(correct, items.length);
        }
      });
    });
  }

  /* ───── پیش‌بینی گام بعد ───── */
  function predictBlock(p, resolve) {
    const d = document.createElement('div'); d.className = 'predict';
    d.innerHTML = `<div class="pd-h">🤔 قبل از دیدن گام بعد، حدس بزن</div><div class="pd-q">${p.q}</div>
      <div class="opts">${p.o.map((o, j) => `<button class="opt" data-j="${j}"><span class="oi">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div>
      <div class="pd-fb"></div><button class="btn ghost pd-skip">رد کردن و نمایش گام</button>`;
    let done = false;
    d.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (done) return; done = true; const j = +b.dataset.j;
      d.querySelectorAll('.opt').forEach((x, xj) => { x.disabled = true; if (xj === p.a) x.classList.add('right'); else if (xj === j) x.classList.add('wrong'); });
      const fb = d.querySelector('.pd-fb');
      fb.innerHTML = j === p.a ? '🎯 حدس درست! حالا ببین چرا:' : '🙂 مشکلی نیست؛ ببین چرا این جواب درست است:';
      d.querySelector('.pd-skip').remove(); resolve(j === p.a);
    });
    d.querySelector('.pd-skip').onclick = () => { if (done) return; done = true; resolve(null); };
    return d;
  }

  return { state, save, stage, setStage, mastery, srsUpdate, srsDue, check, mountChallenge, mountMCQ, predictBlock, QUALITY, DAYS };
})();
