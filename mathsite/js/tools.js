/* ==========================================================
   ابزارها: کسرها، رسم نمودار SVG، و دو ماشین‌حساب تعاملی
   ========================================================== */
window.Tools = (function () {

  /* ───── کسرها (محاسبه‌ی دقیق) ───── */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const add = (x, y) => F(x.n * y.d + y.n * x.d, x.d * y.d);
  const mul = (x, y) => F(x.n * y.n, x.d * y.d);
  const neg = x => F(-x.n, x.d);
  const sub = (x, y) => add(x, neg(y));
  const div = (x, y) => F(x.n * y.d, x.d * y.n);
  const val = x => x.n / x.d;

  function dec(s) { // "0.03" -> 3/100
    const [i, f = ''] = s.split('.');
    return F(parseInt(i + f, 10), Math.pow(10, f.length));
  }
  function parse(str) {
    const fa = '۰۱۲۳۴۵۶۷۸۹';
    const s = String(str).trim()
      .replace(/[۰-۹]/g, c => fa.indexOf(c))
      .replace(/[−–]/g, '-').replace(/[٫,]/g, '.').replace(/\s+/g, '');
    let m = s.match(/^(-?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (m) {
      const den = dec(m[3]); if (den.n === 0) return null;
      const r = div(dec(m[2]), den); return m[1] ? neg(r) : r;
    }
    m = s.match(/^(-?)(\d+(?:\.\d+)?)$/);
    if (m) { const r = dec(m[2]); return m[1] ? neg(r) : r; }
    return null;
  }
  const tex = x => x.d === 1 ? String(x.n)
    : (x.n < 0 ? '-' : '') + '\\frac{' + Math.abs(x.n) + '}{' + x.d + '}';
  const texP = x => (x.n < 0 || x.d !== 1) ? '\\left(' + tex(x) + '\\right)' : tex(x);

  function polyTex(a, b, c) {
    const parts = [[a, 'x^2'], [b, 'x'], [c, '']];
    let s = '';
    parts.forEach(([k, v]) => {
      if (k === 0) return;
      const abs = Math.abs(k);
      const body = (abs === 1 && v) ? v : String(abs) + v;
      if (!s) s = (k < 0 ? '-' : '') + body;
      else s += (k < 0 ? ' - ' : ' + ') + body;
    });
    return (s || '0') + ' = 0';
  }
  const isSq = n => n >= 0 && Number.isInteger(Math.sqrt(n));
  const fmt = n => String(+n.toFixed(4));

  /* ───── رسم نمودار ───── */
  function plot({ f, xr, yr, xs = 1, ys = 1, marks = [], xl = 'x', yl = 'y', w = 640, h = 320 }) {
    const pl = 44, pr = 16, pt = 18, pb = 30;
    const sx = x => pl + (x - xr[0]) / (xr[1] - xr[0]) * (w - pl - pr);
    const sy = y => h - pb - (y - yr[0]) / (yr[1] - yr[0]) * (h - pt - pb);
    let g = '';
    for (let x = Math.ceil(xr[0] / xs) * xs; x <= xr[1] + 1e-9; x += xs)
      g += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${pt}" y2="${h - pb}" class="pg"/>` +
           `<text x="${sx(x)}" y="${h - 10}" class="pt" text-anchor="middle">${+x.toFixed(2)}</text>`;
    for (let y = Math.ceil(yr[0] / ys) * ys; y <= yr[1] + 1e-9; y += ys)
      g += `<line y1="${sy(y)}" y2="${sy(y)}" x1="${pl}" x2="${w - pr}" class="pg"/>` +
           `<text x="${pl - 6}" y="${sy(y) + 4}" class="pt" text-anchor="end">${+y.toFixed(2)}</text>`;
    const ax = (yr[0] <= 0 && yr[1] >= 0 ? `<line x1="${pl}" x2="${w - pr}" y1="${sy(0)}" y2="${sy(0)}" class="pa"/>` : '') +
               (xr[0] <= 0 && xr[1] >= 0 ? `<line x1="${sx(0)}" x2="${sx(0)}" y1="${pt}" y2="${h - pb}" class="pa"/>` : '');
    let d = '', pen = false;
    const N = 400;
    for (let i = 0; i <= N; i++) {
      const x = xr[0] + (xr[1] - xr[0]) * i / N, y = f(x);
      if (y < yr[0] - 0.5 || y > yr[1] + 0.5) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1) + ' ';
      pen = true;
    }
    const mk = marks.filter(m => m.x >= xr[0] && m.x <= xr[1] && m.y >= yr[0] && m.y <= yr[1]).map(m => `<circle cx="${sx(m.x)}" cy="${sy(m.y)}" r="5.5" class="pm"/>` +
      `<text x="${sx(m.x)}" y="${sy(m.y) + (m.up ? -12 : 20)}" class="pl" text-anchor="middle">${m.l}</text>`).join('');
    return `<figure class="plot"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="نمودار تابع">
      ${g}${ax}<path d="${d}" class="pc"/>${mk}
      <text x="${w - pr}" y="${(yr[0] <= 0 ? sy(0) : h - pb) - 6}" class="pt" text-anchor="end">${xl}</text>
      <text x="${(xr[0] <= 0 ? sx(0) : pl) + 8}" y="${pt + 8}" class="pt">${yl}</text>
    </svg><figcaption>نمودار تابع و نقاط مهم آن</figcaption></figure>`;
  }

  /* ───── ابزار ۱: ساخت معادله از ریشه‌ها ───── */
  function builder(root) {
    root.innerHTML = `
      <div class="card"><h3>🧱 سازنده‌ی معادله از روی ریشه‌ها</h3>
        <p>دو ریشه را بنویسید (عدد صحیح، اعشاری یا کسر مثل <b dir="ltr">1/3</b>).</p>
        <div class="row">
          <div class="field"><label>ریشه‌ی اول</label><input id="r1" value="1/3"></div>
          <div class="field"><label>ریشه‌ی دوم</label><input id="r2" value="2/3"></div>
        </div>
        <button class="btn" id="goB">بساز!</button>
        <div class="out" id="outB"></div></div>`;
    const run = () => {
      const a = parse(root.querySelector('#r1').value), b = parse(root.querySelector('#r2').value);
      const out = root.querySelector('#outB');
      if (!a || !b) { out.innerHTML = '<span class="err">ورودی معتبر نیست؛ مثلاً 2 یا -3/4 یا 0.5 بنویسید.</span>'; return; }
      const S = add(a, b), P = mul(a, b);
      const L = S.d * P.d / gcd(S.d, P.d);
      let A = L, B = -S.n * (L / S.d), C = P.n * (L / P.d);
      const g = gcd(gcd(A, B), C); A /= g; B /= g; C /= g;
      out.innerHTML = `
        <p>$$S=${tex(a)}+${texP(b)}=${tex(S)}$$</p>
        <p>$$P=${tex(a)}\\times${texP(b)}=${tex(P)}$$</p>
        <p>$$x^2-${texP(S)}x+${texP(P)}=0$$</p>
        <p>پس از حذف مخرج و ساده‌سازی:</p>
        <p>$$\\boxed{${polyTex(A, B, C)}}$$</p>`;
      window.renderMath(out);
    };
    root.querySelector('#goB').onclick = run;
    root.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => e.key === 'Enter' && run()));
    run();
  }

  /* ───── ابزار ۲: تحلیل معادله‌ی درجه دوم ───── */
  function analyzer(root) {
    root.innerHTML = `
      <div class="card"><h3>🔎 تحلیل‌گر معادله‌ی $ax^2+bx+c=0$</h3>
        <p>ضرایب را وارد کنید تا $S$، $P$، دلتا، ریشه‌ها و رأس سهمی را ببینید.</p>
        <div class="row">
          <div class="field"><label>a</label><input id="ca" value="9"></div>
          <div class="field"><label>b</label><input id="cb" value="-9"></div>
          <div class="field"><label>c</label><input id="cc" value="2"></div>
        </div>
        <button class="btn" id="goA">تحلیل کن</button>
        <div class="out" id="outA"></div></div>`;
    const run = () => {
      const a = parse(root.querySelector('#ca').value), b = parse(root.querySelector('#cb').value), c = parse(root.querySelector('#cc').value);
      const out = root.querySelector('#outA');
      if (!a || !b || !c) { out.innerHTML = '<span class="err">ضرایب معتبر نیستند.</span>'; return; }
      if (a.n === 0) { out.innerHTML = '<span class="err">اگر a = 0 باشد معادله درجه دوم نیست.</span>'; return; }
      const S = neg(div(b, a)), P = div(c, a);
      const D = sub(mul(b, b), mul(F(4), mul(a, c)));
      const xv = neg(div(b, mul(F(2), a))), yv = neg(div(D, mul(F(4), a)));
      let roots;
      const dv = val(D);
      if (dv < 0) roots = `$\\Delta<0$ ⟵ ریشه‌ی حقیقی ندارد.`;
      else if (dv === 0) roots = `ریشه‌ی مضاعف: $x=${tex(xv)}$`;
      else if (isSq(D.n) && isSq(D.d)) {
        const sq = F(Math.sqrt(D.n), Math.sqrt(D.d)), two = mul(F(2), a);
        const r1 = div(add(neg(b), sq), two), r2 = div(sub(neg(b), sq), two);
        roots = `$x_1=${tex(r1)}$ و $x_2=${tex(r2)}$`;
      } else {
        const r1 = (-val(b) + Math.sqrt(dv)) / (2 * val(a)), r2 = (-val(b) - Math.sqrt(dv)) / (2 * val(a));
        roots = `$x_1\\approx${fmt(r1)}$ و $x_2\\approx${fmt(r2)}$ (گنگ)`;
      }
      out.innerHTML = `
        <p>$$S=-\\frac ba=${tex(S)}\\qquad P=\\frac ca=${tex(P)}$$</p>
        <p>$$\\Delta=b^2-4ac=${tex(D)}$$</p>
        <p>${roots}</p>
        <p>رأس سهمی: $\\left(${tex(xv)}\\,,\\ ${tex(yv)}\\right)$ — ${val(a) > 0 ? 'کمینه' : 'بیشینه'}</p>`;
      window.renderMath(out);
    };
    root.querySelector('#goA').onclick = run;
    root.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => e.key === 'Enter' && run()));
    run();
  }


  /* ───── ابزار ۳: کاوشگر تعاملی سهمی ───── */
  function explorer(root) {
    root.innerHTML = `
      <div class="card"><h3>🎛️ کاوشگر سهمی: ضرایب را حرکت دهید</h3>
        <p>با لغزنده‌ها ضرایب $a$، $b$ و $c$ را تغییر دهید و ببینید ریشه‌ها، $S$، $P$ و رأس چطور جابه‌جا می‌شوند.</p>
        <div class="sliders">
          <label><span>a = <b id="va">1</b></span><input type="range" id="sa" min="-3" max="3" step="0.25" value="1"></label>
          <label><span>b = <b id="vb">-4</b></span><input type="range" id="sb" min="-10" max="10" step="0.5" value="-4"></label>
          <label><span>c = <b id="vc">3</b></span><input type="range" id="sc" min="-10" max="10" step="0.5" value="3"></label>
        </div>
        <div id="exStats" class="stats"></div>
        <div id="exPlot"></div></div>`;
    const g = id => root.querySelector('#' + id);
    const run = () => {
      const a = +g('sa').value, b = +g('sb').value, c = +g('sc').value;
      g('va').textContent = a; g('vb').textContent = b; g('vc').textContent = c;
      if (a === 0) { g('exStats').innerHTML = '<span class="err">a = 0 یعنی معادله درجه دوم نیست؛ لغزنده را جابه‌جا کنید.</span>'; g('exPlot').innerHTML = ''; return; }
      const D = b * b - 4 * a * c, S = -b / a, P = c / a, xv = -b / (2 * a), yv = a * xv * xv + b * xv + c;
      const marks = [{ x: xv, y: yv, l: 'رأس', up: a < 0 }];
      let info = '';
      if (D >= 0) {
        const r1 = (-b + Math.sqrt(D)) / (2 * a), r2 = (-b - Math.sqrt(D)) / (2 * a);
        marks.push({ x: r1, y: 0, l: fmt(r1) }, ...(D > 0 ? [{ x: r2, y: 0, l: fmt(r2) }] : []));
        info = D === 0 ? `ریشه‌ی مضاعف ${fmt(r1)}` : `ریشه‌ها: ${fmt(r2)} و ${fmt(r1)}`;
      } else info = 'ریشه‌ی حقیقی ندارد';
      g('exStats').innerHTML = `
        <span class="chip2">S = ${fmt(S)}</span><span class="chip2">P = ${fmt(P)}</span>
        <span class="chip2">Δ = ${fmt(D)}</span><span class="chip2 rt">رأس: <bdi dir="ltr">(${fmt(xv)} , ${fmt(yv)})</bdi></span>
        <span class="chip2 ${D < 0 ? 'bad' : 'good'}">${info}</span>`;
      g('exPlot').innerHTML = plot({ f: x => a * x * x + b * x + c, xr: [-8, 8], yr: [-12, 12], xs: 2, ys: 4, marks });
    };
    root.querySelectorAll('input').forEach(i => i.addEventListener('input', run));
    run();
  }

  /* ───── ابزار ۴: حل‌کننده‌ی دومربعی ───── */
  function biquad(root) {
    root.innerHTML = `
      <div class="card"><h3>🧮 حل‌کننده‌ی دومربعی $ax^4+bx^2+c=0$</h3>
        <p>ضرایب را بدهید تا گام‌های $t=x^2$ را ببینید.</p>
        <div class="row">
          <div class="field"><label>a</label><input id="qa" value="1"></div>
          <div class="field"><label>b</label><input id="qb" value="-3"></div>
          <div class="field"><label>c</label><input id="qc" value="-4"></div>
        </div>
        <button class="btn" id="goQ">حل کن</button>
        <div class="out" id="outQ"></div></div>`;
    const xs = t => { // جواب‌های x برای x^2 = t (t عدد گویا یا اعشاری)
      const tv = typeof t === 'number' ? t : val(t);
      const tt = typeof t === 'number' ? '' : tex(t);
      if (tv < -1e-12) return `$x^2=${tt || fmt(tv)}<0$ ⟵ <span class="err">بدون جواب حقیقی</span>`;
      if (Math.abs(tv) < 1e-12) return '$x^2=0$ ⟵ $x=0$';
      if (typeof t !== 'number' && isSq(t.n) && isSq(t.d)) {
        const r = F(Math.sqrt(t.n), Math.sqrt(t.d));
        return `$x^2=${tt}$ ⟵ $x=\\pm${tex(r)}$`;
      }
      return `$x^2=${tt || fmt(tv)}$ ⟵ $x\\approx\\pm${fmt(Math.sqrt(tv))}$`;
    };
    const run = () => {
      const a = parse(root.querySelector('#qa').value), b = parse(root.querySelector('#qb').value), c = parse(root.querySelector('#qc').value);
      const out = root.querySelector('#outQ');
      if (!a || !b || !c || a.n === 0) { out.innerHTML = '<span class="err">ضرایب معتبر نیستند (a نباید صفر باشد).</span>'; return; }
      const D = sub(mul(b, b), mul(F(4), mul(a, c)));
      let html = `<p>$t=x^2\\ \\Rightarrow\\ ${tex(a)}t^2+${texP(b)}t+${texP(c)}=0$</p><p>$\\Delta=${tex(D)}$</p>`;
      if (val(D) < 0) html += '<p>Δ < 0 ⟵ <span class="err">t حقیقی ندارد، پس x هم ندارد.</span></p>';
      else if (isSq(D.n) && isSq(D.d)) {
        const sq = F(Math.sqrt(D.n), Math.sqrt(D.d)), two = mul(F(2), a);
        const t1 = div(add(neg(b), sq), two), t2 = div(sub(neg(b), sq), two);
        const list = val(D) === 0 ? [t1] : [t1, t2];
        html += `<p>$t=${list.map(tex).join('\\ ,\\ ')}$</p>` + list.map(t => `<p>${xs(t)}</p>`).join('');
      } else {
        const t1 = (-val(b) + Math.sqrt(val(D))) / (2 * val(a)), t2 = (-val(b) - Math.sqrt(val(D))) / (2 * val(a));
        html += `<p>$t\\approx${fmt(t1)}\\ ,\\ ${fmt(t2)}$</p><p>${xs(t1)}</p><p>${xs(t2)}</p>`;
      }
      out.innerHTML = html;
      window.renderMath(out);
    };
    root.querySelector('#goQ').onclick = run;
    root.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => e.key === 'Enter' && run()));
    run();
  }

  return { plot, builder, analyzer, explorer, biquad, parse };

})();
