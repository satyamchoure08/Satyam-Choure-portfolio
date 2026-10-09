/* ============================================================
   SUPER BOOT HOUSE — app.js
   loader · cursor · 3D ring carousel · tilt cards · three.js
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- data ---------------- */
  const PRODUCTS = [
    { id: 'trailblazer', name: 'TRAILBLAZER 07', tag: 'BEST SELLER', price: '₹6,499',
      desc: 'Wheat nubuck work boot with storm welt & recycled lug sole.', img: 'assets/shoes/shoe-trailblazer.png' },
    { id: 'arctic', name: 'ARCTIC TACTICAL', tag: 'NEW DROP', price: '₹7,999',
      desc: 'Bone-white combat boot. Zip-shaft, chunky platform, zero mercy.', img: 'assets/shoes/shoe-arctic.png' },
    { id: 'sierra', name: 'SIERRA DUO', tag: 'LIMITED', price: '₹5,499',
      desc: 'Slate-blue knit trainers on a soft, springy sole. Built for long days on your feet.', img: 'assets/shoes/shoe-sierra-sneaker.webp' },
    { id: 'nomad', name: 'NOMAD RIDER', tag: 'HANDMADE', price: '₹8,299',
      desc: 'Cloud-grey knit runner with a chunky cushioned sole. Born for long roads.', img: 'assets/shoes/shoe-nomad-sneaker.webp' },
    { id: 'oxford', name: 'OXFORD WANDERER', tag: 'CLASSIC', price: '₹4,999',
      desc: 'Cherry-red leather low-tops with crisp white laces. Boardroom today, weekend tomorrow.', img: 'assets/shoes/shoe-oxford-sneaker.webp' },
    { id: 'blaze', name: 'BLAZE RUNNER', tag: 'HOT', price: '₹5,999',
      desc: 'Signal-red knit runner with cloud foam. Outrun your excuses.', img: 'assets/shoes/shoe-blaze.png' },
  ];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- loader ---------------- */
  const loader = $('#loader'), pct = $('#loadPct'), bar = $('#loadBar');
  let start = null;
  function tick(ts) {
    if (!start) start = ts;
    const p = clamp((ts - start) / 1500, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    pct.textContent = Math.round(eased * 100);
    bar.style.width = (eased * 100) + '%';
    if (p < 1) requestAnimationFrame(tick);
    else finishLoad();
  }
  function finishLoad() {
    document.body.classList.add('loaded');
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1000);
  }
  if (prefersReduced) { pct.textContent = 100; bar.style.width = '100%'; finishLoad(); }
  else requestAnimationFrame(tick);

  /* ---------------- custom cursor ---------------- */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
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

  /* ---------------- nav + progress ---------------- */
  const nav = $('#nav'), prog = $('#progressBar');
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    const h = document.documentElement;
    prog.style.transform = `scaleX(${scrollY / (h.scrollHeight - innerHeight || 1)})`;
  }, { passive: true });

  /* ---------------- reveal on scroll ---------------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
  }), { threshold: .18 });
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
  const N = PRODUCTS.length, STEP = 360 / N, DRAG = .32;   // DRAG = degrees per pixel dragged
  const radiusFor = () => innerWidth < 640 ? 300 : 430;
  let RADIUS = radiusFor();
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

  let angle = 0, target = 0;                 // current + wanted rotation (degrees)
  let dragging = false, pid = null, moved = 0, lastX = 0, lastT = 0, vel = 0, downCard = null;
  let hovering = false, ringOnScreen = false;
  const AUTO_EVERY = 3600;                   // auto-advance one shoe every 3.6s
  let nextAuto = performance.now() + AUTO_EVERY;

  const snap = a => Math.round(a / STEP) * STEP;
  const holdAuto = (ms = 6000) => { nextAuto = performance.now() + ms; };
  function go(dir) {                         // dir = +1 next shoe, -1 previous shoe
    target = snap(target) - dir * STEP;
    holdAuto();
  }
  function goTo(i) {                         // spin the shortest way to card i
    const want = -i * STEP;
    const diff = ((want - target) % 360 + 540) % 360 - 180;
    target = snap(target + diff);
    holdAuto();
  }
  function frontIndex() {
    return ((Math.round(-angle / STEP) % N) + N) % N;
  }
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
      angle = prefersReduced ? target : lerp(angle, target, 1 - Math.pow(.91, dt / 16.7)); // same speed at any frame rate
      if (Math.abs(target - angle) < .02) angle = target;
    }
    ringEl.style.transform = `translateZ(${-RADIUS}px) rotateY(${angle}deg)`;
    const f = frontIndex();
    if (f !== lastFront) { lastFront = f; paintMeta(f); }
    requestAnimationFrame(ringLoop);
  }
  requestAnimationFrame(ringLoop);
  new IntersectionObserver(es => { ringOnScreen = es[0].isIntersecting; }, { threshold: .35 }).observe(wrap);

  // drag to spin (ignores the arrow buttons so their clicks always go through)
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
    vel = lerp(vel, dx / Math.max(8, now - lastT), .5);   // px per ms, smoothed
    lastT = now;
  });
  function endDrag(e) {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false; wrap.classList.remove('grabbing');
    if (performance.now() - lastT > 120) vel = 0;           // held still before letting go: no fling
    if (wrap.hasPointerCapture(pid)) wrap.releasePointerCapture(pid);
    if (moved < 6 && downCard) goTo(+downCard.dataset.i);   // a tap on a side card brings it to the front
    else target = snap(angle + clamp(vel, -2.5, 2.5) * 220 * DRAG); // fling, then settle on a card
    holdAuto();
  }
  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);
  wrap.addEventListener('lostpointercapture', endDrag);
  wrap.addEventListener('mouseenter', () => { hovering = true; });
  wrap.addEventListener('mouseleave', () => { hovering = false; holdAuto(2500); });

  // arrows + keyboard
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
  $('#metaAdd').addEventListener('click', () => addToCart(PRODUCTS[frontIndex()].name));

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
          <button class="g-add" data-name="${p.name}" data-cursor aria-label="Add ${p.name} to cart">
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
    const b = e.target.closest('.g-add'); if (b) addToCart(b.dataset.name);
  });

  /* ---------------- cart + toast ---------------- */
  let cartN = 0; const cartCount = $('#cartCount'), toast = $('#toast');
  let toastT;
  function addToCart(name) {
    cartN++; cartCount.textContent = cartN;
    cartCount.classList.remove('bump'); void cartCount.offsetWidth; cartCount.classList.add('bump');
    toast.textContent = `${name} added to cart ✦`;
    toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 1900);
  }
  $('#cartBtn').addEventListener('click', () => {
    toast.textContent = cartN ? `${cartN} pair${cartN > 1 ? 's' : ''} waiting for you ✦` : 'Your cart is lonely. Fix that ✦';
    toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 1900);
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
      const tt = t * .001;
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

  /* ---------------- footer wordmark: always fits the screen ---------------- */
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

  /* ---------------- newsletter ---------------- */
  $('#joinForm').addEventListener('submit', e => {
    e.preventDefault();
    $('#formMsg').hidden = false;
    e.target.querySelector('input').value = '';
  });
})();
