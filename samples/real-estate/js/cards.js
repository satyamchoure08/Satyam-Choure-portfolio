/* ============================================================
   KOHINOOR ESTATES — property cards, quick view, shortlist
   drawer and compare tray. Shared by home + properties pages.
   ============================================================ */
(function () {
  "use strict";
  var KE, DATA;

  function cardHTML(p, i) {
    var tilt = i % 2 ? "tilt-r" : "tilt-l";
    var price = KE.priceLabel(p.priceLakh);
    return (
      '<article class="pcard rv ' + tilt + '" style="--i:' + (i % 4) + '" data-id="' + p.id + '">' +
        '<div class="pcard-media">' +
          '<img src="' + p.img + '" width="' + p.w + '" height="' + p.h + '" loading="lazy" decoding="async" alt="' + p.alt + '">' +
          '<span class="pcard-tag' + (p.status === "New launch" ? " acc" : "") + '">' + p.status + "</span>" +
          '<button class="pcard-wish" data-wish="' + p.id + '" aria-pressed="false" aria-label="Save to shortlist">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.3 11C19 15.4 12 20 12 20Z"/></svg>' +
          "</button>" +
          '<button class="pcard-quick" data-qv="' + p.id + '">Quick view</button>' +
        "</div>" +
        '<div class="pcard-row" style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">' +
          '<h3 class="pcard-name">' + p.name + "</h3>" +
          '<span class="pcard-price">' + price + "</span>" +
        "</div>" +
        '<p class="pcard-sub">' + p.area + ", " + p.city + " · " + p.type + "</p>" +
        '<div class="pcard-specs">' +
          (p.bhk ? "<span>" + p.bhk + " BHK</span>" : "") +
          (p.baths ? "<span>" + p.baths + " Bath</span>" : "") +
          "<span>" + p.sqft.toLocaleString("en-IN") + " sqft</span>" +
          '<button class="chip" data-cmp="' + p.id + '" aria-pressed="false" style="margin-left:auto;padding:6px 12px">⇄ Compare</button>' +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- quick view ---------- */
  function fillQuick(p) {
    var m = KE.$("#qv"); if (!m) return;
    KE.$("#qv-img").src = p.img;
    KE.$("#qv-img").alt = p.alt;
    KE.$("#qv-name").textContent = p.name;
    KE.$("#qv-sub").textContent = p.area + ", " + p.city + " · " + p.type + " · " + p.status;
    KE.$("#qv-price").textContent = KE.priceLabel(p.priceLakh);
    KE.$("#qv-specs").innerHTML =
      (p.bhk ? "<span>" + p.bhk + " BHK</span>" : "") +
      (p.baths ? "<span>" + p.baths + " Bath</span>" : "") +
      "<span>" + p.sqft.toLocaleString("en-IN") + " sqft</span>" +
      "<span>" + p.facing + "-facing</span>";
    KE.$("#qv-blurb").textContent = p.blurb;
    KE.$("#qv-tags").innerHTML = p.tags.map(function (t) { return '<span class="chip chip-acc">' + t + "</span>"; }).join("");
    KE.$("#qv-book").href = "property.html?id=" + p.id + "#book";
    KE.$("#qv-wa").href = KE.waLink("Hi Kohinoor Estates! I'd like to know more about " + p.name + " (" + p.area + ", " + p.city + ").");
  }

  /* ---------- shortlist drawer ---------- */
  function renderWish() {
    var body = KE.$("#wishBody"); if (!body) return;
    var ids = KE.wish.get();
    var wc = KE.$("#wishCount");
    if (wc) wc.textContent = String(ids.length);
    if (!ids.length) {
      body.innerHTML = '<div class="empty-state" style="border:0;padding:30px 10px"><p class="micro">Shortlist is empty — tap the heart on any home.</p></div>';
      return;
    }
    body.innerHTML = ids.map(function (id) {
      var p = DATA.properties.filter(function (x) { return x.id === id; })[0];
      if (!p) return "";
      return '<div style="display:grid;grid-template-columns:84px 1fr auto;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft);padding-bottom:12px">' +
        '<img src="' + p.img + '" width="84" height="63" style="border-radius:6px;object-fit:cover;aspect-ratio:4/3" alt="' + p.alt + '" loading="lazy">' +
        '<div><a href="property.html?id=' + p.id + '" style="text-decoration:none;font-weight:600;font-size:14px">' + p.name + "</a>" +
        '<div class="micro">' + p.area + " · " + KE.priceLabel(p.priceLakh) + "</div></div>" +
        '<button class="btn-round" data-unwish="' + p.id + '" aria-label="Remove ' + p.name + ' from shortlist" style="width:38px;height:38px"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      "</div>";
    }).join("");
    var waAll = KE.waLink("Hi! My shortlist on kohinoor-estates: " + ids.map(function (id) {
      var p = DATA.properties.filter(function (x) { return x.id === id; })[0];
      return p ? p.name : id;
    }).join(", ") + ". Can we plan visits?");
    KE.$("#wishWA").href = waAll;
  }

  /* ---------- compare ---------- */
  var cmp = [];
  function setCmpBtns() {
    KE.$$(".pcard-specs [data-cmp]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(cmp.indexOf(b.getAttribute("data-cmp")) > -1));
      b.classList.toggle("is-on", cmp.indexOf(b.getAttribute("data-cmp")) > -1);
    });
  }
  function renderTray() {
    var tray = KE.$("#cmpTray"); if (!tray) return;
    tray.classList.toggle("show", cmp.length > 0);
    var n = KE.$("#cmpCount"); if (n) n.textContent = String(cmp.length);
  }
  function renderCompare() {
    var body = KE.$("#cmpBody"); if (!body) return;
    if (cmp.length < 2) {
      body.innerHTML = '<p class="micro" style="padding:20px 6px">Pick at least two homes with ⇄ to compare them side-by-side.</p>';
      return;
    }
    var ps = cmp.map(function (id) { return DATA.properties.filter(function (x) { return x.id === id; })[0]; });
    var row = function (label, fn) {
      return "<tr><th>" + label + "</th>" + ps.map(function (p) { return "<td>" + fn(p) + "</td>"; }).join("") + "</tr>";
    };
    body.innerHTML = '<table class="cmp-table">' +
      row("Home", function (p) { return "<strong>" + p.name + "</strong>"; }) +
      row("Price", function (p) { return KE.priceLabel(p.priceLakh); }) +
      row("₹ / sqft", function (p) { return "₹" + Math.round((p.priceLakh * 1e5) / p.sqft).toLocaleString("en-IN"); }) +
      row("Config", function (p) { return p.bhk ? p.bhk + " BHK / " + p.baths + " bath" : "Plot"; }) +
      row("Area", function (p) { return p.sqft.toLocaleString("en-IN") + " sqft"; }) +
      row("Status", function (p) { return p.status; }) +
      row("Facing", function (p) { return p.facing; }) +
      row("Year", function (p) { return String(p.year); }) +
      "</table>";
  }

  function bind() {
    KE = window.KE; DATA = window.KE_DATA;
    KE.renderCard = cardHTML;

    /* render into any container marked data-cards="featured" or "all" */
    KE.$$("[data-cards]").forEach(function (wrap) {
      var mode = wrap.getAttribute("data-cards");
      var list = mode === "featured"
        ? DATA.properties.filter(function (p) { return p.featured; })
        : DATA.properties;
      wrap.innerHTML = list.map(cardHTML).join("");
    });
    KE.syncWishButtons();

    document.addEventListener("click", function (e) {
      var t = e.target;

      var w = t.closest ? t.closest("[data-wish]") : null;
      if (w) {
        var id = w.getAttribute("data-wish");
        var added = KE.wish.toggle(id);
        KE.syncWishButtons();
        renderWish();
        KE.toast(added ? "Saved to your shortlist." : "Removed from shortlist.", added ? "View" : null, function () {
          KE.openSide(KE.$("#wishDrawer")); renderWish();
        });
        return;
      }
      var uw = t.closest ? t.closest("[data-unwish]") : null;
      if (uw) { KE.wish.toggle(uw.getAttribute("data-unwish")); KE.syncWishButtons(); renderWish(); return; }

      var q = t.closest ? t.closest("[data-qv]") : null;
      if (q) {
        var p = DATA.properties.filter(function (x) { return x.id === q.getAttribute("data-qv"); })[0];
        if (p) { fillQuick(p); KE.openModal(KE.$("#qv")); }
        return;
      }
      var c = t.closest ? t.closest("[data-cmp]") : null;
      if (c) {
        var cid = c.getAttribute("data-cmp");
        var i = cmp.indexOf(cid);
        if (i > -1) cmp.splice(i, 1);
        else {
          if (cmp.length >= 3) { KE.toast("Compare holds three homes — remove one first."); return; }
          cmp.push(cid);
        }
        setCmpBtns(); renderTray(); renderCompare();
        return;
      }
    });

    var openWish = KE.$("[data-open-wish]");
    if (openWish) openWish.addEventListener("click", function () { renderWish(); KE.openSide(KE.$("#wishDrawer")); });
    var openCmp = KE.$("#cmpTray [data-open-cmp]");
    if (openCmp) openCmp.addEventListener("click", function () { KE.openSide(KE.$("#cmpDrawer")); });
    var clearCmp = KE.$("#cmpTray [data-clear-cmp]");
    if (clearCmp) clearCmp.addEventListener("click", function () { cmp = []; setCmpBtns(); renderTray(); renderCompare(); });

    renderWish(); renderTray(); renderCompare();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
