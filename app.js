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
    save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('Could not save on this device (storage full or blocked).'); } }
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
    $('#sync .dot').className = 'dot' + (on ? '' : ' off');
    $('#syncText').textContent = on ? (DB.queue ? `Online · ${DB.queue} to sync` : 'Online · all records synced') : `Offline · ${DB.queue} queued`;
  }
  window.addEventListener('online', () => { DB.queue = 0; store.save(); updateSync(); toast('Connection back. Queued records synced.'); });
  window.addEventListener('offline', updateSync);

  // ---------- header ----------
  const siteSel = $('#siteSel');
  siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  siteSel.value = currentSite;
  siteSel.onchange = () => { currentSite = siteSel.value; try { localStorage.setItem('skillpass.site', currentSite); } catch (e) {} render(); };
  setInterval(() => { $('#clock').textContent = new Date().toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' TLT'; }, 1000);

  // ---------- face engine ----------
  const Face = {
    ready: false, loading: null,
    async load(statusEl) {
      if (this.ready) return true;
      if (!window.faceapi) { if (statusEl) statusEl.textContent = 'Face library did not load.'; return false; }
      if (!this.loading) {
        this.loading = (async () => {
          const base = 'models';
          await faceapi.nets.tinyFaceDetector.loadFromUri(base);
          await faceapi.nets.faceLandmark68TinyNet.loadFromUri(base);
          await faceapi.nets.faceRecognitionNet.loadFromUri(base);
          this.ready = true;
        })();
      }
      if (statusEl) statusEl.textContent = 'Loading face models (first time only, ~7 MB)…';
      try { await this.loading; return true; } catch (e) { console.error(e); this.loading = null; if (statusEl) statusEl.textContent = 'Could not load face models.'; return false; }
    },
    async describe(input) {
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.45 });
      const all = await faceapi.detectAllFaces(input, opts);
      if (all.length === 0) return { error: 'No face found. Face the camera in good light and try again.' };
      if (all.length > 1) return { error: 'More than one face in the picture. Only the trainee should be in frame.' };
      const r = await faceapi.detectSingleFace(input, opts).withFaceLandmarks(true).withFaceDescriptor();
      if (!r) return { error: 'Face found but could not be read clearly. Try again.' };
      return { descriptor: Array.from(r.descriptor), score: r.detection.score, box: r.detection.box };
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

  // ---------- camera widget ----------
  let stream = null;
  function stopCamera() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }

  /* Renders a capture box into el. Calls onShot(canvas) with the captured frame. */
  function cameraBox(el, onShot, label) {
    el.innerHTML = `
      <div class="cam"><div class="empty" data-empty>Camera is off.</div><div class="guide" hidden></div><div class="msg" data-msg hidden></div></div>
      <div class="row" style="margin-top:10px">
        <button class="btn" data-start>Open camera</button>
        <button class="btn or" data-snap hidden>${esc(label || 'Take picture')}</button>
        <label class="btn alt" style="display:inline-block">Use a photo<input type="file" accept="image/*" capture="user" hidden data-file></label>
      </div>`;
    const cam = $('.cam', el), msg = $('[data-msg]', el), empty = $('[data-empty]', el);
    const say = (t) => { msg.hidden = !t; msg.textContent = t || ''; };
    $('[data-start]', el).onclick = async () => {
      stopCamera();
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nocam');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.srcObject = stream;
        cam.querySelectorAll('video,canvas,img').forEach(n => n.remove());
        cam.prepend(v); await v.play();
        empty.hidden = true; $('.guide', el).hidden = false;
        $('[data-snap]', el).hidden = false; $('[data-start]', el).hidden = true;
        say('Keep the face inside the oval');
        Face.load(); // warm up in background
      } catch (e) {
        empty.textContent = 'Camera not available here. Use “Use a photo” instead — on a phone it opens the camera.';
      }
    };
    $('[data-snap]', el).onclick = () => {
      const v = $('video', cam); if (!v) return;
      const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext('2d'); ctx.translate(c.width, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0);
      stopCamera(); v.remove(); cam.prepend(c); $('.guide', el).hidden = true;
      $('[data-snap]', el).hidden = true; $('[data-start]', el).hidden = false; $('[data-start]', el).textContent = 'Retake';
      onShot(c, say);
    };
    $('[data-file]', el).onchange = (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        stopCamera(); cam.querySelectorAll('video,canvas,img').forEach(n => n.remove()); cam.prepend(c);
        empty.hidden = true; $('.guide', el).hidden = true; $('[data-snap]', el).hidden = true;
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
      sx = Math.max(0, cx - sw / 2); sy = Math.max(0, cy - sh / 2 - box.height * 0.08);
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
        say('Face captured · detection ' + Math.round(r.score * 100) + '%');
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
        DB.people.unshift(p); if (navigator.onLine === false) DB.queue++; store.save(); updateSync();
        reg = null; toast(`${p.name} registered (${p.id}).`);
        location.hash = 'licence-' + p.licence;
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
      <div class="tabs"><button data-t="face" class="${ciTab === 'face' ? 'on' : ''}">Face</button><button data-t="finger" class="${ciTab === 'finger' ? 'on' : ''}">Fingerprint</button><button data-t="no" class="${ciTab === 'no' ? 'on' : ''}">Licence number</button></div>
      <div class="grid g2e">
        <div class="panel" id="ciLeft"></div>
        <div class="panel"><h2>Result</h2><div id="ciRes"><p class="mute small">Waiting for a check.</p></div></div>
      </div>`;
  };
  function recordCheckin(p, method, score) {
    const sess = DB.sessions.filter(x => x.site === currentSite && x.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))[0];
    const up = live[currentSite] && live[currentSite].up && navigator.onLine !== false;
    DB.checkins.push({ pid: p.id, site: currentSite, method, score, date: todayISO(), time: new Date().toTimeString().slice(0, 5), session: sess ? sess.id : null });
    if (!up) DB.queue++;
    store.save(); updateSync();
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
        <div class="row" style="margin-top:14px"><button class="btn alt" id="resetDemo">Reset demo data</button></div>
      </div>`;
  };
  V.licences.after = function () {
    const i = $('#licQ'); i.oninput = () => { licQ = i.value; const pos = i.selectionStart; render(); const j = $('#licQ'); j.focus(); j.setSelectionRange(pos, pos); };
    document.querySelectorAll('tr[data-l]').forEach(r => r.onclick = () => (location.hash = 'licence-' + r.dataset.l));
    $('#resetDemo').onclick = () => {
      modal(`<h2>Reset demo data?</h2><p class="small">Removes everyone you registered and all check-ins on this device.</p><div class="row"><button class="btn alt" id="rNo">Keep</button><button class="btn or" id="rYes">Reset</button></div>`);
      $('#rNo').onclick = closeModal; $('#rYes').onclick = () => { DB = seed(); store.save(); closeModal(); updateSync(); render(); toast('Demo data reset.'); };
    };
  };

  function licenceCard(p) {
    let qr = '';
    try { const q = qrcode(0, 'M'); q.addData(location.href.split('#')[0] + '#licence-' + p.licence); q.make(); qr = q.createSvgTag({ cellSize: 3, margin: 0, scalable: true }); } catch (e) { qr = ''; }
    return `<div class="lcard">
      <div class="hd"><b>OHS OPERATOR LICENCE</b><span class="mono small">${p.licence}</span></div>
      <div class="bd">
        ${p.photo ? `<img class="ph" src="${p.photo}" alt="">` : `<div class="ph">${esc(initials(p.name))}</div>`}
        <dl><dt>Name</dt><dd><b>${esc(p.name)}</b></dd><dt>Born</dt><dd>${p.dob ? fmtDate(p.dob) : '—'}</dd><dt>Trainee</dt><dd class="mono">${p.id}</dd>
          <dt>Issued</dt><dd>${fmtDate(p.issued)}</dd><dt>Expires</dt><dd>${fmtDate(expiry(p.issued))}</dd>
          <dt>Classes</dt><dd>${p.classes.map(c => `<span class="tag" title="${esc(CLASSES[c])}">${c}</span>`).join('')}</dd></dl>
        <div class="qr" style="width:92px">${qr}</div>
      </div>
      <div class="ft"><span>Status: <b>${p.status}</b></span><span>Scan to verify</span></div>
    </div>`;
  }
  function openLicence(no) {
    const p = DB.people.find(x => x.licence === no);
    if (!p) { modal('<h2>Licence not found</h2><p class="small">This number is not on the register on this device.</p>'); return; }
    const hist = DB.checkins.filter(c => c.pid === p.id).slice(-5).reverse();
    modal(`${licenceCard(p)}
      <h2 style="margin-top:16px">Classes</h2><ul class="list small">${p.classes.map(c => `<li><span><span class="tag">${c}</span> ${esc(CLASSES[c])}</span><span class="mute">${p.status === 'Pending assessment' ? 'Assessment pending' : 'Competent'}</span></li>`).join('')}</ul>
      <h2 style="margin-top:12px">Recent check-ins</h2>${hist.length ? `<ul class="list small">${hist.map(c => `<li><span>${fmtDate(c.date)} ${c.time} · ${esc(site(c.site).name.split(' — ')[0])}</span><span>${c.method}</span></li>`).join('')}</ul>` : '<p class="small mute">None yet.</p>'}
      ${p.status === 'Pending assessment' ? '<div class="row" style="margin-top:12px"><button class="btn" id="passIt">Record assessment passed</button></div>' : ''}`);
    const b = $('#passIt'); if (b) b.onclick = () => { p.status = 'Current'; store.save(); openLicence(no); render(); toast('Licence now current.'); };
  }

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
  const TITLES = { overview: 'Overview', register: 'Register trainee', checkin: 'Check-in & verify', licences: 'Licence register', classes: 'Classes', sites: 'Sites & links' };
  function render() {
    $('#view').innerHTML = V[route]();
    if (V[route].after) V[route].after();
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === route));
    $('#crumbs').textContent = TITLES[route];
  }
  function onHash() {
    const h = (location.hash || '#overview').slice(1);
    stopCamera();
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
})();
