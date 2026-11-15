/* Shared behaviour for the studio previews: homepage, projects page and sample project page.
   Plain JavaScript, no libraries, nothing loaded from another website.
   Each part runs on its own: if one ever fails, the others still work and every section still shows.
   1. Gentle movement: photos fade in once loaded, sections rise into place (only when allowed).
   2. Header line once the page scrolls.
   3. Menu on phones and tablets.
   4. Photo and project filters (tabs): the big first photo, the "See all" link.
   5. Projects page: By project / By room, and links that open a view or a room.
   6. Photo viewer: full screen, arrows, swipe, keyboard, back button, WhatsApp "I like this photo".
   7. Drawing vs finished slider.
   8. Live "open now" status in Indian time.
   9. Enquiry form: three steps, budgets that fit the project, live WhatsApp message, opens WhatsApp.
   10. Note to the studio owner, shown once, remembered when closed. */
(function () {
  "use strict";
  window.PREVIEW_READY = true;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var MO = root.classList.contains("mo");
  var params = new URLSearchParams(window.location.search);
  var setView = null; // set by part 5, used by part 6
  function uniq(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }
  function safe(fn) { try { fn(); } catch (err) { if (window.console) console.warn("Preview: part skipped", err); } }

  /* 1. Gentle movement */
  safe(function () {
    $$(".ph img, .pcard-ph img").forEach(function (im) {
      var done = function () { im.classList.add("is-in"); };
      if (im.complete && im.naturalWidth) done();
      else { im.addEventListener("load", done); im.addEventListener("error", done); }
    });
    $$("[data-rv-kids]").forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (k, i) {
        k.setAttribute("data-rv", "");
        k.style.transitionDelay = Math.min(i, 6) * 70 + "ms";
      });
    });
    var rvs = $$("[data-rv]");
    if (MO && "IntersectionObserver" in window) {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          el.classList.add("in");
          rio.unobserve(el);
          if (el.style.transitionDelay) setTimeout(function () { el.style.transitionDelay = ""; }, 1200);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
      rvs.forEach(function (el) { rio.observe(el); });
    } else {
      rvs.forEach(function (el) { el.classList.add("in"); });
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

  /* 4. Filters. Items carry data-cat; tabs carry the category to show ("all" shows everything).
        data-max limits how many show at once (the homepage shows 5, the big first one leading). */
  safe(function () {
    $$("[data-filter]").forEach(function (box) {
      var tabs = $$(".tab", box);
      var items = $$(".tile, .pcard", box);
      var grid = $(".grid, .cards", box);
      var max = +box.getAttribute("data-max") || 0;
      var lead = box.hasAttribute("data-lead");
      var more = $(".gal-all", box);
      var moreBase = box.getAttribute("data-all-href") || "";
      var apply = function (cat, animate) {
        var shown = 0, total = 0;
        items.forEach(function (it) {
          var match = cat === "all" || (it.getAttribute("data-cat") || "").split(" ").indexOf(cat) > -1;
          var show = match && (!max || shown < max);
          if (match) { total++; it.setAttribute("data-match", ""); } else it.removeAttribute("data-match");
          if (show) shown++;
          it.hidden = !show;
          it.classList.remove("is-lead", "is-enter");
          if (show && animate && MO) { void it.offsetWidth; it.classList.add("is-enter"); }
        });
        if (grid) grid.setAttribute("data-count", String(shown));
        if (lead && max && shown === max) {
          var first = items.filter(function (it) { return !it.hidden; })[0];
          if (first) first.classList.add("is-lead");
        }
        tabs.forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-cat") === cat)); });
        if (more) {
          more.hidden = !max || total <= max;
          more.textContent = "See all " + total + " photos";
          more.setAttribute("href", moreBase + (cat === "all" ? "" : "&room=" + cat));
        }
      };
      tabs.forEach(function (t) { t.addEventListener("click", function () { apply(t.getAttribute("data-cat"), true); }); });
      box.filterTo = function (cat) { if ($('.tab[data-cat="' + cat + '"]', box)) apply(cat, false); };
      apply("all", false);
    });
  });

  /* 5. Projects page views */
  safe(function () {
    var segBtns = $$(".seg button");
    if (!segBtns.length) return;
    var views = $$(".pj-view");
    setView = function (v, remember) {
      segBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === v)); });
      views.forEach(function (x) { x.hidden = x.getAttribute("data-v") !== v; });
      if (remember) {
        try { history.replaceState(history.state, "", v === "photos" ? "?view=photos" : window.location.pathname); } catch (err) { /* ignore */ }
      }
    };
    segBtns.forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view"), true); }); });
    var room = params.get("room");
    if (params.get("view") === "photos" || room) setView("photos", false);
    var photosBox = $('.pj-view[data-v="photos"]');
    if (room && photosBox && photosBox.filterTo) photosBox.filterTo(room);
  });

  /* 6. Photo viewer */
  safe(function () {
    var vw = $(".viewer"), dataEl = $("#photo-data");
    if (!vw || !dataEl) return;
    var photos = {};
    JSON.parse(dataEl.textContent).forEach(function (p) { photos[p.id] = p; });
    var vImg = $(".vw-img", vw), vCap = $(".vw-cap", vw), vCount = $(".vw-count", vw);
    var vOpen = $(".vw-open", vw), vWa = $(".vw-wa", vw), vClose = $(".vw-close", vw);
    var waNum = document.body.getAttribute("data-wa") || "";
    var hello = document.body.getAttribute("data-hello") || "Hello, ";
    var list = [], idx = 0, lastFocus = null, isOpen = false, pushed = false;

    var show = function (i) {
      idx = (i + list.length) % list.length;
      var p = photos[list[idx]];
      if (!p) return;
      vImg.src = p.src;
      vImg.alt = p.alt;
      vCap.textContent = p.cap;
      vCount.textContent = list.length > 1 ? (idx + 1) + " / " + list.length : "";
      vOpen.hidden = !p.href;
      if (p.href) vOpen.setAttribute("href", p.href);
      vWa.setAttribute("href", "https://wa.me/" + waNum + "?text=" + encodeURIComponent(hello + "I like this photo: " + p.cap + "\n" + p.share));
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
      var box = btn.closest("[data-filter]");
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
      var btn = $('[data-photo="' + pid + '"]');
      if (btn && btn.closest(".pj-view[hidden]") && setView) setView("photos", false);
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
            var step = function (ts) {
              if (dragging) return;
              if (t0 === null) t0 = ts;
              var p = Math.min(1, (ts - t0) / 1600);
              var v = 50 + Math.sin(p * Math.PI * 2) * 16 * (1 - p);
              range.value = v;
              set(v);
              if (p < 1) requestAnimationFrame(step);
            };
            setTimeout(function () { requestAnimationFrame(step); }, 400);
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

      var studio = form.getAttribute("data-studio");
      var compose = function () {
        var lines = ["Hello " + studio + ", I'm " + (val("name") || "…") + "."];
        var prop = [val("type"), val("size"), val("sqft") ? val("sqft") + " sq ft" : ""].filter(Boolean).join(", ");
        var place = [val("area"), val("city")].filter(Boolean).join(", ");
        if (prop || place) lines.push("Property: " + [prop, place].filter(Boolean).join(" in "));
        if (val("scope")) lines.push("Need: " + val("scope"));
        if (val("budget")) lines.push("Budget: " + val("budget"));
        if (val("timeline")) lines.push("Start: " + val("timeline"));
        if (val("note")) lines.push(val("note"));
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
        var lines = compose();
        lines.push("(Sent from your website, " + form.getAttribute("data-from") + ")");
        lines.push("Page: " + form.getAttribute("data-page"));
        window.open("https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
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
})();
