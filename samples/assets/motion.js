/* Upgraded 3D Kinetic Scroll, Perspective Tilt & Magnetic Motion Engine */
(function(){
  if (window.__DEMO_MOTION_V3__) return;
  window.__DEMO_MOTION_V3__ = true;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Top Scroll Laser Progress Bar
  if (!document.getElementById(' scrollProgress') && !document.querySelector('.scroll-progress-v3')) {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-v3';
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#f59e0b,#ff5a1f,#c6ff3d);z-index:99999;pointer-events:none;transition:width 0.1s ease-out;';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = ((window.scrollY / max) * 100).toFixed(1) + '%';
    }, { passive: true });
  }

  if (reduce) return;

  // 3D Perspective Card Tilt on interactive cards
  const cardSelector = '[data-tilt], .card, .p-card, .prod-card, .m-item, .dish-card, .tilt-card, .course-card, .prop-card, .pkg-card';
  document.querySelectorAll(cardSelector).forEach(card => {
    if (card.__tiltWired) return;
    card.__tiltWired = true;
    const maxTilt = parseFloat(card.getAttribute('data-tilt')) || 9;
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * maxTilt).toFixed(2)}deg) rotateY(${(x * maxTilt).toFixed(2)}deg) translateZ(6px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // Scroll-Velocity Skew on marquees / tickers
  let lastY = window.scrollY, skew = 0;
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    skew = Math.max(-10, Math.min(10, dy * 0.25));
    document.querySelectorAll('.marquee, .ticker-track, [data-marquee]').forEach(m => {
      m.style.transform = `skewX(${(-skew).toFixed(2)}deg)`;
    });
  }, { passive: true });
})();
