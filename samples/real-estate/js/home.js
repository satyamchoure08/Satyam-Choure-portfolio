/* ============================================================
   KOHINOOR ESTATES — home.js (Upgraded 3D Massing & Vastu Edition)
   pinned horizontal process · EMI calculator · before/after · carousel
   + Interactive 3D Tower Massing & Floor-Stack Explorer
   + Vastu Sunlight Compass & Neighborhood Commute Radar
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var KE = window.KE;
    if (!KE) return;

    /* ---------- pinned horizontal process (desktop, motion ok) ---------- */
    var pin = KE.$("#procPin");
    if (pin) {
      var track = KE.$("#procTrack", pin);
      if (KE.reduced || window.innerWidth < 900) {
        pin.classList.add("native");
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

    /* ---------- UPGRADE: Interactive 3D Tower Massing & Vastu Sun Compass ---------- */
    var calcSec = KE.$("#c-price") && KE.$("#c-price").closest("section");
    if (calcSec) {
      var st = document.createElement("style");
      st.textContent = `
        .ke-3d-sec{padding:72px 0;border-top:1px solid var(--line,#e2e0dc)}
        .ke-3d-grid{display:grid;gap:28px;align-items:center}
        @media(min-width:880px){.ke-3d-grid{grid-template-columns:1.05fr .95fr}}
        .ke-mass-stage{background:#101216;color:#fff;border-radius:20px;padding:28px;min-height:420px;display:flex;flex-direction:column;justify-content:space-between;perspective:1100px;position:relative;overflow:hidden}
        .ke-tower{margin:24px auto;width:210px;transform-style:preserve-3d;transform:rotateX(58deg) rotateZ(-38deg);transition:transform .45s cubic-bezier(.2,.8,.2,1)}
        .ke-floor{height:38px;margin-bottom:10px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border:2px solid #93c5fd;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 14px 24px rgba(0,0,0,.45);transition:transform .35s,background .25s}
        .ke-floor:hover,.ke-floor.on{background:#eab308;color:#101216;border-color:#fff;transform:translateZ(26px) scale(1.06)}
        .ke-vastu-box{background:var(--surface,#f7f5f0);border:1px solid var(--line,#e2e0dc);border-radius:20px;padding:24px;display:grid;gap:16px}
        .ke-dir-row{display:flex;gap:8px;flex-wrap:wrap}
        .ke-dir{padding:9px 15px;border-radius:99px;border:1.5px solid #101010;background:transparent;font-weight:700;font-size:13px;cursor:pointer}
        .ke-dir.on{background:#002fa7;color:#fff;border-color:#002fa7}
      `;
      document.head.appendChild(st);

      var sec = document.createElement("section");
      sec.className = "ke-3d-sec";
      sec.innerHTML = `
        <div class="container ke-3d-grid">
          <div class="ke-mass-stage" id="keMassStage">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="micro" style="color:#93c5fd">INTERACTIVE 3D FLOOR-STACK MASSING</span>
              <span class="micro" id="keSpinHint">Move pointer to orbit 3D tower</span>
            </div>
            <div class="ke-tower" id="keTower">
              <div class="ke-floor on" data-fl="Sky Penthouse (L12–14)" data-sqft="4,200 sqft" data-price="₹3.40 Cr" data-sun="360° Terrace · Private Plunge Pool">L12–14 · SKY PENTHOUSE</div>
              <div class="ke-floor" data-fl="Duplex Sky Villas (L8–11)" data-sqft="3,150 sqft" data-price="₹2.15 Cr" data-sun="Double-Height Deck · East-North-East">L8–11 · DUPLEX VILLAS</div>
              <div class="ke-floor" data-fl="Signature 4 BHK (L4–7)" data-sqft="2,450 sqft" data-price="₹1.48 Cr" data-sun="Corner Cross-Ventilated · Park View">L4–7 · SIGNATURE 4 BHK</div>
              <div class="ke-floor" data-fl="Garden 3 BHK & Club Podium (L1–3)" data-sqft="1,820 sqft" data-price="₹96 Lakh" data-sun="Direct Podium Lawn Access · Vastu 98%">L1–3 · GARDEN 3 BHK</div>
            </div>
            <div style="background:rgba(255,255,255,.08);padding:14px 16px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
              <div>
                <strong id="keFlTitle" style="display:block;font-size:16px">Sky Penthouse (L12–14) · 4,200 sqft</strong>
                <span id="keFlSub" style="font-size:13px;color:#cbd5e1">360° Terrace · Private Plunge Pool · Indicative: ₹3.40 Cr</span>
              </div>
              <a id="keFlWa" href="https://wa.me/919876543210?text=Hi%20Kohinoor%20Estates%2C%20please%20share%20the%20floor%20plan%20for%20Sky%20Penthouse%20(L12-14)." target="_blank" rel="noopener" class="btn btn-ink" style="background:#eab308;color:#101010">Get Floor Plan ↗</a>
            </div>
          </div>
          <div class="ke-vastu-box">
            <span class="micro">VASTU, SUNLIGHT &amp; COMMUTE RADAR</span>
            <h3 style="font-size:clamp(24px,3.6vw,36px);line-height:1.05;margin:0">Check Unit Orientation &amp; Landmarks</h3>
            <p style="margin:0;opacity:.8">Select an orientation below to inspect natural daylight hours, Vastu compliance, and verified drive times across Bhopal.</p>
            <div class="ke-dir-row" id="keDirs">
              <button type="button" class="ke-dir on" data-dir="East / Ishanya (NE)" data-score="98/100 Vastu Gold" data-light="Morning golden sun (6:15–11:30 AM), cool evenings" data-radar="MP Nagar: 11 min · AIIMS: 14 min · Airport: 24 min">East / North-East</button>
              <button type="button" class="ke-dir" data-dir="North (Kubera)" data-score="95/100 Vastu Compliant" data-light="All-day soft indirect studio daylight, zero harsh glare" data-radar="Bhojpur Club: 6 min · Ring Road: 4 min · New Market: 13 min">North Facing</button>
              <button type="button" class="ke-dir" data-dir="West / Park-Facing" data-score="89/100 Sunset View" data-light="Warm sunset vistas over central landscaped greens" data-radar="Kolar 6-Lane: 3 min · Aura Mall: 8 min · Kaliyasot Dam: 9 min">West Park-Facing</button>
            </div>
            <div style="background:#fff;padding:16px;border-radius:14px;border:1px solid #e2e0dc">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px"><strong id="keVastuTitle">East / Ishanya (NE)</strong><span style="color:#002fa7;font-weight:700" id="keVastuScore">98/100 Vastu Gold</span></div>
              <p style="margin:0 0 8px;font-size:14px" id="keVastuLight">☀️ Daylight: Morning golden sun (6:15–11:30 AM), cool evenings</p>
              <p style="margin:0;font-size:13px;font-family:monospace;color:#475569" id="keVastuRadar">📍 Commute Radar: MP Nagar: 11 min · AIIMS: 14 min · Airport: 24 min</p>
            </div>
          </div>
        </div>
      `;
      calcSec.parentNode.insertBefore(sec, calcSec);

      var stage = KE.$("#keMassStage"), tower = KE.$("#keTower");
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tower.style.transform = "rotateX(" + (58 - py * 20).toFixed(1) + "deg) rotateZ(" + (-38 + px * 45).toFixed(1) + "deg)";
      });
      KE.$$(".ke-floor", tower).forEach(function (fl) {
        fl.addEventListener("click", function () {
          KE.$$(".ke-floor", tower).forEach(function (x) { x.classList.remove("on"); });
          fl.classList.add("on");
          KE.$("#keFlTitle").textContent = fl.dataset.fl + " · " + fl.dataset.sqft;
          KE.$("#keFlSub").textContent = fl.dataset.sun + " · Indicative: " + fl.dataset.price;
          KE.$("#keFlWa").href = KE.waLink("Hi! Please share the floor plan and availability for " + fl.dataset.fl + " (" + fl.dataset.sqft + ", " + fl.dataset.price + ").");
        });
      });
      KE.$$("#keDirs .ke-dir").forEach(function (b) {
        b.addEventListener("click", function () {
          KE.$$("#keDirs .ke-dir").forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on");
          KE.$("#keVastuTitle").textContent = b.dataset.dir;
          KE.$("#keVastuScore").textContent = b.dataset.score;
          KE.$("#keVastuLight").textContent = "☀️ Daylight: " + b.dataset.light;
          KE.$("#keVastuRadar").textContent = "📍 Commute Radar: " + b.dataset.radar;
        });
      });
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
