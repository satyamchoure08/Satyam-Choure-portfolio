/* ============================================================
   KOHINOOR ESTATES — keyboard-friendly lightbox for any
   [data-lb] group of figures/images.
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var KE = window.KE;
    var items = KE.$$("[data-lb] img");
    if (!items.length) return;
    var list = items.map(function (im) {
      return { src: im.getAttribute("src"), alt: im.getAttribute("alt") || "", cap: im.closest("figure") ? (im.closest("figure").getAttribute("data-cap") || im.alt) : im.alt };
    });
    var idx = 0, box = null, lastFocus = null;

    function build() {
      box = document.createElement("div");
      box.className = "lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Image viewer");
      box.innerHTML =
        '<img alt="">' +
        '<button class="btn-round lb-x" aria-label="Close viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<button class="btn-round lb-nav lb-prev" aria-label="Previous image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<button class="btn-round lb-nav lb-next" aria-label="Next image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<p class="cap micro"></p>';
      document.body.appendChild(box);
      box.querySelector(".lb-x").addEventListener("click", close);
      box.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
      box.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
      box.addEventListener("click", function (e) { if (e.target === box) close(); });
      box.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") show(idx - 1);
        if (e.key === "ArrowRight") show(idx + 1);
      });
      KE.trap(box);
    }
    function show(i) {
      idx = (i + list.length) % list.length;
      var im = box.querySelector("img");
      im.src = list[idx].src; im.alt = list[idx].alt;
      box.querySelector(".cap").textContent = list[idx].cap + " — " + (idx + 1) + "/" + list.length;
    }
    function close() {
      if (box) box.remove(); box = null;
      if (lastFocus) lastFocus.focus();
    }
    items.forEach(function (im, k) {
      var fig = im.closest("figure") || im;
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Open image: " + (im.getAttribute("alt") || "photo"));
      var open = function () { lastFocus = fig; if (!box) build(); show(k); box.querySelector(".lb-x").focus(); };
      fig.addEventListener("click", open);
      fig.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
