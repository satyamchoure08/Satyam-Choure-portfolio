/* ============================================================
   KOHINOOR ESTATES — core engine (theme, i18n, nav, reveal,
   toasts, modal, wishlist, accordion, micro-interactions)
   Classic script: exposes window.KE
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.KE_CONFIG, I18N = window.KE_I18N;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- money ---------- */
  function fmtINR(n) {           // n = rupees
    if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2).replace(/\.00$/, "") + " Cr";
    if (n >= 1e5) return "₹" + Math.round(n / 1e5) + " L";
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }
  function priceLabel(lakh) { return fmtINR(lakh * 1e5); }
  function waLink(text) {
    return "https://wa.me/" + CFG.waNumber + "?text=" + encodeURIComponent(text);
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("ke-theme", t); } catch (e) {}
    $$(".js-theme").forEach(function (b) { b.setAttribute("aria-pressed", String(t === "dark")); });
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("ke-theme"); } catch (e) {}
    var t = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", t);
    $$(".js-theme").forEach(function (b) {
      b.setAttribute("aria-pressed", String(t === "dark"));
      b.addEventListener("click", function () {
        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    });
  }

  /* ---------- i18n ---------- */
  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    var dict = I18N[lang] || I18N.en;
    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    $$(".js-lang").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem("ke-lang", lang); } catch (e) {}
  }
  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem("ke-lang"); } catch (e) {}
    applyLang(saved === "hi" ? "hi" : "en");
    $$(".js-lang").forEach(function (b) {
      b.addEventListener("click", function () {
        applyLang(document.documentElement.getAttribute("lang") === "hi" ? "en" : "hi");
      });
    });
  }

  /* ---------- header ---------- */
  function initHeader() {
    var head = $(".site-head");
    if (!head) return;
    var onScroll = function () { head.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile drawer ---------- */
  var lastFocus = null;
  function openDrawer(d) {
    lastFocus = document.activeElement;
    d.classList.add("open");
    document.body.style.overflow = "hidden";
    var f = d.querySelector("a,button"); if (f) f.focus();
  }
  function closeDrawer(d) {
    d.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function initDrawer() {
    var d = $("#drawer"), b = $("#burger");
    if (!d || !b) return;
    b.addEventListener("click", function () {
      d.classList.contains("open") ? closeDrawer(d) : openDrawer(d);
      b.setAttribute("aria-expanded", String(d.classList.contains("open")));
    });
    $$("[data-close-drawer]", d).forEach(function (x) {
      x.addEventListener("click", function () { closeDrawer(d); b.setAttribute("aria-expanded", "false"); });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var els = $$(".rv, .lines");
    if (!els.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up ---------- */
  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    var run = function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      if (reduced) { el.textContent = String(end); return; }
      var t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        p = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(end * p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- magnetic micro-hover ---------- */
  function initMagnetic() {
    if (reduced || !finePointer) return;
    $$("[data-mag]").forEach(function (el) {
      el.addEventListener("mousemove", function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) / r.width;
        var y = (ev.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = "translate(" + x * 8 + "px," + y * 6 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- toasts ---------- */
  function toast(msg, actionLabel, actionFn) {
    var wrap = $("#toasts"); if (!wrap) return;
    var t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status");
    var span = document.createElement("span"); span.textContent = msg; t.appendChild(span);
    if (actionLabel) {
      var b = document.createElement("button"); b.textContent = actionLabel;
      b.addEventListener("click", function () { actionFn && actionFn(); kill(); });
      t.appendChild(b);
    }
    wrap.appendChild(t);
    var kill = function () { t.remove(); };
    setTimeout(kill, 4200);
  }

  /* ---------- focus trap ---------- */
  function trap(scope) {
    var sel = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
    function onKey(e) {
      if (e.key !== "Tab") return;
      var els = $$(sel, scope).filter(function (el) { return el.offsetParent !== null; });
      if (!els.length) return;
      var first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
    scope.addEventListener("keydown", onKey);
    return function () { scope.removeEventListener("keydown", onKey); };
  }

  /* ---------- modal ---------- */
  var modalTrap = null;
  function openModal(back) {
    lastFocus = document.activeElement;
    back.hidden = false;
    requestAnimationFrame(function () { back.classList.add("show"); });
    document.body.style.overflow = "hidden";
    modalTrap = trap(back);
    var f = back.querySelector(".modal-x") || back.querySelector("button,a"); if (f) f.focus();
  }
  function closeModal(back) {
    back.classList.remove("show");
    document.body.style.overflow = "";
    if (modalTrap) { modalTrap(); modalTrap = null; }
    setTimeout(function () { back.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }
  function initModal() {
    $$(".modal-back").forEach(function (back) {
      back.addEventListener("click", function (e) { if (e.target === back) closeModal(back); });
      $$("[data-close-modal]", back).forEach(function (x) {
        x.addEventListener("click", function () { closeModal(back); });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var m = $(".modal-back.show"); if (m) closeModal(m);
      var d = $(".drawer.open"); if (d) { closeDrawer(d); var b = $("#burger"); b && b.setAttribute("aria-expanded", "false"); }
      var s = $(".side-drawer.open"); if (s) closeSide(s);
      var lb = $(".lightbox"); if (lb) lb.remove();
    });
  }

  /* ---------- side drawers (wishlist/compare) ---------- */
  var sideTrap = null;
  function openSide(d) {
    lastFocus = document.activeElement;
    d.classList.add("open"); document.body.style.overflow = "hidden";
    sideTrap = trap(d);
  }
  function closeSide(d) {
    d.classList.remove("open"); document.body.style.overflow = "";
    if (sideTrap) { sideTrap(); sideTrap = null; }
    if (lastFocus) lastFocus.focus();
  }
  function initSide() {
    $$(".side-drawer").forEach(function (d) {
      $$("[data-close-side]", d).forEach(function (x) {
        x.addEventListener("click", function () { closeSide(d); });
      });
    });
  }

  /* ---------- wishlist ---------- */
  var wish = {
    get: function () { try { return JSON.parse(localStorage.getItem("ke-wish") || "[]"); } catch (e) { return []; } },
    has: function (id) { return this.get().indexOf(id) > -1; },
    toggle: function (id) {
      var w = this.get();
      var i = w.indexOf(id);
      if (i > -1) w.splice(i, 1); else w.push(id);
      try { localStorage.setItem("ke-wish", JSON.stringify(w)); } catch (e) {}
      return i === -1;
    }
  };
  function syncWishButtons() {
    $$(".pcard-wish").forEach(function (b) {
      var on = wish.has(b.getAttribute("data-wish"));
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? "Remove from shortlist" : "Save to shortlist");
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    $$(".faq-item").forEach(function (item) {
      var q = $(".faq-q", item), a = $(".faq-a", item);
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------- back to top ---------- */
  function initTop() {
    var t = $("#totop"); if (!t) return;
    var on = function () { t.classList.toggle("show", window.scrollY > 900); };
    window.addEventListener("scroll", on, { passive: true }); on();
    t.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- cookie / privacy ---------- */
  function initCookie() {
    var bar = $("#cookiebar"); if (!bar) return;
    var choice = null;
    try { choice = localStorage.getItem("ke-cookie"); } catch (e) {}
    if (choice) { bar.remove(); return; }
    bar.hidden = false;
    var set = function (v) {
      try { localStorage.setItem("ke-cookie", v); } catch (e) {}
      bar.hidden = true;
      toast(v === "yes" ? "Analytics enabled. Thank you." : "Essential cookies only. Noted.");
    };
    $("#cookie-yes").addEventListener("click", function () { set("yes"); });
    $("#cookie-no").addEventListener("click", function () { set("no"); });
  }

  /* ---------- helpers exposed ---------- */
  window.KE = {
    $: $, $$: $$, reduced: reduced, finePointer: finePointer,
    fmtINR: fmtINR, priceLabel: priceLabel, waLink: waLink,
    toast: toast, openModal: openModal, closeModal: closeModal,
    openSide: openSide, closeSide: closeSide, trap: trap,
    wish: wish, syncWishButtons: syncWishButtons, cfg: CFG
  };

  document.addEventListener("DOMContentLoaded", function () {
    initTheme(); initLang(); initHeader(); initDrawer(); initReveal();
    initCounters(); initMagnetic(); initModal(); initSide(); initFaq();
    initTop(); initCookie(); syncWishButtons();
  });
})();
