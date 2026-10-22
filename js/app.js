(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BLUE = [45, 75, 110], RED = [194, 65, 43], LIT = [92, 128, 170];
  const LIGHT = (() => { const v = [-0.35, 0.85, 0.55], l = Math.hypot(...v); return v.map((a) => a / l); })();
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const fmt = (n) => n.toLocaleString('en-US');
  const pct = (x) => (x * 100).toFixed(1) + '%';
  const shade = (c, f) => `rgb(${c.map((v) => Math.round(Math.min(255, v * f))).join(',')})`;

  // Rotate a point by yaw (about Y) then pitch (about X).
  function rot(p, yw, pt) {
    const cy = Math.cos(yw), sy = Math.sin(yw), cp = Math.cos(pt), sp = Math.sin(pt);
    const x1 = p[0] * cy + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cy;
    return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
  }

  // A small orthographic 3D view: boxes drawn back to front, back faces culled.
  function makeView(canvas, o) {
    const ctx = canvas.getContext('2d');
    const v = { W: 0, H: 0, unit: 80, yaw: o.yaw, pitch: o.pitch, fit: o.fit, oy: o.oy, drag: false, lx: 0, ly: 0, sway: reduce ? 0 : 1 };
    const S = (q) => [v.W * 0.5 + q[0] * v.unit, v.H * v.oy - q[1] * v.unit];
    const P = (p, yw) => S(rot(p, yw, v.pitch));

    function size() {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      v.W = r.width; v.H = r.height;
      v.unit = Math.min(v.H / v.fit, v.W / (v.fit * 0.8));
    }
    function update() { v.sway += ((v.drag || reduce ? 0 : 1) - v.sway) * 0.05; }
    function angle(now) { return v.yaw + v.sway * 0.26 * Math.sin(now / 2600); }
    function clear() { ctx.clearRect(0, 0, v.W, v.H); }

    function quad(pts, col) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = 'rgba(242,238,229,0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawBox(b, yw) {
      const F = [
        { n: [0, 1, 0],  p: [[b.x0, b.y1, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1]] },
        { n: [0, 0, 1],  p: [[b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1]] },
        { n: [1, 0, 0],  p: [[b.x1, b.y0, b.z0], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x1, b.y1, b.z0]] },
        { n: [-1, 0, 0], p: [[b.x0, b.y0, b.z0], [b.x0, b.y0, b.z1], [b.x0, b.y1, b.z1], [b.x0, b.y1, b.z0]] },
        { n: [0, 0, -1], p: [[b.x0, b.y0, b.z0], [b.x1, b.y0, b.z0], [b.x1, b.y1, b.z0], [b.x0, b.y1, b.z0]] },
      ];
      for (const f of F) {
        const nr = rot(f.n, yw, v.pitch);
        if (nr[2] <= 0.02) continue;                           // faces away from the viewer
        const lam = Math.max(0, nr[0] * LIGHT[0] + nr[1] * LIGHT[1] + nr[2] * LIGHT[2]);
        quad(f.p.map((q) => S(rot(q, yw, v.pitch))), shade(b.col, 0.56 + 0.44 * lam));
      }
    }
    function drawBoxes(list, yw) {
      const order = list.map((b) => ({ b, d: rot([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2], yw, v.pitch)[2] }));
      order.sort((a, b) => a.d - b.d);                          // far first
      for (const { b } of order) drawBox(b, yw);
    }
    function floor(e, yw) {
      const pts = [[-e, 0, -e], [e, 0, -e], [e, 0, e], [-e, 0, e]].map((p) => P(p, yw));
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = 'rgba(28,27,24,0.035)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(28,27,24,0.14)';
      ctx.stroke();
    }
    function text(s, p3, yw, opt = {}) {
      const [x, y] = P(p3, yw);
      ctx.font = opt.font || '13px ui-monospace, Menlo, monospace';
      ctx.textAlign = opt.align || 'center';
      ctx.textBaseline = 'middle';
      if (opt.plate) {
        const w = ctx.measureText(s).width, pad = 6;
        ctx.fillStyle = 'rgba(242,238,229,0.94)';
        ctx.fillRect(x - w / 2 - pad, y - 11, w + pad * 2, 22);
      }
      ctx.fillStyle = opt.color || '#1c1b18';
      ctx.fillText(s, x, y);
    }

    // Drag to turn (horizontal) and tilt (vertical).
    canvas.addEventListener('pointerdown', (e) => {
      v.drag = true; v.lx = e.clientX; v.ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add('drag');
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!v.drag) return;
      v.yaw += (e.clientX - v.lx) * 0.009;
      v.pitch = clamp(v.pitch + (e.clientY - v.ly) * 0.005, 0.25, 1.25);
      v.lx = e.clientX; v.ly = e.clientY;
    });
    const endDrag = () => { v.drag = false; canvas.classList.remove('drag'); };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', size);
    size();

    return { update, angle, clear, drawBoxes, floor, text };
  }

  // ---------- 01 · Confusion matrix ----------
  // Counts from results/evaluation_report.txt (BERT Fusion).
  // TN real called real, FP real called fraud, FN fraud called real, TP fraud called fraud.
  const COUNTS = {
    test:  { TN: 3385, FP: 18, FN: 57, TP: 3356 },
    train: { TN: 4226, FP: 27, FN: 62, TP: 4205 },
  };
  const SCALE_MAX = 4300;
  const CELLS = [
    { k: 'TN', x: 0, z: 0, col: BLUE }, { k: 'FP', x: 1, z: 0, col: RED },
    { k: 'FN', x: 0, z: 1, col: RED },  { k: 'TP', x: 1, z: 1, col: BLUE },
  ];
  const mView = makeView(document.getElementById('cm'), { yaw: 0.8, pitch: 0.72, fit: 4.7, oy: 0.63 });
  const mState = { model: 'model', split: 'test' };
  const mH = { TN: 0, FP: 0, FN: 0, TP: 0 };
  const hFor = (n) => (n > 0 ? 0.08 + 2.4 * Math.sqrt(n / SCALE_MAX) : 0.02);

  function countsFor() {
    const d = COUNTS[mState.split];
    if (mState.model === 'model') return d;
    return { TN: d.TN + d.FP, FP: 0, FN: d.FN + d.TP, TP: 0 };   // always answers "real"
  }

  function drawMatrix(now) {
    mView.update();
    const yw = mView.angle(now);
    const c = countsFor();
    for (const k of ['TN', 'FP', 'FN', 'TP']) mH[k] += (hFor(c[k]) - mH[k]) * 0.14;
    mView.clear();
    mView.floor(2.35, yw);
    const list = CELLS.map((q) => {
      const cx = (q.x - 0.5) * 2.2, cz = (q.z - 0.5) * 2.2;
      return { x0: cx - 0.82, x1: cx + 0.82, y0: 0, y1: mH[q.k], z0: cz - 0.82, z1: cz + 0.82, col: q.col, k: q.k, cx, cz };
    });
    mView.drawBoxes(list, yw);
    for (const b of list) {
      const err = b.k === 'FP' || b.k === 'FN';
      mView.text(fmt(c[b.k]), [b.cx, b.y1 + 0.22, b.cz], yw,
        { plate: true, color: err ? '#a8361f' : '#1c1b18', font: '600 14px ui-monospace, Menlo, monospace' });
    }
    const ax = { color: '#6b675e', font: '12px ui-monospace, Menlo, monospace' };
    mView.text('model says real', [-1.1, 0, 2.7], yw, ax);
    mView.text('model says fraud', [1.1, 0, 2.7], yw, ax);
    mView.text('is real', [2.75, 0, -1.1], yw, { ...ax, align: 'left' });
    mView.text('is fraud', [2.75, 0, 1.1], yw, { ...ax, align: 'left' });
  }

  function renderMatrixReadout() {
    const c = countsFor();
    const total = c.TN + c.FP + c.FN + c.TP;
    const real = c.TN + c.FP, fraud = c.FN + c.TP;
    const model = mState.model === 'model';
    document.getElementById('acc').textContent = pct((c.TN + c.TP) / total);
    document.getElementById('accNote').textContent = model
      ? `Share of all ${fmt(total)} postings in this split labelled correctly.`
      : 'Equal to the share of real postings in this split.';
    document.getElementById('missed').textContent = fmt(c.FN);
    document.getElementById('missedOf').textContent = `of ${fmt(fraud)}`;
    document.getElementById('missedNote').textContent = model
      ? 'Fraudulent postings the model let through.'
      : 'It labels every posting real, so every fraud gets through.';
    document.getElementById('flagged').textContent = fmt(c.FP);
    document.getElementById('flaggedOf').textContent = `of ${fmt(real)}`;
    document.getElementById('flaggedNote').textContent = model
      ? 'Genuine postings wrongly marked as fraud.'
      : 'Zero by construction: it never flags a posting.';
  }

  function setGroup(ids, active) {
    for (const id of ids) document.getElementById(id).setAttribute('aria-pressed', String(id === active));
  }
  const M = ['m-model', 'm-naive'], S2 = ['s-test', 's-train'];
  document.getElementById('m-model').addEventListener('click', () => { mState.model = 'model'; setGroup(M, 'm-model'); renderMatrixReadout(); });
  document.getElementById('m-naive').addEventListener('click', () => { mState.model = 'naive'; setGroup(M, 'm-naive'); renderMatrixReadout(); });
  document.getElementById('s-test').addEventListener('click', () => { mState.split = 'test'; setGroup(S2, 's-test'); renderMatrixReadout(); });
  document.getElementById('s-train').addEventListener('click', () => { mState.split = 'train'; setGroup(S2, 's-train'); renderMatrixReadout(); });

  // ---------- 02 · Systems, exploded ----------
  // Layers listed top to bottom, with a footprint width and depth for each.
  const SYSTEMS = {
    fraud: { label: 'Fraud detector', layers: [
      { name: 'Web app and API', text: 'Flask 3.1 with Google OAuth 2.0 sign-in and OpenAPI/Swagger docs.', w: 2.2, d: 2.2 },
      { name: 'Text model', text: 'DistilBERT (distilbert-base-uncased), fine-tuned with frozen lower layers.', w: 2.6, d: 2.6 },
      { name: 'Anomaly and ensemble', text: 'Isolation Forest for outliers, combined with a scikit-learn ensemble.', w: 3.0, d: 3.0 },
      { name: 'Deployment', text: 'Docker image for a Hugging Face Space, serving on port 7860.', w: 2.4, d: 2.4 },
    ] },
    expense: { label: 'Expense tracker', layers: [
      { name: 'Web client', text: 'Netlify-hosted front end, with receipt scanning in the browser (Tesseract.js).', w: 2.4, d: 2.4 },
      { name: 'Mobile client', text: 'Expo and React Native app for recording and reviewing finances.', w: 2.0, d: 2.0 },
      { name: 'REST API', text: 'Spring Boot 4.1.1 on Java 26: authentication, business rules, reports and sync.', w: 2.8, d: 2.8 },
      { name: 'Database', text: 'PostgreSQL and SQLite, both named in the repository.', w: 3.0, d: 3.0 },
    ] },
    diary: { label: 'Digital diary', layers: [
      { name: 'Pages', text: 'Server-rendered HTML with Jinja2 and a little vanilla JavaScript.', w: 2.2, d: 2.2 },
      { name: 'API and sign-in', text: 'FastAPI with JSON endpoints under /api, JWT in HttpOnly cookies, and passkeys (WebAuthn).', w: 2.6, d: 2.6 },
      { name: 'Data', text: 'SQLAlchemy 2 over SQLite or Postgres.', w: 3.0, d: 3.0 },
      { name: 'Sharing', text: 'Per-entry visibility, user grants and public links that can expire.', w: 2.8, d: 2.8 },
    ] },
  };
  const sView = makeView(document.getElementById('stack'), { yaw: 0.7, pitch: 0.6, fit: 5.9, oy: 0.7 });
  const T = 0.2;                       // layer thickness
  const sState = { sys: 'fraud', exT: 0, ex: 0, hover: -1 };

  function drawStack(now) {
    sView.update();
    sState.ex += (sState.exT - sState.ex) * 0.1;
    const yw = sView.angle(now);
    const layers = SYSTEMS[sState.sys].layers;
    const n = layers.length;
    sView.clear();
    sView.floor(2.5, yw);
    const list = layers.map((L, k) => {
      const level = n - 1 - k;          // k = 0 is the top layer
      const gapA = 0.14, gapE = 0.95;
      const y0 = level * (T + gapA + sState.ex * (gapE - gapA));
      return { x0: -L.w / 2, x1: L.w / 2, y0, y1: y0 + T, z0: -L.d / 2, z1: L.d / 2,
               col: k === sState.hover ? LIT : BLUE, k };
    });
    sView.drawBoxes(list, yw);
    if (sState.ex > 0.4) {                     // numbers only once the layers have room to show them
      for (const b of list) {
        sView.text(String(b.k + 1), [0, b.y1 + 0.02, 0], yw,
          { plate: true, color: '#1c1b18', font: '600 13px ui-monospace, Menlo, monospace' });
      }
    }
  }

  function renderLayers() {
    const ol = document.getElementById('layers');
    ol.innerHTML = '';
    SYSTEMS[sState.sys].layers.forEach((L, k) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${k + 1}. ${L.name}</b><span>${L.text}</span>`;
      li.addEventListener('mouseenter', () => { sState.hover = k; li.classList.add('on'); });
      li.addEventListener('mouseleave', () => { sState.hover = -1; li.classList.remove('on'); });
      ol.appendChild(li);
    });
  }

  document.querySelectorAll('[data-sys]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sState.sys = btn.dataset.sys;
      sState.hover = -1;
      document.querySelectorAll('[data-sys]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderLayers();
    });
  });
  document.getElementById('ex').addEventListener('input', (e) => { sState.exT = Number(e.target.value) / 100; });

  // ---------- one frame loop for both objects ----------
  function loop(now) {
    drawMatrix(now);
    drawStack(now);
    requestAnimationFrame(loop);
  }

  renderMatrixReadout();
  renderLayers();
  requestAnimationFrame(loop);
})();
