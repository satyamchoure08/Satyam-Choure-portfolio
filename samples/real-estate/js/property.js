/* ============================================================
   KOHINOOR ESTATES — detail page hydration from ?id=
   ============================================================ */
(function () {
  "use strict";
  function emi(loan, ratePct, years) {
    var r = ratePct / 1200, n = years * 12;
    if (r === 0) return loan / n;
    var f = Math.pow(1 + r, n);
    return (loan * r * f) / (f - 1);
  }
  function init() {
    var KE = window.KE, DATA = window.KE_DATA;
    var id = new URLSearchParams(location.search).get("id");
    var p = DATA.properties.filter(function (x) { return x.id === id; })[0] ||
            DATA.properties.filter(function (x) { return x.featured; })[0];
    if (!p) return;

    document.title = p.name + ", " + p.area + " — Kohinoor Estates";
    KE.$("#bc-name").textContent = p.name;
    KE.$("#pp-title").innerHTML = "";
    KE.$("#pp-title").textContent = p.name;
    KE.$("#pp-sub").textContent = (p.area + ", " + p.city + " · " + p.type + " · " + p.status).toUpperCase();
    KE.$("#pp-price").textContent = KE.priceLabel(p.priceLakh);
    KE.$("#pp-specs").innerHTML =
      (p.bhk ? "<span>" + p.bhk + " BHK</span>" : "<span>Plot</span>") +
      (p.baths ? "<span>" + p.baths + " Bath</span>" : "") +
      "<span>" + p.sqft.toLocaleString("en-IN") + " sqft</span>" +
      "<span>" + p.facing + "-facing</span><span>" + p.year + "</span>" +
      "<span>₹" + Math.round((p.priceLakh * 1e5) / p.sqft).toLocaleString("en-IN") + "/sqft</span>";
    KE.$("#pp-tags").innerHTML = p.tags.map(function (t) { return '<span class="chip chip-acc">' + t + "</span>"; }).join("");
    var img = KE.$("#pp-img");
    img.src = p.img; img.alt = p.alt;
    KE.$("#pp-blurb").textContent = p.blurb;
    KE.$("#pp-amen").innerHTML = p.amenities.map(function (a) { return '<span class="chip">' + a + "</span>"; }).join("");
    KE.$("#pp-wa").href = KE.waLink("Hi! I'd like to enquire about " + p.name + " (" + p.area + ", " + p.city + ", " + KE.priceLabel(p.priceLakh) + ").");
    KE.$("#pp-emi").textContent = KE.fmtINR(emi(p.priceLakh * 1e5 * 0.8, 8.5, 20)) + "/mo";

    /* similar: same city first, then fill */
    var sim = DATA.properties.filter(function (x) { return x.id !== p.id && x.city === p.city; })
      .concat(DATA.properties.filter(function (x) { return x.id !== p.id && x.city !== p.city; }))
      .slice(0, 3);
    var rail = KE.$("#similar");
    if (rail && KE.renderCard) {
      rail.innerHTML = sim.map(KE.renderCard).join("");
      KE.syncWishButtons();
    }

    /* preselect in booking widget */
    var bk = KE.$("#booking");
    if (bk) bk.setAttribute("data-property", p.id);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
