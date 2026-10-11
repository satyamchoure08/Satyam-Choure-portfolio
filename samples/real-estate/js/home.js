/* ============================================================
   KOHINOOR ESTATES — home page: pinned horizontal process,
   before/after slider, testimonial carousel.
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var KE = window.KE;

    /* ---------- pinned horizontal process (desktop, motion ok) ---------- */
    var pin = KE.$("#procPin");
    if (pin) {
      var track = KE.$("#procTrack", pin);
      if (KE.reduced || window.innerWidth < 900) {
        pin.classList.add("native");   /* css fallback: overflow-x scroll */
      } else {
        var dist = function () { return Math.max(0, track.scrollWidth - pin.clientWidth); };
        var setH = function () { pin.style.height = (dist() + window.innerHeight) + "px"; };
        var onScroll = function () {
          var r = pin.getBoundingClientRect();
          var p = Math.min(Math.max(-r.top / Math.max(1, r.height - window.innerHeight), 0), 1);
          track.style.transform = "translateX(" + (-p * dist()) + "px)";
        };
        setH(); onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", function () { setH(); onScroll(); });
      }
    }

    /* ---------- EMI calculator ---------- */
    var P = KE.$("#c-price");
    if (P) {
      var D = KE.$("#c-down"), R = KE.$("#c-rate"), Y = KE.$("#c-years");
      var recalc = function () {
        var price = parseFloat(P.value) * 1e5;
        var dp = price * parseFloat(D.value) / 100;
        var loan = price - dp;
        var r = parseFloat(R.value) / 1200, n = parseFloat(Y.value) * 12;
        var f = Math.pow(1 + r, n);
        var emi = r === 0 ? loan / n : (loan * r * f) / (f - 1);
        var total = emi * n + dp;
        KE.$("#o-price").textContent = KE.fmtINR(price);
        KE.$("#o-down").textContent = D.value + "%";
        KE.$("#o-rate").textContent = parseFloat(R.value).toFixed(1) + "%";
        KE.$("#o-years").textContent = Y.value + " yrs";
        KE.$("#o-emi").innerHTML = "₹" + Math.round(emi).toLocaleString("en-IN") + "<em>/mo</em>";
        KE.$("#o-loan").textContent = KE.fmtINR(loan);
        KE.$("#o-dp").textContent = KE.fmtINR(dp);
        KE.$("#o-int").textContent = KE.fmtINR(emi * n - loan);
        KE.$("#o-afford").textContent = KE.fmtINR(total);
        KE.$("#c-wa").href = KE.waLink("Hi! My EMI sheet — price " + KE.fmtINR(price) + ", down " + D.value +
          "%, rate " + parseFloat(R.value).toFixed(1) + "%, " + Y.value + " yrs → EMI ₹" +
          Math.round(emi).toLocaleString("en-IN") + "/mo. Can we talk?");
      };
      [P, D, R, Y].forEach(function (s) { s.addEventListener("input", recalc); });
      recalc();
    }

    /* ---------- before / after ---------- */
    var ba = KE.$("#ba");
    if (ba) {
      var range = KE.$(".ba-range", ba);
      var setPos = function (v) { ba.style.setProperty("--pos", v + "%"); };
      range.addEventListener("input", function () { setPos(range.value); });
      setPos(52);
    }

    /* ---------- testimonial carousel ---------- */
    var tc = KE.$("#tcarousel");
    if (tc) {
      var slides = KE.$$(".tslide", tc);
      var dots = KE.$$(".tdot", tc);
      var idx = 0;
      var show = function (i) {
        idx = (i + slides.length) % slides.length;
        slides.forEach(function (s, k) { s.classList.toggle("on", k === idx); });
        dots.forEach(function (d, k) { d.classList.toggle("on", k === idx); d.setAttribute("aria-current", k === idx ? "true" : "false"); });
      };
      var prev = KE.$("#tPrev", tc), next = KE.$("#tNext", tc);
      if (prev) prev.addEventListener("click", function () { show(idx - 1); });
      if (next) next.addEventListener("click", function () { show(idx + 1); });
      dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); }); });
      tc.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { show(idx - 1); e.preventDefault(); }
        if (e.key === "ArrowRight") { show(idx + 1); e.preventDefault(); }
      });
      show(0);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
