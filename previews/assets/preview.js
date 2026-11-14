/* Shared behaviour for the client homepage previews and sample project pages.
   1. Header: line once scrolled, hides while scrolling down, returns on the way up.
   2. Phone bar (call + WhatsApp) slides in after the hero.
   3. Process: the big photo changes as each step comes into view.
   4. Project filter chips.
   5. Drawing vs finished slider.
   6. Live "open now" status in the studio's own time zone (India).
   7. Enquiry form opens WhatsApp to the studio with the message already typed.
   8. Note to the studio owner, shown once, remembered when closed. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1 + 2 */
  var head = $(".site-head");
  var hero = $(".hero") || $(".p-hero");
  var bar = $(".bar");
  var lastY = window.scrollY || 0;
  function onScroll() {
    var y = window.scrollY || 0;
    if (head) {
      head.classList.toggle("scrolled", y > 8);
      head.classList.toggle("away", y > 420 && y > lastY + 2);
      if (y < lastY - 2) head.classList.remove("away");
    }
    if (bar) bar.classList.toggle("show", !hero || y > hero.offsetHeight * 0.6);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 3 */
  var steps = $$(".step");
  var shots = $$(".stage img");
  function activate(i) {
    steps.forEach(function (s, n) { s.classList.toggle("on", n === i); });
    shots.forEach(function (s, n) { s.classList.toggle("on", n === i); });
  }
  if (steps.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  }
  if (steps.length) activate(0);

  /* 4: filter, then deal the visible tiles back into the two columns so neither runs empty */
  var chips = $$(".chip");
  var tileCols = $$(".work .tiles .col");
  var allTiles = $$(".work .tiles .tile").sort(function (a, b) { return (+a.style.order) - (+b.style.order); });
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var cat = chip.getAttribute("data-cat");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      var n = 0;
      allTiles.forEach(function (t) {
        var show = cat === "all" || t.getAttribute("data-cat") === cat;
        t.classList.toggle("out", !show);
        if (tileCols.length === 2) tileCols[show ? (n++ % 2) : 1].appendChild(t);
      });
    });
  });

  /* 5 */
  $$(".ba").forEach(function (ba) {
    var range = $(".ba-range", ba);
    var frame = $(".ba-frame", ba);
    function set(v) { ba.style.setProperty("--pos", v + "%"); }
    range.addEventListener("input", function () { set(range.value); });
    var dragging = false;
    function fromPointer(ev) {
      var r = frame.getBoundingClientRect();
      var v = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
      range.value = v; set(v);
    }
    frame.addEventListener("pointerdown", function (ev) { dragging = true; fromPointer(ev); });
    window.addEventListener("pointermove", function (ev) { if (dragging) fromPointer(ev); });
    window.addEventListener("pointerup", function () { dragging = false; });
    // A small nudge the first time the slider comes into view, so people see it moves.
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          seen.disconnect();
          var t0 = null;
          function step(ts) {
            if (dragging) return;
            if (t0 === null) t0 = ts;
            var p = Math.min(1, (ts - t0) / 1600);
            var v = 50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p);
            range.value = v; set(v);
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      seen.observe(frame);
    }
  });

  /* 6 */
  var status = $(".status");
  if (status && window.Intl && Intl.DateTimeFormat) {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      var dayIdx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
      var mins = parseInt(get("hour"), 10) % 24 * 60 + parseInt(get("minute"), 10);
      var days = status.getAttribute("data-days").split(",").map(Number);
      var open = +status.getAttribute("data-open"), close = +status.getAttribute("data-close");
      var fmt = function (m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; };
      var isOpen = days.indexOf(dayIdx) > -1 && mins >= open && mins < close;
      var text;
      if (isOpen) text = "Open now, closes at " + fmt(close);
      else {
        var names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        var d = dayIdx, n = 0;
        if (!(days.indexOf(d) > -1 && mins < open)) { do { d = (d + 1) % 7; n++; } while (days.indexOf(d) < 0 && n < 8); }
        text = "Closed now, opens " + (n === 0 ? "today" : n === 1 ? "tomorrow" : names[d]) + " at " + fmt(open);
      }
      status.textContent = text;
      status.classList.toggle("is-open", isOpen);
      status.hidden = false;
    } catch (err) { /* leave hidden */ }
  }

  /* 7 */
  var form = $("form.enquiry");
  if (form) {
    var val = function (name) { var el = form.elements[name]; return el ? String(el.value || "").trim() : ""; };
    var compose = function () {
      var lines = ["Hello " + form.getAttribute("data-studio") + ", I'm " + (val("name") || "…") + "."];
      if (val("area")) lines.push("Area: " + val("area"));
      if (val("space")) lines.push("Planning: " + val("space"));
      if (val("budget")) lines.push("Budget: " + val("budget"));
      if (val("message")) lines.push(val("message"));
      return lines;
    };
    var bubble = $(".bubble", form);
    var redraw = function () { if (bubble) bubble.textContent = compose().join("\n"); };
    form.addEventListener("input", redraw);
    form.addEventListener("change", redraw);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var err = $(".form-error", form);
      if (!val("name")) {
        if (err) { err.hidden = false; err.textContent = "Add your name so the studio knows who is writing."; }
        form.elements.name.focus();
        return;
      }
      if (err) err.hidden = true;
      var lines = compose();
      lines.push("(Sent from your website)");
      window.open("https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* 8 */
  var note = $(".owner");
  if (note) {
    var key = "preview-note-" + note.getAttribute("data-key");
    var closed = false;
    try { closed = window.localStorage.getItem(key) === "closed"; } catch (err) { closed = false; }
    if (!closed) {
      // Shows once the hero has been seen: after scrolling past most of it, or after 9 seconds.
      var shown = false, ready = false;
      var show = function () {
        if (shown || !ready) return;
        shown = true;
        note.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { note.classList.add("show"); }); });
      };
      setTimeout(function () { ready = true; if (!hero || (window.scrollY || 0) > hero.offsetHeight * 0.6) show(); }, 2600);
      setTimeout(function () { ready = true; show(); }, 9000);
      window.addEventListener("scroll", function () { if (!hero || (window.scrollY || 0) > hero.offsetHeight * 0.6) show(); }, { passive: true });
      $(".owner-close", note).addEventListener("click", function () {
        note.classList.remove("show");
        setTimeout(function () { note.hidden = true; }, 500);
        try { window.localStorage.setItem(key, "closed"); } catch (err) { /* ignore */ }
      });
    }
  }
})();
