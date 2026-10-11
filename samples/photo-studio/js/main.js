/* Noor Frame Studio — interactions
   Vanilla JS, no third-party code, no cookies, no network calls except the
   WhatsApp / mailto / maps links the visitor chooses to tap.
   [PLACEHOLDER] WhatsApp number and brand name live in the constants below. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // [PLACEHOLDER] brand + WhatsApp number (digits only, country code first)
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

  /* ---------- Header: smart hide on scroll down, FAB visibility --------- */
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

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 12);
    if (y > lastY + 6 && y > 240) header.classList.add('is-hidden');
    else if (y < lastY - 6) header.classList.remove('is-hidden');
    lastY = y;
    fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
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
  menuOpen.addEventListener('click', () => {
    drawer.showModal();
    menuOpen.setAttribute('aria-expanded', 'true');
  });
  $('#menuClose').addEventListener('click', () => drawer.close());
  drawer.addEventListener('close', () => menuOpen.setAttribute('aria-expanded', 'false'));
  $$('a[href^="#"]', drawer).forEach((a) => a.addEventListener('click', () => drawer.close()));

  /* ---------- Generic close buttons for dialogs ------------------------- */
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));

  /* ---------- Hero 3D tilt (desktop + motion allowed only) -------------- */
  const hero = $('.hero');
  const stack = $('#heroStack');
  if (stack && fine.matches && !reduce.matches) {
    hero.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      stack.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
      stack.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
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
  function setBA(v) {
    ba.style.setProperty('--pos', v + '%');
    baRange.setAttribute('aria-valuetext', 'Divider at ' + v + '%');
  }
  baRange.addEventListener('input', () => setBA(baRange.value));
  setBA(baRange.value);

  /* ---------- Toasts ---------------------------------------------------- */
  const toastRegion = $('#toasts');
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastRegion.appendChild(t);
    window.setTimeout(() => t.remove(), 2600);
  }

  /* ---------- Configurator: live estimate + WhatsApp / email hand-off --- */
  // [SAMPLE] prices in INR. Edit here; the summary, message and mailto update automatically.
  const TYPES = {
    portrait: { name: 'Portraits', base: 3500, hour: 1200, incl: '60 min · 20 edited photos', img: 'images/svc-portrait.jpg', alt: 'Studio portrait of a woman in black, side-lit against a dark backdrop' },
    family:   { name: 'Family', base: 6500, hour: 1500, incl: '90 min · 30 edited photos', img: 'images/svc-family.jpg', alt: 'Family of four posing together on a cream backdrop (AI-generated stand-in image)' },
    newborn:  { name: 'Newborn', base: 7500, hour: 1500, incl: '2 hrs · 25 edited photos', img: 'images/svc-newborn.jpg', alt: 'Sleeping newborn on a cream knit blanket in soft studio light (AI-generated stand-in image)' },
    product:  { name: 'Product', base: 4000, hour: 800, incl: 'Up to 10 items · 3 angles each', img: 'images/g-product-4.jpg', alt: 'Perfume bottles arranged on driftwood in natural studio light' },
    wedding:  { name: 'Wedding day', base: 38000, hour: 3000, incl: '8 hrs · 400+ edited photos', img: 'images/svc-wedding.jpg', alt: 'Couple in white outfits posing beside rustic wooden decor' }
  };
  const ADDONS = {
    outfit:   { name: 'Outfit change', price: 800 },
    location: { name: 'On location within Bhopal', price: 1500 },
    express:  { name: '48-hour express edit', price: 2000 },
    album:    { name: '20-page printed album', price: 4500 }
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
  $('#fDate').min = todayISO();

  $('#copyQuote').addEventListener('click', async () => {
    const text = state.lastMessage || messageText();
    try {
      if (!navigator.clipboard) throw new Error('no clipboard api');
      await navigator.clipboard.writeText(text);
      toast('Quote copied. Paste it into WhatsApp or email.');
    } catch (err) {
      // Fallback for older browsers / iframes without Clipboard permission
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
      toast(ok ? 'Quote copied.' : 'Could not copy. Use “Send this to WhatsApp” instead.');
    }
  });

  renderConfigurator();

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
  $('#qvBook').addEventListener('click', () => {
    const radio = $('input[name="shootType"][value="' + qvType + '"]');
    if (radio) { radio.checked = true; state.type = qvType; renderConfigurator(); }
    qv.close();
    const title = $('#build-title');
    title.setAttribute('tabindex', '-1');
    title.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => title.focus({ preventScroll: true }), reduce.matches ? 0 : 450);
  });
  qv.addEventListener('click', (e) => { if (e.target === qv) qv.close(); });

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
    galleryCount.textContent = n + (n === 1 ? ' frame' : ' frames');
    galleryEmpty.classList.toggle('is-shown', n === 0);
  }

  $$('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      $$('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      applyGallery();
    });
  });
  search.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    applyGallery();
  });
  $('#clearSearch').addEventListener('click', () => {
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
  const step = (d) => { lbIndex = (lbIndex + d + lbList.length) % lbList.length; renderLB(); };
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
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
  $('#quotePrev').addEventListener('click', () => showQuote(qi - 1));
  $('#quoteNext').addEventListener('click', () => showQuote(qi + 1));
  $('#quoteDots').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      showQuote(qi + (e.key === 'ArrowRight' ? 1 : -1));
      dots[qi].focus();
    }
  });

  /* ---------- Enquiry form: validation + loading / success / error ------ */
  const form = $('#enquiryForm');
  const submitBtn = $('#fSubmit');
  const panels = { loading: $('#panelLoading'), ok: $('#panelOk'), err: $('#panelErr') };
  const msgCount = $('#fMsg-count');
  const fMsg = $('#fMsg');
  fMsg.addEventListener('input', () => { msgCount.textContent = fMsg.value.length + ' / 500'; });

  const rules = {
    fName: (el) => (el.value.trim().length >= 2 ? '' : 'Please enter your name (at least 2 letters).'),
    fPhone: (el) => {
      const d = el.value.replace(/[\s\-+()]/g, '').replace(/^91(?=\d{10}$)/, '');
      return /^[6-9]\d{9}$/.test(d) ? '' : 'Enter a 10-digit mobile number, for example 98000 00000.';
    },
    fEmail: (el) => (!el.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()) ? '' : 'That email doesn’t look right. Check for typos.'),
    fType: (el) => (el.value ? '' : 'Choose the shoot you are interested in.'),
    fDate: (el) => (!el.value || el.value >= todayISO() ? '' : 'Pick today or a later date.'),
    fConsent: (el) => (el.checked ? '' : 'Please tick the box so we can reply on WhatsApp.')
  };

  function checkField(id, showAll) {
    const el = $('#' + id);
    const errEl = $('#' + id + '-err');
    const msg = rules[id](el);
    const touched = el.dataset.touched === '1' || showAll;
    el.setAttribute('aria-invalid', msg && touched ? 'true' : 'false');
    if (touched) errEl.textContent = msg;
    return msg;
  }

  Object.keys(rules).forEach((id) => {
    const el = $('#' + id);
    el.addEventListener('blur', () => { el.dataset.touched = '1'; checkField(id, false); });
    el.addEventListener('input', () => { if (el.dataset.touched === '1') checkField(id, false); });
    el.addEventListener('change', () => { if (el.dataset.touched === '1') checkField(id, false); });
  });

  function showPanel(name) {
    Object.keys(panels).forEach((k) => { panels[k].hidden = k !== name; });
  }

  function buildEnquiry() {
    const v = (id) => $('#' + id).value.trim();
    const typeLabel = $('#fType').selectedOptions[0].textContent;
    const lines = [
      'Hi ' + BRAND + ', I would like to enquire about a shoot.',
      'Name: ' + v('fName'),
      'WhatsApp: ' + v('fPhone'),
      v('fEmail') ? 'Email: ' + v('fEmail') : null,
      'Shoot: ' + typeLabel,
      v('fDate') ? 'Preferred date: ' + v('fDate') : 'Preferred date: flexible',
      v('fMsg') ? 'Notes: ' + v('fMsg') : null
    ].filter(Boolean);
    return WA + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  let sendTimer = 0;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ids = Object.keys(rules);
    ids.forEach((id) => { $('#' + id).dataset.touched = '1'; });
    const invalid = ids.filter((id) => checkField(id, true));
    if (invalid.length) {
      $('#' + invalid[0]).focus();
      return;
    }
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Preparing…';
    form.hidden = true;
    showPanel('loading');
    window.clearTimeout(sendTimer);
    sendTimer = window.setTimeout(() => {
      try {
        const url = buildEnquiry();
        $('#panelOkLink').href = url;
        showPanel('ok');
        // Opens in a new tab; if the browser blocks it, the visible button above works.
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
      } catch (err) {
        showPanel('err');
      } finally {
        submitBtn.removeAttribute('aria-busy');
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send on WhatsApp';
      }
    }, 700);
  });

  $('#panelOkReset').addEventListener('click', () => {
    form.reset();
    fMsg.dispatchEvent(new Event('input'));
    Object.keys(rules).forEach((id) => { const el = $('#' + id); el.dataset.touched = ''; el.setAttribute('aria-invalid', 'false'); $('#' + id + '-err') && ($('#' + id + '-err').textContent = ''); });
    $('#fConsent-err').textContent = '';
    panels.ok.hidden = true;
    form.hidden = false;
    $('#fName').focus();
  });
  $('#panelErrRetry').addEventListener('click', () => {
    panels.err.hidden = true;
    form.hidden = false;
    $('#fSubmit').focus();
  });

  /* ---------- Smooth anchors that respect reduced motion ---------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();
