/* ════════════════════════════════════════════════════════════════════
   AAGAM ACADEMY — app.js · vanilla, dependency-free
   Analytics flag: flip to true ONLY after adding consent copy (cookie box).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ANALYTICS_ENABLED = false; // [PLACEHOLDER] keep false until analytics + consent ship
  var WA = '919876543210';       // [PLACEHOLDER] client WhatsApp number
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(pointer: fine)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function inr(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  /* ── toast ─────────────────────────────────────────── */
  function toast(msg) {
    var box = $('#toasts');
    var t = document.createElement('p');
    t.className = 'toast';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, 3400);
  }

  /* ── theme ─────────────────────────────────────────── */
  (function theme() {
    var saved = null;
    try { saved = localStorage.getItem('aa-theme'); } catch (e) {}
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
    var btn = $('#theme-toggle');
    function sync() { btn.setAttribute('aria-pressed', String(document.documentElement.getAttribute('data-theme') === 'light')); }
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('aa-theme', next); } catch (e) {}
      sync();
    });
    sync();
  })();

  /* ── entry gate ────────────────────────────────────── */
  (function gate() {
    var g = $('#gate');
    var seen = false;
    try { seen = !!sessionStorage.getItem('aa-gate'); } catch (e) { seen = true; }
    if (REDUCED || seen) { g.remove(); return; }
    g.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { g.classList.add('is-ready'); });
    function enter() {
      g.classList.add('is-exit');
      document.body.style.overflow = '';
      try { sessionStorage.setItem('aa-gate', '1'); } catch (e) {}
      setTimeout(function () { g.remove(); }, 750);
    }
    $('#gate-enter').addEventListener('click', enter);
    $('#gate-skip').addEventListener('click', enter);
    g.addEventListener('keydown', function (e) { if (e.key === 'Escape') enter(); });
  })();

  /* ── header hide/show + active section ─────────────── */
  (function head() {
    var h = $('#site-head'), last = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 480 && y > last + 4) h.classList.add('is-hide');
      else if (y < last - 4 || y < 200) h.classList.remove('is-hide');
      last = y;
      $('#to-top').hidden = y < 700;
    }, { passive: true });
    $('#to-top').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); });

    var links = $$('.main-nav a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); });
          var a = map[en.target.id];
          if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['courses', 'results', 'method', 'faculty', 'fees', 'faq'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  })();

  /* ── drawer ────────────────────────────────────────── */
  (function drawer() {
    var d = $('#drawer'), s = $('#scrim'), b = $('#burger');
    function set(open) {
      d.hidden = false;
      requestAnimationFrame(function () { d.classList.toggle('is-open', open); });
      s.hidden = !open;
      b.setAttribute('aria-expanded', String(open));
      b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (!open) setTimeout(function () { if (!d.classList.contains('is-open')) d.hidden = true; }, 400);
    }
    b.addEventListener('click', function () { set(!d.classList.contains('is-open')); });
    s.addEventListener('click', function () { set(false); });
    $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('is-open')) set(false); });
  })();

  /* ── reveal on scroll (called last, after all injections) ── */
  function initReveal() {
    if (REDUCED) { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.18 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ── count-up stats ────────────────────────────────── */
  (function counters() {
    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (REDUCED) { el.textContent = target.toLocaleString('en-IN'); return; }
      var t0 = null, dur = 1300;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { io.observe(el); });
  })();

  /* ── hero orb: hand-rolled 3D point sphere (canvas 2D) ─ */
  (function orb() {
    var c = $('#orb');
    if (!c) return;
    var ctx = c.getContext('2d');
    var W, H, DPR, pts = [], ry = 0, t = 0, px = 0, py = 0, visible = true, raf = null;

    function size() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * DPR; c.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }
    function build() {
      var n = W < 700 ? 300 : 720;
      var R = Math.min(W, H) * 0.34;
      pts = [];
      var golden = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2;
        var rad = Math.sqrt(1 - y * y);
        var th = golden * i;
        pts.push({
          x: Math.cos(th) * rad * R,
          y: y * R,
          z: Math.sin(th) * rad * R,
          a: i % 13 === 0
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.5, cy = H * 0.46;
      var cosY = Math.cos(ry), sinY = Math.sin(ry);
      var tilt = 0.32 + py * 0.22, cosX = Math.cos(tilt), sinX = Math.sin(tilt);
      var fov = 900;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x1 = p.x * cosY - p.z * sinY;
        var z1 = p.x * sinY + p.z * cosY;
        var y1 = p.y * cosX - z1 * sinX;
        var z2 = p.y * sinX + z1 * cosX;
        var s = fov / (fov + z2);
        var X = cx + x1 * s + px * 26;
        var Y = cy + y1 * s + py * 18;
        var depth = (z2 / (Math.min(W, H) * 0.34) + 1) / 2; // 0 near … 1 far
        var alpha = 0.85 - depth * 0.68;
        var r = (1 - depth) * 2.1 + 0.5;
        ctx.beginPath();
        ctx.fillStyle = p.a
          ? 'rgba(200,245,66,' + alpha.toFixed(3) + ')'
          : 'rgba(242,239,230,' + (alpha * 0.62).toFixed(3) + ')';
        ctx.arc(X, Y, r, 0, 6.2832);
        ctx.fill();
      }
    }
    function loop() {
      ry += 0.0017; t++;
      draw();
      raf = requestAnimationFrame(loop);
    }
    size();
    window.addEventListener('resize', function () { size(); if (REDUCED) draw(); });
    if (REDUCED) { ry = 0.8; draw(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        visible = en.isIntersecting;
        if (visible && !raf && !document.hidden) raf = requestAnimationFrame(loop);
        else if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 }).observe(c);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
      else if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop);
    });
    if (FINE) {
      $('.hero').addEventListener('pointermove', function (e) {
        px = (e.clientX / W - 0.5) * 2;
        py = (e.clientY / H - 0.5) * 2;
      });
    }
    raf = requestAnimationFrame(loop);
  })();

  /* ── hero card parallax ────────────────────────────── */
  (function parallax() {
    if (REDUCED) return;
    var cards = $$('[data-parallax]');
    if (!cards.length) return;
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        cards.forEach(function (el) {
          var f = parseFloat(el.getAttribute('data-parallax'));
          var base = el.classList.contains('hero-card-a') ? 5 : -6;
          el.style.transform = 'rotate(' + base + 'deg) translateY(' + (y * f) + 'px)';
        });
        tick = false;
      });
    }, { passive: true });
  })();

  /* ── magnetic CTA ──────────────────────────────────── */
  (function magnet() {
    if (REDUCED || !FINE) return;
    var zone = $('#magnet-zone');
    if (!zone) return;
    var m = $('.magnet', zone);
    zone.addEventListener('pointermove', function (e) {
      var r = m.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      m.style.transform = 'translate(' + dx * 0.12 + 'px,' + dy * 0.18 + 'px)';
    });
    zone.addEventListener('pointerleave', function () { m.style.transform = ''; });
  })();

  /* ══ DATA [SAMPLE] ══════════════════════════════════ */
  var COURSES = [
    { id: 'jee2', cat: 'jee', tags: ['JEE', 'XI–XII'], name: 'JEE Main + Advanced — 2-Year',
      blurb: 'Concept-first Physics, Chemistry, Maths with weekly full-syllabus mocks from day one.',
      meta: ['≤24 BATCH', '3 LECTURES/WK', 'WEEKLY MOCK'], price: 'from ₹6,500/mo',
      img: 'images/study-desk.jpg', alt: 'Student working through a problem set at a library desk',
      feats: ['Chapter diagnostics every 6 weeks', 'Previous-year paper marathon each December', 'Rank-boosters: 1-on-1 analysis after every mock'] },
    { id: 'neet2', cat: 'neet', tags: ['NEET', 'XI–XII'], name: 'NEET (UG) — 2-Year',
      blurb: 'NCERT line-by-line for Biology, problem volume for Physics & Chemistry, assertion-reason drills.',
      meta: ['≤24 BATCH', '3 LECTURES/WK', 'WEEKLY MOCK'], price: 'from ₹6,500/mo',
      img: 'images/study-table.jpg', alt: 'Young woman reading a textbook at a university library desk',
      feats: ['NCERT line-by-line revision sheets', 'Diagram practice for Biology every Friday', 'Full-length NTA-pattern mocks on Sundays'] },
    { id: 'boards', cat: 'boards', tags: ['BOARDS', 'XI–XII'], name: 'Boards Science — CBSE / MP',
      blurb: 'Score-first prep: answer-writing practice, board-pattern tests and boardpaper post-mortems.',
      meta: ['≤24 BATCH', '2 LECTURES/WK', 'MONTHLY MOCK'], price: 'from ₹4,500/mo',
      img: 'images/classroom-desks.jpg', alt: 'Students in uniform writing at classroom desks',
      feats: ['Answer-sheet evaluation with board marking schemes', 'Derivation & diagram notebooks checked weekly', 'Pre-boards in Dec & Feb under exam conditions'] },
    { id: 'found', cat: 'foundation', tags: ['FOUNDATION', 'VIII–X'], name: 'Foundation VIII–X',
      blurb: 'Maths & Science that build intuition early — Olympiad flavour, school-marks results.',
      meta: ['≤20 BATCH', '2 CLASSES/WK', 'FORTNIGHTLY TEST'], price: 'from ₹3,500/mo',
      img: 'images/hero-classroom.jpg', alt: 'Two schoolboys solving a notebook problem together at a red desk',
      feats: ['Mental-maths & estimation warm-ups', 'Science through experiments, not definitions', 'Early NTSE / Olympiad exposure in class IX'] },
    { id: 'xboost', cat: 'boards foundation', tags: ['BOARDS', 'X'], name: 'Class X Board Intensive',
      blurb: 'A one-year sprint for X: weekly tests, sample-paper marathons and a maths score guarantee plan.',
      meta: ['≤24 BATCH', '3 CLASSES/WK', 'WEEKLY TEST'], price: 'from ₹3,800/mo',
      img: 'images/teen-group.jpg', alt: 'Five teenage students in uniform smiling together outdoors',
      feats: ['10 sample papers solved & reviewed pre-boards', 'Formula-retention sprints before every test', 'Parent progress ping every Monday'] },
    { id: 'crash', cat: 'jee neet', tags: ['CRASH', '45 DAYS'], name: 'Crash ’45 — Post-Boards Sprint',
      blurb: '45 days, six days a week: full syllabus revision, daily part-test, and exam-temperament training.',
      meta: ['≤24 BATCH', '6 DAYS/WK', 'DAILY PART-TEST'], price: '₹18,000 flat',
      img: 'images/outdoor-study.jpg', alt: 'Student revising with books and a laptop at an outdoor desk',
      feats: ['Daily 3-hour part-tests with same-day review', 'Formula sheets condensed to 12 pages', 'Exam-hall simulation twice a week'] }
  ];

  var RANKERS = [
    { name: 'Aarav Mehta', line: 'AIR 1,204 · JEE ADV ’25', img: 'images/student-boy.jpg', alt: 'Young student in uniform smiling confidently outdoors' },
    { name: 'Sana Qureshi', line: '681 / 720 · NEET ’25', img: 'images/portrait-girl.jpg', alt: 'Schoolgirl in uniform smiling outdoors in warm light' },
    { name: 'Rohan Verma', line: '97.4% · CBSE XII ’25', img: 'images/group-students.jpg', alt: 'Three students in uniform posing together indoors' },
    { name: 'Ishita Patel', line: 'NTSE SCHOLAR ’24', img: 'images/teen-group.jpg', alt: 'Five teenage students in uniform smiling together outdoors' }
  ];

  var FACULTY = [
    { name: 'Rakesh Iyer', role: 'PHYSICS · 14 YRS', line: 'Teaches from the board, never the projector. Ex-JEE Advanced four-digit rank himself.', img: 'images/teacher-whiteboard.jpg', alt: 'Teacher explaining geometry at a green blackboard' },
    { name: 'Dr. Farah Khan', role: 'CHEMISTRY · 12 YRS', line: 'Runs the doubt desk personally till 8 pm. Organic chemistry as storytelling.', img: 'images/teacher-smiling.jpg', alt: 'Teacher smiling in front of a classroom whiteboard' },
    { name: 'Sunita Sharma', role: 'MATHS · 9 YRS', line: 'Believes speed is a by-product of calm. Runs the estimation & mental-maths labs.', img: 'images/study-desk.jpg', alt: 'Maths mentor working through solutions at a library desk' },
    { name: 'Arvind Nair', role: 'BIOLOGY · 10 YRS', line: 'NCERT mapped line-by-line; his diagram notebooks are quietly famous in Bhopal.', img: 'images/outdoor-study.jpg', alt: 'Biology mentor reading at a desk with books and lamp' }
  ];

  var BATCHES = [
    { days: 'mon wed fri', tag: 'JEE · XI', name: 'Mon · Wed · Fri — 17:00–19:00', who: 'with R. Iyer & S. Sharma', seats: 6 },
    { days: 'mon wed', tag: 'NEET · XII', name: 'Mon · Wed — 07:00–09:00', who: 'with Dr. F. Khan & A. Nair', seats: 4 },
    { days: 'sat', tag: 'BOARDS · X', name: 'Sat — 10:00–13:00', who: 'with S. Sharma', seats: 9 },
    { days: 'wed fri', tag: 'FOUNDATION · IX', name: 'Wed · Fri — 16:00–17:30', who: 'with A. Nair', seats: 12 },
    { days: 'mon wed fri', tag: 'JEE · XII', name: 'Mon · Wed · Fri — 18:00–20:00', who: 'with R. Iyer', seats: 3 },
    { days: 'sat', tag: 'CRASH ’45', name: 'Sat · Sun — 08:00–13:00', who: 'full faculty', seats: 10 }
  ];

  var STORIES = [
    { q: 'The weekly WhatsApp summary is the difference. For the first time in three years of coaching, we knew exactly what was happening — before the report card.', w: 'Meera S.', r: 'NEET ’25 PARENT' },
    { q: 'I joined in class XI barely average in Maths. The daily practice sheets are brutal and brilliant. 97.4% in boards says the rest.', w: 'Rohan V.', r: 'CBSE XII ’25' },
    { q: 'They refused to admit my son into the JEE batch until his diagnostic was done. That honesty is why we stayed for four years.', w: 'Anil M.', r: 'FOUNDATION PARENT' },
    { q: 'Doubt desk till 8 pm saved me. No appointment, no judgement — just "bring the question, let\'s see it together."', w: 'Sana Q.', r: 'NEET ’25 · 681/720' },
    { q: 'Small batch is real here. My daughter\'s mentor knew her weak chapters by name in the second week.', w: 'Kavita R.', r: 'BOARDS X PARENT' }
  ];

  var GALLERY = [
    { img: 'images/hero-classroom.jpg', cap: 'FOUNDATION ROOM — AFTERNOON BATCH', alt: 'Two students in checked uniforms studying at a red desk', w: 1400, h: 788 },
    { img: 'images/teacher-whiteboard.jpg', cap: 'PHYSICS, FROM THE BOARD', alt: 'Teacher pointing at geometry on a green blackboard', w: 1400, h: 2100 },
    { img: 'images/library-two.jpg', cap: 'DOUBT DESK — OPEN TILL 8', alt: 'Two students revising together at a library desk', w: 1400, h: 933 },
    { img: 'images/classroom-desks.jpg', cap: 'SUNDAY MOCK IN PROGRESS', alt: 'Students in uniform writing at classroom desks', w: 1400, h: 933 },
    { img: 'images/study-table.jpg', cap: 'READING ROOM, ZONE-II', alt: 'Student reading a textbook at a library desk in New Delhi', w: 1400, h: 933 },
    { img: 'images/teen-group.jpg', cap: 'BATCH OF ’25 — RESULTS DAY', alt: 'Five students in uniform smiling together on results day', w: 1400, h: 933 }
  ];

  var FAQS = [
    { q: 'What are the fees, and can we pay in instalments?', a: 'Programmes run roughly ₹3,500–₹6,500 per month; the 45-day crash course is a flat ₹18,000 [SAMPLE]. Fees are payable quarterly, and the number printed on your admission sheet is the number you pay — no "extras" appear later. Use the fee calculator above for a live estimate.' },
    { q: 'What is the refund policy?', a: 'Seven days, no questions, full refund. After that, pro-rata for unattended months. Every refund is confirmed in writing on WhatsApp the same day it is requested.' },
    { q: 'How big are the batches, really?', a: 'Capped at 24, and we mean it. When a batch fills, we open a second one or start a waitlist. Small-group (≤12) and 1-on-1 options exist at a higher fee.' },
    { q: 'What if my child misses a class?', a: 'Every lecture is recorded and uploaded the same night, plus a Sunday catch-up slot. For illness longer than two weeks, the mentor runs a free 1-on-1 re-entry session.' },
    { q: 'Do you run online or hybrid batches?', a: 'Yes — live online batches with the same weekly mocks and doubt desk on video. Hybrid students can swap between centre and home week by week.' },
    { q: 'Is there a scholarship?', a: 'The Aagam Scholastic Test runs every April and November. Scores map to 10–90% fee waivers [SAMPLE], valid for one academic year. The test is free and the report is useful even if you don\'t join.' },
    { q: 'How do parents stay in the loop?', a: 'A two-line WhatsApp summary every Monday (what improved, what\'s next), a parent-teacher meeting every six weeks, and the mock-analysis sheet after every Sunday test.' }
  ];

  /* ── render: courses ───────────────────────────────── */
  (function courses() {
    var grid = $('#course-grid');
    grid.innerHTML = COURSES.map(function (c) {
      return '<article class="c-card reveal" data-cat="' + c.cat + '">' +
        '<div class="c-head">' + c.tags.map(function (t, i) { return '<span class="tag mono' + (i ? ' ghost' : '') + '">' + t + '</span>'; }).join('') + '</div>' +
        '<h3 class="c-name">' + c.name + '</h3>' +
        '<p class="c-blurb">' + c.blurb + '</p>' +
        '<ul class="c-meta mono">' + c.meta.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul>' +
        '<div class="c-foot"><p class="c-price mono">' + c.price + ' [SAMPLE]</p>' +
        '<button class="btn btn-ghost" type="button" data-course="' + c.id + '" aria-haspopup="dialog">Quick view</button></div>' +
        '</article>';
    }).join('');

    $$('.chip[data-filter]').forEach(function (ch) {
      ch.addEventListener('click', function () {
        $$('.chip[data-filter]').forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
        ch.classList.add('is-on'); ch.setAttribute('aria-pressed', 'true');
        var f = ch.getAttribute('data-filter');
        $$('.c-card', grid).forEach(function (card) {
          card.classList.toggle('is-off', f !== 'all' && card.getAttribute('data-cat').indexOf(f) === -1);
        });
      });
    });

    var dlg = $('#dlg-course'), body = $('#course-body');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-course]');
      if (!btn) return;
      var c = COURSES.filter(function (x) { return x.id === btn.getAttribute('data-course'); })[0];
      body.innerHTML =
        '<img class="cc-img" src="' + c.img + '" alt="' + c.alt + '" width="1400" height="700" loading="lazy">' +
        '<div class="cc-tags">' + c.tags.map(function (t) { return '<span class="tag mono">' + t + '</span>'; }).join('') + '</div>' +
        '<h3>' + c.name + '</h3><p class="fine" style="margin-bottom:16px">' + c.blurb + '</p>' +
        '<ul>' + c.feats.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
        '<div class="cc-foot"><p class="c-price mono">' + c.price + ' [SAMPLE]</p>' +
        '<a class="btn btn-solid" target="_blank" rel="noopener" href="' + waLink('Hi Aagam Academy, I want details of the ' + c.name + ' programme.') + '">Ask about this course</a></div>';
      dlg.showModal();
    });
    $('#course-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  })();

  /* ── render: rankers ───────────────────────────────── */
  (function rankers() {
    $('#rankers').innerHTML = RANKERS.map(function (r) {
      return '<article class="r-card"><img src="' + r.img + '" alt="' + r.alt + '" width="1400" height="1750" loading="lazy" decoding="async">' +
        '<h3>' + r.name + '</h3><span class="mono">' + r.line + ' [SAMPLE]</span></article>';
    }).join('');
  })();

  /* ── render: faculty ───────────────────────────────── */
  (function faculty() {
    $('#fac-grid').innerHTML = FACULTY.map(function (f) {
      return '<article class="f-card reveal"><div class="f-ph"><img src="' + f.img + '" alt="' + f.alt + '" width="1400" height="1610" loading="lazy" decoding="async"></div>' +
        '<h3>' + f.name + '</h3><span class="mono micro">' + f.role + '</span><p class="f-line">' + f.line + '</p></article>';
    }).join('');
  })();

  /* ── method steps ──────────────────────────────────── */
  (function method() {
    var steps = $$('.m-step'), num = $('#method-num'), fill = $('#method-rail-fill');
    if (!steps.length) return;
    function set(i) {
      steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      var label = '0' + (i + 1);
      if (num.textContent !== label) {
        num.textContent = label;
        num.classList.add('tick');
        setTimeout(function () { num.classList.remove('tick'); }, 320);
      }
      fill.style.height = ((i + 1) / steps.length * 100) + '%';
    }
    set(0);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) set(steps.indexOf(en.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  })();

  /* ── before / after slider ─────────────────────────── */
  (function ba() {
    var box = $('#ba'), range = $('#ba-range');
    if (!box) return;
    range.addEventListener('input', function () { box.style.setProperty('--pos', range.value + '%'); });
  })();

  /* ── batches: filter + search ──────────────────────── */
  (function batches() {
    var grid = $('#batch-grid');
    grid.innerHTML = BATCHES.map(function (b) {
      return '<article class="b-card reveal" data-days="' + b.days + '" data-text="' + (b.tag + ' ' + b.name).toLowerCase() + '">' +
        '<div class="b-top mono"><span>' + b.tag + '</span><span class="b-seats">' + b.seats + ' SEATS LEFT [SAMPLE]</span></div>' +
        '<h3>' + b.name + '</h3><p class="fine">' + b.who + '</p>' +
        '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + waLink('Hi Aagam Academy, please reserve a seat in the ' + b.tag + ' batch (' + b.name + ').') + '">Reserve seat</a></article>';
    }).join('');

    var day = 'all', q = '';
    function apply() {
      $$('.b-card', grid).forEach(function (card) {
        var okDay = day === 'all' || card.getAttribute('data-days').indexOf(day) !== -1;
        var okQ = !q || card.getAttribute('data-text').indexOf(q) !== -1;
        card.classList.toggle('is-off', !(okDay && okQ));
      });
    }
    $$('.chip[data-day]').forEach(function (ch) {
      ch.addEventListener('click', function () {
        $$('.chip[data-day]').forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
        ch.classList.add('is-on'); ch.setAttribute('aria-pressed', 'true');
        day = ch.getAttribute('data-day'); apply();
      });
    });
    $('#batch-search').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); apply(); });
  })();

  /* ── fee calculator ────────────────────────────────── */
  (function calc() {
    var form = $('#calc-form');
    var out = $('#calc-price'), per = $('#calc-per'), lines = $('#calc-lines'), waBtn = $('#calc-wa');
    function val(name) { return form.querySelector('input[name="' + name + '"]:checked'); }
    function compute() {
      var prog = val('prog'), batch = val('batch');
      var base = parseFloat(prog.getAttribute('data-base'));
      var flat = prog.getAttribute('data-flat') === '1';
      var mult = parseFloat(batch.getAttribute('data-mult'));
      var fee = base * mult;
      var rows = [
        ['BASE · ' + prog.value.toUpperCase(), inr(base) + (flat ? ' flat' : '/mo')],
        ['BATCH · ' + batch.value.toUpperCase(), '×' + mult]
      ];
      if ($('#disc-sibling').checked) { rows.push(['SIBLING −10%', '−' + inr(fee * 0.10)]); fee *= 0.9; }
      if ($('#disc-early').checked) { rows.push(['EARLY BIRD', '−' + inr(2000)]); fee = Math.max(0, fee - 2000); }
      var addons = 0;
      if ($('#add-material').checked) { addons += 2000; rows.push(['MATERIAL PACK', '+' + inr(2000) + '/yr']); }
      if ($('#add-tests').checked) { addons += 3000; rows.push(['TEST SERIES', '+' + inr(3000) + '/yr']); }
      rows.push(['ADD-ONS (YEARLY)', addons ? inr(addons) : '—']);
      out.textContent = inr(fee);
      per.textContent = flat ? ' flat' : '/mo';
      lines.innerHTML = rows.map(function (r) { return '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>'; }).join('');
      waBtn.href = waLink('Hi Aagam Academy, my fee estimate: ' + prog.value + ' / ' + batch.value + ' ≈ ' + inr(fee) + (flat ? ' flat' : '/mo') + '. Please confirm the exact figure.');
    }
    form.addEventListener('change', compute);
    form.addEventListener('input', compute);
    compute();
  })();

  /* ── testimonials carousel ─────────────────────────── */
  (function caro() {
    var track = $('#caro-track'), dots = $('#caro-dots');
    track.innerHTML = STORIES.map(function (s, i) {
      var init = s.w.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase();
      return '<figure class="t-slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + STORIES.length + '">' +
        '<blockquote>' + s.q + '”</blockquote>' +
        '<figcaption><span class="t-ava mono">' + init + '</span><div><strong>' + s.w + ' [SAMPLE]</strong>' +
        '<p class="mono micro">' + s.r + ' [SAMPLE]</p></div></figcaption></figure>';
    }).join('');
    dots.innerHTML = STORIES.map(function (_, i) {
      return '<button type="button" role="tab" aria-label="Show testimonial ' + (i + 1) + '" aria-selected="' + (i === 0) + '" data-i="' + i + '"></button>';
    }).join('');
    var i = 0, timer = null, region = $('#caro');
    function go(n) {
      i = (n + STORIES.length) % STORIES.length;
      track.style.transform = 'translateX(-' + i * 100 + '%)';
      $$('button', dots).forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); });
    }
    $('#caro-prev').addEventListener('click', function () { go(i - 1); });
    $('#caro-next').addEventListener('click', function () { go(i + 1); });
    dots.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) go(+b.getAttribute('data-i')); });
    var sx = null;
    region.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    region.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var d = e.clientX - sx;
      if (Math.abs(d) > 48) go(i + (d < 0 ? 1 : -1));
      sx = null;
    });
    if (!REDUCED) {
      timer = setInterval(function () {
        if (!region.matches(':hover') && !region.contains(document.activeElement) && !document.hidden) go(i + 1);
      }, 6500);
      region.addEventListener('mouseenter', function () { clearInterval(timer); });
    }
  })();

  /* ── gallery + lightbox ────────────────────────────── */
  (function gallery() {
    var gal = $('#gal');
    gal.innerHTML = GALLERY.map(function (g, i) {
      return '<button class="g-item" type="button" data-i="' + i + '" aria-label="Open image: ' + g.cap + '">' +
        '<img src="' + g.img + '" alt="' + g.alt + '" width="' + g.w + '" height="' + g.h + '" loading="lazy" decoding="async">' +
        '<span class="mono micro">' + g.cap + '</span></button>';
    }).join('');
    var dlg = $('#dlg-light'), img = $('#light-img'), cap = $('#light-cap'), cur = 0;
    function show(n) {
      cur = (n + GALLERY.length) % GALLERY.length;
      var g = GALLERY[cur];
      img.src = g.img; img.alt = g.alt; cap.textContent = g.cap + ' · ' + (cur + 1) + '/' + GALLERY.length;
    }
    gal.addEventListener('click', function (e) {
      var b = e.target.closest('.g-item');
      if (!b) return;
      show(+b.getAttribute('data-i'));
      dlg.showModal();
    });
    $('#light-prev').addEventListener('click', function () { show(cur - 1); });
    $('#light-next').addEventListener('click', function () { show(cur + 1); });
    $('#light-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  })();

  /* ── FAQ accordion ─────────────────────────────────── */
  (function faq() {
    var acc = $('#acc');
    acc.innerHTML = FAQS.map(function (f, i) {
      return '<div class="acc-item"><h3><button class="acc-btn" id="acc-b' + i + '" aria-expanded="false" aria-controls="acc-p' + i + '">' + f.q + '</button></h3>' +
        '<div class="acc-panel" id="acc-p' + i + '" role="region" aria-labelledby="acc-b' + i + '"><div><p>' + f.a + '</p></div></div></div>';
    }).join('');
    acc.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc-btn');
      if (!btn) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      $$('.acc-btn', acc).forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.acc-item').classList.remove('is-open');
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        btn.closest('.acc-item').classList.add('is-open');
      }
    });
  })();

  /* ── multi-step enquiry form ───────────────────────── */
  (function enq() {
    var form = $('#enq-form');
    var count = $('#enq-count');
    var labels = { 1: 'STUDENT', 2: 'PREFERENCES', 3: 'CONTACT' };
    function show(n) {
      $$('.enq-panel', form).forEach(function (p) {
        var on = +p.getAttribute('data-panel') === n;
        p.hidden = !on;
        p.classList.toggle('is-on', on);
      });
      $$('.enq-step').forEach(function (s) { s.classList.toggle('is-on', +s.getAttribute('data-s') <= n); });
      count.textContent = 'STEP ' + n + ' / 3 — ' + labels[n];
    }
    function err(id, input, msg) {
      var el = $('#' + id);
      el.textContent = msg || '';
      if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    function v1() {
      var ok = true;
      ok = err('e-name', $('#f-name'), $('#f-name').value.trim().length >= 2 ? '' : 'Please enter the student’s name.') && ok;
      ok = err('e-class', $('#f-class'), $('#f-class').value ? '' : 'Please pick a class.') && ok;
      return ok;
    }
    function v2() {
      return err('e-slot', $('#f-slot'), $('#f-slot').value ? '' : 'Please choose a slot.');
    }
    function v3() {
      var ok = true;
      ok = err('e-phone', $('#f-phone'), /^[6-9][0-9]{9}$/.test($('#f-phone').value.trim()) ? '' : 'Enter a valid 10-digit Indian mobile number.') && ok;
      var em = $('#f-email').value.trim();
      ok = err('e-email', $('#f-email'), (!em || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) ? '' : 'That email doesn’t look right.') && ok;
      ok = err('e-consent', $('#f-consent'), $('#f-consent').checked ? '' : 'We need your OK to call or message you.') && ok;
      return ok;
    }
    form.addEventListener('click', function (e) {
      var nx = e.target.closest('[data-next]'), pv = e.target.closest('[data-prev]');
      if (nx) {
        var to = +nx.getAttribute('data-next');
        if (to === 2 && !v1()) { toast('A couple of fields need attention.'); return; }
        if (to === 3 && !v2()) { toast('Please pick a preferred slot.'); return; }
        show(to);
      }
      if (pv) show(+pv.getAttribute('data-prev'));
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!v1() || !v2() || !v3()) { toast('Please fix the highlighted fields.'); return; }
      var btn = $('#enq-submit');
      btn.disabled = true; btn.textContent = 'Sending…';
      var d = new FormData(form);
      var lead = {
        ref: 'AA-' + String(Date.now()).slice(-5),
        name: d.get('name'), klass: d.get('klass'), target: d.get('target'),
        mode: d.get('mode'), slot: d.get('slot'), note: d.get('note'),
        phone: d.get('phone'), email: d.get('email'), at: new Date().toISOString()
      };
      setTimeout(function () {
        try {
          var all = JSON.parse(localStorage.getItem('aa_leads') || '[]');
          all.push(lead);
          localStorage.setItem('aa_leads', JSON.stringify(all));
        } catch (er) {}
        $$('.enq-panel', form).forEach(function (p) { p.hidden = true; });
        $('.enq-prog', form).style.display = 'none';
        $('#enq-honest').style.display = 'none';
        $('#enq-ref').textContent = lead.ref;
        $('#enq-wa').href = waLink('Hi Aagam Academy! Enquiry ' + lead.ref + ': ' + lead.name + ' (class ' + lead.klass + '), target ' + lead.target + ', mode ' + lead.mode + ', slot ' + lead.slot + '. Mobile: ' + lead.phone + '.');
        $('#enq-done').hidden = false;
        toast('Enquiry saved in this browser · ' + lead.ref);
      }, 900);
    });
    show(1);
  })();

  /* ── privacy dialog ────────────────────────────────── */
  (function privacy() {
    $('#privacy-open').addEventListener('click', function () { $('#dlg-privacy').showModal(); });
    $('#privacy-close').addEventListener('click', function () { $('#dlg-privacy').close(); });
  })();

  /* ── cookie notice (only when analytics enabled) ───── */
  (function cookie() {
    if (!ANALYTICS_ENABLED) return;
    var ok = null;
    try { ok = localStorage.getItem('aa-consent'); } catch (e) {}
    if (ok) return;
    var box = $('#cookie');
    box.hidden = false;
    function set(v) {
      try { localStorage.setItem('aa-consent', v); } catch (e) {}
      box.hidden = true;
    }
    $('#cookie-yes').addEventListener('click', function () { set('yes'); });
    $('#cookie-no').addEventListener('click', function () { set('no'); });
  })();

  /* reveal must init after injected content exists */
  initReveal();
})();
