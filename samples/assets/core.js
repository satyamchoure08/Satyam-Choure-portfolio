/* Shared behaviour for the sample sites: personalising, WhatsApp, picking items, booking, edit mode and 2.5D effects. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Personal details from the link: ?name=..&phone=..&area=.. ---------- */
  const P = new URLSearchParams(location.search);
  $$('[data-k]').forEach(el => { const v = P.get(el.dataset.k); if (v) el.textContent = v; });
  const bizName = () => ($('[data-k="name"]')?.textContent || '').trim();
  function syncName() {
    const n = bizName();
    if (n) document.title = n;
    $$('[data-initial]').forEach(i => (i.textContent = (n.charAt(0) || '•').toUpperCase()));
  }
  syncName();
  $$('[data-k]').forEach(el => el.addEventListener('input', () => {
    $$(`[data-k="${el.dataset.k}"]`).forEach(o => { if (o !== el) o.textContent = el.textContent; });
    if (el.dataset.k === 'name') syncName();
  }));
  $$('[data-year]').forEach(e => (e.textContent = new Date().getFullYear()));

  /* ---------- Toast ---------- */
  const toastEl = document.createElement('div');
  toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
  document.body.append(toastEl);
  let tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 3000); }

  /* ---------- Call, WhatsApp, map ---------- */
  const num = () => ($('[data-k="phone"]')?.textContent || '').replace(/\D/g, '').slice(-10);
  function hasNum() { if (num().length === 10) return true; toast('Add the phone number first: tap Edit'); return false; }
  function callNow() { if (hasNum()) location.href = 'tel:+91' + num(); }
  function waSend(msg) { if (hasNum()) window.open('https://wa.me/91' + num() + '?text=' + encodeURIComponent(msg), '_blank'); }
  function directions() {
    const a = ($('#addr')?.textContent || '').trim();
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(bizName() + ', ' + a), '_blank');
  }

  /* ---------- Picking items (menu, services, plans, rooms) ---------- */
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const priceOf = it => parseInt(($('[data-price]', it)?.textContent || '0').replace(/\D/g, '')) || 0;
  const nameOf = it => ($('[data-name]', it)?.textContent || '').trim();
  const picks = () => $$('[data-item]').map(it => ({ it, q: +(it.dataset.q || 0) })).filter(x => x.q > 0);
  function updatePicks() {
    const p = picks();
    const count = p.reduce((s, x) => s + x.q, 0);
    const total = p.reduce((s, x) => s + x.q * priceOf(x.it), 0);
    document.body.classList.toggle('has-picks', count > 0);
    $$('[data-pick-count]').forEach(e => (e.textContent = count + ' ' + (count === 1 ? (e.dataset.one || 'item') : (e.dataset.many || 'items'))));
    $$('[data-pick-total]').forEach(e => (e.textContent = inr(total)));
    $$('[data-pick-list]').forEach(e => (e.textContent = p.length ? p.map(x => (x.q > 1 ? x.q + ' × ' : '') + nameOf(x.it)).join(', ') + ' (' + inr(total) + ')' : (e.dataset.empty || '')));
  }
  function setQ(it, q) {
    const max = +(it.closest('[data-max]')?.dataset.max || 99);
    q = Math.max(0, Math.min(max, q));
    it.dataset.q = q;
    it.classList.toggle('on', q > 0);
    const qe = $('[data-q]', it); if (qe) qe.textContent = q;
    const add = $('[data-add]', it);
    if (add && add.dataset.on) add.textContent = q > 0 ? add.dataset.on : add.dataset.off;
    // single choice groups (e.g. one room type)
    const grp = it.closest('[data-single]');
    if (grp && q > 0) $$('[data-item]', grp).forEach(o => { if (o !== it && +(o.dataset.q || 0) > 0) setQ(o, 0); });
    updatePicks();
  }
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'), sub = e.target.closest('[data-sub]');
    if (!add && !sub) return;
    const it = (add || sub).closest('[data-item]'); if (!it) return;
    const q = +(it.dataset.q || 0);
    const max = +(it.closest('[data-max]')?.dataset.max || 99);
    if (add) setQ(it, max === 1 ? (q ? 0 : 1) : q + 1); else setQ(it, q - 1);
    if (add && navigator.vibrate) navigator.vibrate(12);
  });
  $$('[data-add]').forEach(a => { if (a.dataset.on && !a.dataset.off) a.dataset.off = a.textContent; });
  updatePicks();
  function pickLines() {
    const p = picks(); if (!p.length) return '';
    const total = p.reduce((s, x) => s + x.q * priceOf(x.it), 0);
    return p.map(x => '• ' + (x.q > 1 ? x.q + ' × ' : '') + nameOf(x.it) + ' – ' + inr(priceOf(x.it) * x.q)).join('\n') + '\nTotal: ' + inr(total);
  }
  function sendPicks(intro) {
    const l = pickLines();
    if (!l) { toast('Pick something first'); return; }
    waSend('Hello ' + bizName() + ', ' + intro + '\n' + l);
  }

  /* ---------- Booking forms → WhatsApp ---------- */
  const fmtDate = v => { const d = new Date(v + 'T00:00'); return isNaN(d) ? v : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); };
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-wa]'); if (!f) return;
    e.preventDefault();
    const lines = [], seen = new Set();
    for (const el of f.elements) {
      const lab = el.dataset && el.dataset.label; if (!lab) continue;
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) continue;
      let v = (el.value || '').trim(); if (!v || seen.has(lab)) continue;
      if (el.type === 'date') v = fmtDate(v);
      lines.push(lab + ': ' + v); seen.add(lab);
    }
    const pl = f.hasAttribute('data-with-picks') ? pickLines() : '';
    if (f.hasAttribute('data-need-picks') && !pl) { toast(f.dataset.needPicks || 'Pick something first'); return; }
    if (f.hasAttribute('data-need-any') && !pl && !lines.length) { toast(f.dataset.needAny || 'Add something first'); return; }
    waSend('Hello ' + bizName() + ', ' + f.dataset.wa + '\n' + lines.join('\n') + (pl ? '\n' + pl : ''));
  });
  // default dates: today / tomorrow
  const isoLocal = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  $$('input[type=date][data-default]').forEach(i => {
    const d = new Date(); d.setDate(d.getDate() + (+i.dataset.default || 0));
    i.value = isoLocal(d); i.min = isoLocal(new Date());
  });

  /* ---------- Open now / closed (data-status="10-13,17-21" data-off="0") ---------- */
  function fmtH(h) { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); const ap = hh >= 12 ? 'PM' : 'AM'; const h12 = ((hh + 11) % 12) + 1; return h12 + (mm ? ':' + String(mm).padStart(2, '0') : '') + ' ' + ap; }
  function status() {
    $$('[data-status]').forEach(el => {
      const ranges = el.dataset.status.split(',').map(r => r.split('-').map(Number));
      const off = (el.dataset.off || '').split(',').filter(Boolean).map(Number);
      const now = new Date(), day = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
      let txt, open = false;
      if (off.includes(day)) txt = 'Closed today';
      else {
        const cur = ranges.find(([a, b]) => h >= a && h < b);
        if (cur) { open = true; txt = 'Open now, until ' + fmtH(cur[1]); }
        else { const next = ranges.find(([a]) => h < a); txt = next ? 'Opens at ' + fmtH(next[0]) : 'Closed now'; }
      }
      el.textContent = txt; el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open);
    });
  }
  status(); setInterval(status, 60000);

  /* ---------- Edit mode (for showing owners their own site) ---------- */
  const ctl = document.createElement('div');
  ctl.className = 'edit-ctl';
  ctl.innerHTML = '<button type="button" class="link-btn">Copy link</button><button type="button" class="edit-btn">Edit</button>';
  document.body.append(ctl);
  let editing = false;
  function toggleEdit() {
    editing = !editing;
    document.body.classList.toggle('editing', editing);
    $$('[data-k],[data-e]').forEach(el => (el.contentEditable = editing ? 'true' : 'false'));
    $('.edit-btn', ctl).textContent = editing ? 'Done' : 'Edit';
    if (editing) toast('Tap any text to change it. Use Add photo on a picture to put in your own.');
    else updatePicks();
  }
  $('.edit-btn', ctl).onclick = toggleEdit;
  async function copyLink() {
    if (location.protocol === 'file:') { toast('Put this site online first, then links will work'); return; }
    const u = new URL(location.origin + location.pathname);
    u.searchParams.set('name', bizName());
    if (num().length === 10) u.searchParams.set('phone', num());
    const a = $('[data-k="area"]'); if (a) u.searchParams.set('area', a.textContent.trim());
    try { await navigator.clipboard.writeText(u.href); toast('Link copied. Paste it on WhatsApp'); }
    catch (e) { prompt('Copy this link:', u.href); }
  }
  $('.link-btn', ctl).onclick = copyLink;

  // photo slots
  $$('[data-photo]').forEach(slot => {
    const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', hidden: true });
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'ph-btn', textContent: 'Add photo' });
    slot.append(inp, b);
    b.onclick = e => { e.stopPropagation(); e.preventDefault(); inp.click(); };
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      slot.style.backgroundImage = 'url("' + URL.createObjectURL(f) + '")';
      b.textContent = 'Change photo';
    };
  });

  /* ---------- 2.5D effects ---------- */
  // pointer tilt with moving glare
  if (!reduce) $$('[data-tilt]').forEach(el => {
    const max = +(el.dataset.tilt || 12);
    el.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg');
      el.style.setProperty('--ry', (x * max).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', ((y + .5) * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  // scroll depth: sets --p (-1 … 1) = where the element sits in the screen; CSS turns it into 3D
  const depthEls = $$('[data-depth]');
  // coverflow strips
  const flows = $$('[data-flow]');
  function flowUpdate(fl) {
    const c = fl.scrollLeft + fl.clientWidth / 2;
    [...fl.children].forEach(ch => {
      const d = Math.max(-1.6, Math.min(1.6, (ch.offsetLeft + ch.offsetWidth / 2 - c) / ch.offsetWidth));
      ch.style.setProperty('--d', d.toFixed(3)); ch.style.setProperty('--ad', Math.abs(d).toFixed(3));
    });
  }
  flows.forEach(fl => {
    let q = 0; fl.addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(() => { q = 0; flowUpdate(fl); }); }, { passive: true });
    // start on the second item so both sides show depth
    requestAnimationFrame(() => { const ch = fl.children[1]; if (ch && fl.dataset.flow !== 'start') fl.scrollLeft = ch.offsetLeft + ch.offsetWidth / 2 - fl.clientWidth / 2; flowUpdate(fl); });
  });
  let sq = 0;
  function onScroll() {
    sq = 0; const h = innerHeight;
    depthEls.forEach(el => { const r = el.getBoundingClientRect(); const p = (r.top + r.height / 2 - h / 2) / h; el.style.setProperty('--p', Math.max(-1.2, Math.min(1.2, p)).toFixed(3)); });
    document.documentElement.style.setProperty('--sy', scrollY.toFixed(0));
    document.body.classList.toggle('show-dock', scrollY > h * 0.55);
  }
  addEventListener('scroll', () => { if (!sq) sq = requestAnimationFrame(onScroll); }, { passive: true });
  if (!reduce) { addEventListener('resize', () => { onScroll(); flows.forEach(flowUpdate); }); }
  onScroll();

  // 3D entrances for key pieces
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  // tabs that scroll to sections and highlight on scroll
  $$('[data-tabs]').forEach(nav => {
    const links = $$('a[href^="#"]', nav);
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const tio = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); const on = links.find(a => a.classList.contains('on')); if (on) nav.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' }); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => tio.observe(s));
  });

  Object.assign(window, { callNow, waSend, directions, sendPicks, toast, toggleEdit, copyLink, bizName });
})();
