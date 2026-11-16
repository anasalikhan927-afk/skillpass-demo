/* SkillPass TL — concept prototype (Avora Consulting Services)
   Everything runs in the browser. Records are kept in localStorage on this device only. */
(function () {
  'use strict';

  // ---------- reference data ----------
  const CLASSES = {
    WHS: 'Work health & safety induction', EXC: 'Excavator', FEL: 'Front-end loader',
    DZR: 'Dozer', RLR: 'Roller', GRD: 'Grader', FLT: 'Forklift', TH: 'Telehandler',
    EWP: 'Elevated work platform', WAH: 'Working at heights'
  };

  const SITES = [
    { id: 'DIL', name: 'Dili — Comoro Training Centre', mun: 'Dili', link: 'Fibre + LEO backup', base: { lat: 18, dl: 210 }, plan: 2000, used: 1310, trainees: 0 },
    { id: 'TIB', name: 'Tibar — Port works yard', mun: 'Liquiçá', link: 'LEO satellite', base: { lat: 34, dl: 165 }, plan: 1000, used: 612 },
    { id: 'BAU', name: 'Baucau — Vila Antiga hall', mun: 'Baucau', link: 'LEO satellite', base: { lat: 38, dl: 140 }, plan: 1000, used: 744 },
    { id: 'MAL', name: 'Maliana — Municipal yard', mun: 'Bobonaro', link: 'LEO satellite', base: { lat: 41, dl: 128 }, plan: 500, used: 431 },
    { id: 'SUA', name: 'Suai — Supply base site office', mun: 'Covalima', link: 'LEO satellite', base: { lat: 36, dl: 150 }, plan: 1000, used: 388 },
    { id: 'SAM', name: 'Same — Suco centre', mun: 'Manufahi', link: 'LEO satellite', base: { lat: 44, dl: 110 }, plan: 500, used: 207 },
    { id: 'LOS', name: 'Lospalos — Technical school', mun: 'Lautém', link: '4G + LEO backup', base: { lat: 52, dl: 60 }, plan: 500, used: 466 },
    { id: 'OEC', name: 'Pante Macassar — Oé-Cusse', mun: 'RAEOA', link: 'LEO satellite', base: { lat: 39, dl: 135 }, plan: 500, used: 150 }
  ];

  const SEED_PEOPLE = [
    ['Joãozinho da Costa', 'Dili', 'BJ Habibie works package', ['WHS', 'EXC', 'FEL'], '2026-03-11'],
    ['Maria Ximenes', 'Baucau', 'Municipal works', ['WHS', 'WAH', 'EWP'], '2026-05-02'],
    ['Agostinho Soares', 'Liquiçá', 'Tibar port contractor', ['WHS', 'FLT', 'TH'], '2026-02-20'],
    ['Ermelinda Guterres', 'Dili', 'Independent', ['WHS', 'WAH'], '2026-06-18'],
    ['Domingos Pereira', 'Bobonaro', 'Road rehab Lot 4', ['WHS', 'DZR', 'GRD'], '2025-12-09'],
    ['Natália Belo', 'Covalima', 'Supply base', ['WHS', 'FLT'], '2026-08-27'],
    ['Celestino Amaral', 'Lautém', 'Road rehab Lot 7', ['WHS', 'RLR', 'GRD'], '2026-01-15'],
    ['Rosa Fernandes', 'Manufahi', 'Suco infrastructure', ['WHS', 'WAH'], '2026-09-30'],
    ['Mateus Sarmento', 'Dili', 'BJ Habibie works package', ['WHS', 'EXC'], '2026-04-07'],
    ['Filomena Pinto', 'RAEOA', 'Port maintenance', ['WHS', 'TH', 'EWP'], '2026-07-21']
  ];

  const TRAINERS = ['A. Tilman', 'R. Kassoma', 'J. Hornai', 'L. Mendonça', 'P. Carvalho'];

  // ---------- storage ----------
  const KEY = 'skillpass.v1';
  const store = {
    load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } },
    save() {
      try {
        const s = JSON.stringify(DB); localStorage.setItem(KEY, s);
        if (localStorage.getItem(KEY) !== s) throw new Error('verify');
        return true;
      } catch (e) { toast('Could not save on this device. Open the link in Chrome or Safari (not inside WhatsApp), and not in private mode.'); return false; }
    }
  };

  function seed() {
    const people = SEED_PEOPLE.map((p, i) => ({
      id: 'SP-' + (10231 + i * 17),
      name: p[0], mun: p[1], employer: p[2], phone: '+670 77' + String(310000 + i * 4127).slice(0, 6),
      dob: (1984 + (i * 3) % 18) + '-0' + (1 + i % 9) + '-1' + (i % 9),
      classes: p[3], issued: p[4], status: i === 4 ? 'Suspended' : 'Current',
      licence: 'TL-OHS-' + p[4].slice(2, 4) + '-' + String(4410 + i * 37).padStart(5, '0'),
      face: null, photo: null, cred: null, created: p[4]
    }));
    const today = new Date();
    const d = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
    const sessions = [
      { id: 'C-801', date: d(0), course: 'WHS', site: 'DIL', mode: 'On site', seats: 16, booked: 11, trainer: TRAINERS[0] },
      { id: 'C-802', date: d(0), course: 'EXC', site: 'TIB', mode: 'On site + practical', seats: 6, booked: 6, trainer: TRAINERS[1] },
      { id: 'C-803', date: d(1), course: 'WAH', site: 'BAU', mode: 'Theory live from Dili', seats: 20, booked: 14, trainer: TRAINERS[2] },
      { id: 'C-804', date: d(1), course: 'WHS', site: 'SAM', mode: 'Theory live from Dili', seats: 20, booked: 9, trainer: TRAINERS[0] },
      { id: 'C-805', date: d(2), course: 'FLT', site: 'SUA', mode: 'On site + practical', seats: 8, booked: 5, trainer: TRAINERS[3] },
      { id: 'C-806', date: d(3), course: 'GRD', site: 'MAL', mode: 'On site + practical', seats: 6, booked: 2, trainer: TRAINERS[4] },
      { id: 'C-807', date: d(4), course: 'EWP', site: 'OEC', mode: 'Theory live from Dili', seats: 12, booked: 7, trainer: TRAINERS[2] },
      { id: 'C-808', date: d(6), course: 'WHS', site: 'LOS', mode: 'Recorded theory (offline pack)', seats: 20, booked: 4, trainer: TRAINERS[3] }
    ];
    return { people, sessions, checkins: [], queue: 0, v: 1 };
  }

  let DB = store.load() || seed();
  if (!store.load()) store.save();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (n) => n.split(/\s+/).filter(w => w.length > 2 || /^[A-Z]/.test(w)).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const site = (id) => SITES.find(s => s.id === id) || SITES[0];
  const fmtDate = (iso) => { const d = new Date(iso + 'T00:00:00'); return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const expiry = (iso) => { const d = new Date(iso + 'T00:00:00'); d.setFullYear(d.getFullYear() + 3); return d.toISOString().slice(0, 10); };
  let currentSite = (function () { try { return localStorage.getItem('skillpass.site') || 'DIL'; } catch (e) { return 'DIL'; } })();

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3200);
  }
  function modal(html) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; }
  function closeModal() {
    $('#modal').hidden = true; $('#modalBody').innerHTML = ''; stopCamera();
    if (location.hash.startsWith('#licence-')) location.hash = 'licences';
  }
  $('#modalClose').onclick = closeModal;
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

  function avatar(p, cls = 'avatar') {
    return p.photo ? `<img class="${cls}" src="${p.photo}" alt="">` : `<div class="${cls}">${esc(initials(p.name))}</div>`;
  }

  // ---------- cloud register (Supabase) ----------
  // Fill in config.js with the project URL and the *publishable* key to turn this on.
  const CFG = window.SKILLPASS_CLOUD || {};
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const Cloud = {
    on: !!(CFG.url && CFG.key), state: 'off', last: null, err: '', busy: false, again: false,
    headers(extra) {
      const h = { apikey: CFG.key, 'Content-Type': 'application/json' };
      if (/^eyJ/.test(CFG.key)) h.Authorization = 'Bearer ' + CFG.key; // legacy anon key
      return Object.assign(h, extra || {});
    },
    async req(path, opt) {
      opt = opt || {};
      const r = await fetch(CFG.url.replace(/\/$/, '') + '/rest/v1/' + path, { method: opt.method || 'GET', headers: this.headers(opt.headers), body: opt.body });
      if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 160));
      const t = await r.text(); return t ? JSON.parse(t) : null;
    },
    toRow(p) {
      return { id: p.id, licence: p.licence, name: p.name, dob: p.dob || null, phone: p.phone || null, mun: p.mun || null, employer: p.employer || null,
        classes: p.classes, issued: p.issued, status: p.status, face: p.face || null, photo: p.photo || null, updated_at: new Date().toISOString() };
    },
    fromRow(r) {
      return { id: r.id, licence: r.licence, name: r.name, dob: r.dob, phone: r.phone, mun: r.mun, employer: r.employer || 'Independent',
        classes: r.classes || [], issued: r.issued, status: r.status, face: r.face, photo: r.photo, cred: null, created: (r.created_at || '').slice(0, 10) };
    },
    cRow(c) { return { cid: c.cid, trainee_id: c.pid, site: c.site, method: c.method, score: c.score == null ? null : String(c.score), date: c.date, time: c.time, session: c.session }; },
    cFrom(r) { return { cid: r.cid, pid: r.trainee_id, site: r.site, method: r.method, score: r.score, date: r.date, time: r.time, session: r.session, synced: true }; },
    upsert(table, rows, key) {
      return this.req(table + '?on_conflict=' + key, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
    },
    async sync() {
      if (!this.on) return;
      if (this.busy) { this.again = true; return; }
      this.busy = true; this.state = 'syncing'; updateSync();
      try {
        // 1. send local changes
        const dirty = DB.people.filter(p => p._dirty);
        if (dirty.length) {
          const sent = dirty.map(p => [p, JSON.stringify(this.toRow(p).status) + p.classes.join()]);
          await this.upsert('trainees', dirty.map(p => this.toRow(p)), 'id');
          sent.forEach(([p, sig]) => { if (JSON.stringify(p.status) + p.classes.join() === sig) delete p._dirty; });
        }
        DB.checkins.forEach(c => { if (!c.cid) c.cid = newId(); });
        const unsent = DB.checkins.filter(c => !c.synced && DB.people.some(p => p.id === c.pid));
        // 2. fetch the shared register
        const rows = await this.req('trainees?select=*&order=created_at.desc&limit=2000');
        const ids = new Set(rows.map(r => r.id));
        rows.forEach(r => {
          const p = this.fromRow(r), i = DB.people.findIndex(x => x.id === p.id);
          if (i < 0) DB.people.push(p);
          else if (!DB.people[i]._dirty) { p.cred = DB.people[i].cred; DB.people[i] = p; } // never overwrite unsent local changes
        });
        const missing = DB.people.filter(p => !ids.has(p.id));
        if (missing.length) await this.upsert('trainees', missing.map(p => this.toRow(p)), 'id');
        if (unsent.length) { await this.upsert('checkins', unsent.map(c => this.cRow(c)), 'cid'); unsent.forEach(c => c.synced = true); }
        const cs = await this.req('checkins?select=*&order=created_at.desc&limit=1000');
        const have = new Set(DB.checkins.map(c => c.cid));
        cs.reverse().forEach(r => { if (!have.has(r.cid)) DB.checkins.push(this.cFrom(r)); });
        DB.queue = 0; store.save();
        this.state = 'ok'; this.err = ''; this.last = new Date();
        if (['overview', 'licences'].includes(route) && $('#modal').hidden && !document.activeElement.matches('input,select,textarea')) render();
      } catch (e) {
        console.error(e); this.state = 'error'; this.err = String(e.message || e);
        DB.queue = DB.people.filter(p => p._dirty).length + DB.checkins.filter(c => !c.synced).length; store.save();
      }
      this.busy = false; updateSync();
      if (this.again) { this.again = false; this.sync(); }
    },
    async findLicence(lic) {
      if (!this.on) return null;
      const rows = await this.req('trainees?select=*&licence=eq.' + encodeURIComponent(lic));
      return rows && rows[0] ? this.fromRow(rows[0]) : null;
    }
  };
  function changed(p) { if (p) p._dirty = true; store.save(); Cloud.sync(); }

  // ---------- live link simulation ----------
  const live = {};
  function tickLinks() {
    SITES.forEach((s, i) => {
      const r = Math.random();
      const down = s.id === 'LOS' && r < 0.35;
      live[s.id] = {
        up: !down,
        lat: down ? null : Math.round(s.base.lat + (Math.random() * 14 - 5)),
        dl: down ? 0 : Math.round(s.base.dl * (0.75 + Math.random() * 0.4)),
        sync: down ? 'queued' : (Math.random() < 0.8 ? 'just now' : Math.ceil(Math.random() * 4) + ' min ago')
      };
    });
  }
  tickLinks();
  setInterval(() => { tickLinks(); if (route === 'sites' || route === 'overview') render(); }, 6000);

  function updateSync() {
    const on = navigator.onLine !== false;
    let txt, bad = !on;
    if (!Cloud.on) txt = on ? 'Saved on this device only' : 'Offline';
    else if (!on) txt = `Offline · ${DB.queue} waiting to upload`;
    else if (Cloud.state === 'syncing') txt = 'Cloud register · syncing…';
    else if (Cloud.state === 'error') { txt = 'Cloud not reachable · saved on device'; bad = true; }
    else if (Cloud.last) txt = 'Cloud register · synced ' + Cloud.last.toTimeString().slice(0, 5);
    else txt = 'Cloud register · connecting…';
    $('#sync .dot').className = 'dot' + (bad ? ' off' : '');
    $('#syncText').textContent = txt;
    const m = $('#cloudMini'); if (m) { m.textContent = txt; m.className = 'cloudmini' + (bad ? ' off' : ''); }
  }
  window.addEventListener('online', () => { updateSync(); Cloud.sync(); });
  window.addEventListener('offline', updateSync);

  // ---------- header ----------
  const siteSel = $('#siteSel');
  siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  siteSel.value = currentSite;
  siteSel.onchange = () => { currentSite = siteSel.value; try { localStorage.setItem('skillpass.site', currentSite); } catch (e) {} render(); };
  setInterval(() => { $('#clock').textContent = new Date().toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' TLT'; }, 1000);

  // ---------- face engine ----------
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  const Face = {
    ready: false, loading: null, mode: 'gpu',
    opts() { return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.45 }); },
    async toCpu() {
      try { await faceapi.tf.setBackend('cpu'); await faceapi.tf.ready(); this.mode = 'cpu'; } catch (e) { console.error(e); }
    },
    async warm() {
      const c = document.createElement('canvas'); c.width = 160; c.height = 160;
      c.getContext('2d').fillRect(0, 0, 160, 160);
      await faceapi.detectAllFaces(c, this.opts());
      await faceapi.computeFaceDescriptor(c);
    },
    async load(statusEl) {
      if (this.ready) return true;
      if (!window.faceapi) { if (statusEl) statusEl.textContent = 'Face library did not load. Check the internet connection and reload.'; return false; }
      if (!this.loading) {
        this.loading = (async () => {
          const bases = ['https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model', 'models'];
          let lastErr, loaded = false;
          for (const base of bases) {
            try {
              await faceapi.nets.tinyFaceDetector.loadFromUri(base);
              await faceapi.nets.faceLandmark68TinyNet.loadFromUri(base);
              await faceapi.nets.faceRecognitionNet.loadFromUri(base);
              loaded = true; break;
            } catch (e) { lastErr = e; }
          }
          if (!loaded) throw lastErr;
          // Warm up. Some phones hang or crawl on the GPU path; fall back to CPU.
          try {
            await faceapi.tf.ready();
            if (faceapi.tf.getBackend() !== 'webgl') this.mode = 'cpu';
            await withTimeout(this.warm(), 12000);
          } catch (e) {
            await this.toCpu();
            await withTimeout(this.warm(), 30000).catch(() => {});
          }
          this.ready = true;
        })();
      }
      if (statusEl) statusEl.textContent = 'Preparing face engine (first time only, up to 30 s)…';
      try { await this.loading; return true; } catch (e) { console.error(e); this.loading = null; if (statusEl) statusEl.textContent = 'Could not load face models. Check the internet connection.'; return false; }
    },
    async describeOnce(input) {
      const all = await faceapi.detectAllFaces(input, this.opts());
      if (all.length === 0) return { error: 'No face found. Face the camera in good light and try again.' };
      if (all.length > 1) return { error: 'More than one face in the picture. Only the trainee should be in frame.' };
      const r = await faceapi.detectSingleFace(input, this.opts()).withFaceLandmarks(true).withFaceDescriptor();
      if (!r) return { error: 'Face found but could not be read clearly. Try again.' };
      return { descriptor: Array.from(r.descriptor), score: r.detection.score, box: r.detection.box };
    },
    async describe(input) {
      input = shrink(input, 480);
      const k = input._scale || 1;
      const fix = (r) => { if (r && r.box) { const b = r.box; r.box = { x: b.x * k, y: b.y * k, width: b.width * k, height: b.height * k }; } return r; };
      try { return fix(await withTimeout(this.describeOnce(input), this.mode === 'cpu' ? 40000 : 15000)); }
      catch (e) {
        if (this.mode !== 'cpu') {
          await this.toCpu();
          try { return fix(await withTimeout(this.describeOnce(input), 40000)); } catch (e2) { /* fall through */ }
        }
        return { error: 'Reading the face took too long on this device. Please try again.' };
      }
    },
    match(desc) {
      let best = null;
      DB.people.forEach(p => {
        (p.face || []).forEach(f => {
          const d = faceapi.euclideanDistance(desc, f);
          if (!best || d < best.d) best = { p, d };
        });
      });
      return best;
    },
    THRESH: 0.5
  };

  function shrink(src, max) {
    const w = src.width || src.videoWidth, h = src.height || src.videoHeight;
    if (!w || Math.max(w, h) <= max) return src;
    const s = max / Math.max(w, h), c = document.createElement('canvas');
    c.width = Math.round(w * s); c.height = Math.round(h * s);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    c._scale = 1 / s; return c;
  }

  // ---------- camera widget (live scanner) ----------
  let stream = null, scanTimer = null;
  function stopCamera() {
    if (scanTimer) { clearTimeout(scanTimer); scanTimer = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }

  /* Renders a live face scanner into el. Auto-captures when one face is centred and steady.
     Calls onShot(canvas, say) with the captured frame. */
  function cameraBox(el, onShot, label) {
    el.innerHTML = `
      <div class="cam"><div class="empty" data-empty>Camera is off</div><canvas class="ov" hidden></canvas><div class="guide" hidden></div><div class="msg" data-msg hidden></div></div>
      <div class="row" style="margin-top:10px">
        <button class="btn" data-start>Start scanner</button>
        <button class="btn alt" data-snap hidden>${esc(label || 'Capture now')}</button>
        <label class="btn alt" style="display:inline-block">Use a photo<input type="file" accept="image/*" capture="user" hidden data-file></label>
      </div>`;
    const cam = $('.cam', el), msg = $('[data-msg]', el), empty = $('[data-empty]', el), guide = $('.guide', el), ov = $('.ov', el);
    const say = (t) => { msg.hidden = !t; msg.textContent = t || ''; };
    let good = 0, busy = false, done = false;

    function draw(dets, ok) {
      const v = $('video', cam); if (!v) return;
      ov.width = v.videoWidth; ov.height = v.videoHeight;
      const g = ov.getContext('2d'); g.clearRect(0, 0, ov.width, ov.height);
      g.strokeStyle = ok ? '#4fd18b' : '#ffffffcc'; g.lineWidth = Math.max(3, ov.width / 160);
      dets.forEach(d => {
        const { x, y, width: w, height: h } = d.box, L = Math.min(w, h) * 0.22;
        g.beginPath();
        [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([px, py, sx, sy]) => {
          g.moveTo(px + sx * L, py); g.lineTo(px, py); g.lineTo(px, py + sy * L);
        });
        g.stroke();
      });
    }

    function capture() {
      const v = $('video', cam); if (!v || done) return;
      done = true;
      const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext('2d'); ctx.translate(c.width, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0);
      stopCamera(); v.remove(); ov.hidden = true; guide.hidden = true; cam.prepend(c);
      $('[data-snap]', el).hidden = true; const st = $('[data-start]', el); st.hidden = false; st.textContent = 'Scan again';
      onShot(c, say);
    }

    async function tick() {
      const v = $('video', cam);
      if (!stream || !v || done) return;
      if (!busy && v.readyState >= 2 && v.videoWidth) {
        busy = true;
        try {
          const dets = await withTimeout(faceapi.detectAllFaces(v, Face.opts()), Face.mode === 'cpu' ? 8000 : 4000);
          if (done) return;
          const W = v.videoWidth, H = v.videoHeight;
          let ok = false;
          if (dets.length === 0) { good = 0; say('Looking for a face…'); }
          else if (dets.length > 1) { good = 0; say('Only one person in front of the camera'); }
          else {
            const b = dets[0].box, cx = (b.x + b.width / 2) / W, cy = (b.y + b.height / 2) / H, size = b.width / W;
            if (size < 0.2) { good = 0; say('Move a little closer'); }
            else if (size > 0.75) { good = 0; say('Move back a little'); }
            else if (Math.abs(cx - 0.5) > 0.22 || Math.abs(cy - 0.5) > 0.26) { good = 0; say('Centre your face in the oval'); }
            else { ok = true; good++; say(good >= 3 ? 'Got it' : 'Hold still…'); }
          }
          guide.classList.toggle('ok', ok);
          draw(dets, ok);
          if (good >= 3) { busy = false; capture(); return; }
        } catch (e) {
          if (Face.mode !== 'cpu') { say('Switching to compatibility mode…'); await Face.toCpu(); }
        }
        busy = false;
      }
      scanTimer = setTimeout(tick, Face.mode === 'cpu' ? 400 : 150);
    }

    $('[data-start]', el).onclick = async () => {
      stopCamera(); done = false; good = 0;
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nocam');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.setAttribute('playsinline', ''); v.srcObject = stream;
        cam.querySelectorAll('video,canvas:not(.ov),img').forEach(n => n.remove());
        cam.prepend(v); await v.play();
        empty.hidden = true; guide.hidden = false; guide.classList.remove('ok'); ov.hidden = false;
        $('[data-snap]', el).hidden = false; $('[data-start]', el).hidden = true;
        say('Preparing face scanner…');
        const ok = await Face.load({ set textContent(t) { say(t); } });
        if (!ok || !stream) return;
        say('Looking for a face…');
        tick();
      } catch (e) {
        empty.textContent = 'Camera not available here. Use “Use a photo” — on a phone it opens the camera.';
      }
    };
    $('[data-snap]', el).onclick = capture;
    $('[data-file]', el).onchange = (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        stopCamera(); done = true; cam.querySelectorAll('video,canvas:not(.ov),img').forEach(n => n.remove()); cam.prepend(c);
        empty.hidden = true; guide.hidden = true; ov.hidden = true; $('[data-snap]', el).hidden = true;
        $('[data-start]', el).hidden = false;
        onShot(c, say);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(f);
      e.target.value = '';
    };
    return { say };
  }

  function thumbFrom(canvas, box) {
    const t = document.createElement('canvas'); t.width = 160; t.height = 200;
    const ctx = t.getContext('2d');
    let sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
    if (box) {
      const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
      sw = Math.min(canvas.width, box.width * 1.9); sh = sw * 1.25;
      if (sh > canvas.height) { sh = canvas.height; sw = sh / 1.25; }
      sx = Math.min(Math.max(0, cx - sw / 2), canvas.width - sw);
      sy = Math.min(Math.max(0, cy - sh / 2 - box.height * 0.08), canvas.height - sh);
    }
    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 160, 200);
    return t.toDataURL('image/jpeg', 0.78);
  }

  // ---------- fingerprint (WebAuthn platform authenticator) ----------
  const b64u = {
    enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
  };
  const Finger = {
    async available() {
      try { return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch (e) { return false; }
    },
    async enrol(person) {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'SkillPass TL' },
          user: { id: new TextEncoder().encode(person.id), name: person.id, displayName: person.name },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
          timeout: 60000, attestation: 'none'
        }
      });
      return b64u.enc(cred.rawId);
    },
    async verify(people) {
      const allow = people.filter(p => p.cred).map(p => ({ type: 'public-key', id: b64u.dec(p.cred), transports: ['internal'] }));
      const a = await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: allow, userVerification: 'required', timeout: 60000 } });
      const id = b64u.enc(a.rawId);
      return DB.people.find(p => p.cred === id) || null;
    }
  };
  function fingerError(e) {
    const n = e && e.name;
    if (n === 'NotAllowedError') return 'Cancelled, timed out, or this page is not allowed to use the fingerprint reader here. On GitHub Pages it works on phones and laptops with a fingerprint sensor.';
    if (n === 'SecurityError') return 'The browser blocked fingerprint access for this address. Open the app on its own HTTPS address (e.g. GitHub Pages).';
    if (n === 'InvalidStateError') return 'This device already holds a fingerprint key for this trainee.';
    return 'Fingerprint not available on this device or browser.';
  }

  // ---------- views ----------
  let route = 'overview';
  const V = {};

  V.overview = function () {
    const lic = DB.people.filter(p => p.status === 'Current').length;
    const up = SITES.filter(s => live[s.id].up).length;
    const todayC = DB.checkins.filter(c => c.date === todayISO()).length;
    const today = DB.sessions.filter(s => s.date === todayISO());
    const recent = DB.checkins.slice(-6).reverse();
    return `
      <h1>Overview</h1>
      <p class="lede">Today across all training sites. Check-ins made at remote sites travel over the site link and land here; if a link drops they queue on the device and sync later.</p>
      <div class="kpis">
        <div class="kpi"><div class="n">${lic}</div><div class="l">Current licences</div><div class="d">${DB.people.length} trainees on register</div></div>
        <div class="kpi"><div class="n">${DB.people.filter(p => p.face).length}</div><div class="l">Face enrolled</div><div class="d">${DB.people.filter(p => p.cred).length} with fingerprint</div></div>
        <div class="kpi"><div class="n">${up}/${SITES.length}</div><div class="l">Sites online</div><div class="d">${SITES.filter(s => /LEO/.test(s.link)).length} on satellite</div></div>
        <div class="kpi"><div class="n">${todayC}</div><div class="l">Check-ins today</div><div class="d">${DB.queue} waiting to sync</div></div>
      </div>
      <div class="grid g2">
        <div class="panel">
          <h2>Today's classes <span class="aside">${fmtDate(todayISO())}</span></h2>
          ${today.length ? `<table><tr><th>Course</th><th>Site</th><th>Delivery</th><th>Seats</th></tr>
            ${today.map(s => `<tr><td><span class="tag">${s.course}</span> ${esc(CLASSES[s.course])}</td><td>${esc(site(s.site).name.split(' — ')[0])}</td><td>${esc(s.mode)}</td><td class="mono">${s.booked}/${s.seats}</td></tr>`).join('')}</table>` : '<p class="mute">No classes today.</p>'}
          <div style="margin-top:14px" class="row"><a class="btn" href="#checkin">Start check-in</a><a class="btn alt" href="#register">Register a trainee</a></div>
        </div>
        <div class="panel">
          <h2>Site links <span class="aside">refreshes every 6 s</span></h2>
          <ul class="list">${SITES.map(s => { const L = live[s.id]; return `<li><span>${esc(s.name.split(' — ')[0])}</span><span class="st ${L.up ? (L.lat > 50 ? 'warn' : 'ok') : 'bad'}">${L.up ? L.lat + ' ms' : 'link down — queuing'}</span></li>`; }).join('')}</ul>
        </div>
      </div>
      <div class="panel" style="margin-top:16px">
        <h2>Recent check-ins</h2>
        ${recent.length ? `<table><tr><th>Time</th><th>Trainee</th><th class="hide-m">Site</th><th>Method</th><th class="hide-m">Score</th></tr>
          ${recent.map(c => { const p = DB.people.find(x => x.id === c.pid) || { name: '?' }; return `<tr><td class="mono">${c.time}</td><td>${esc(p.name)}</td><td class="hide-m">${esc(site(c.site).name.split(' — ')[0])}</td><td>${c.method}</td><td class="mono hide-m">${c.score || '—'}</td></tr>`; }).join('')}</table>`
        : '<p class="mute">No check-ins yet. Register yourself with a photo, then try Check-in &amp; verify.</p>'}
      </div>`;
  };

  // Register
  let reg = null;
  V.register = function () {
    reg = reg || { step: 1, data: {}, face: null, photo: null, cred: null, id: 'SP-' + (20000 + Math.floor(Math.random() * 9000)) };
    const st = (n, t) => `<div class="${reg.step === n ? 'on' : reg.step > n ? 'done' : ''}">${n}. ${t}</div>`;
    let body = '';
    if (reg.step === 1) {
      const d = reg.data;
      body = `<form id="f1" class="form panel">
        <label class="full">Full name<input name="name" required value="${esc(d.name)}" placeholder="As on electoral card"></label>
        <label>Date of birth<input name="dob" type="date" required value="${esc(d.dob)}"></label>
        <label>Phone<input name="phone" value="${esc(d.phone || '+670 ')}"></label>
        <label>Municipality<select name="mun">${['Dili','Aileu','Ainaro','Atauro','Baucau','Bobonaro','Covalima','Ermera','Lautém','Liquiçá','Manatuto','Manufahi','RAEOA','Viqueque'].map(m => `<option ${d.mun === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
        <label>Employer / project<input name="employer" value="${esc(d.employer)}"></label>
        <label class="full">Applying for
          <div class="row" style="margin-top:4px">${Object.keys(CLASSES).map(k => `<label style="flex-direction:row;gap:5px;align-items:center;color:var(--ink)"><input type="checkbox" name="cls" value="${k}" ${(d.classes || ['WHS']).includes(k) ? 'checked' : ''}> <span class="tag">${k}</span></label>`).join('')}</div>
        </label>
        <div class="full spread"><span class="mute small">Trainee no. <span class="mono">${reg.id}</span></span><button class="btn">Next: photo</button></div>
      </form>`;
    } else if (reg.step === 2) {
      body = `<div class="grid g2e"><div class="panel"><h2>Take the trainee's photo</h2><div id="camReg"></div></div>
        <div class="panel"><h2>What happens</h2>
          <p class="small">The photo is turned into a face template (128 numbers) in this browser. The template is used for check-in; the small photo goes on the licence card. Nothing leaves this device in the demo.</p>
          <div id="regShot" class="shot">${reg.photo ? `<img class="thumb" src="${reg.photo}"><span class="st ok">Face captured</span>` : '<span class="mute small">No photo yet.</span>'}</div>
          <div class="row" style="margin-top:16px"><button class="btn alt" id="back2">Back</button><button class="btn" id="next2" ${reg.face ? '' : 'disabled'}>Next: fingerprint</button></div>
        </div></div>`;
    } else if (reg.step === 3) {
      body = `<div class="grid g2e"><div class="panel"><h2>Add fingerprint (optional)</h2>
          <p class="small">Uses this device's fingerprint sensor (or face unlock) through the browser's passkey system. The fingerprint itself never leaves the sensor — the app only stores a key that the sensor unlocks.</p>
          <div id="fpState" class="small" style="margin:10px 0">${reg.cred ? '<span class="st ok">Fingerprint key added on this device</span>' : '<span class="mute">Not added.</span>'}</div>
          <button class="btn alt" id="fpAdd">Scan fingerprint</button>
        </div>
        <div class="panel"><h2>Review</h2>
          <div class="row">${reg.photo ? `<img class="thumb" src="${reg.photo}">` : ''}<div><b>${esc(reg.data.name)}</b><div class="small mute">${esc(reg.data.mun)} · ${esc(reg.data.employer || '—')}</div><div style="margin-top:4px">${(reg.data.classes || []).map(c => `<span class="tag">${c}</span>`).join('')}</div></div></div>
          <div class="row" style="margin-top:16px"><button class="btn alt" id="back3">Back</button><button class="btn or" id="save3">Save trainee</button></div>
        </div></div>`;
    }
    return `<h1>Register trainee</h1><p class="lede">New trainees are registered at any site. Identity is checked once here; after that they check in to classes and assessments with their face or fingerprint.</p>
      <div class="steps">${st(1, 'Details')}${st(2, 'Photo')}${st(3, 'Fingerprint & save')}</div>${body}`;
  };
  V.register.after = function () {
    if (reg.step === 1) {
      $('#f1').onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        reg.data = { name: fd.get('name').trim(), dob: fd.get('dob'), phone: fd.get('phone'), mun: fd.get('mun'), employer: fd.get('employer'), classes: fd.getAll('cls') };
        if (!reg.data.classes.length) reg.data.classes = ['WHS'];
        reg.step = 2; render();
      };
    } else if (reg.step === 2) {
      cameraBox($('#camReg'), async (canvas, say) => {
        say('Reading face…');
        if (!(await Face.load({ set textContent(t) { say(t); } }))) return;
        const r = await Face.describe(canvas);
        if (r.error) { say(r.error); return; }
        const dup = Face.match(r.descriptor);
        if (dup && dup.d < 0.42) { say(''); toast(`This face looks like ${dup.p.name} (${dup.p.id}), already registered.`); }
        reg.face = [r.descriptor]; reg.photo = thumbFrom(canvas, r.box);
        say('Face captured · detection ' + Math.round(r.score * 100) + '% · ' + Face.mode);
        $('#regShot').innerHTML = `<img class="thumb" src="${reg.photo}"><span class="st ok">Face captured</span>`;
        $('#next2').disabled = false;
      }, 'Take picture');
      $('#back2').onclick = () => { stopCamera(); reg.step = 1; render(); };
      $('#next2').onclick = () => { stopCamera(); reg.step = 3; render(); };
    } else if (reg.step === 3) {
      $('#back3').onclick = () => { reg.step = 2; render(); };
      $('#fpAdd').onclick = async () => {
        if (!(await Finger.available())) { $('#fpState').innerHTML = `<span class="st warn">${fingerError({})}</span>`; return; }
        try { reg.cred = await Finger.enrol({ id: reg.id, name: reg.data.name }); $('#fpState').innerHTML = '<span class="st ok">Fingerprint key added on this device</span>'; }
        catch (e) { $('#fpState').innerHTML = `<span class="st warn">${esc(fingerError(e))}</span>`; }
      };
      $('#save3').onclick = () => {
        const yy = todayISO().slice(2, 4);
        const p = { id: reg.id, name: reg.data.name, dob: reg.data.dob, phone: reg.data.phone, mun: reg.data.mun, employer: reg.data.employer || 'Independent',
          classes: reg.data.classes, issued: todayISO(), status: 'Pending assessment', licence: 'TL-OHS-' + yy + '-' + String(Math.floor(10000 + Math.random() * 89999)),
          face: reg.face, photo: reg.photo, cred: reg.cred, created: todayISO() };
        DB.people.unshift(p); if (navigator.onLine === false) DB.queue++;
        p._dirty = true;
        if (!store.save()) { DB.people.shift(); return; }
        Cloud.sync(); updateSync();
        reg = null; toast(Cloud.on ? `Saved: ${p.name} (${p.id}). Uploading to the cloud register…` : `Saved on this device: ${p.name} (${p.id}).`);
        justRegistered = p.licence; location.hash = 'licence-' + p.licence;
      };
    }
  };

  // Check-in
  let ciTab = 'face';
  V.checkin = function () {
    const s = site(currentSite);
    const sess = DB.sessions.filter(x => x.site === currentSite && x.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))[0];
    return `<h1>Check-in &amp; verify</h1>
      <p class="lede">Confirms that the person at the class or assessment is the registered trainee. Site: <b>${esc(s.name)}</b>${sess ? ` · next class <span class="tag">${sess.course}</span> ${fmtDate(sess.date)}` : ''}.</p>
      <div class="tabs"><button data-t="face" class="${ciTab === 'face' ? 'on' : ''}">Face</button><button data-t="finger" class="${ciTab === 'finger' ? 'on' : ''}">Fingerprint</button><button data-t="qr" class="${ciTab === 'qr' ? 'on' : ''}">Scan card</button><button data-t="no" class="${ciTab === 'no' ? 'on' : ''}">Licence number</button></div>
      <div class="grid g2e">
        <div class="panel" id="ciLeft"></div>
        <div class="panel"><h2>Result</h2><div id="ciRes"><p class="mute small">Waiting for a check.</p></div></div>
      </div>`;
  };
  function recordCheckin(p, method, score) {
    const sess = DB.sessions.filter(x => x.site === currentSite && x.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))[0];
    const up = live[currentSite] && live[currentSite].up && navigator.onLine !== false;
    DB.checkins.push({ cid: newId(), pid: p.id, site: currentSite, method, score, date: todayISO(), time: new Date().toTimeString().slice(0, 5), session: sess ? sess.id : null });
    if (!up && !Cloud.on) DB.queue++;
    changed(null); updateSync();
    return { sess, up };
  }
  function showResult(p, method, score, extra) {
    const { sess, up } = recordCheckin(p, method, score);
    const ok = p.status !== 'Suspended';
    $('#ciRes').innerHTML = `<div class="result ${ok ? 'ok' : 'bad'}">${avatar(p, 'thumb')}<div>
      <div class="big">${ok ? 'Verified' : 'Verified — licence suspended'}: ${esc(p.name)}</div>
      <div class="small mono">${p.id} · ${p.licence}</div>
      <div class="small">${extra || ''}</div>
      <div style="margin-top:4px">${p.classes.map(c => `<span class="tag">${c}</span>`).join('')}</div></div></div>
      <ul class="list small" style="margin-top:10px">
        <li><span>Attendance</span><span>${sess ? `Recorded for ${sess.id} (${sess.course})` : 'Recorded (no class booked here)'}</span></li>
        <li><span>Sync</span><span class="st ${up ? 'ok' : 'warn'}">${up ? 'Sent to Dili over site link' : 'Link down — queued on device'}</span></li>
      </ul>
      <div class="row" style="margin-top:10px"><a class="btn alt" href="#licence-${p.licence}">Open licence</a></div>`;
  }
  V.checkin.after = function () {
    document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { stopCamera(); ciTab = b.dataset.t; render(); });
    const L = $('#ciLeft');
    if (ciTab === 'face') {
      const n = DB.people.filter(p => p.face).length;
      L.innerHTML = `<h2>Take a picture to verify</h2><div id="camCi"></div>${n ? '' : '<p class="note" style="margin-top:10px">No one has a face on file yet. Register a trainee with a photo first.</p>'}`;
      cameraBox($('#camCi'), async (canvas, say) => {
        say('Checking…');
        if (!(await Face.load({ set textContent(t) { say(t); } }))) return;
        const r = await Face.describe(canvas);
        if (r.error) { say(r.error); $('#ciRes').innerHTML = `<div class="result bad"><div><div class="big">Not verified</div><div class="small">${esc(r.error)}</div></div></div>`; return; }
        const m = Face.match(r.descriptor);
        if (!m || m.d > Face.THRESH) {
          say('No match');
          $('#ciRes').innerHTML = `<div class="result bad"><div><div class="big">No match on the register</div><div class="small">Closest distance ${m ? m.d.toFixed(2) : '—'} (must be under ${Face.THRESH.toFixed(2)}). Check ID manually or register the person.</div></div></div>`;
          return;
        }
        say('Match found');
        showResult(m.p, 'Face', m.d.toFixed(2), `Face distance ${m.d.toFixed(2)} (limit ${Face.THRESH.toFixed(2)})`);
      }, 'Verify');
    } else if (ciTab === 'finger') {
      const n = DB.people.filter(p => p.cred).length;
      L.innerHTML = `<h2>Fingerprint on this device</h2><p class="small">The trainee touches the sensor. The device confirms the fingerprint and returns the key that was created at registration.</p>
        <p class="small mute">${n} trainee${n === 1 ? '' : 's'} with a fingerprint key on this device.</p>
        <button class="btn" id="fpGo" ${n ? '' : 'disabled'}>Scan fingerprint</button><div id="fpMsg" class="small" style="margin-top:10px"></div>`;
      $('#fpGo') && ($('#fpGo').onclick = async () => {
        $('#fpMsg').textContent = 'Waiting for sensor…';
        try {
          const p = await Finger.verify(DB.people);
          if (!p) { $('#fpMsg').textContent = 'Key not recognised on this register.'; return; }
          $('#fpMsg').textContent = '';
          showResult(p, 'Fingerprint', 'device', 'Fingerprint confirmed by device sensor');
        } catch (e) { $('#fpMsg').innerHTML = `<span class="st warn">${esc(fingerError(e))}</span>`; }
      });
    } else if (ciTab === 'qr') {
      L.innerHTML = `<h2>Scan the QR on a licence card</h2>
        <div class="cam" id="qrCam"><div class="empty">Camera is off</div><div class="qrframe" hidden></div><div class="msg" hidden></div></div>
        <div class="row" style="margin-top:10px"><button class="btn" id="qrStart">Start scanning</button></div>
        <p class="small mute" style="margin-top:8px">Works with the card on paper or on another phone's screen.</p>`;
      const cam = $('#qrCam'), msg = $('.msg', cam);
      const say = (t) => { msg.hidden = !t; msg.textContent = t || ''; };
      $('#qrStart').onclick = async () => {
        stopCamera();
        if (!window.jsQR) { say('QR reader did not load. Check the internet connection.'); return; }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        } catch (e) { $('.empty', cam).textContent = 'Camera not available here.'; return; }
        const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.setAttribute('playsinline', ''); v.srcObject = stream;
        v.style.transform = 'none';
        cam.querySelectorAll('video').forEach(n => n.remove()); cam.prepend(v); await v.play();
        $('.empty', cam).hidden = true; $('.qrframe', cam).hidden = false; $('#qrStart').hidden = true;
        say('Point at the QR code');
        const c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true });
        const loop = () => {
          if (!stream) return;
          if (v.readyState >= 2 && v.videoWidth) {
            const s = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
            c.width = Math.round(v.videoWidth * s); c.height = Math.round(v.videoHeight * s);
            g.drawImage(v, 0, 0, c.width, c.height);
            const code = jsQR(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: 'dontInvert' });
            if (code && code.data) {
              const m = code.data.split('#v-')[1];
              const d = m && decodePayload(m);
              if (!d) { say('That is not a SkillPass licence code'); }
              else {
                stopCamera(); $('#qrStart').hidden = false; $('#qrStart').textContent = 'Scan another'; $('.qrframe', cam).hidden = true;
                say('Code read');
                const p = DB.people.find(x => x.licence === d.licence);
                if (!d.intact) { $('#ciRes').innerHTML = '<div class="result bad"><div><div class="big">Code has been altered</div><div class="small">Do not accept this card.</div></div></div>'; return; }
                if (p) { showResult(p, 'Card QR', '—', 'Licence card scanned'); return; }
                $('#ciRes').innerHTML = `<div class="result ${d.status === 'Current' ? 'ok' : 'bad'}"><div class="avatar">${esc(initials(d.name))}</div><div>
                  <div class="big">${d.status === 'Current' ? 'Valid licence' : esc(d.status)}: ${esc(d.name)}</div><div class="small mono">${d.id} · ${d.licence}</div>
                  <div style="margin-top:4px">${d.classes.map(c => `<span class="tag">${c}</span>`).join('')}</div></div></div>
                  <p class="small mute" style="margin-top:8px">Not on this device's register — details read from the card.</p>
                  <a class="btn alt" href="#v-${m}">Open full licence check</a>`;
                return;
              }
            }
          }
          scanTimer = setTimeout(loop, 160);
        };
        loop();
      };
    } else {
      L.innerHTML = `<h2>Look up by licence or trainee no.</h2><form id="lnF" class="row"><input name="q" placeholder="TL-OHS-26-04410 or SP-10231" style="flex:1;min-width:200px"><button class="btn">Find</button></form>
        <p class="small mute" style="margin-top:8px">For when a camera or sensor is not available. Staff compare the photo on screen with the person.</p>`;
      $('#lnF').onsubmit = (e) => {
        e.preventDefault(); const q = new FormData(e.target).get('q').trim().toUpperCase();
        const p = DB.people.find(x => x.licence.toUpperCase() === q || x.id.toUpperCase() === q);
        if (!p) { $('#ciRes').innerHTML = '<div class="result bad"><div class="big">Not found</div></div>'; return; }
        showResult(p, 'Manual', '—', 'Manual check — compare photo with the person');
      };
    }
  };

  // Licences
  let licQ = '';
  V.licences = function () {
    const q = licQ.toLowerCase();
    const rows = DB.people.filter(p => !q || (p.name + p.licence + p.id + p.mun + p.employer + p.classes.join(' ')).toLowerCase().includes(q));
    return `<div class="spread"><div><h1>Licence register</h1><p class="lede">Every licence holder, their classes and status. Click a row for the licence card.</p></div></div>
      <div class="panel">
        <div class="spread" style="margin-bottom:10px"><input id="licQ" placeholder="Search name, licence no., class, municipality" value="${esc(licQ)}" style="flex:1;max-width:420px"><span class="small mute">${rows.length} of ${DB.people.length}</span></div>
        <table><tr><th></th><th>Name</th><th>Licence no.</th><th class="hide-m">Classes</th><th class="hide-m">Municipality</th><th>Status</th><th class="hide-m">ID</th></tr>
        ${rows.map(p => `<tr class="click" data-l="${p.licence}"><td style="width:52px">${avatar(p)}</td><td>${esc(p.name)}<div class="small mute">${esc(p.employer)}</div></td><td class="mono small">${p.licence}</td>
          <td class="hide-m">${p.classes.map(c => `<span class="tag">${c}</span>`).join('')}</td><td class="hide-m">${esc(p.mun)}</td>
          <td><span class="st ${p.status === 'Current' ? 'ok' : p.status === 'Suspended' ? 'bad' : 'warn'}">${p.status}</span></td>
          <td class="small hide-m">${p.face ? 'Face' : ''}${p.face && p.cred ? ' · ' : ''}${p.cred ? 'Finger' : ''}${!p.face && !p.cred ? '<span class="mute">—</span>' : ''}</td></tr>`).join('')}
        </table>
        <div class="note" style="margin-top:14px">${Cloud.on ? 'This register is shared: every phone and laptop using the link sees the same trainees and check-ins. <span id="cloudMini" class="cloudmini"></span>' : 'Records are saved in this browser on this device. To move them to another phone or laptop, use <b>Back up</b> here and <b>Restore</b> there.'}</div>
        <div class="row" style="margin-top:10px"><button class="btn alt" id="backup">Back up register</button>
          <label class="btn alt" style="display:inline-block">Restore from backup<input type="file" accept=".json,application/json" hidden id="restore"></label>
          <button class="btn alt" id="resetDemo">Reset demo data</button></div>
      </div>`;
  };
  V.licences.after = function () {
    const i = $('#licQ'); i.oninput = () => { licQ = i.value; const pos = i.selectionStart; render(); const j = $('#licQ'); j.focus(); j.setSelectionRange(pos, pos); };
    document.querySelectorAll('tr[data-l]').forEach(r => r.onclick = () => (location.hash = 'licence-' + r.dataset.l));
    $('#backup').onclick = () => {
      const blob = new Blob([JSON.stringify(DB)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'skillpass-register-' + todayISO() + '.json'; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast('Backup file downloaded.');
    };
    $('#restore').onchange = (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      f.text().then(t => {
        const data = JSON.parse(t);
        if (!data || !Array.isArray(data.people)) throw new Error('bad');
        let added = 0;
        data.people.forEach(p => {
          const i = DB.people.findIndex(x => x.id === p.id);
          if (i < 0) { DB.people.push(p); added++; } else if (p.face && !DB.people[i].face) { DB.people[i] = p; added++; }
        });
        const seen = new Set(DB.checkins.map(c => c.pid + c.date + c.time));
        (data.checkins || []).forEach(c => { if (!seen.has(c.pid + c.date + c.time)) DB.checkins.push(c); });
        DB.people.forEach(p => p._dirty = true); changed(null); render(); toast(`Restored. ${added} trainee record${added === 1 ? '' : 's'} added or updated.`);
      }).catch(() => toast('That file is not a SkillPass backup.'));
      e.target.value = '';
    };
    $('#resetDemo').onclick = () => {
      modal(`<h2>Reset demo data?</h2><p class="small">Removes everyone you registered and all check-ins on this device.</p><div class="row"><button class="btn alt" id="rNo">Keep</button><button class="btn or" id="rYes">Reset</button></div>`);
      $('#rNo').onclick = closeModal; $('#rYes').onclick = () => { DB = seed(); store.save(); closeModal(); updateSync(); render(); toast('Demo data reset.'); };
    };
  };

  // ---------- QR payload: the licence details travel inside the QR, so any phone can read them ----------
  const b64e = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); };
  const ST = { 'Current': 'C', 'Pending assessment': 'P', 'Suspended': 'S' };
  const STR = { C: 'Current', P: 'Pending assessment', S: 'Suspended' };
  function sum(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return (h % 46656).toString(36); }
  function payloadFor(p) {
    const body = [p.licence, p.id, p.name, p.dob || '', p.mun || '', p.classes.join('.'), p.issued, ST[p.status] || 'P'].join('|');
    return b64e(body + '|' + sum(body));
  }
  function decodePayload(s) {
    try {
      const parts = b64d(s).split('|'); if (parts.length !== 9) return null;
      const chk = parts.pop(); const ok = sum(parts.join('|')) === chk;
      const [licence, id, name, dob, mun, cls, issued, st] = parts;
      return { licence, id, name, dob, mun, classes: cls ? cls.split('.') : [], issued, status: STR[st] || 'Pending assessment', photo: null, intact: ok };
    } catch (e) { return null; }
  }
  const verifyUrl = (p) => location.origin + location.pathname + '#v-' + payloadFor(p);
  function qrSvg(text) {
    try { const q = qrcode(0, 'L'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { return ''; }
  }

  const GUILLOCHE = (function () {
    let paths = '';
    for (let k = 0; k < 9; k++) {
      let d = '';
      for (let x = 0; x <= 400; x += 4) {
        const y = 60 + k * 9 + Math.sin(x / 26 + k * 0.7) * 14 + Math.sin(x / 9 + k) * 2;
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      paths += `<path d="${d}" fill="none" stroke="%231f4d3a" stroke-opacity=".07" stroke-width=".8"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">${paths.replace(/%23/g, '#')}</svg>`;
    return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
  })();

  function licenceCard(p, opts) {
    opts = opts || {};
    const qr = qrSvg(verifyUrl(p));
    const stCls = p.status === 'Current' ? 'ok' : p.status === 'Suspended' ? 'bad' : 'warn';
    return `<div class="lflip" id="lflip" title="Tap to turn the card over">
      <div class="lin">
        <div class="lface front" style="background-image:${GUILLOCHE}">
          <div class="ltop">
            <div class="lbrand"><svg viewBox="0 0 32 32" width="18" height="18"><path d="M7 22 L13 10 L19 22 Z" fill="currentColor"/><rect x="20" y="15" width="5" height="7" fill="currentColor"/></svg><span>SkillPass&nbsp;TL</span></div>
            <span class="lpill ${stCls}">${esc(p.status)}</span>
          </div>
          <div class="lmain">
            ${p.photo ? `<img class="lph" src="${p.photo}" alt="">` : `<div class="lph lini">${esc(initials(p.name))}</div>`}
            <div class="linfo">
              <div class="lkind">Operator licence · High-risk work</div>
              <div class="lname">${esc(p.name)}</div>
              <div class="lno">${p.licence}</div>
              <div class="lmeta">
                <div><span>Born</span>${p.dob ? fmtDate(p.dob) : '—'}</div>
                <div><span>Issued</span>${fmtDate(p.issued)}</div>
                <div><span>Expires</span>${fmtDate(expiry(p.issued))}</div>
              </div>
            </div>
          </div>
          <div class="lclasses">${p.classes.map(c => `<span>${c}</span>`).join('')}</div>
          <div class="ltais"></div>
        </div>
        <div class="lface back">
          <div class="lqr">${qr}</div>
          <div class="lback-info">
            <div class="lkind light">Licensed classes</div>
            <ul>${p.classes.map(c => `<li><b>${c}</b>${esc(CLASSES[c])}</li>`).join('')}</ul>
          </div>
          <div class="lbfoot"><span>Trainee ${p.id}</span><span>Valid until ${fmtDate(expiry(p.issued))}</span></div>
          <div class="lfine">Scan the code to check this licence is current.</div>
          <div class="ltais"></div>
        </div>
      </div>
    </div>
    ${opts.noHint ? '' : '<div class="row small mute" style="justify-content:center;margin-top:8px">Tap the card to turn it over</div>'}`;
  }

  function bindFlip() {
    const fl = $('#lflip'); if (!fl) return;
    fl.onclick = () => {
      const lin = $('.lin', fl); if (lin.classList.contains('turning')) return;
      lin.classList.add('turning');
      setTimeout(() => { fl.classList.toggle('flipped'); lin.classList.remove('turning'); }, 170);
    };
  }
  let justRegistered = null;
  function openLicence(no) {
    const p = DB.people.find(x => x.licence === no);
    if (!p) { modal('<h2>Licence not found</h2><p class="small">This number is not on the register on this device.</p>'); return; }
    const hist = DB.checkins.filter(c => c.pid === p.id).slice(-5).reverse();
    const fresh = justRegistered === no; justRegistered = null;
    modal(`${fresh ? '<div class="regok"><b>Registered and saved.</b> Scan the QR code below with any other phone to see this licence.</div>' : ''}
      ${licenceCard(p)}
      ${p.status === 'Pending assessment' ? '<div class="pendbar"><span>Assessment not yet recorded — the QR will show “not yet licensed”.</span><button class="btn" id="passIt">Record assessment passed</button></div>' : ''}
      <div class="bigqr"><div class="bigqr-code">${qrSvg(verifyUrl(p))}</div>
        <div><b>Scan to verify</b><p class="small">Point any phone camera at this code. It opens the licence details on that phone — no app needed.</p>
        <button class="btn alt" id="copyLink">Copy verify link</button></div></div>
      <h2 style="margin-top:16px">Classes</h2><ul class="list small">${p.classes.map(c => `<li><span><span class="tag">${c}</span> ${esc(CLASSES[c])}</span><span class="mute">${p.status === 'Pending assessment' ? 'Assessment pending' : 'Competent'}</span></li>`).join('')}</ul>
      <h2 style="margin-top:12px">Recent check-ins</h2>${hist.length ? `<ul class="list small">${hist.map(c => `<li><span>${fmtDate(c.date)} ${c.time} · ${esc(site(c.site).name.split(' — ')[0])}</span><span>${c.method}</span></li>`).join('')}</ul>` : '<p class="small mute">None yet.</p>'}
`);
    bindFlip();
    const cl = $('#copyLink'); if (cl) cl.onclick = () => { navigator.clipboard.writeText(verifyUrl(p)).then(() => toast('Link copied.'), () => toast('Could not copy on this device.')); };
    const b = $('#passIt'); if (b) b.onclick = () => { const q = DB.people.find(x => x.licence === no) || p; q.status = 'Current'; changed(q); openLicence(no); render(); toast('Licence is now current. The QR code has been updated.'); };
  }

  // Public verify page (opened from a scanned QR)
  let verifyData = null, verifyLive = null;
  V.verify = function () {
    const d = verifyData;
    if (!d) return `<h1>Verify a licence</h1><div class="result bad"><div><div class="big">This QR code could not be read</div><div class="small">It may be damaged or not a SkillPass code.</div></div></div>`;
    const local = (verifyLive && verifyLive.licence === d.licence) ? verifyLive : DB.people.find(x => x.licence === d.licence);
    const p = local ? Object.assign({}, d, { photo: local.photo, status: local.status, classes: local.classes }) : d;
    const ok = d.intact && p.status === 'Current';
    const cls = !d.intact ? 'bad' : p.status === 'Current' ? 'ok' : p.status === 'Suspended' ? 'bad' : 'warn';
    const head = !d.intact ? 'Code has been altered — do not accept' : p.status === 'Current' ? 'Valid licence' : p.status === 'Suspended' ? 'Licence suspended — not allowed on site' : 'Not yet licensed — assessment pending';
    return `<h1>Licence check</h1>
      <div class="vbanner ${cls}"><div class="vicon">${ok ? '✓' : '!'}</div><div><div class="big">${head}</div><div class="small">${esc(p.name)} · ${p.licence}</div></div></div>
      <div style="margin:18px 0">${licenceCard(p)}</div>
      <div class="panel"><h2>May operate</h2>
        <ul class="list">${p.classes.map(c => `<li><span><span class="tag">${c}</span> ${esc(CLASSES[c] || c)}</span><span class="st ${ok ? 'ok' : 'warn'}">${ok ? 'Yes' : 'No'}</span></li>`).join('')}</ul>
        <ul class="list small" style="margin-top:8px">
          <li><span>Trainee no.</span><span class="mono">${p.id}</span></li>
          <li><span>Municipality</span><span>${esc(p.mun || '—')}</span></li>
          <li><span>Valid until</span><span>${fmtDate(expiry(p.issued))}</span></li>
        </ul>
        <p class="small mute" style="margin-top:10px">${verifyLive && verifyLive.licence === d.licence ? 'Checked live against the cloud register just now.' : local ? 'Matched to the register on this device.' : Cloud.on ? 'Checking the cloud register…' : 'Details read from the code on the card. With the cloud register switched on, this check is made live and also returns the photo.'}</p>
      </div>`;
  };
  V.verify.after = function () { bindFlip(); };

  // Classes
  V.classes = function () {
    const rows = DB.sessions.slice().sort((a, b) => a.date.localeCompare(b.date));
    return `<h1>Classes</h1><p class="lede">Theory can be taught live from Dili to several sites at once over the site link; practical work and assessment stay on site. Sites with weak links get a recorded offline pack.</p>
      <div class="panel"><table><tr><th>Date</th><th>Course</th><th>Site</th><th class="hide-m">Delivery</th><th class="hide-m">Trainer</th><th>Seats</th><th></th></tr>
      ${rows.map(s => `<tr><td class="mono small">${fmtDate(s.date)}</td><td><span class="tag">${s.course}</span> <span class="hide-m">${esc(CLASSES[s.course])}</span></td><td>${esc(site(s.site).name.split(' — ')[0])}</td>
        <td class="hide-m small">${esc(s.mode)}</td><td class="hide-m small">${s.trainer}</td>
        <td><div class="mono small">${s.booked}/${s.seats}</div><div class="bar"><i class="${s.booked >= s.seats ? 'hi' : ''}" style="width:${Math.min(100, s.booked / s.seats * 100)}%"></i></div></td>
        <td><button class="btn alt" data-book="${s.id}" ${s.booked >= s.seats ? 'disabled' : ''}>Book</button></td></tr>`).join('')}
      </table></div>`;
  };
  V.classes.after = function () {
    document.querySelectorAll('[data-book]').forEach(b => b.onclick = () => {
      const s = DB.sessions.find(x => x.id === b.dataset.book);
      modal(`<h2>Book ${s.course} · ${fmtDate(s.date)}</h2><p class="small">${esc(site(s.site).name)}</p>
        <label class="small">Trainee<br><select id="bookWho" style="width:100%">${DB.people.map(p => `<option value="${p.id}">${esc(p.name)} — ${p.id}</option>`).join('')}</select></label>
        <div class="row" style="margin-top:14px"><button class="btn" id="bookGo">Confirm booking</button></div>`);
      $('#bookGo').onclick = () => { s.booked++; store.save(); closeModal(); render(); toast('Seat booked. SMS confirmation queued.'); };
    });
  };

  // Sites
  V.sites = function () {
    return `<h1>Sites &amp; links</h1><p class="lede">Each training site has its own internet link — mostly low-earth-orbit satellite outside Dili. The register, check-ins, exam results and live theory all depend on it, so link health sits next to the training data.</p>
      <div class="panel"><table><tr><th>Site</th><th class="hide-m">Link</th><th>Status</th><th>Latency</th><th class="hide-m">Down</th><th class="hide-m">Data this month</th><th class="hide-m">Last sync</th></tr>
      ${SITES.map(s => { const L = live[s.id]; const pct = s.used / s.plan * 100; return `<tr><td>${esc(s.name)}<div class="small mute">${esc(s.mun)}</div></td><td class="hide-m small">${esc(s.link)}</td>
        <td><span class="st ${L.up ? (L.lat > 50 ? 'warn' : 'ok') : 'bad'}">${L.up ? 'Online' : 'Down'}</span></td><td class="mono small">${L.up ? L.lat + ' ms' : '—'}</td>
        <td class="mono small hide-m">${L.up ? L.dl + ' Mbps' : '—'}</td>
        <td class="hide-m"><div class="small mono">${s.used} / ${s.plan} GB</div><div class="bar"><i class="${pct > 85 ? 'hi' : ''}" style="width:${pct}%"></i></div></td>
        <td class="small hide-m">${L.sync}</td></tr>`; }).join('')}
      </table></div>
      <div class="grid g3" style="margin-top:16px">
        <div class="panel"><h2>When a link drops</h2><p class="small">Check-ins and results are kept on the site device and sent when the link returns. The header shows how many are waiting.</p></div>
        <div class="panel"><h2>Live theory</h2><p class="small">One trainer in Dili teaches up to four sites at a time. Sites with under 30 Mbps get the recorded pack instead.</p></div>
        <div class="panel"><h2>Data plans</h2><p class="small">Sites above 85% of their monthly data are flagged so the plan can be raised before exam week.</p></div>
      </div>`;
  };

  // ---------- router ----------
  const TITLES = { verify: 'Licence check', overview: 'Overview', register: 'Register trainee', checkin: 'Check-in & verify', licences: 'Licence register', classes: 'Classes', sites: 'Sites & links' };
  function render() {
    $('#view').innerHTML = V[route]();
    if (V[route].after) V[route].after();
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === route));
    $('#crumbs').textContent = TITLES[route];
  }
  function onHash() {
    const h = (location.hash || '#overview').slice(1);
    stopCamera();
    if (h.startsWith('v-')) {
      if (!$('#modal').hidden) { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }
      verifyData = decodePayload(h.slice(2)); verifyLive = null; route = 'verify'; render(); window.scrollTo(0, 0);
      if (verifyData && verifyData.intact && Cloud.on) {
        const lic = verifyData.licence;
        Cloud.findLicence(lic).then(r => { if (r && verifyData && verifyData.licence === lic && route === 'verify') { verifyLive = r; render(); } }).catch(() => {});
      }
      return;
    }
    if (h.startsWith('licence-')) {
      if (route !== 'licences') { route = 'licences'; render(); }
      openLicence(h.slice(8));
      return;
    }
    if (!$('#modal').hidden) closeModal();
    route = V[h] ? h : 'overview';
    render(); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', onHash);
  updateSync();
  onHash();
  if (Cloud.on) { Cloud.sync(); setInterval(() => { if (document.visibilityState === 'visible') Cloud.sync(); }, 20000); }
})();
