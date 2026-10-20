/* Satyam Choure — portfolio interactions.
   Plain JavaScript + GSAP/ScrollTrigger. Everything degrades to a readable static page. */
(function () {
  "use strict";

  var d = document, html = d.documentElement;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var reduce = html.classList.contains("reduce");
  var fine = false;
  try { fine = matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) {}
  var G = window.gsap, ST = window.ScrollTrigger;
  var motion = !!(G && ST) && !reduce;

  /* ---------- Year + IST clock ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  var clockFmt = null;
  try { clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }); } catch (e) {}
  function tickClock() {
    if (!clockFmt) return;
    var t = clockFmt.format(new Date());
    $$("[data-clock]").forEach(function (el) { if (el.textContent !== t) el.textContent = t; });
  }
  tickClock(); setInterval(tickClock, 10000);

  /* ---------- Smooth wheel scrolling (desktop pointers only) ---------- */
  var glide = null;
  function Glide() {
    var self = this;
    this.y = this.t = window.scrollY; this.on = false; this.anim = null; this.locked = false; this.last = 0;
    this.max = function () { return Math.max(0, html.scrollHeight - window.innerHeight); };
    this.nested = function (el, dy) {
      while (el && el !== d.body && el !== html) {
        if (el.nodeType === 1) {
          var oy = getComputedStyle(el).overflowY;
          if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
            if ((dy < 0 && el.scrollTop > 0) || (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return true;
          }
        }
        el = el.parentNode;
      }
      return false;
    };
    this.frame = function (now) {
      if (!self.on) return;
      var dt = Math.min(64, now - self.last); self.last = now;
      if (self.anim) {
        var a = self.anim, p = Math.min(1, (now - a.t0) / a.dur);
        var e = p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2;
        self.y = a.from + (a.to - a.from) * e;
        if (p >= 1) { self.anim = null; self.y = self.t = a.to; }
      } else {
        var k = 1 - Math.pow(1 - 0.1, dt / 16.667);
        self.y += (self.t - self.y) * k;
        if (Math.abs(self.t - self.y) < 0.35) self.y = self.t;
      }
      window.scrollTo(0, self.y);
      if (!self.anim && self.y === self.t) { self.on = false; return; }
      requestAnimationFrame(self.frame);
    };
    this.start = function () { if (!self.on) { self.on = true; self.last = performance.now(); requestAnimationFrame(self.frame); } };
    this.stop = function () { self.on = false; self.anim = null; self.y = self.t = window.scrollY; };
    this.to = function (y, dur) {
      y = Math.max(0, Math.min(self.max(), y));
      self.anim = { from: window.scrollY, to: y, t0: performance.now(), dur: dur };
      self.t = y; self.on = false; self.start();
    };
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (self.locked) { e.preventDefault(); return; }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (self.nested(e.target, e.deltaY)) return;
      e.preventDefault();
      var dy = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!self.on || self.anim) { self.y = window.scrollY; self.t = self.y; self.anim = null; }
      self.t = Math.max(0, Math.min(self.max(), self.t + dy));
      self.start();
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!self.on) { self.y = self.t = window.scrollY; } }, { passive: true });
    window.addEventListener("keydown", function (e) {
      var keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"];
      if (keys.indexOf(e.key) > -1) self.stop();
    });
    window.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.clientX > html.clientWidth - 2) self.stop(); }, { passive: true });
  }
  if (!reduce && fine) glide = new Glide();

  function scrollToY(y, opts) {
    opts = opts || {};
    var dist = Math.abs(y - window.scrollY);
    if (glide && !opts.instant) glide.to(y, Math.min(1800, Math.max(700, dist * 0.45)));
    else window.scrollTo({ top: y, behavior: reduce || opts.instant ? "auto" : "smooth" });
  }
  function lockScroll(on) {
    if (glide) glide.locked = on;
    d.body.style.overflow = on ? "hidden" : "";
  }

  /* ---------- In-page links ---------- */
  d.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var target = id ? d.getElementById(id) : null;
    if (!target && id !== "top") return;
    e.preventDefault();
    var go = function () {
      var y = !target || id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY;
      scrollToY(y);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        setTimeout(function () { try { target.focus({ preventScroll: true }); } catch (err) {} }, 50);
      }
    };
    if (menuOpen) { closeMenu(true); setTimeout(go, reduce ? 0 : 380); } else go();
  });

  /* ---------- Header: hide on scroll down, tone over dark sections ---------- */
  var hdr = $("[data-hdr]");
  var themeMeta = $('meta[name="theme-color"]');
  var nightEls = $$("[data-tone='night']");
  var navLinks = $$(".hdr__nav a");
  var sections = navLinks.map(function (a) { return d.getElementById(a.getAttribute("href").slice(1)); });
  var lastY = window.scrollY, ticking = false, menuOpen = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    hdr.classList.toggle("is-scrolled", y > 24);
    if (!menuOpen) {
      if (y > lastY + 4 && y > window.innerHeight * 0.6) hdr.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 80) hdr.classList.remove("is-hidden");
    }
    lastY = y;
    var probe = 38, night = false;
    for (var i = 0; i < nightEls.length; i++) {
      var r = nightEls[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) { night = true; break; }
    }
    if (hdr.classList.contains("on-night") !== night) {
      hdr.classList.toggle("on-night", night);
      if (themeMeta) themeMeta.setAttribute("content", night ? "#121110" : "#EFEBE3");
    }
    var mid = window.innerHeight * 0.4;
    sections.forEach(function (s, i) {
      if (!s) return;
      var r = s.getBoundingClientRect();
      navLinks[i].classList.toggle("is-active", r.top <= mid && r.bottom > mid);
    });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menu = $("[data-menu]"), openBtn = $("[data-menu-open]"), closeBtn = $("[data-menu-close]");
  function focusables() { return $$("a, button", menu).filter(function (el) { return !el.hasAttribute("disabled"); }); }
  function openMenu() {
    menuOpen = true; menu.hidden = false; openBtn.setAttribute("aria-expanded", "true");
    lockScroll(true); hdr.classList.remove("is-hidden");
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
    if (motion) G.fromTo($$(".menu__nav a", menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.05, delay: 0.25 });
    setTimeout(function () { closeBtn.focus(); }, 60);
  }
  function closeMenu(skipFocus) {
    if (!menuOpen) return;
    menuOpen = false; openBtn.setAttribute("aria-expanded", "false"); menu.classList.remove("is-open");
    lockScroll(false);
    setTimeout(function () { if (!menuOpen) menu.hidden = true; }, reduce ? 0 : 800);
    if (!skipFocus) openBtn.focus();
  }
  if (menu && openBtn) {
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", function () { closeMenu(); });
    d.addEventListener("keydown", function (e) {
      if (!menuOpen) return;
      if (e.key === "Escape") { closeMenu(); return; }
      if (e.key === "Tab") {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", function () { if (menuOpen && window.innerWidth > 899) closeMenu(true); });
  }

  /* ---------- Line splitting for display headings ---------- */
  function splitLines(el) {
    if (!el.__src) el.__src = el.innerHTML;
    el.innerHTML = el.__src;
    var words = [];
    (function walk(node, wrap) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(" ")); return; }
            var w = d.createElement("span"); w.className = "w"; w.style.display = "inline-block";
            if (wrap) { var inner = wrap.cloneNode(false); inner.textContent = p; w.appendChild(inner); } else w.textContent = p;
            frag.appendChild(w); words.push(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          if (n.tagName === "EM" || n.tagName === "SPAN") {
            var clone = n.cloneNode(false);
            var holder = d.createElement("span"); holder.innerHTML = n.innerHTML;
            walk(holder, clone);
            while (holder.firstChild) node.insertBefore(holder.firstChild, n);
            node.removeChild(n);
          }
        }
      });
    })(el, null);
    var lines = [], top = null, cur = null;
    words.forEach(function (w) {
      var t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 3) { cur = []; lines.push(cur); top = t; }
      cur.push(w);
    });
    el.innerHTML = "";
    var inners = [];
    lines.forEach(function (ws) {
      var l = d.createElement("span"); l.className = "sl";
      var i = d.createElement("span"); i.className = "sl__i";
      ws.forEach(function (w, k) { if (k) i.appendChild(d.createTextNode(" ")); w.style.display = ""; i.appendChild(w); });
      l.appendChild(i); el.appendChild(l); inners.push(i);
    });
    return inners;
  }

  /* ---------- Hero reel ---------- */
  var reel = $("[data-reel]");
  var reelNames = ["Noor Frame Studio", "Angeethi Kitchen", "Kohinoor Estates", "Super Boot House", "Aagam Academy", "Shree Krishna Sweets & Bakers"];
  function startReel() {
    if (!reel) return;
    var imgs = $$(".phone__screen img", reel), nameEl = $("[data-reel-name]", reel), noEl = $("[data-reel-no]", reel);
    var i = 0, paused = false, visible = true;
    if (reduce) return;
    reel.addEventListener("mouseenter", function () { paused = true; });
    reel.addEventListener("mouseleave", function () { paused = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(reel);
    setInterval(function () {
      if (paused || !visible || d.hidden) return;
      imgs[i].classList.remove("is-on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("is-on");
      var swap = function () { nameEl.textContent = reelNames[i]; noEl.textContent = (i < 9 ? "0" : "") + (i + 1); };
      if (motion) {
        G.to([nameEl, noEl], { yPercent: -40, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: function () {
          swap(); G.fromTo([nameEl, noEl], { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
        } });
      } else swap();
    }, 3000);
  }

  /* ---------- Index: filters + cursor preview ---------- */
  var chips = $$("[data-filter]"), rows = $$(".idx__list li");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      chips.forEach(function (x) { var on = x === c; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      var shown = [];
      rows.forEach(function (li) { var show = f === "all" || li.getAttribute("data-type") === f; li.hidden = !show; if (show) shown.push(li); });
      if (motion) { G.fromTo(shown, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.035, overwrite: true }); ST.refresh(); }
    });
  });
  var peek = $("[data-peek]");
  if (peek && fine && !reduce) {
    var pimg = $("img", peek), px = 0, py = 0, tx = 0, ty = 0, on = false, running = false, preloaded = false;
    var loop = function () {
      px += (tx - px) * 0.18; py += (ty - py) * 0.18;
      peek.style.transform = "translate3d(" + (px + 28).toFixed(1) + "px," + (py - peek.offsetHeight * 0.5).toFixed(1) + "px,0)";
      if (on || Math.abs(tx - px) > 0.5 || Math.abs(ty - py) > 0.5) requestAnimationFrame(loop); else running = false;
    };
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    $$(".idx__row").forEach(function (r) {
      r.addEventListener("mouseenter", function (e) {
        if (!preloaded) { preloaded = true; $$(".idx__row").forEach(function (x) { var im = new Image(); im.src = x.getAttribute("data-thumb"); }); }
        if (!on) { px = tx = e.clientX; py = ty = e.clientY; }
        pimg.src = r.getAttribute("data-thumb"); on = true; peek.classList.add("is-on");
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
      r.addEventListener("mouseleave", function () { on = false; peek.classList.remove("is-on"); });
    });
    window.addEventListener("scroll", function () { if (on) { on = false; peek.classList.remove("is-on"); } }, { passive: true });
  }

  /* ---------- Copy email ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var t = d.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      d.body.appendChild(t); t.select();
      try { d.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); }
      d.body.removeChild(t);
    });
  }
  $$("[data-copy]").forEach(function (b) {
    var label = $("[data-copy-label]", b), status = $("[data-copy-status]");
    b.addEventListener("click", function () {
      copyText(b.getAttribute("data-copy")).then(function () {
        b.classList.add("is-copied"); label.textContent = "Copied"; if (status) status.textContent = "Email address copied";
        setTimeout(function () { b.classList.remove("is-copied"); label.textContent = "Copy email"; if (status) status.textContent = ""; }, 2200);
      }).catch(function () { label.textContent = "Select and copy"; });
    });
  });

  /* ---------- Project brief → email ---------- */
  var brief = $("[data-brief]");
  if (brief) {
    var hint = $("[data-brief-hint]", brief);
    var compose = function () {
      var v = function (n) { var el = brief.elements[n]; return el ? String(el.value || "").trim() : ""; };
      var needs = $$('input[name="need"]:checked', brief).map(function (x) { return x.value; });
      var when = ($('input[name="when"]:checked', brief) || {}).value || "";
      var name = v("name"), biz = v("business"), msg = v("message");
      var subject = "New project" + (biz ? " — " + biz : name ? " — " + name : "");
      var lower = function (s) { return s.charAt(0).toLowerCase() + s.slice(1); };
      var unsure = needs.indexOf("Not sure yet") > -1;
      var wants = needs.filter(function (n) { return n !== "Not sure yet"; }).map(lower);
      var list = wants.length > 1 ? wants.slice(0, -1).join(", ") + " and " + wants[wants.length - 1] : wants[0];
      var lines = ["Hi Satyam,", ""];
      lines.push("I’m " + (name || "[your name]") + (biz ? " from " + biz : "") + ".");
      if (list) lines.push("I’m looking for " + list + (unsure ? " — not fully sure yet." : "."));
      else if (unsure) lines.push("I’m not sure yet exactly what I need.");
      if (when) lines.push("When: " + lower(when) + ".");
      if (msg) { lines.push(""); lines.push(msg); }
      lines.push(""); lines.push("Thanks!");
      return { subject: subject, body: lines.join("\n") };
    };
    brief.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = compose();
      window.location.href = "mailto:satyamchoure08@gmail.com?subject=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body);
      hint.textContent = "Opening your email app. If nothing opens, use “Copy message” and send it to satyamchoure08@gmail.com.";
    });
    var copyBtn = $("[data-brief-copy]", brief), copyLabel = $("[data-brief-copy-label]", brief);
    copyBtn.addEventListener("click", function () {
      var m = compose();
      copyText("Subject: " + m.subject + "\n\n" + m.body).then(function () {
        copyLabel.textContent = "Copied";
        hint.textContent = "Copied. Paste it into an email to satyamchoure08@gmail.com — or into a DM on X.";
        setTimeout(function () { copyLabel.textContent = "Copy message"; }, 2200);
      }).catch(function () { hint.textContent = "Couldn’t copy automatically — please email satyamchoure08@gmail.com."; });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && motion) {
    $$("[data-magnetic]").forEach(function (b) {
      var xTo = G.quickTo(b, "x", { duration: 0.6, ease: "expo.out" }), yTo = G.quickTo(b, "y", { duration: 0.6, ease: "expo.out" });
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22); yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      b.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Footer wordmark: fit to width ---------- */
  var mark = $(".ftr__mark"), word = $("[data-ftr-word]");
  function fitMark() {
    if (!mark) return;
    var wrap = mark.parentNode, avail = wrap.clientWidth - parseFloat(getComputedStyle(wrap).paddingLeft) - parseFloat(getComputedStyle(wrap).paddingRight);
    mark.style.fontSize = "100px";
    var w = mark.getBoundingClientRect().width;
    if (w > 0) mark.style.fontSize = (Math.floor(1000 * avail / w * 0.997) / 10) + "px";
  }
  if (word) {
    var chars = word.textContent.split("");
    word.innerHTML = chars.map(function (c) { return c === " " ? '<span class="ch">&nbsp;</span>' : '<span class="ch">' + c + "</span>"; }).join("");
  }
  fitMark();

  /* ---------- Motion ---------- */
  function heroIn(delay) {
    if (!motion) return;
    var tl = G.timeline({ delay: delay || 0, defaults: { ease: "expo.out" } });
    tl.fromTo(".hero__title .ln__i", { y: 0, yPercent: 108 }, { y: 0, yPercent: 0, duration: 1.5, stagger: 0.1 }, 0)
      .fromTo(".hero__meta > *", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }, 0.25)
      .fromTo(".reel", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.6 }, 0.3)
      .fromTo([".hero__lead", ".hero__ctas"], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.09 }, 0.55);
    return tl;
  }

  function setupScroll() {
    if (!motion) return;
    G.registerPlugin(ST);
    G.config({ nullTargetWarn: false });

    /* Work panel opens from an inset card to full bleed */
    var panel = $("[data-panel]");
    if (panel) {
      G.fromTo(panel, { "--inset": "clamp(10px, 2.6vw, 44px)", "--r": "26px" }, {
        "--inset": "0px", "--r": "0px", ease: "none",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "top 12%", scrub: true }
      });
    }

    /* Headings: line by line */
    $$("[data-split]").forEach(function (h) {
      var lines = splitLines(h);
      G.set(h, { opacity: 1 });
      G.fromTo(lines, { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    });
    var lastW = window.innerWidth, rt;
    window.addEventListener("resize", function () {
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth; clearTimeout(rt);
      rt = setTimeout(function () { $$("[data-split]").forEach(function (h) { var ls = splitLines(h); G.set(ls, { yPercent: 0 }); }); fitMark(); ST.refresh(); }, 180);
    });

    /* Generic reveals */
    $$("[data-reveal]").forEach(function (el) {
      G.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$(".sec-head__note, .idx__head, .filters, .idx__note").forEach(function (el) {
      G.from(el, { opacity: 0, y: 20, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
    });
    G.set(".idx__list li", { opacity: 0, y: 18 });
    ST.batch(".idx__list li", {
      start: "top 94%", once: true,
      onEnter: function (els) { G.fromTo(els, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }); }
    });

    /* Plates: frame opens, the site scrolls inside it, the phone drifts */
    $$("[data-plate]").forEach(function (p) {
      var screen = $(".plate__screen", p), img = $(".plate__pan", p), phone = $(".phone", p), info = $(".plate__info", p);
      G.fromTo(screen, { clipPath: "inset(9% 7% 9% 7% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "none",
        scrollTrigger: { trigger: p, start: "top 98%", end: "top 40%", scrub: true } });
      G.fromTo(img, { scale: 1.12 }, { scale: 1, ease: "none", transformOrigin: "50% 0%",
        scrollTrigger: { trigger: p, start: "top 98%", end: "top 40%", scrub: true } });
      G.fromTo(img, { y: 0 }, {
        y: function () { return -Math.max(0, img.getBoundingClientRect().height / (G.getProperty(img, "scale") || 1) - screen.clientHeight); },
        ease: "none", immediateRender: false,
        scrollTrigger: { trigger: screen, start: "top 62%", end: "bottom -10%", scrub: true, invalidateOnRefresh: true }
      });
      if (phone) G.fromTo(phone, { yPercent: 22 }, { yPercent: -12, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
      if (info) G.fromTo(info.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: info, start: "top 86%", once: true } });
    });

    /* Product card */
    var prod = $(".product__card");
    if (prod) G.fromTo(prod, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: prod, start: "top 88%", once: true } });

    /* Portrait */
    var por = $("[data-reveal-img]");
    if (por) {
      var pic = $("picture", por), pimg2 = $("img", por);
      G.fromTo(pic, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: por, start: "top 82%", once: true } });
      G.fromTo(pimg2, { scale: 1.25 }, { scale: 1, duration: 2, ease: "expo.out", scrollTrigger: { trigger: por, start: "top 82%", once: true } });
    }

    /* Footer wordmark letters rise */
    var chs = $$(".ftr__word .ch");
    if (chs.length) G.fromTo(chs, { yPercent: 105 }, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.035,
      scrollTrigger: { trigger: ".ftr", start: "top 92%", once: true } });
    var fs = $(".ftr__seal");
    if (fs) G.fromTo(fs, { scale: 1.6, rotate: -14, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.9, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".ftr", start: "top 85%", once: true }, delay: 0.5 });

    window.addEventListener("load", function () { ST.refresh(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { fitMark(); ST.refresh(); });
  }

  /* ---------- Intro, then hero ---------- */
  function runIntro() {
    var intro = $("[data-intro]");
    var wantsIntro = html.classList.contains("has-intro") && intro && motion;
    try { sessionStorage.setItem("sc-intro", "1"); } catch (e) {}
    if (!wantsIntro) {
      if (intro) intro.remove();
      html.classList.remove("has-intro");
      heroIn(0.05);
      return;
    }
    lockScroll(true);
    var count = $("[data-intro-count]", intro), obj = { v: 0 };
    var tl = G.timeline();
    tl.fromTo(".intro__mark", { scale: 1.35, rotate: -10, opacity: 0, filter: "blur(8px)" }, { scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 0.75, ease: "power4.out" }, 0.05)
      .fromTo(".intro__name span", { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.3)
      .fromTo([".intro__count", ".intro__note"], { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2)
      .to(obj, { v: 100, duration: 1.3, ease: "power2.inOut", onUpdate: function () { count.textContent = String(Math.round(obj.v)).padStart(2, "0"); } }, 0);
    var fontsReady = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
    var timeout = new Promise(function (r) { setTimeout(r, 2600); });
    Promise.all([tl.then(), Promise.race([fontsReady, timeout])]).then(function () {
      G.to(intro, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut", onComplete: function () {
        intro.remove(); html.classList.remove("has-intro"); lockScroll(false); ST && ST.refresh();
      } });
      G.to(".intro__mark, .intro__name", { y: -60, opacity: 0, duration: 0.8, ease: "power3.in" });
      heroIn(0.55);
    });
  }

  function motionOff() {
    var intro0 = $("[data-intro]"); if (intro0) intro0.remove();
    html.classList.remove("has-intro");
    if (!reduce) html.classList.add("motion-off");
    lockScroll(false);
  }
  if (motion) {
    html.classList.add("motion");
    try { setupScroll(); runIntro(); }
    catch (err) { motion = false; motionOff(); if (window.console) console.error(err); }
  } else motionOff();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitMark);
  window.addEventListener("resize", function () { clearTimeout(window.__fitT); window.__fitT = setTimeout(fitMark, 150); });
  startReel();
})();
