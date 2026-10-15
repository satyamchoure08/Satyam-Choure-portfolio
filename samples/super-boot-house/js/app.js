/* ============================================================
   SUPER BOOT HOUSE — app.js (Upgraded 3D & Interactive Edition)
   loader · cursor · 3D ring carousel · tilt cards · three.js
   + 3D Boot Customizer & Fit Finder · Slide-out WhatsApp Cart Drawer
   + Interactive 3D Anatomy Hotspots · Scroll-Velocity Skewed Marquee
   ============================================================ */
(function () {
  'use strict';

  const WA_NUM = '919669039996';
  const PRODUCTS = [
    { id: 'trailblazer', name: 'TRAILBLAZER 07', tag: 'BEST SELLER', price: '₹6,499', rawPrice: 6499,
      desc: 'Wheat nubuck work boot with storm welt & recycled lug sole.', img: 'assets/shoes/shoe-trailblazer.png' },
    { id: 'arctic', name: 'ARCTIC TACTICAL', tag: 'NEW DROP', price: '₹7,999', rawPrice: 7999,
      desc: 'Bone-white combat boot. Zip-shaft, chunky platform, zero mercy.', img: 'assets/shoes/shoe-arctic.png' },
    { id: 'sierra', name: 'SIERRA DUO', tag: 'LIMITED', price: '₹5,499', rawPrice: 5499,
      desc: 'Slate-blue knit trainers on a soft, springy sole. Built for long days on your feet.', img: 'assets/shoes/shoe-sierra-sneaker.webp' },
    { id: 'nomad', name: 'NOMAD RIDER', tag: 'HANDMADE', price: '₹8,299', rawPrice: 8299,
      desc: 'Cloud-grey knit runner with a chunky cushioned sole. Born for long roads.', img: 'assets/shoes/shoe-nomad-sneaker.webp' },
    { id: 'oxford', name: 'OXFORD WANDERER', tag: 'CLASSIC', price: '₹4,999', rawPrice: 4999,
      desc: 'Cherry-red leather low-tops with crisp white laces. Boardroom today, weekend tomorrow.', img: 'assets/shoes/shoe-oxford-sneaker.webp' },
    { id: 'blaze', name: 'BLAZE RUNNER', tag: 'HOT', price: '₹5,999', rawPrice: 5999,
      desc: 'Signal-red knit runner with cloud foam. Outrun your excuses.', img: 'assets/shoes/shoe-blaze.png' },
  ];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- loader ---------------- */
  const loader = $('#loader'), pct = $('#loadPct'), bar = $('#loadBar');
  let start = null;
  function tick(ts) {
    if (!start) start = ts;
    const p = clamp((ts - start) / 1400, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    if (pct) pct.textContent = Math.round(eased * 100);
    if (bar) bar.style.width = (eased * 100) + '%';
    if (p < 1) requestAnimationFrame(tick);
    else finishLoad();
  }
  function finishLoad() {
    document.body.classList.add('loaded');
    if (loader) {
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 900);
    }
  }
  if (prefersReduced) { if (pct) pct.textContent = 100; if (bar) bar.style.width = '100%'; finishLoad(); }
  else requestAnimationFrame(tick);

  /* ---------------- custom cursor ---------------- */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  if (dot && ring) {
    (function cursorLoop() {
      rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16);
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(cursorLoop);
    })();
    document.addEventListener('mouseover', e => {
      const onRing = !!e.target.closest('#ringWrap') && !e.target.closest('button');
      ring.classList.toggle('big', onRing || !!e.target.closest('a,button,[data-cursor]'));
      ring.classList.toggle('drag', onRing);
    });
  }

  /* ---------------- nav + progress + scroll-velocity marquee ---------------- */
  const nav = $('#nav'), prog = $('#progressBar');
  let lastScrollY = scrollY, velSkew = 0;
  addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    const h = document.documentElement;
    if (prog) prog.style.transform = `scaleX(${scrollY / (h.scrollHeight - innerHeight || 1)})`;
  }, { passive: true });

  if (!prefersReduced) {
    const mTracks = $$('.marquee-track, .t-track');
    (function skewLoop() {
      const dy = scrollY - lastScrollY;
      lastScrollY = scrollY;
      velSkew = lerp(velSkew, clamp(dy * 0.35, -12, 12), 0.14);
      mTracks.forEach(t => { t.style.transform = `skewX(${velSkew.toFixed(2)}deg)`; });
      requestAnimationFrame(skewLoop);
    })();
  }

  /* ---------------- reveal on scroll ---------------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
  }), { threshold: .15 });
  $$('.rv, .sec-head, .visit, .craft-sticky').forEach(el => io.observe(el));

  /* ---------------- counters ---------------- */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now();
    (function step(t) {
      const p = clamp((t - t0) / 1600, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString('en-IN') + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------------- craft card rotations ---------------- */
  $$('.craft-card').forEach(c => c.style.setProperty('--rot', (c.dataset.rot || 0) + 'deg'));

  /* ---------------- 3D ring carousel ---------------- */
  const ringEl = $('#ring'), wrap = $('#ringWrap');
  const N = PRODUCTS.length, STEP = 360 / N, DRAG = .32;
  const radiusFor = () => innerWidth < 640 ? 300 : 430;
  let RADIUS = radiusFor();
  let selectedSize = 'UK 8';

  PRODUCTS.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'p-card';
    card.dataset.i = i;
    card.style.transform = `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`;
    card.innerHTML = `
      <span class="tag ${p.tag === 'HOT' || p.tag === 'NEW DROP' ? 'hot' : ''}">${p.tag}</span>
      <div class="ph"><img src="${p.img}" alt="${p.name}" loading="lazy" draggable="false"></div>
      <h4>${p.name}</h4><span class="price">${p.price}</span>`;
    ringEl.appendChild(card);
  });
  const cards = $$('.p-card', ringEl);

  let angle = 0, target = 0;
  let dragging = false, pid = null, moved = 0, lastX = 0, lastT = 0, vel = 0, downCard = null;
  let hovering = false, ringOnScreen = false;
  const AUTO_EVERY = 3600;
  let nextAuto = performance.now() + AUTO_EVERY;

  const snap = a => Math.round(a / STEP) * STEP;
  const holdAuto = (ms = 6000) => { nextAuto = performance.now() + ms; };
  function go(dir) { target = snap(target) - dir * STEP; holdAuto(); }
  function goTo(i) {
    const want = -i * STEP;
    const diff = ((want - target) % 360 + 540) % 360 - 180;
    target = snap(target + diff);
    holdAuto();
  }
  function frontIndex() { return ((Math.round(-angle / STEP) % N) + N) % N; }
  let lastFront = -1;
  function paintMeta(i) {
    const p = PRODUCTS[i];
    $('#metaName').textContent = p.name;
    $('#metaDesc').textContent = p.desc;
    $('#metaPrice').textContent = p.price;
    cards.forEach((c, k) => c.classList.toggle('is-front', k === i));
  }
  let lastFrame = performance.now();
  function ringLoop(t) {
    const dt = Math.min(64, t - lastFrame); lastFrame = t;
    if (!dragging) {
      if (!prefersReduced && !hovering && ringOnScreen && t > nextAuto) {
        target = snap(target) - STEP; nextAuto = t + AUTO_EVERY;
      }
      angle = prefersReduced ? target : lerp(angle, target, 1 - Math.pow(.91, dt / 16.7));
      if (Math.abs(target - angle) < .02) angle = target;
    }
    ringEl.style.transform = `translateZ(${-RADIUS}px) rotateY(${angle}deg)`;
    const f = frontIndex();
    if (f !== lastFront) { lastFront = f; paintMeta(f); }
    requestAnimationFrame(ringLoop);
  }
  requestAnimationFrame(ringLoop);
  new IntersectionObserver(es => { ringOnScreen = es[0].isIntersecting; }, { threshold: .35 }).observe(wrap);

  wrap.addEventListener('dragstart', e => e.preventDefault());
  wrap.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    dragging = true; pid = e.pointerId; moved = 0; vel = 0;
    lastX = e.clientX; lastT = performance.now();
    downCard = e.target.closest('.p-card');
    wrap.classList.add('grabbing');
  });
  wrap.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== pid) return;
    const now = performance.now(), dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    if (moved > 6 && !wrap.hasPointerCapture(pid)) { try { wrap.setPointerCapture(pid); } catch (_) {} }
    angle += dx * DRAG; target = angle;
    vel = lerp(vel, dx / Math.max(8, now - lastT), .5);
    lastT = now;
  });
  function endDrag(e) {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false; wrap.classList.remove('grabbing');
    if (performance.now() - lastT > 120) vel = 0;
    if (wrap.hasPointerCapture(pid)) wrap.releasePointerCapture(pid);
    if (moved < 6 && downCard) goTo(+downCard.dataset.i);
    else target = snap(angle + clamp(vel, -2.5, 2.5) * 220 * DRAG);
    holdAuto();
  }
  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);
  wrap.addEventListener('lostpointercapture', endDrag);
  wrap.addEventListener('mouseenter', () => { hovering = true; });
  wrap.addEventListener('mouseleave', () => { hovering = false; holdAuto(2500); });

  $('#ringNext').addEventListener('click', () => go(1));
  $('#ringPrev').addEventListener('click', () => go(-1));
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  addEventListener('resize', () => {
    const r = radiusFor();
    if (r !== RADIUS) { RADIUS = r; cards.forEach((c, i) => c.style.transform = `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`); }
  });
  $('#metaAdd').addEventListener('click', () => {
    const p = PRODUCTS[frontIndex()];
    addToCart(p.name, p.rawPrice, selectedSize);
  });

  /* ---------------- drop grid + tilt ---------------- */
  const grid = $('#grid');
  PRODUCTS.forEach(p => {
    const el = document.createElement('article');
    el.className = 'tilt rv';
    el.innerHTML = `
      <div class="tilt-inner">
        <span class="shine"></span>
        <span class="g-tag">${p.tag}</span>
        <div class="g-ph"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
        <h3>${p.name}</h3>
        <div class="g-row"><strong>${p.price}</strong>
          <button class="g-add" data-name="${p.name}" data-price="${p.rawPrice}" data-cursor aria-label="Add ${p.name} to cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>
          </button></div>
      </div>`;
    grid.appendChild(el);
    io.observe(el);
  });
  grid.addEventListener('mousemove', e => {
    const card = e.target.closest('.tilt'); if (!card) return;
    const inner = $('.tilt-inner', card), r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    inner.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 14}deg)`;
    inner.style.setProperty('--mx', ((px + .5) * 100) + '%');
    inner.style.setProperty('--my', ((py + .5) * 100) + '%');
  });
  grid.addEventListener('mouseleave', () => $$('.tilt-inner', grid).forEach(i => i.style.transform = ''));
  grid.addEventListener('mouseout', e => {
    const card = e.target.closest('.tilt');
    if (card && !card.contains(e.relatedTarget)) $('.tilt-inner', card).style.transform = '';
  });
  grid.addEventListener('click', e => {
    const b = e.target.closest('.g-add');
    if (b) addToCart(b.dataset.name, +b.dataset.price, selectedSize);
  });

  /* ---------------- UPGRADE: Interactive 3D Customizer, Size Finder & Slide-Out Cart ---------------- */
  const extraStyles = document.createElement('style');
  extraStyles.textContent = `
    .sbh-size-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:14px 0 6px}
    .sbh-sz{padding:7px 13px;border-radius:8px;border:2px solid #161310;background:#fff;font-weight:700;font-size:13px;cursor:pointer;transition:.18s}
    .sbh-sz.on{background:#FF4D00;color:#fff;border-color:#FF4D00;transform:translateY(-2px)}
    .sbh-lab{padding:80px 5vw;background:#161310;color:#F4EFE6;position:relative;overflow:hidden}
    .sbh-lab-grid{max-width:1200px;margin:0 auto;display:grid;gap:32px;align-items:center}
    @media(min-width:860px){.sbh-lab-grid{grid-template-columns:1.05fr .95fr}}
    .sbh-stage{background:radial-gradient(circle at 50% 45%,rgba(255,77,0,.28),rgba(22,19,16,.95));border:2px solid rgba(244,239,230,.18);border-radius:24px;padding:32px;text-align:center;position:relative;perspective:1000px}
    .sbh-stage img{width:min(340px,85%);height:auto;margin:0 auto;display:block;transition:transform .4s cubic-bezier(.2,.8,.2,1),filter .35s;filter:drop-shadow(0 26px 32px rgba(0,0,0,.65))}
    .sbh-hotspot{position:absolute;width:30px;height:30px;border-radius:50%;background:#FF4D00;color:#fff;font-weight:900;font-size:13px;display:grid;place-items:center;border:2px solid #fff;cursor:pointer;box-shadow:0 0 0 6px rgba(255,77,0,.25);animation:sbhPulse 2s infinite}
    @keyframes sbhPulse{50%{box-shadow:0 0 0 12px rgba(255,77,0,0)}}
    .sbh-controls{display:grid;gap:18px}
    .sbh-grp label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#FF4D00;font-weight:700;margin-bottom:8px}
    .sbh-chips{display:flex;flex-wrap:wrap;gap:8px}
    .sbh-chip{padding:10px 15px;border-radius:10px;background:rgba(255,255,255,.08);color:#F4EFE6;border:1.5px solid rgba(255,255,255,.14);font-weight:700;font-size:14px;cursor:pointer;transition:.2s}
    .sbh-chip.on{background:#FF4D00;color:#fff;border-color:#fff}
    .sbh-drawer{position:fixed;inset:0;z-index:999;display:none}
    .sbh-drawer.open{display:block}
    .sbh-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
    .sbh-panel{position:absolute;right:0;top:0;bottom:0;width:min(430px,92vw);background:#F4EFE6;color:#161310;padding:24px;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.4)}
    .sbh-items{flex:1;overflow:auto;margin:16px 0;display:grid;gap:10px;align-content:start}
    .sbh-item{background:#fff;border:2px solid #161310;border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:10px}
    .sbh-qbtn{width:28px;height:28px;border-radius:6px;background:#161310;color:#fff;font-weight:900}
  `;
  document.head.appendChild(extraStyles);

  // Inject UK Size Picker inside Ring Meta
  const metaBox = $('#ringMeta');
  if (metaBox) {
    const szRow = document.createElement('div');
    szRow.className = 'sbh-size-row';
    szRow.innerHTML = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'].map(s =>
      `<button type="button" class="sbh-sz${s === selectedSize ? ' on' : ''}" data-sz="${s}">${s}</button>`
    ).join('');
    metaBox.insertBefore(szRow, metaBox.querySelector('.meta-row'));
    szRow.addEventListener('click', e => {
      const b = e.target.closest('.sbh-sz'); if (!b) return;
      selectedSize = b.dataset.sz;
      $$('.sbh-sz', szRow).forEach(x => x.classList.toggle('on', x === b));
    });
  }

  // Inject 3D Customizer & Anatomy Inspector before #craft
  const craftSec = $('#craft');
  if (craftSec) {
    const lab = document.createElement('section');
    lab.className = 'sbh-lab';
    lab.id = 'customizer';
    lab.innerHTML = `
      <div class="sbh-lab-grid">
        <div class="sbh-stage" id="customStage">
          <span style="display:inline-block;background:#FF4D00;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:99px;letter-spacing:.1em;margin-bottom:10px">INTERACTIVE 3D BOOT LAB · TAP HOTSPOTS</span>
          <div style="position:relative;display:inline-block">
            <img src="assets/shoes/shoe-trailblazer.png" id="labBootImg" alt="Customizable 3D Boot">
            <button type="button" class="sbh-hotspot" style="top:18%;left:24%" data-tip="Storm-proof brass speed hooks & waxed paracord laces">1</button>
            <button type="button" class="sbh-hotspot" style="top:48%;right:18%" data-tip="100% Full-grain Chhindwara hand-oiled hide">2</button>
            <button type="button" class="sbh-hotspot" style="bottom:12%;left:45%" data-tip="360° Goodyear Storm Welt — resoleable for life">3</button>
          </div>
          <p id="hotspotTip" style="margin-top:12px;font-size:14px;color:#ffd2b8;font-weight:600">✦ Tap any numbered hotspot on the boot or drag to inspect</p>
          <div style="margin-top:10px;font-size:24px;font-weight:900" id="labPriceOut">₹6,499 · UK 8</div>
        </div>
        <div class="sbh-controls">
          <p class="sec-kicker" style="color:#FF4D00">Chapter 02.5 · Custom Forge</p>
          <h2 class="sec-title" style="color:#F4EFE6;font-size:clamp(32px,5vw,56px)">FORGE YOUR <span class="outline">PAIR</span></h2>
          <div class="sbh-grp">
            <label>1. Leather Hide &amp; Colourway</label>
            <div class="sbh-chips" id="labColor">
              <button type="button" class="sbh-chip on" data-name="Wheat Nubuck" data-filter="none" data-add="0">Wheat Nubuck</button>
              <button type="button" class="sbh-chip" data-name="Obsidian Tactical" data-filter="grayscale(1) contrast(1.25) brightness(0.75)" data-add="400">Obsidian Black (+₹400)</button>
              <button type="button" class="sbh-chip" data-name="Oxblood Cherry" data-filter="hue-rotate(325deg) saturate(1.6) brightness(0.88)" data-add="500">Oxblood Cherry (+₹500)</button>
              <button type="button" class="sbh-chip" data-name="Forest Olive" data-filter="hue-rotate(65deg) saturate(1.2) brightness(0.9)" data-add="300">Forest Olive (+₹300)</button>
            </div>
          </div>
          <div class="sbh-grp">
            <label>2. Outsole Tread</label>
            <div class="sbh-chips" id="labSole">
              <button type="button" class="sbh-chip on" data-name=" Commando Lug Sole" data-add="0">Commando Lug (+₹0)</button>
              <button type="button" class="sbh-chip" data-name="Vibram Arctic Grip" data-add="700">Arctic Deep Lug (+₹700)</button>
              <button type="button" class="sbh-chip" data-name="City Crepe Wedge" data-add="300">City Crepe Wedge (+₹300)</button>
            </div>
          </div>
          <div class="sbh-grp">
            <label>3. Foot Length Fit Finder (cm → UK Size)</label>
            <input type="range" id="cmRange" min="24" max="29.5" step="0.5" value="26.5" style="width:100%;accent-color:#FF4D00">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span id="cmOut">Foot Length: 26.5 cm → Recommended: UK 8</span><span>Snug Fit Guaranteed</span></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" class="btn btn-solid" id="addCustomBoot"><span>Add Custom Boot to Cart</span></button>
            <button type="button" class="btn btn-ghost" id="waCustomBoot" style="color:#fff;border-color:#fff"><span>Order on WhatsApp ↗</span></button>
          </div>
        </div>
      </div>
    `;
    craftSec.parentNode.insertBefore(lab, craftSec);

    const labState = { color: 'Wheat Nubuck', sole: 'Commando Lug Sole', add: 0, size: 'UK 8' };
    const bootImg = $('#labBootImg');
    function updateLab() {
      const price = 6499 + labState.add;
      $('#labPriceOut').textContent = `${inr(price)} · ${labState.size}`;
    }
    $$('#labColor .sbh-chip').forEach(b => b.addEventListener('click', () => {
      $$('#labColor .sbh-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      bootImg.style.filter = `${b.dataset.filter} drop-shadow(0 26px 32px rgba(0,0,0,.65))`;
      bootImg.style.transform = 'rotateY(18deg) scale(1.06)';
      setTimeout(() => { bootImg.style.transform = ''; }, 320);
      labState.color = b.dataset.name;
      labState.add = (+b.dataset.add || 0) + (+($('#labSole .sbh-chip.on')?.dataset.add || 0));
      updateLab();
    }));
    $$('#labSole .sbh-chip').forEach(b => b.addEventListener('click', () => {
      $$('#labSole .sbh-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      labState.sole = b.dataset.name;
      labState.add = (+b.dataset.add || 0) + (+($('#labColor .sbh-chip.on')?.dataset.add || 0));
      updateLab();
    }));
    $$('.sbh-hotspot', lab).forEach(h => h.addEventListener('click', () => {
      $('#hotspotTip').textContent = '✦ ' + h.dataset.tip;
      bootImg.style.transform = 'rotate(-6deg) scale(1.08)';
      setTimeout(() => { bootImg.style.transform = ''; }, 300);
    }));
    $('#cmRange').addEventListener('input', e => {
      const cm = parseFloat(e.target.value);
      const ukMap = { 24: 'UK 6', 24.5: 'UK 6.5', 25: 'UK 7', 25.5: 'UK 7.5', 26: 'UK 8', 26.5: 'UK 8', 27: 'UK 9', 27.5: 'UK 9.5', 28: 'UK 10', 28.5: 'UK 10.5', 29: 'UK 11', 29.5: 'UK 11' };
      labState.size = ukMap[cm] || 'UK 8';
      selectedSize = labState.size;
      $('#cmOut').textContent = `Foot Length: ${cm} cm → Recommended: ${labState.size}`;
      updateLab();
    });
    $('#addCustomBoot').addEventListener('click', () => {
      addToCart(`CUSTOM TRAILBLAZER (${labState.color}, ${labState.sole})`, 6499 + labState.add, labState.size);
    });
    $('#waCustomBoot').addEventListener('click', () => {
      const msg = `Hi Super Boot House! I forged a custom pair in the 3D Boot Lab:\n• Model: TRAILBLAZER 07\n• Leather: ${labState.color}\n• Sole: ${labState.sole}\n• Size: ${labState.size}\n• Price: ${inr(6499 + labState.add)}\nPlease confirm availability!`;
      window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  /* ---------------- Slide-Out Cart Drawer + Toast ---------------- */
  const cart = [];
  const cartCount = $('#cartCount'), toast = $('#toast');
  let toastT;
  const drawer = document.createElement('div');
  drawer.className = 'sbh-drawer';
  drawer.innerHTML = `
    <div class="sbh-backdrop" id="sbhCloseBg"></div>
    <aside class="sbh-panel" role="dialog" aria-label="Your Boot Vault Cart">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #161310;padding-bottom:12px">
        <h3 style="font-family:'Archivo Black',sans-serif;font-size:22px">THE VAULT BAG</h3>
        <button type="button" id="sbhCloseBtn" style="font-size:24px;font-weight:900">×</button>
      </div>
      <div class="sbh-items" id="sbhCartItems"></div>
      <div style="border-top:2px solid #161310;padding-top:14px;display:grid;gap:10px">
        <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:900"><span>Total</span><span id="sbhCartTotal">₹0</span></div>
        <button type="button" class="btn btn-solid" id="sbhWaCheckout" style="width:100%;justify-content:center"><span>Checkout on WhatsApp ↗</span></button>
      </div>
    </aside>
  `;
  document.body.appendChild(drawer);

  function renderCart() {
    const totalCount = cart.reduce((s, i) => s + i.qty, 0);
    const totalAmt = cart.reduce((s, i) => s + i.qty * i.price, 0);
    if (cartCount) cartCount.textContent = totalCount;
    $('#sbhCartTotal').textContent = inr(totalAmt);
    const box = $('#sbhCartItems');
    if (!cart.length) {
      box.innerHTML = '<p style="padding:24px 0;color:#666">Your Vault Bag is empty. Spin the 3D ring or forge a custom pair to add boots.</p>';
      return;
    }
    box.innerHTML = cart.map((it, idx) => `
      <div class="sbh-item">
        <div>
          <strong style="display:block;font-size:15px">${it.name}</strong>
          <span style="font-size:12px;color:#555">${it.size} · ${inr(it.price)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button type="button" class="sbh-qbtn" data-idx="${idx}" data-d="-1">−</button>
          <b>${it.qty}</b>
          <button type="button" class="sbh-qbtn" data-idx="${idx}" data-d="1">+</button>
        </div>
      </div>
    `).join('');
  }
  drawer.addEventListener('click', e => {
    const q = e.target.closest('.sbh-qbtn');
    if (q) {
      const idx = +q.dataset.idx, d = +q.dataset.d;
      cart[idx].qty += d;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      renderCart();
    }
  });
  $('#sbhCloseBg').addEventListener('click', () => drawer.classList.remove('open'));
  $('#sbhCloseBtn').addEventListener('click', () => drawer.classList.remove('open'));
  $('#sbhWaCheckout').addEventListener('click', () => {
    if (!cart.length) return;
    const totalAmt = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const lines = cart.map(i => `• ${i.qty} × ${i.name} (${i.size}) — ${inr(i.qty * i.price)}`).join('\n');
    const msg = `Hi Super Boot House Chhindwara! I want to order from Drop 07:\n${lines}\nTotal: ${inr(totalAmt)}\nPlease share payment & shipping details.`;
    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  function addToCart(name, price = 6499, size = selectedSize) {
    const existing = cart.find(x => x.name === name && x.size === size);
    if (existing) existing.qty++;
    else cart.push({ name, price, size, qty: 1 });
    renderCart();
    if (cartCount) {
      cartCount.classList.remove('bump'); void cartCount.offsetWidth; cartCount.classList.add('bump');
    }
    if (toast) {
      toast.textContent = `${name} (${size}) added to Vault ✦`;
      toast.classList.add('show');
      clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200);
    }
  }
  $('#cartBtn').addEventListener('click', () => {
    renderCart();
    drawer.classList.add('open');
  });

  /* ---------------- magnetic buttons ---------------- */
  if (matchMedia('(pointer:fine)').matches && !prefersReduced) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  /* ---------------- hero boot tilt ---------------- */
  const stage = $('#heroStage'), bootWrap = $('.hero-boot-wrap');
  if (stage && matchMedia('(pointer:fine)').matches && !prefersReduced) {
    stage.addEventListener('mousemove', e => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      bootWrap.style.transform = `rotateY(${px * 22}deg) rotateX(${-py * 14}deg)`;
    });
    stage.addEventListener('mouseleave', () => bootWrap.style.transform = '');
  }

  /* ---------------- three.js scenes ---------------- */
  const mouse = { x: 0, y: 0 };
  addEventListener('mousemove', e => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  function makeScene(canvas, opts) {
    if (typeof THREE === 'undefined' || !canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.z = opts.camZ || 9;
    const group = new THREE.Group(); scene.add(group);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.4, .62, 150, 16),
      new THREE.MeshBasicMaterial({ color: opts.primary, wireframe: true, transparent: true, opacity: .38 }));
    group.add(knot);
    [[-4.6, 1.7, -2, .9], [4.7, -1.9, -1.2, 1.15], [3.4, 2.6, -3, .6]].forEach(([x, y, z, s]) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0),
        new THREE.MeshBasicMaterial({ color: opts.secondary, wireframe: true, transparent: true, opacity: .5 }));
      m.position.set(x, y, z); m.userData.spin = .004 + Math.random() * .006; group.add(m);
    });
    const N = 260, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - .5) * 24;
      pos[i * 3 + 1] = (Math.random() - .5) * 14;
      pos[i * 3 + 2] = (Math.random() - .5) * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: opts.particle, size: .055, transparent: true, opacity: .55 }));
    scene.add(pts);

    let visible = true;
    new IntersectionObserver(es => visible = es[0].isIntersecting, { threshold: 0 }).observe(canvas);
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = camera.aspect < .9 ? (opts.camZ || 9) + 6.5 : (opts.camZ || 9);
      camera.updateProjectionMatrix();
    }
    resize(); addEventListener('resize', resize);

    (function loop(t) {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const tt = t * .001 + scrollY * 0.0015;
      knot.rotation.x = tt * .22; knot.rotation.y = tt * .3;
      group.children.forEach(c => { if (c.userData.spin) { c.rotation.x += c.userData.spin; c.rotation.y += c.userData.spin * 1.4; } });
      pts.rotation.y = tt * .02;
      camera.position.x = lerp(camera.position.x, mouse.x * .9, .04);
      camera.position.y = lerp(camera.position.y, -mouse.y * .6, .04);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })(0);
  }
  makeScene($('#heroCanvas'), { primary: 0xff4d00, secondary: 0x161310, particle: 0x161310, camZ: 9 });
  makeScene($('#ctaCanvas'), { primary: 0xff4d00, secondary: 0xc98a2d, particle: 0xff4d00, camZ: 10 });

  const mark = $('.footer-mark'), markText = mark && $('span', mark);
  function fitMark() {
    if (!markText) return;
    mark.style.fontSize = '100px';
    const fs = 100 * mark.clientWidth / markText.offsetWidth;
    mark.style.fontSize = Math.min(fs * .995, 260) + 'px';
  }
  fitMark();
  addEventListener('resize', fitMark);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMark);

  $('#joinForm').addEventListener('submit', e => {
    e.preventDefault();
    $('#formMsg').hidden = false;
    e.target.querySelector('input').value = '';
  });
})();
