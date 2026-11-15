/* Shared behaviour for the studio preview websites: homepage, projects page, project pages, about and contact.
   Plain JavaScript, no libraries, nothing loaded from another website.
   Each part runs on its own: if one ever fails, the others still work and every section still shows.
   0. Old links: a shared photo link from the old homepage opens that photo on the projects page.
   1. Gentle movement: photos fade in once loaded, sections rise, headings rise word by word, lines draw in, cover wipe.
   2. Header line once the page scrolls.
   3. Menu on phones and tablets.
   4. Projects: filters that combine (property type + room) with live counts, greyed-out chips, Projects/Photos view,
      Grid/List layout, "Show more", the link keeps the filters, WhatsApp messages that name the filter.
   5. Project cards: the line drawing fades in on hover (laptops; loaded only when needed).
   6. Photo viewer: full screen, arrows, swipe, keyboard, back button, WhatsApp "I liked this ...".
   7. Drawing vs finished slider.
   8. Live "open now" status in Indian time.
   9. Enquiry form: three steps, budgets that fit the project, live WhatsApp message, opens WhatsApp.
   10. Note to the studio owner, shown once, remembered when closed.
   11. Process line that fills as you scroll. */
(function () {
  "use strict";
  window.PREVIEW_READY = true;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var MO = root.classList.contains("mo");
  var params = new URLSearchParams(window.location.search);
  var body = document.body;
  var hello = body.getAttribute("data-hello") || "Hello, ";
  var waNum = body.getAttribute("data-wa") || "";
  var pageUrl = body.getAttribute("data-page") || window.location.href.split("?")[0];
  function uniq(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }
  function safe(fn) { try { fn(); } catch (err) { if (window.console) console.warn("Preview: part skipped", err); } }
  function waLink(line, page) { return "https://wa.me/" + waNum + "?text=" + encodeURIComponent(hello + line + "\nPage: " + page); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  /* 0. Old links */
  safe(function () {
    var old = params.get("photo");
    if (body.classList.contains("home") && old) window.location.replace("projects/?photo=" + encodeURIComponent(old.replace(/^\d+-/, "")));
  });

  /* 1. Gentle movement */
  safe(function () {
    $$(".ph img, .pc-img, .np-ph img").forEach(function (im) {
      var done = function () { im.classList.add("is-in"); };
      if (im.complete && im.naturalWidth) done();
      else { im.addEventListener("load", done); im.addEventListener("error", done); }
    });
    $$("[data-rv-kids]").forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (k, i) {
        k.setAttribute("data-rv", "");
        k.style.transitionDelay = Math.min(i, 6) * 80 + "ms";
      });
    });
    if (MO) {
      // Headings rise word by word. Only plain-text headings; the words stay real text for screen readers.
      $$(".h1, .h2, .hero-h, .np-t").forEach(function (h) {
        if (h.children.length || !h.textContent.trim()) return;
        var words = h.textContent.trim().split(/\s+/);
        h.textContent = "";
        words.forEach(function (w, i) {
          if (i) h.appendChild(document.createTextNode(" "));
          var outer = document.createElement("span"), inner = document.createElement("span");
          outer.className = "w";
          inner.textContent = w;
          inner.style.setProperty("--i", String(i));
          outer.appendChild(inner);
          h.appendChild(outer);
        });
        h.classList.add("wr");
      });
      // Lines in one group draw one after another
      $$("[data-wl]").forEach(function (el) {
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (k) { return k.hasAttribute("data-wl"); });
        var i = sibs.indexOf(el);
        if (i > 0) el.style.setProperty("--wd", Math.min(i, 8) * 0.08 + "s");
      });
    }
    var els = $$("[data-rv], .wr, [data-wl], .wipe");
    // A wiped photo starts fully clipped, which the browser counts as "not on screen", so its frame is watched instead
    var watched = function (el) { return el.classList.contains("wipe") ? el.parentNode : el; };
    if (MO && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          els.filter(function (el) { return watched(el) === en.target; }).forEach(function (el) {
            el.classList.add("in");
            if (el.style.transitionDelay) setTimeout(function () { el.style.transitionDelay = ""; }, 1500);
          });
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
      els.forEach(function (el) { io.observe(watched(el)); });
    } else {
      els.forEach(function (el) { el.classList.add("in"); });
    }
  });

  /* 2. Header */
  safe(function () {
    var hd = $(".hd");
    if (!hd) return;
    var onScroll = function () { hd.classList.toggle("is-scrolled", (window.scrollY || 0) > 4); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });

  /* 3. Menu */
  safe(function () {
    var mb = $(".hd-menu"), mn = $("#menu");
    if (!mb || !mn) return;
    var menuOpen = false;
    var setMenu = function (v) {
      menuOpen = v;
      mb.setAttribute("aria-expanded", String(v));
      mb.textContent = v ? "Close" : "Menu";
      mn.hidden = !v;
      root.classList.toggle("menu-open", v);
      if (v) { var a = $("a", mn); if (a) a.focus({ preventScroll: true }); }
    };
    mb.addEventListener("click", function () { setMenu(!menuOpen); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && menuOpen) { setMenu(false); mb.focus(); } });
    $$("a", mn).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (menuOpen && window.innerWidth >= 1080) setMenu(false); });
  });

  /* 4. Projects: filters, views, layouts */
  // Cards go 1 big + 2 small, the next three mirrored; a group of one or two at the end shares the row equally.
  function rhythm(list) {
    var n = list.length;
    list.forEach(function (el, i) {
      el.classList.remove("pc-big", "pc-s", "pc-half");
      var t = Math.floor(i / 3), k = i % 3, inGroup = Math.min(3, n - t * 3);
      if (inGroup === 3) el.classList.add((t % 2 === 0 ? k === 0 : k === 2) ? "pc-big" : "pc-s");
      else el.classList.add("pc-half");
    });
  }
  safe(function () {
    $$("[data-gal]").forEach(function (box) {
      var urlSync = box.hasAttribute("data-url");
      var step = +box.getAttribute("data-step") || 0;
      var cards = $$(".pc", box), rows = $$(".lv-row", box), tiles = $$(".tile", box);
      var chips = $$(".tab[data-k]", box);
      var viewBtns = $$("[data-view]", box), layoutBtns = $$("[data-layout]", box);
      var panels = $$("[data-panel]", box), layoutBox = $("[data-layouts]", box);
      var cardsBox = $(".cards", box), lv = $(".lv", box), peek = $(".lv-peek img", box);
      var moreBtn = $(".pj-more", box), status = $(".pj-status", box), empty = $(".pj-empty", box);
      var clearBar = $(".pj-bar .pj-clear", box);
      var allLink = $("[data-all]", box);
      var st = { view: "projects", type: "all", space: "all", layout: "grid", limit: step };
      var keepPhoto = "";
      var has = function (k, v) { return v === "all" || chips.some(function (b) { return b.getAttribute("data-k") === k && b.getAttribute("data-v") === v; }); };
      var label = function (k, v) {
        var b = chips.filter(function (x) { return x.getAttribute("data-k") === k && x.getAttribute("data-v") === v; })[0];
        return b && b.firstChild ? b.firstChild.textContent.trim() : v;
      };
      var match = function (el, t, s) {
        var sp = (el.getAttribute("data-spaces") || el.getAttribute("data-space") || "").split(" ");
        return (t === "all" || el.getAttribute("data-type") === t) && (s === "all" || sp.indexOf(s) > -1);
      };
      var count = function (list, t, s) { return list.filter(function (el) { return match(el, t, s); }).length; };
      var picked = function () { return [st.type !== "all" ? label("type", st.type) : "", st.space !== "all" ? label("space", st.space) : ""].filter(Boolean).join(", "); };

      if (urlSync) {
        if (params.get("view") === "photos") st.view = "photos";
        if (params.get("layout") === "list") st.layout = "list";
        var t0 = params.get("type"), s0 = params.get("space"), r0 = params.get("room");
        if (t0 && has("type", t0)) st.type = t0;
        if (s0 && has("space", s0)) st.space = s0;
        else if (r0) { // old links used plural room names (?room=kitchens)
          if (has("space", r0)) st.space = r0;
          else if (has("space", r0.replace(/s$/, ""))) st.space = r0.replace(/s$/, "");
          st.view = "photos";
        }
        var ph = params.get("photo");
        var phTile = ph ? tiles.filter(function (t) { return $("[data-photo]", t).getAttribute("data-photo") === ph; })[0] : null;
        if (phTile) {
          keepPhoto = ph;
          st.view = "photos";
          var pos = tiles.filter(function (t) { return match(t, st.type, st.space); }).indexOf(phTile);
          if (step && pos >= step) st.limit = Math.ceil((pos + 1) / step) * step;
        }
      }

      var setPeek = function (row) {
        if (!peek || !row) return;
        var src = $(".lv-a", row).getAttribute("data-peek");
        if (!src || peek.getAttribute("src") === src) return;
        peek.classList.add("is-swap");
        var im = new Image();
        im.onload = im.onerror = function () { peek.src = src; peek.classList.remove("is-swap"); };
        im.src = src;
      };
      rows.forEach(function (r) {
        var a = $(".lv-a", r);
        a.addEventListener("pointerenter", function () { setPeek(r); });
        a.addEventListener("focus", function () { setPeek(r); });
      });

      var render = function (animate) {
        var L = st.view === "photos" ? tiles : cards;
        chips.forEach(function (b) {
          var k = b.getAttribute("data-k"), v = b.getAttribute("data-v");
          var n = k === "type" ? count(L, v, st.space) : count(L, st.type, v);
          var on = st[k] === v;
          var nEl = $(".tab-n", b);
          if (nEl) nEl.textContent = String(n);
          b.setAttribute("aria-pressed", String(on));
          b.disabled = n === 0 && !on;
        });
        viewBtns.forEach(function (b) {
          var v = b.getAttribute("data-view");
          b.setAttribute("aria-pressed", String(v === st.view));
          var nEl = $(".seg-n", b);
          if (nEl) nEl.textContent = String(count(v === "photos" ? tiles : cards, st.type, st.space));
        });
        panels.forEach(function (pn) { pn.hidden = pn.getAttribute("data-panel") !== st.view; });
        if (layoutBox) layoutBox.hidden = st.view !== "projects";
        layoutBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-layout") === st.layout)); });
        if (cardsBox && lv) { cardsBox.hidden = st.layout === "list"; lv.hidden = st.layout !== "list"; }

        var visible = [];
        cards.forEach(function (el) {
          var m = match(el, st.type, st.space);
          el.hidden = !m;
          el.classList.remove("is-enter");
          if (m) {
            visible.push(el);
            if (animate && MO) { void el.offsetWidth; el.classList.add("is-enter"); }
          }
        });
        rhythm(visible);

        var firstRow = null;
        rows.forEach(function (r) {
          var m = match(r, st.type, st.space);
          r.classList.toggle("is-dim", !m);
          if (m && !firstRow) firstRow = r;
        });
        if (st.layout === "list") setPeek(firstRow);

        var total = 0;
        tiles.forEach(function (t) {
          var m = match(t, st.type, st.space);
          if (m) { total++; t.setAttribute("data-match", ""); } else t.removeAttribute("data-match");
          var show = m && (!st.limit || total <= st.limit);
          var was = !t.hidden;
          t.hidden = !show;
          t.classList.remove("is-enter");
          if (show && animate && MO && (!was || animate === "all")) { void t.offsetWidth; t.classList.add("is-enter"); }
        });
        var shownPhotos = st.limit ? Math.min(total, st.limit) : total;
        if (moreBtn) {
          var left = total - shownPhotos;
          moreBtn.hidden = left <= 0;
          moreBtn.textContent = "Show " + Math.min(step || left, left) + " more of " + left;
        }

        var sel = picked();
        var n = st.view === "photos" ? total : visible.length;
        if (status) {
          if (st.view === "photos") status.textContent = sel ? plural(total, "photo") + ": " + sel : "All " + plural(total, "photo");
          else status.textContent = sel ? visible.length + " of " + plural(cards.length, "project") + ": " + sel : "Showing all " + plural(cards.length, "project");
        }
        if (empty) empty.hidden = n > 0;
        if (clearBar) clearBar.hidden = !sel;
        if (allLink) allLink.setAttribute("href", allLink.getAttribute("data-all") + (st.type !== "all" ? "?type=" + st.type : ""));

        if (urlSync) {
          var q = new URLSearchParams();
          if (st.view === "photos") q.set("view", "photos");
          if (st.type !== "all") q.set("type", st.type);
          if (st.space !== "all") q.set("space", st.space);
          if (st.view === "projects" && st.layout === "list") q.set("layout", "list");
          if (keepPhoto) q.set("photo", keepPhoto); // a shared photo link keeps its photo until the visitor changes a filter
          keepPhoto = "";
          var qs = q.toString();
          try { history.replaceState(history.state, "", window.location.pathname + (qs ? "?" + qs : "")); } catch (err) { /* ignore */ }
          // Every WhatsApp button on this page now says what the visitor was looking at, with this exact link
          var line = sel ? "I was looking at your projects: " + sel + "." : "I was looking at your projects.";
          var href = waLink(line, pageUrl + (qs ? "?" + qs : ""));
          $$(".js-wa").forEach(function (a) { a.setAttribute("href", href); });
        }
      };

      chips.forEach(function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-k"), v = b.getAttribute("data-v");
          st[k] = st[k] === v ? "all" : v; // tapping the chosen chip again clears it
          st.limit = step;
          render("all");
        });
      });
      viewBtns.forEach(function (b) { b.addEventListener("click", function () { st.view = b.getAttribute("data-view"); st.limit = step; render("all"); }); });
      layoutBtns.forEach(function (b) { b.addEventListener("click", function () { st.layout = b.getAttribute("data-layout"); render("all"); }); });
      $$(".pj-clear", box).forEach(function (b) { b.addEventListener("click", function () { st.type = st.space = "all"; st.limit = step; render("all"); }); });
      if (moreBtn) moreBtn.addEventListener("click", function () {
        var before = tiles.filter(function (t) { return !t.hidden; }).length;
        st.limit += step;
        render(true);
        var next = tiles.filter(function (t) { return !t.hidden; })[before];
        var nb = next && $("[data-photo]", next);
        if (nb) nb.focus({ preventScroll: true });
      });
      render(false);
    });
  });

  /* 5. Project cards: line drawing on hover (laptops) */
  safe(function () {
    if (!window.matchMedia || !window.matchMedia("(hover: hover)").matches) return;
    $$(".pc-a").forEach(function (a) {
      var sk = $(".pc-sk", a);
      if (!sk) return;
      var load = function () {
        if (sk.getAttribute("src") || !sk.getAttribute("data-src")) return;
        sk.addEventListener("load", function () { sk.classList.add("is-ready"); }, { once: true });
        sk.setAttribute("src", sk.getAttribute("data-src"));
      };
      a.addEventListener("pointerenter", load);
      a.addEventListener("focus", load);
    });
  });

  /* 6. Photo viewer */
  safe(function () {
    var vw = $(".viewer"), dataEl = $("#photo-data");
    if (!vw || !dataEl) return;
    var photos = {};
    JSON.parse(dataEl.textContent).forEach(function (p) { photos[p.id] = p; });
    var vImg = $(".vw-img", vw), vCap = $(".vw-cap", vw), vCount = $(".vw-count", vw);
    var vOpen = $(".vw-open", vw), vWa = $(".vw-wa", vw), vClose = $(".vw-close", vw);
    var list = [], idx = 0, lastFocus = null, isOpen = false, pushed = false;

    var show = function (i) {
      idx = (i + list.length) % list.length;
      var p = photos[list[idx]];
      if (!p) return;
      vImg.classList.remove("is-new");
      vImg.src = p.src;
      vImg.alt = p.alt;
      if (MO) { void vImg.offsetWidth; vImg.classList.add("is-new"); }
      vCap.textContent = p.cap;
      vCount.textContent = list.length > 1 ? (idx + 1) + " / " + list.length : "";
      vOpen.hidden = !p.href;
      if (p.href) vOpen.setAttribute("href", p.href);
      vWa.setAttribute("href", p.wa);
      $$(".vw-nav", vw).forEach(function (b) { b.hidden = list.length < 2; });
      [idx + 1, idx - 1].forEach(function (k) {
        var q = photos[list[(k + list.length) % list.length]];
        if (q) { var pre = new Image(); pre.src = q.src; }
      });
    };
    var openAt = function (id, group) {
      list = group && group.length ? group : Object.keys(photos);
      var i = list.indexOf(id);
      if (i < 0) { list = [id].concat(list); i = 0; }
      lastFocus = document.activeElement;
      isOpen = true;
      vw.hidden = false;
      root.classList.add("viewer-open");
      show(i);
      vClose.focus({ preventScroll: true });
      try { history.pushState({ viewer: true }, ""); pushed = true; } catch (err) { pushed = false; }
    };
    var shut = function () {
      if (!isOpen) return;
      isOpen = false;
      vw.hidden = true;
      root.classList.remove("viewer-open");
      vImg.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    var close = function () {
      if (pushed && history.state && history.state.viewer) { pushed = false; history.back(); } // the back step closes it
      else shut();
    };
    window.addEventListener("popstate", function () { pushed = false; shut(); });

    // The arrows move through the photos that match the current filter, in page order
    var groupFor = function (btn) {
      var box = btn.closest("[data-gal]");
      var els = box ? $$("[data-match] [data-photo]", box)
        : $$("[data-photo]").filter(function (el) { return !el.closest("[hidden]") && !vw.contains(el); });
      return uniq(els.map(function (el) { return el.getAttribute("data-photo"); }).filter(function (id) { return photos[id]; }));
    };
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("[data-photo]") : null;
      if (!b || vw.contains(b)) return;
      var id = b.getAttribute("data-photo");
      if (!photos[id]) return;
      ev.preventDefault();
      openAt(id, groupFor(b));
    });
    vClose.addEventListener("click", close);
    $(".vw-prev", vw).addEventListener("click", function () { show(idx - 1); });
    $(".vw-next", vw).addEventListener("click", function () { show(idx + 1); });
    document.addEventListener("keydown", function (ev) {
      if (!isOpen) return;
      if (ev.key === "Escape") { ev.preventDefault(); close(); }
      else if (ev.key === "ArrowRight") show(idx + 1);
      else if (ev.key === "ArrowLeft") show(idx - 1);
      else if (ev.key === "Tab") { // keep keyboard focus inside the viewer
        var f = $$("button, a[href]", vw).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    });
    // Swipe left or right for the next photo, down to close; a tap beside the photo also closes
    var sx = null, sy = null;
    var stage = $(".vw-stage", vw);
    stage.addEventListener("pointerdown", function (ev) { sx = ev.clientX; sy = ev.clientY; });
    stage.addEventListener("pointerup", function (ev) {
      if (sx === null) return;
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      sx = sy = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
      else if (ev.target === stage && Math.abs(dx) < 8 && Math.abs(dy) < 8) close();
    });
    stage.addEventListener("pointercancel", function () { sx = sy = null; });
    // A shared photo link (?photo=...) opens that photo
    var pid = params.get("photo");
    if (pid && photos[pid]) {
      var btn = $$("[data-photo]").filter(function (el) { return el.getAttribute("data-photo") === pid && !vw.contains(el); })[0];
      openAt(pid, btn ? groupFor(btn) : null);
    }
  });

  /* 7. Drawing vs finished slider: drag anywhere on the photo, or use the keyboard (it is a range input) */
  safe(function () {
    $$(".ba").forEach(function (ba) {
      var range = $(".ba-range", ba), frame = $(".ba-frame", ba);
      var set = function (v) { ba.style.setProperty("--pos", v + "%"); };
      range.addEventListener("input", function () { set(range.value); });
      var dragging = false;
      var fromPointer = function (ev) {
        var r = frame.getBoundingClientRect();
        var v = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
        range.value = v;
        set(v);
      };
      frame.addEventListener("pointerdown", function (ev) { dragging = true; fromPointer(ev); });
      window.addEventListener("pointermove", function (ev) { if (dragging) fromPointer(ev); });
      window.addEventListener("pointerup", function () { dragging = false; });
      // A small nudge the first time it comes into view, so people see it moves
      if (MO && "IntersectionObserver" in window) {
        var seen = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            seen.disconnect();
            var t0 = null;
            var stepFn = function (ts) {
              if (dragging) return;
              if (t0 === null) t0 = ts;
              var p = Math.min(1, (ts - t0) / 1600);
              var v = 50 + Math.sin(p * Math.PI * 2) * 16 * (1 - p);
              range.value = v;
              set(v);
              if (p < 1) requestAnimationFrame(stepFn);
            };
            setTimeout(function () { requestAnimationFrame(stepFn); }, 400);
          });
        }, { threshold: 0.6 });
        seen.observe(frame);
      }
    });
  });

  /* 8. Open now / closed now, in the studio's time zone (India) */
  safe(function () {
    var statuses = $$(".status");
    if (!statuses.length || !window.Intl || !Intl.DateTimeFormat) return;
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var part = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
    var dayIdx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(part("weekday"));
    var mins = (parseInt(part("hour"), 10) % 24) * 60 + parseInt(part("minute"), 10);
    var fmt = function (m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; };
    statuses.forEach(function (st) {
      var days = st.getAttribute("data-days").split(",").map(Number);
      var open = +st.getAttribute("data-open"), shutAt = +st.getAttribute("data-close");
      var isOpenNow = days.indexOf(dayIdx) > -1 && mins >= open && mins < shutAt;
      var text;
      if (isOpenNow) text = "Open now, closes at " + fmt(shutAt);
      else {
        var names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        var d = dayIdx, n = 0;
        if (!(days.indexOf(d) > -1 && mins < open)) { do { d = (d + 1) % 7; n++; } while (days.indexOf(d) < 0 && n < 8); }
        text = "Closed now, opens " + (n === 0 ? "today" : n === 1 ? "tomorrow" : names[d]) + " at " + fmt(open);
      }
      st.textContent = text;
      st.classList.toggle("is-open", isOpenNow);
      st.hidden = false;
    });
  });

  /* 9. Enquiry form */
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); };
  $$("form.enq").forEach(function (form) {
    safe(function () {
      var steps = $$(".enq-step", form), prog = $$(".enq-prog li", form);
      var opts = JSON.parse(form.getAttribute("data-opts") || "{}") || {};
      var cur = 0;
      var picked = function (name) {
        return $$('[name="' + name + '"]', form).filter(function (x) { return (x.type === "radio" || x.type === "checkbox") ? x.checked : true; })
          .map(function (x) { return String(x.value || "").trim(); }).filter(Boolean);
      };
      var val = function (name) { return picked(name).join(", "); };
      var showError = function (i, msg) {
        var p = $(".form-error", steps[i]);
        if (!p) return;
        p.hidden = !msg;
        p.textContent = msg || "";
      };
      var problem = function (i) {
        if (i === 0) { if (!val("type")) return "Pick the type of property."; if (!val("city")) return "Add your city."; }
        if (i === 1 && !val("scope")) return "Pick at least one thing you need.";
        if (i === 2 && !val("name")) return "Add your name so the studio knows who is writing.";
        return "";
      };
      // keyboard: true when the step was changed from the keyboard, so focus moves into the new step
      var go = function (i, keyboard) {
        cur = Math.max(0, Math.min(steps.length - 1, i));
        steps.forEach(function (s, n) { s.classList.toggle("is-on", n === cur); });
        prog.forEach(function (p, n) { p.classList.toggle("is-on", n === cur); p.classList.toggle("is-done", n < cur); });
        if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ block: "start", behavior: MO ? "smooth" : "auto" });
        if (keyboard) {
          var first = $("input, textarea, button", steps[cur]);
          if (first) first.focus({ preventScroll: true });
        }
      };
      $$(".enq-next", form).forEach(function (b) {
        b.addEventListener("click", function (ev) {
          var m = problem(cur);
          showError(cur, m);
          if (!m) go(cur + 1, ev.detail === 0);
        });
      });
      $$(".enq-back", form).forEach(function (b) { b.addEventListener("click", function (ev) { go(cur - 1, ev.detail === 0); }); });

      // Budget choices follow what is being planned (a kitchen, a full home or a new building)
      var budgetBox = $(".budget-chips", form);
      var budgetKey = function () {
        var sc = picked("scope");
        var any = function (arr) { return sc.some(function (s) { return (arr || []).indexOf(s) > -1; }); };
        if (any(opts.build)) return "build";
        if (any(opts.big)) return "big";
        if (sc.length && opts.budgets && opts.budgets.small) return "small";
        return opts.default;
      };
      var lastKey = budgetKey();
      var drawBudgets = function () {
        if (!budgetBox || !opts.budgets) return;
        var key = budgetKey();
        if (key === lastKey || !opts.budgets[key]) return;
        lastKey = key;
        var was = val("budget");
        budgetBox.innerHTML = opts.budgets[key].map(function (b) {
          return '<label class="chip"><input type="radio" name="budget" value="' + esc(b) + '"' + (b === was ? " checked" : "") + "><span>" + esc(b) + "</span></label>";
        }).join("");
      };

      // The message, in the order the studio reads it best
      var studio = form.getAttribute("data-studio");
      var from = form.getAttribute("data-from");
      var page = form.getAttribute("data-page");
      var compose = function () {
        var lines = ["Hello " + studio + ", I'm " + (val("name") || "…") + "."];
        if (from) lines.push("From your website: " + from);
        var prop = [val("type"), val("size")].filter(Boolean).join(", ");
        var raw = val("sqft"), num = raw.replace(/[^\d]/g, "");
        var area = num && +num >= 50 ? "about " + Number(num).toLocaleString("en-IN") + " sq ft" : raw;
        if (area) prop = (prop ? prop + ", " : "") + area;
        if (prop) lines.push("Property: " + prop);
        if (val("scope")) lines.push("Scope: " + val("scope"));
        var place = [val("area"), val("city")].filter(Boolean).join(", ");
        if (place) lines.push("City: " + place);
        if (val("budget")) lines.push("Budget: " + val("budget"));
        if (val("timeline")) lines.push("Timeline: " + val("timeline"));
        if (val("note")) lines.push("Note: " + val("note"));
        lines.push("Page: " + page);
        return lines;
      };
      var bubble = $(".bubble", form);
      var redraw = function () { if (bubble) bubble.textContent = compose().join("\n"); };
      form.addEventListener("change", function (ev) {
        if (ev.target && ev.target.name === "scope") drawBudgets();
        if (ev.target && ev.target.name) showError(cur, "");
        redraw();
      });
      form.addEventListener("input", redraw);
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        if (cur < steps.length - 1) { // Enter in an early step means "Next"
          var m0 = problem(cur);
          showError(cur, m0);
          if (!m0) go(cur + 1, true);
          return;
        }
        for (var i = 0; i < steps.length; i++) {
          var m = problem(i);
          if (m) { go(i, true); showError(i, m); return; }
        }
        window.open("https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(compose().join("\n")), "_blank", "noopener");
        var thanks = $(".enq-thanks", form);
        if (thanks) { thanks.hidden = false; thanks.textContent = "WhatsApp is opening with your message. Press send there to reach the studio."; }
      });
      form.classList.add("is-wizard"); // only now: if anything above failed, the form stays one long page that still shows
      redraw();
    });
  });

  /* 10. Note to the studio owner: shows once, after a few seconds or a little scrolling, never again once closed */
  safe(function () {
    var note = $(".owner");
    if (!note) return;
    var key = "preview-note-" + note.getAttribute("data-key");
    var closed = false;
    try { closed = window.localStorage.getItem(key) === "closed"; } catch (err) { closed = false; }
    if (closed) return;
    var noteShown = false;
    var showNote = function () {
      if (noteShown) return;
      noteShown = true;
      note.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { note.classList.add("show"); }); });
    };
    setTimeout(showNote, 4000);
    var onNoteScroll = function () { if ((window.scrollY || 0) > 500) { showNote(); window.removeEventListener("scroll", onNoteScroll); } };
    window.addEventListener("scroll", onNoteScroll, { passive: true });
    $(".owner-close", note).addEventListener("click", function () {
      note.classList.remove("show");
      setTimeout(function () { note.hidden = true; }, 400);
      try { window.localStorage.setItem(key, "closed"); } catch (err) { /* ignore */ }
    });
  });

  /* 11. Process: the line fills as you scroll and each stop lights up as the line reaches it */
  safe(function () {
    var wrap = $(".steps-wrap[data-fill]");
    if (!wrap) return;
    var steps = $$(".step", wrap);
    if (!MO) { steps.forEach(function (s) { s.classList.add("is-on"); }); return; }
    var wide = window.matchMedia("(min-width: 900px)");
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = wrap.getBoundingClientRect(), vh = window.innerHeight || 800;
      var p = wide.matches ? (vh * 0.85 - r.top) / (vh * 0.45) : (vh * 0.72 - r.top) / Math.max(1, r.height);
      p = Math.max(0, Math.min(1, p));
      wrap.style.setProperty("--fill", p.toFixed(3));
      steps.forEach(function (s) {
        var at = wide.matches ? s.offsetLeft / Math.max(1, wrap.offsetWidth) : s.offsetTop / Math.max(1, wrap.offsetHeight);
        s.classList.toggle("is-on", p > 0 && p + 0.001 >= at);
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  });
})();
