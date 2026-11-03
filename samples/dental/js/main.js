(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero load sequence: start once the hero photo and fonts are ready (or after 1.2s at most) */
  const heroImg = document.querySelector('.arch--hero img');
  let started = false;
  const start = () => { if (started) return; started = true; requestAnimationFrame(() => root.classList.add('ready')); };
  const waits = [];
  if (heroImg && !heroImg.complete) waits.push(new Promise(r => { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }); }));
  if (document.fonts && document.fonts.ready) waits.push(document.fonts.ready);
  Promise.all(waits).then(start);
  setTimeout(start, 1200);

  /* Header border after scrolling */
  const top = document.querySelector('[data-top]');
  const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Open now / today's hours (Indian time) */
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const todayRow = document.querySelector(`.hours tr[data-day="${day}"]`);
  if (todayRow) todayRow.classList.add('is-today');
  const status = document.querySelector('[data-open-status]');
  if (status) {
    const open = day !== 0 && mins >= 600 && mins < 1200;
    if (open) { status.textContent = 'Open now, until 8 pm'; status.classList.add('is-open'); }
    else if (day === 0) status.textContent = 'Closed today. Sunday visits by appointment';
    else if (mins < 600) status.textContent = 'Opens today at 10 am';
    else status.textContent = day === 6 ? 'Closed now. Sunday by appointment, Monday from 10 am' : 'Closed now. Opens tomorrow at 10 am';
  }

  /* Concern picker (accessible tabs) */
  const picker = document.querySelector('[data-picker]');
  if (picker) {
    const tabs = [...picker.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('is-on', on);
        if (on && !reduce) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
      });
      if (focus) tab.focus();
      if (window.innerWidth <= 900) tab.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (e.key in keys) { e.preventDefault(); select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  }

  /* First visit: the step in the middle of the screen lights up and swaps the pinned photo */
  const steps = [...document.querySelectorAll('[data-step]')];
  const stepImgs = [...document.querySelectorAll('[data-step-img]')];
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const n = en.target.dataset.step;
        steps.forEach(s => s.classList.toggle('is-on', s === en.target));
        stepImgs.forEach(img => img.classList.toggle('is-on', img.dataset.stepImg === n));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }

  /* Studio gallery: slow parallax inside each frame */
  const frames = [...document.querySelectorAll('[data-parallax]')];
  if (frames.length && !reduce) {
    const imgs = frames.map(f => f.querySelector('img'));
    imgs.forEach(img => { img.style.transform = 'scale(1.12)'; });
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      frames.forEach((f, i) => {
        const r = f.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 roughly
        imgs[i].style.transform = `translate3d(0, ${(p * -6).toFixed(2)}%, 0) scale(1.12)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
