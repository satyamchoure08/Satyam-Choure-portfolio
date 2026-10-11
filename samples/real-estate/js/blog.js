/* ============================================================
   KOHINOOR ESTATES — journal tag filter
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var KE = window.KE;
    var grid = KE.$("#posts"); if (!grid) return;
    var cards = KE.$$("[data-tag]", grid);
    var chips = KE.$$("#tagRow .chip");
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true");
        var tag = c.getAttribute("data-tag");
        cards.forEach(function (card) {
          card.hidden = tag !== "all" && card.getAttribute("data-tag") !== tag;
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
