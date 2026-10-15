/* Noor Frame Studio — interactions (Upgraded 3D & Interactive Light Lab Edition)
   Vanilla JS + 3D Camera Aperture Canvas + Interactive Virtual Light Lab
   + Wall Frame Scale Visualizer + 3D Perspective Card Tilt */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const BRAND = 'Noor Frame Studio';
  const WA = 'https://wa.me/919800000000';
  const MAIL = 'hello@noorframestudio.in';

  const money = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const todayISO = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  /* ---------- Reveal on scroll ----------------------------------------- */
  const reveals = $$('.reveal');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Header + Scroll-Linked 3D Hero Stack Fan-Out ------------- */
  const header = $('#siteHeader');
  const fab = $('#fab');
  let lastY = window.scrollY;
  let ticking = false;
  const statement = $('[data-split]');
  const words = [];

  if (statement) {
    const text = statement.textContent.trim();
    statement.setAttribute('aria-label', text);
    statement.innerHTML = text.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    words.push(...$$('.w', statement));
  }

  function paintStatement() {
    if (!statement) return;
    if (reduce.matches) { words.forEach((w) => w.classList.add('is-on')); return; }
    const r = statement.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.5), 0, 1);
    const lit = Math.ceil(p * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
  }

  const stack = $('#heroStack');
  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 12);
      if (y > lastY + 6 && y > 240) header.classList.add('is-hidden');
      else if (y < lastY - 6) header.classList.remove('is-hidden');
    }
    lastY = y;
    if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
    if (stack && !reduce.matches) {
      const sp = clamp(y / 500, 0, 1);
      stack.style.setProperty('--scroll-spread', sp.toFixed(3));
    }
    paintStatement();
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Count-up stats -------------------------------------------- */
  const counters = $$('[data-count]');
  function animateCount(el) {
    const to = parseFloat(el.dataset.count);
    const dec = Number(el.dataset.decimals || 0);
    const fmt = (v) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN'));
    if (reduce.matches) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const dur = 1400;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce.matches) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Mobile drawer (native <dialog>) --------------------------- */
  const drawer = $('#menuDrawer');
  const menuOpen = $('#menuOpen');
  if (menuOpen && drawer) {
    menuOpen.addEventListener('click', () => {
      drawer.showModal();
      menuOpen.setAttribute('aria-expanded', 'true');
    });
    $('#menuClose')?.addEventListener('click', () => drawer.close());
    drawer.addEventListener('close', () => menuOpen.setAttribute('aria-expanded', 'false'));
    $$('a[href^="#"]', drawer).forEach((a) => a.addEventListener('click', () => drawer.close()));
  }

  $$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));

  /* ---------- Hero 3D tilt (desktop + motion allowed only) -------------- */
  const hero = $('.hero');
  if (stack && fine.matches && !reduce.matches && hero) {
    hero.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      stack.style.setProperty('--ry', (x * 18).toFixed(2) + 'deg');
      stack.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => {
      stack.style.setProperty('--ry', '0deg');
      stack.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------- Magnetic CTAs (desktop only) ------------------------------ */
  if (fine.matches && !reduce.matches) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.setProperty('--mx', (x * 0.16).toFixed(1) + 'px');
        el.style.setProperty('--my', (y * 0.22).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- Before / after slider ------------------------------------- */
  const ba = $('#ba');
  const baRange = $('#baRange');
  if (ba && baRange) {
    function setBA(v) {
      ba.style.setProperty('--pos', v + '%');
      baRange.setAttribute('aria-valuetext', 'Divider at ' + v + '%');
    }
    baRange.addEventListener('input', () => setBA(baRange.value));
    setBA(baRange.value);
  }

  /* ---------- Toasts ---------------------------------------------------- */
  const toastRegion = $('#toasts');
  function toast(msg) {
    if (!toastRegion) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastRegion.appendChild(t);
    window.setTimeout(() => t.remove(), 2600);
  }

  /* ---------- UPGRADE: Interactive 3D Light Lab & Frame Scale Visualizer ---------- */
  const studioStyles = document.createElement('style');
  studioStyles.textContent = `
    .nf-lab{margin:56px auto;padding:32px;border-radius:24px;background:#15120F;color:#F4EFE6;box-shadow:0 24px 60px rgba(21,18,15,.22)}
    .nf-lab-grid{display:grid;gap:28px;align-items:center}
    @media(min-width:860px){.nf-lab-grid{grid-template-columns:1fr 1.15fr}}
    .nf-stage{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:4/5;background:#0a0908;perspective:900px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
    .nf-stage img{width:100%;height:100%;object-fit:cover;transition:filter .35s,transform .35s}
    .nf-beam{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;transition:background .35s}
    .nf-shadow-mask{position:absolute;inset:0;pointer-events:none;transition:background .35s}
    .nf-chip-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .nf-chip{padding:8px 14px;border-radius:99px;background:rgba(244,239,230,.08);color:#F4EFE6;border:1px solid rgba(244,239,230,.18);font-size:13px;font-weight:600;cursor:pointer;transition:.2s}
    .nf-chip.on{background:#B8390F;color:#fff;border-color:#B8390F}
    .nf-wall{margin-top:24px;padding:24px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);text-align:center}
    .nf-frame-preview{margin:16px auto;background:#fff;padding:10px;box-shadow:0 18px 36px rgba(0,0,0,.5);transition:width .35s,height .35s,transform .35s;display:inline-block}
    .nf-frame-preview img{width:100%;height:100%;object-fit:cover;display:block}
  `;
  document.head.appendChild(studioStyles);

  const editSec = $('#edit') || $('#build');
  if (editSec) {
    const labSec = document.createElement('section');
    labSec.className = 'wrap';
    labSec.id = 'light-lab';
    labSec.innerHTML = `
      <div class="nf-lab">
        <div class="nf-lab-grid">
          <div class="nf-stage" id="nfLightStage">
            <img src="images/svc-portrait.jpg" id="nfPortrait" alt="Interactive studio lighting model">
            <div class="nf-beam" id="nfBeam" style="background:radial-gradient(circle at 25% 25%, rgba(255,210,160,0.42), transparent 65%)"></div>
            <div class="nf-shadow-mask" id="nfMask" style="background:linear-gradient(115deg, transparent 35%, rgba(0,0,0,0.52) 95%)"></div>
            <span style="position:absolute;left:14px;bottom:14px;background:rgba(21,18,15,.82);padding:6px 12px;border-radius:99px;font-size:12px" id="nfLightLabel">Rembrandt 45° · 3200K Warm Gold</span>
          </div>
          <div>
            <p class="mono" style="color:#B8390F;text-transform:uppercase;letter-spacing:.12em;font-size:12px">03.5 — Interactive 3D Light &amp; Frame Lab</p>
            <h3 style="font-size:clamp(26px,4vw,40px);margin:6px 0 10px">Test Our Studio Strobe &amp; Print Scale</h3>
            <p style="color:#c7bfb5;font-size:15px;margin-bottom:18px">Move the key strobe around the subject, test editorial colour gels, and preview how your framed print scales on a living-room wall.</p>
            <div style="margin-bottom:14px">
              <strong style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#c7bfb5">1. Key Light Direction</strong>
              <div class="nf-chip-row" id="nfKeyDir">
                <button type="button" class="nf-chip on" data-name="Rembrandt 45°" data-x="25%" data-y="25%" data-mask="linear-gradient(115deg, transparent 35%, rgba(0,0,0,0.52) 95%)">Rembrandt 45°</button>
                <button type="button" class="nf-chip" data-name="Butterfly Glamour" data-x="50%" data-y="18%" data-mask="radial-gradient(circle at 50% 42%, transparent 45%, rgba(0,0,0,0.45) 100%)">Butterfly Beauty</button>
                <button type="button" class="nf-chip" data-name="Split Film Noir" data-x="8%" data-y="48%" data-mask="linear-gradient(90deg, transparent 22%, rgba(0,0,0,0.78) 80%)">Split Noir</button>
                <button type="button" class="nf-chip" data-name="Golden Rim Halo" data-x="82%" data-y="22%" data-mask="linear-gradient(250deg, transparent 30%, rgba(0,0,0,0.48) 90%)">Golden Rim</button>
              </div>
            </div>
            <div style="margin-bottom:14px">
              <strong style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#c7bfb5">2. Colour Gel Temperature</strong>
              <div class="nf-chip-row" id="nfGel">
                <button type="button" class="nf-chip on" data-name="3200K Warm Gold" data-col="rgba(255,205,145,0.45)" data-filt="contrast(1.04) saturate(1.08)">3200K Warm Gold</button>
                <button type="button" class="nf-chip" data-name="5600K Crisp Daylight" data-col="rgba(220,238,255,0.38)" data-filt="contrast(1.08) saturate(1)">5600K Daylight</button>
                <button type="button" class="nf-chip" data-name="Vermilion Editorial Gel" data-col="rgba(255,75,40,0.48)" data-filt="contrast(1.15) saturate(1.25)">Vermilion Editorial</button>
                <button type="button" class="nf-chip" data-name="Silver Gelatin B&W" data-col="rgba(255,255,255,0.28)" data-filt="grayscale(1) contrast(1.25)">Silver B&amp;W</button>
              </div>
            </div>
            <div class="nf-wall">
              <strong style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#c7bfb5;display:block">3. Archival Wall Frame Visualizer</strong>
              <div class="nf-chip-row" style="justify-content:center" id="nfFrameSz">
                <button type="button" class="nf-chip" data-w="110px" data-h="140px" data-label="12×18 inch Desk/Wall Print (₹1,800)">12×18" (₹1,800)</button>
                <button type="button" class="nf-chip on" data-w="150px" data-h="190px" data-label="16×24 inch Living Room Statement (₹3,200)">16×24" (₹3,200)</button>
                <button type="button" class="nf-chip" data-w="200px" data-h="245px" data-label="24×36 inch Gallery Heirloom (₹5,500)">24×36" Gallery (₹5,500)</button>
              </div>
              <div class="nf-frame-preview" id="nfFrameBox" style="width:150px;height:190px"><img src="images/svc-portrait.jpg" alt="Framed print preview"></div>
              <p style="font-size:13px;color:#c7bfb5" id="nfFrameLabel">16×24 inch Living Room Statement (₹3,200)</p>
            </div>
          </div>
        </div>
      </div>
    `;
    editSec.parentNode.insertBefore(labSec, editSec.nextSibling);

    let curKey = 'Rembrandt 45°', curGel = '3200K Warm Gold', curCol = 'rgba(255,205,145,0.45)', curX = '25%', curY = '25%';
    function syncLight() {
      $('#nfBeam').style.background = `radial-gradient(circle at ${curX} ${curY}, ${curCol}, transparent 65%)`;
      $('#nfLightLabel').textContent = `${curKey} · ${curGel}`;
    }
    $$('#nfKeyDir .nf-chip').forEach(b => b.addEventListener('click', () => {
      $$('#nfKeyDir .nf-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      curKey = b.dataset.name; curX = b.dataset.x; curY = b.dataset.y;
      $('#nfMask').style.background = b.dataset.mask;
      syncLight();
    }));
    $$('#nfGel .nf-chip').forEach(b => b.addEventListener('click', () => {
      $$('#nfGel .nf-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      curGel = b.dataset.name; curCol = b.dataset.col;
      $('#nfPortrait').style.filter = b.dataset.filt;
      syncLight();
    }));
    $$('#nfFrameSz .nf-chip').forEach(b => b.addEventListener('click', () => {
      $$('#nfFrameSz .nf-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const box = $('#nfFrameBox');
      box.style.width = b.dataset.w; box.style.height = b.dataset.h;
      box.style.transform = 'rotateY(12deg) scale(1.03)';
      setTimeout(() => { box.style.transform = ''; }, 280);
      $('#nfFrameLabel').textContent = b.dataset.label;
    }));
  }

  /* ---------- Configurator: live estimate + WhatsApp / email hand-off --- */
  const TYPES = {
    portrait: { name: 'Portraits', base: 3500, hour: 1200, incl: '60 min · 20 edited photos', img: 'images/svc-portrait.jpg', alt: 'Studio portrait of a woman in a purple silk saree against a red backdrop' },
    family: { name: 'Family', base: 6500, hour: 1500, incl: '90 min · 30 edited photos', img: 'images/svc-family.jpg', alt: 'Family of four posing together on a cream backdrop (AI-generated stand-in image)' },
    newborn: { name: 'Newborn', base: 7500, hour: 1500, incl: '2 hrs · 25 edited photos', img: 'images/svc-newborn.jpg', alt: 'Sleeping newborn on a cream knit blanket in soft studio light (AI-generated stand-in image)' },
    product: { name: 'Product', base: 4000, hour: 800, incl: 'Up to 10 items · 3 angles each', img: 'images/g-product-4.jpg', alt: 'Perfume bottles arranged on driftwood in natural studio light' },
    wedding: { name: 'Wedding day', base: 38000, hour: 3000, incl: '8 hrs · 400+ edited photos', img: 'images/svc-wedding.jpg', alt: 'Couple in white outfits posing beside rustic wooden decor' }
  };
  const ADDONS = {
    outfit: { name: 'Outfit change', price: 800 },
    location: { name: 'On location within Bhopal', price: 1500 },
    express: { name: '48-hour express edit', price: 2000 },
    album: { name: '20-page printed album', price: 4500 }
  };
  const MAX_HOURS = 6;
  const state = { type: 'portrait', hours: 0, addons: new Set(), date: '', time: '12:00 PM' };

  const cfg = $('#configurator');
  const previewImg = $('#previewImg');
  const previewLabel = $('#previewLabel');
  const totalOut = $('#totalOut');
  const sumLines = $('#sumLines');
  const waSend = $('#waSend');
  const mailSend = $('#mailSend');
  const hoursOut = $('#hoursOut');
  const hoursMinus = $('#hoursMinus');
  const hoursPlus = $('#hoursPlus');
  const dateIn = $('#cfgDate');
  let shown = TYPES.portrait.base;
  let tweenRAF = 0;

  function quote() {
    const t = TYPES[state.type];
    const lines = [{ label: t.name + ' · ' + t.incl, value: t.base }];
    if (state.hours > 0) {
      lines.push({ label: state.hours + (state.hours === 1 ? ' extra hour' : ' extra hours') + ' × ' + money(t.hour), value: state.hours * t.hour });
    }
    state.addons.forEach((k) => lines.push({ label: ADDONS[k].name, value: ADDONS[k].price }));
    const total = lines.reduce((s, l) => s + l.value, 0);
    return { lines, total };
  }

  function messageText() {
    const t = TYPES[state.type];
    const q = quote();
    const addons = state.addons.size
      ? Array.from(state.addons).map((k) => ADDONS[k].name).join(', ')
      : 'none';
    const when = state.date
      ? new Date(state.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'flexible';
    return [
      'Hi ' + BRAND + ', I would like to book a shoot.',
      'Shoot: ' + t.name + ' (' + t.incl + ')',
      'Extra time: ' + state.hours + ' hour(s)',
      'Add-ons: ' + addons,
      'Preferred date: ' + when + ', ' + state.time,
      'Indicative estimate: ' + money(q.total) + ' (sample prices, excl. GST)',
      'Please confirm availability. Thank you!'
    ].join('\n');
  }

  function tweenTotal(to) {
    if (reduce.matches) { totalOut.textContent = money(to); shown = to; return; }
    window.cancelAnimationFrame(tweenRAF);
    const from = shown;
    const t0 = performance.now();
    const dur = 320;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      totalOut.textContent = money(from + (to - from) * e);
      if (p < 1) tweenRAF = window.requestAnimationFrame(step);
      else shown = to;
    };
    tweenRAF = window.requestAnimationFrame(step);
  }

  function swapPreview(src, alt, label) {
    previewLabel.textContent = label;
    if (previewImg.getAttribute('src') === src) { previewImg.alt = alt; return; }
    if (reduce.matches) { previewImg.src = src; previewImg.alt = alt; return; }
    previewImg.classList.add('is-swapping');
    window.setTimeout(() => {
      previewImg.src = src;
      previewImg.alt = alt;
      previewImg.classList.remove('is-swapping');
    }, 180);
  }

  function renderConfigurator() {
    const t = TYPES[state.type];
    const q = quote();
    swapPreview(t.img, t.alt, t.name);
    tweenTotal(q.total);
    sumLines.textContent = '';
    q.lines.forEach((l) => {
      const li = document.createElement('li');
      const a = document.createElement('span');
      const b = document.createElement('span');
      a.textContent = l.label;
      b.textContent = money(l.value);
      li.append(a, b);
      sumLines.appendChild(li);
    });
    hoursOut.textContent = state.hours + (state.hours === 1 ? ' extra hour' : ' extra hours');
    hoursMinus.disabled = state.hours <= 0;
    hoursPlus.disabled = state.hours >= MAX_HOURS;
    const msg = messageText();
    waSend.href = WA + '?text=' + encodeURIComponent(msg);
    mailSend.href = 'mailto:' + MAIL +
      '?subject=' + encodeURIComponent('Shoot enquiry: ' + t.name) +
      '&body=' + encodeURIComponent(msg);
    state.lastMessage = msg;
  }

  if (cfg) {
    cfg.addEventListener('change', (e) => {
      const el = e.target;
      if (el.name === 'shootType') state.type = el.value;
      else if (el.name === 'addon') {
        if (el.checked) state.addons.add(el.value); else state.addons.delete(el.value);
      } else if (el.name === 'cfgTime') state.time = el.value;
      else if (el.id === 'cfgDate') state.date = el.value;
      renderConfigurator();
    });
    hoursMinus.addEventListener('click', () => { state.hours = Math.max(0, state.hours - 1); renderConfigurator(); });
    hoursPlus.addEventListener('click', () => { state.hours = Math.min(MAX_HOURS, state.hours + 1); renderConfigurator(); });
    dateIn.min = todayISO();
    if ($('#fDate')) $('#fDate').min = todayISO();
    $('#copyQuote').addEventListener('click', async () => {
      const text = state.lastMessage || messageText();
      try {
        await navigator.clipboard.writeText(text);
        toast('Quote copied. Paste it into WhatsApp or email.');
      } catch (err) {
        toast('Use “Send this to WhatsApp” instead.');
      }
    });
    renderConfigurator();
  }

  /* ---------- Quick view dialog (services) ------------------------------ */
  const QV = {
    wedding: { title: 'Weddings', kicker: 'Service 01', list: ['Full-day coverage (8 hrs), two photographers on request', '400+ edited photos in a private online gallery [SAMPLE]', 'Candid moments plus editorial portraits', 'Pre-wedding shoot available as an add-on [PLACEHOLDER]'], price: 'From ₹38,000 [SAMPLE]' },
    portrait: { title: 'Portraits', kicker: 'Service 02', list: ['60-minute studio or outdoor session', '20 edited photos [SAMPLE]', 'Wardrobe and light advice before you come', 'Includes one outfit change'], price: 'From ₹3,500 [SAMPLE]' },
    family: { title: 'Family', kicker: 'Service 03', list: ['90-minute unposed session, all generations welcome', '30 edited photos [SAMPLE]', 'Props and pets welcome', 'Group framing for grandparents included'], price: 'From ₹6,500 [SAMPLE]' },
    newborn: { title: 'Newborn', kicker: 'Service 04', list: ['2-hour session with a warm, quiet studio', '25 edited photos [SAMPLE]', 'Parent-led, safety-first posing', 'Stops whenever baby needs a break'], price: 'From ₹7,500 [SAMPLE]' },
    product: { title: 'Product', kicker: 'Service 05', list: ['Up to 10 items per session', 'Three angles per item, edited for web and print', 'Same-week turnaround on request [PLACEHOLDER]'], price: 'From ₹4,000 [SAMPLE]' }
  };
  const qv = $('#quickView');
  let qvType = 'portrait';
  $$('[data-quick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.quick;
      const d = QV[key];
      qvType = key;
      $('#qvKicker').textContent = d.kicker;
      $('#qvTitle').textContent = d.title;
      $('#qvPrice').textContent = d.price;
      const list = $('#qvList');
      list.textContent = '';
      d.list.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      const img = $('#qvImg');
      img.src = TYPES[key].img;
      img.alt = TYPES[key].alt;
      $('#qvWa').href = WA + '?text=' + encodeURIComponent('Hi ' + BRAND + ', I would like to book a ' + d.title + ' shoot.');
      qv.showModal();
    });
  });
  $('#qvBook')?.addEventListener('click', () => {
    const radio = $('input[name="shootType"][value="' + qvType + '"]');
    if (radio) { radio.checked = true; state.type = qvType; renderConfigurator(); }
    qv.close();
    $('#build-title')?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
  });
  qv?.addEventListener('click', (e) => { if (e.target === qv) qv.close(); });

  /* ---------- Gallery: filter + search + lightbox ----------------------- */
  const tiles = $$('.tile');
  const galleryCount = $('#galleryCount');
  const galleryEmpty = $('#galleryEmpty');
  const search = $('#gallerySearch');
  let filter = 'all';
  let query = '';

  function applyGallery() {
    let n = 0;
    tiles.forEach((t) => {
      const haystack = (t.dataset.cats + ' ' + t.dataset.cap + ' ' + t.dataset.alt).toLowerCase();
      const ok = (filter === 'all' || t.dataset.cats === filter) && (!query || haystack.includes(query));
      t.hidden = !ok;
      if (ok) n++;
    });
    if (galleryCount) galleryCount.textContent = n + (n === 1 ? ' frame' : ' frames');
    if (galleryEmpty) galleryEmpty.classList.toggle('is-shown', n === 0);
  }

  $$('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      $$('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      applyGallery();
    });
  });
  search?.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    applyGallery();
  });
  $('#clearSearch')?.addEventListener('click', () => {
    search.value = '';
    query = '';
    applyGallery();
    search.focus();
  });
  applyGallery();

  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbCount = $('#lbCount');
  let lbList = [];
  let lbIndex = 0;

  function renderLB() {
    const t = lbList[lbIndex];
    lbImg.src = t.dataset.src;
    lbImg.alt = t.dataset.alt;
    lbCap.textContent = t.dataset.cap;
    lbCount.textContent = (lbIndex + 1) + ' / ' + lbList.length;
  }
  tiles.forEach((t) => t.addEventListener('click', () => {
    lbList = tiles.filter((x) => !x.hidden);
    lbIndex = lbList.indexOf(t);
    renderLB();
    lb.showModal();
  }));
  const stepLB = (d) => { lbIndex = (lbIndex + d + lbList.length) % lbList.length; renderLB(); };
  $('#lbPrev')?.addEventListener('click', () => stepLB(-1));
  $('#lbNext')?.addEventListener('click', () => stepLB(1));
  lb?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepLB(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepLB(1); }
  });

  /* ---------- Testimonials ---------------------------------------------- */
  const quotes = $$('.quote');
  const dots = $$('#quoteDots button');
  let qi = 0;
  function showQuote(i) {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle('is-active', k === qi));
    dots.forEach((d, k) => {
      d.setAttribute('aria-selected', String(k === qi));
      d.tabIndex = k === qi ? 0 : -1;
    });
  }
  dots.forEach((d, k) => d.addEventListener('click', () => showQuote(k)));
  $('#quotePrev')?.addEventListener('click', () => showQuote(qi - 1));
  $('#quoteNext')?.addEventListener('click', () => showQuote(qi + 1));
})();
