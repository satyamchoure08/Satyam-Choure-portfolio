/* Soft scroll + hover effects shared by the sample sites. Safe to remove: pages work the same without it. */
(function () {
  'use strict';
  try {
    var d = document, w = window;
    if (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (/[?&]nomotion\b/.test(location.search)) return;
    var fine = w.matchMedia && w.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var SKIP = /(^|[\s_-])(rv|reveal|fade-up|aos|visible)([\s_-]|$)/;
    function skip(el) {
      if (el.matches('.sr-only,[hidden],[aria-hidden="true"]')) return true;
      for (var n = el; n && n !== d.body; n = n.parentElement) {
        var cl = n.getAttribute('class') || '';
        if (n.hasAttribute('data-reveal') || SKIP.test(cl) || /marquee|ticker|slider|carousel|swiper|track/.test(cl)) return true;
        if (getComputedStyle(n).animationName !== 'none') return true;
      }
      return false;
    }

    /* 1. scroll progress bar, coloured like the site's main button */
    var bar = d.createElement('div'); bar.className = 'mx-bar'; bar.setAttribute('aria-hidden', 'true');
    d.body.appendChild(bar);
    var accent = '', best = 0.28;
    var cand = d.querySelectorAll('.btn-primary,.btn--primary,.btn-solid,.btn-gold,.btn-wa,.btn,button,a[class*="btn"]');
    function sat(c) {
      var m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return 0;
      if (m[4] !== undefined && +m[4] < 0.9) return 0;
      var r = +m[1] / 255, g = +m[2] / 255, bl = +m[3] / 255, mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
      return mx - mn;
    }
    for (var i = 0; i < cand.length; i++) {
      var c = getComputedStyle(cand[i]).backgroundColor, v = sat(c);
      if (v > best) { best = v; accent = c; }
    }
    if (accent) bar.style.setProperty('--mx-accent', accent);

    /* 2. reveal things that start below the first screen */
    var SEL = 'section h2,.sec-head,.sec-title,[class*="card"]:not([class*="__"]),.tile,.tc,.stat,.choice,.price,.plan,.feature,section img';
    var els = [].slice.call(d.querySelectorAll(SEL)).filter(function (el) {
      if (el.closest('header,nav,footer,[class*="hero"],[class*="modal"],[class*="drawer"],[class*="menu"]')) return false;
      if (skip(el)) return false;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.top < w.innerHeight * 0.92) return false;
      return true;
    });
    // an element inside another animated element is left alone
    els = els.filter(function (el) { return !els.some(function (o) { return o !== el && o.contains(el) && !(o.tagName === 'IMG'); }); });
    var kids = new Map();
    els.forEach(function (el) {
      var p = el.parentElement, n = kids.get(p) || 0; kids.set(p, n + 1);
      el.style.setProperty('--mx-d', Math.min(n, 5) * 0.07 + 's');
      el.classList.add('mx-pre', 'mx-run');
      if (el.tagName === 'IMG') el.classList.add('mx-img');
    });
    function show(el) {
      el.classList.add('mx-in');
      setTimeout(function () { el.classList.remove('mx-pre', 'mx-run', 'mx-in', 'mx-img'); el.style.removeProperty('--mx-d'); }, 1700);
    }
    if ('IntersectionObserver' in w) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); show(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else { els.forEach(show); }
    setTimeout(function () { els.forEach(function (el) { if (el.classList.contains('mx-pre') && !el.classList.contains('mx-in')) { var r = el.getBoundingClientRect(); if (r.top < w.innerHeight) show(el); } }); }, 5000);

    /* 3. progress bar + hero drift */
    var hero = d.querySelector('[class*="hero"] img, section img');
    if (hero && hero.closest('[class*="hero"],section:first-of-type,header')) {
      var hr = hero.getBoundingClientRect(); if (hr.top > w.innerHeight) hero = null;
    } else hero = null;
    var ticking = false;
    function sweep() {
      var vh = w.innerHeight * 0.9;
      for (var k = 0; k < els.length; k++) {
        var el = els[k];
        if (el.classList.contains('mx-pre') && !el.classList.contains('mx-in') && el.getBoundingClientRect().top < vh) show(el);
      }
    }
    function frame() {
      ticking = false; sweep();
      var max = d.documentElement.scrollHeight - w.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, w.scrollY / max) : 0) + ')';
      if (hero) hero.style.translate = '0 ' + Math.min(14, w.scrollY * 0.03).toFixed(1) + 'px';
    }
    w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();

    /* 4. buttons lift a little on hover; card photos lean toward the pointer (mouse only) */
    if (fine) {
      d.addEventListener('pointerover', function (e) {
        var b = e.target.closest && e.target.closest('a.btn,button.btn,.btn,a[class*="btn"],button[class*="btn"]');
        if (!b || b._mx || b.disabled) return; b._mx = 1;
        b.animate([{ translate: '0 0' }, { translate: '0 -2px' }], { duration: 180, fill: 'forwards', easing: 'ease-out' });
      }, { passive: true });
      d.addEventListener('pointerout', function (e) {
        var b = e.target.closest && e.target.closest('a.btn,button.btn,.btn,a[class*="btn"],button[class*="btn"]');
        if (!b || !b._mx || b.contains(e.relatedTarget)) return; b._mx = 0;
        b.getAnimations().forEach(function (a) { if (a.effect && a.effect.getKeyframes && a.effect.getKeyframes()[1] && a.effect.getKeyframes()[1].translate) a.cancel(); });
      }, { passive: true });
      var cards = d.querySelectorAll('[class*="card"]:not([class*="__"]),.tile,.choice');
      [].forEach.call(cards, function (c) {
        var im = c.querySelector('img'); if (!im) return;
        var box = im.parentElement, ov = getComputedStyle(box).overflow;
        if (ov === 'visible' && getComputedStyle(c).overflow === 'visible') return;
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width - 0.5) * 10, y = ((e.clientY - r.top) / r.height - 0.5) * 10;
          im.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px'; im.style.scale = '1.05';
        }, { passive: true });
        c.addEventListener('pointerleave', function () {
          im.animate([{ translate: im.style.translate || '0 0', scale: '1.05' }, { translate: '0 0', scale: '1' }], { duration: 350, easing: 'ease-out' });
          im.style.translate = ''; im.style.scale = '';
        });
      });
    }
  } catch (err) { /* effects are optional */ }
})();
