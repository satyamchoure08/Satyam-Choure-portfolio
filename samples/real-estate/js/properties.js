/* ============================================================
   KOHINOOR ESTATES — instant search, filters, sort, empty state
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var KE = window.KE, DATA = window.KE_DATA;
    var grid = KE.$("#grid"); if (!grid) return;

    var state = { q: "", type: "any", area: "any", bhk: "any", budget: "any", status: "any", sort: "featured" };

    var q   = KE.$("#q"),
        fT  = KE.$("#f-type"), fA = KE.$("#f-area"), fB = KE.$("#f-bhk"),
        fBu = KE.$("#f-budget"), fS = KE.$("#f-status"), fSort = KE.$("#f-sort"),
        count = KE.$("#count"), empty = KE.$("#empty"), resetBtn = KE.$("#resetFilters");

    /* fill area select from data */
    if (fA) {
      var areas = [];
      DATA.properties.forEach(function (p) { if (areas.indexOf(p.area) === -1) areas.push(p.area); });
      areas.sort().forEach(function (a) {
        var o = document.createElement("option"); o.value = a; o.textContent = a; fA.appendChild(o);
      });
    }

    function apply() {
      var list = DATA.properties.filter(function (p) {
        if (state.type !== "any" && p.type !== state.type) return false;
        if (state.area !== "any" && p.area !== state.area) return false;
        if (state.bhk !== "any" && (p.bhk !== parseInt(state.bhk, 10) || 0)) return false;
        if (state.status !== "any" && p.status !== state.status) return false;
        if (state.budget !== "any") {
          if (state.budget === "u50" && !(p.priceLakh < 50)) return false;
          if (state.budget === "50-100" && !(p.priceLakh >= 50 && p.priceLakh < 100)) return false;
          if (state.budget === "100-200" && !(p.priceLakh >= 100 && p.priceLakh < 200)) return false;
          if (state.budget === "200p" && !(p.priceLakh >= 200)) return false;
        }
        if (state.q) {
          var hay = (p.name + " " + p.area + " " + p.city + " " + p.type + " " + p.tags.join(" ")).toLowerCase();
          if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
        }
        return true;
      });

      if (state.sort === "price-asc")  list.sort(function (a, b) { return a.priceLakh - b.priceLakh; });
      if (state.sort === "price-desc") list.sort(function (a, b) { return b.priceLakh - a.priceLakh; });
      if (state.sort === "size-desc")  list.sort(function (a, b) { return b.sqft - a.sqft; });

      grid.innerHTML = list.map(KE.renderCard).join("");
      KE.syncWishButtons();
      if (count) count.textContent = list.length + (list.length === 1 ? " home" : " homes");
      if (empty) empty.hidden = list.length !== 0;
      grid.hidden = list.length === 0;
    }

    if (q) q.addEventListener("input", function () { state.q = q.value.trim(); apply(); });
    [[fT, "type"], [fA, "area"], [fB, "bhk"], [fBu, "budget"], [fS, "status"], [fSort, "sort"]].forEach(function (pair) {
      if (pair[0]) pair[0].addEventListener("change", function () { state[pair[1]] = pair[0].value; apply(); });
    });
    if (resetBtn) resetBtn.addEventListener("click", function () {
      state = { q: "", type: "any", area: "any", bhk: "any", budget: "any", status: "any", sort: "featured" };
      if (q) q.value = ""; [fT, fA, fB, fBu, fS, fSort].forEach(function (s) { if (s) s.value = s.options[0].value; });
      apply();
    });

    apply();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
