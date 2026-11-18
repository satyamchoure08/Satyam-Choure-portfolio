/* =====================================================================
   PATRA REAL ESTATE — site script
   ---------------------------------------------------------------------
   1. CONFIG   : phone / WhatsApp number, office hours, map link
   2. LISTINGS : ONE array — add a new property by copying one block
   3. Everything below that is rendering / behaviour. No edits needed.
   ===================================================================== */

const CONFIG = {
  whatsapp: "919822362656",          // e.g. "919876543210" (country code + number, digits only)
  phoneDisplay: "+91 98223 62656",      // shown on the page, e.g. "+91 98765 43210"
  officeHours: "[ADD HOURS]",        // e.g. "Mon–Sat, 10 am – 7 pm"
  mapsQuery: "Jagdamba Heights Apartment, near SBI Bank, Mankapur, Nagpur",
  businessName: "Patra Real Estate",
};

/* ---------------------------------------------------------------------
   LISTINGS
   type     : "rent" | "sale" | "plot"  (plot = residential plots & land)
   areas    : localities this listing is available in
   price    : number in rupees (rent = per month)
   priceNote: optional text after the price ("per month", "onwards")
   images   : file names inside /images  (first one is the cover)
   details  : short facts shown in the detail popup (keep them true)
   --------------------------------------------------------------------- */
const LISTINGS = [
  {
    id: "1791727423",
    type: "rent",
    title: "3 BHK Independent Duplex",
    areas: ["Sadar", "Friends Colony", "Civil Lines", "Zingabai Takli"],
    price: 14000,
    priceNote: "per month",
    images: ["1791727423_00.webp", "1791727423_01.webp", "1791727423_02.webp", "1791727423_03.webp", "1791727423_04.webp"],
    details: { "Bedrooms": "3 BHK", "Bathrooms": "3", "Furnishing": "Semi-furnished", "Facing": "East", "Car parking": "Yes", "Bachelors": "Families only" },
    description: "Independent 3 BHK duplex with modular kitchen and designer ceilings. Available in Sadar, Friends Colony, Zingabai Takli and Civil Lines.",
    featured: true,
  },
  {
    id: "1769679454",
    type: "rent",
    title: "3 BHK Duplex with Car Parking",
    areas: ["Civil Lines", "Sadar", "Mankapur", "Zingabai Takli"],
    price: 14000,
    priceNote: "per month",
    images: ["1769679454_02.webp", "1769679454_00.webp", "1769679454_01.webp", "1769679454_03.webp", "1769679454_04.webp"],
    details: { "Bedrooms": "3 BHK", "Bathrooms": "3", "Furnishing": "Semi-furnished", "Facing": "West", "Car parking": "2", "Bachelors": "Allowed", "Maintenance": "₹500 / month" },
    description: "Independent duplex near the market, with car parking. Available in Civil Lines, Sadar, Mankapur and Zingabai Takli.",
  },
  {
    id: "1777420480",
    type: "rent",
    title: "2 / 3 BHK Flat, Semi-furnished",
    areas: ["Civil Lines", "Sadar", "Mankapur", "Zingabai Takli"],
    price: 14000,
    priceNote: "per month",
    images: ["1777420480_01.webp", "1777420480_00.webp", "1777420480_02.webp", "1777420480_03.webp"],
    details: { "Bedrooms": "2 / 3 BHK", "Bathrooms": "2", "Furnishing": "Semi-furnished", "Floor": "2nd of 4", "Facing": "East", "Car parking": "2", "Bachelors": "Allowed", "Maintenance": "₹500 / month" },
    description: "Well-kept 2 / 3 BHK flat with all facilities, in a good building. Available in Civil Lines, Sadar, Mankapur and Zingabai Takli.",
  },
  {
    id: "1584195261",
    type: "rent",
    title: "2 & 3 BHK Fully Furnished Flat",
    areas: ["Indora", "Friends Colony", "Sadar", "Zingabai Takli", "Kamptee Road", "Koradi Road", "Jaripatka", "Civil Lines"],
    price: 14000,
    priceNote: "per month",
    images: ["1584195261_01.webp", "1584195261_00.webp", "1584195261_02.webp", "1584195261_03.webp", "1584195261_07.webp", "1584195261_08.webp", "1584195261_05.webp", "1584195261_06.webp", "1584195261_04.webp"],
    details: { "Bedrooms": "2 & 3 BHK", "Bathrooms": "2", "Furnishing": "Fully furnished", "Floor": "1st of 4", "Facing": "East", "Car parking": "Yes", "Bachelors": "Allowed" },
    description: "Fully furnished flats ready to move in — beds, wardrobes, modular kitchen and fittings included. Available across Indora, Friends Colony, Sadar, Zingabai Takli, Kamptee Road, Koradi Road, Jaripatka and Civil Lines.",
    featured: true,
  },
  {
    id: "1734110531",
    type: "rent",
    title: "2 / 3 BHK Flat with Modular Kitchen",
    areas: ["Civil Lines", "Sadar", "Kamptee Road", "Zingabai Takli", "Mankapur", "Friends Colony", "Koradi Road"],
    price: 12000,
    priceNote: "per month",
    images: ["1734110531_01.webp", "1734110531_00.webp", "1734110531_02.webp"],
    details: { "Bedrooms": "2 / 3 BHK", "Furnishing": "Semi-furnished", "Floor": "1st of 5", "Facing": "West", "Car parking": "1", "Bachelors": "Allowed", "Maintenance": "₹500 / month" },
    description: "Spacious flat with modular kitchen and marble bathroom. Available in Civil Lines, Sadar, Kamptee Road, Zingabai Takli, Mankapur, Friends Colony and Koradi Road.",
  },
  {
    id: "1727199048",
    type: "rent",
    title: "2 & 3 BHK Flat",
    areas: ["Civil Lines", "Sadar", "Mankapur", "Friends Colony", "Zingabai Takli", "Jaripatka"],
    price: 12000,
    priceNote: "per month",
    images: ["1727199048_00.webp", "1727199048_01.webp", "1727199048_02.webp"],
    details: { "Bedrooms": "2 & 3 BHK", "Bathrooms": "3", "Furnishing": "Semi-furnished", "Floor": "1st of 6", "Facing": "East", "Car parking": "Yes", "Bachelors": "Allowed" },
    description: "Semi-furnished flat with sofa set, modular kitchen and bedroom wardrobes. Available in Civil Lines, Sadar, Mankapur, Friends Colony, Zingabai Takli and Jaripatka.",
  },
  {
    id: "1791727672",
    type: "rent",
    title: "1 & 2 BHK Flat",
    areas: ["Sadar", "Gorewada", "Mankapur", "Jaripatka"],
    price: 9000,
    priceNote: "per month",
    images: ["1791727672_00.webp", "1791727672_01.webp", "1791727672_03.webp", "1791727672_06.webp", "1791727672_02.webp"],
    details: { "Bedrooms": "1 & 2 BHK", "Bathrooms": "2", "Furnishing": "Semi-furnished", "Facing": "East", "Car parking": "Yes", "Bachelors": "Families only" },
    description: "Bright 1 & 2 BHK flats with a furnished hall and bedrooms. Available in Sadar, Gorewada, Mankapur and Jaripatka.",
  },
  {
    id: "1727202743",
    type: "rent",
    title: "1 / 2 BHK Flat",
    areas: ["Civil Lines", "Mankapur", "Zingabai Takli", "Koradi Road", "Friends Colony", "Jaripatka", "Kamptee Road"],
    price: 8000,
    priceNote: "per month",
    images: ["1727202743_00.webp", "1727202743_01.webp", "1727202743_02.webp"],
    details: { "Bedrooms": "1 / 2 BHK", "Bathrooms": "1", "Furnishing": "Semi-furnished", "Floor": "2nd of 5", "Facing": "East", "Car parking": "2", "Bachelors": "Allowed", "Maintenance": "₹700 / month" },
    description: "Compact flat with wooden modular kitchen and built-in wardrobes. Available in Civil Lines, Mankapur, Zingabai Takli, Koradi Road, Friends Colony, Jaripatka and Kamptee Road.",
  },

  /* ---------- FOR SALE ---------- */
  {
    id: "1851444193",
    type: "sale",
    title: "3 BHK Duplex",
    areas: ["Sadar", "Zingabai Takli", "Friends Colony", "Kamptee Road"],
    price: 6000000,
    images: ["1851444193_00.webp", "1851444193_01.webp"],
    details: { "Bedrooms": "3 BHK", "Bathrooms": "3", "Furnishing": "Unfurnished", "Status": "Ready to move", "Facing": "East", "Car parking": "Yes" },
    description: "Newly built 3 BHK duplex with glass-railed balconies, gated parking and a modern grey-and-white elevation. Available in Sadar, Zingabai Takli, Friends Colony and Kamptee Road.",
    featured: true,
  },
  {
    id: "1727997883",
    type: "sale",
    title: "1 & 2 BHK Flat",
    areas: ["Sadar", "Friends Colony", "Koradi Road", "Zingabai Takli", "Kamptee Road"],
    price: 2000000,
    priceNote: "onwards",
    images: ["1727997883_00.webp"],
    details: { "Bedrooms": "1 & 2 BHK", "Bathrooms": "2", "Furnishing": "Semi-furnished", "Status": "Ready to move", "Floor": "1st of 4", "Facing": "East", "Car parking": "Yes" },
    description: "Ready-to-move 1 & 2 BHK flats in a new apartment building. Available in Sadar, Friends Colony, Koradi Road, Zingabai Takli and Kamptee Road.",
  },

  /* ---------- PLOTS & LAND ---------- */
  {
    id: "1725601954",
    type: "plot",
    title: "Residential Plots",
    areas: ["Gorewada", "Kamptee Road", "Mankapur", "Koradi Road", "Godhani"],
    price: 2200000,
    priceNote: "onwards",
    images: ["1725601954_00.webp", "1725601954_01.webp", "1725601954_02.webp", "1725601954_03.webp"],
    details: { "Type": "Residential plot", "Sizes": "Small, medium and large plots", "Facing": "East" },
    description: "Residential plots in developing layouts, in three sizes. Available in Gorewada, Kamptee Road, Mankapur, Koradi Road and Godhani Road.",
    featured: true,
  },
  {
    id: "1859476665",
    type: "plot",
    title: "Land in Prime Locations",
    areas: ["Kamptee Road", "Godhani", "Koradi Road", "Katol Road"],
    price: 80000000,
    images: ["1859476665_00.webp", "1859476665_01.webp", "1859476665_02.webp", "1859476665_03.webp", "1859476665_04.webp"],
    details: { "Type": "Land", "Title": "Clear property", "Facing": "East" },
    description: "Clear-title land in prime, developing areas of North Nagpur. Available on Kamptee Road, Godhani, Koradi Road, Katol Road and Wardha Road.",
  },
];

/* Order of the area filter and the "Areas we serve" section */
const AREAS = [
  { name: "Sadar",          zone: "Central" },
  { name: "Civil Lines",    zone: "Central" },
  { name: "Mankapur",       zone: "North" },
  { name: "Zingabai Takli", zone: "North" },
  { name: "Gorewada",       zone: "North" },
  { name: "Koradi Road",    zone: "North" },
  { name: "Godhani",        zone: "North" },
  { name: "Friends Colony", zone: "North-East" },
  { name: "Kamptee Road",   zone: "North-East" },
  { name: "Jaripatka",      zone: "North-East" },
  { name: "Indora",         zone: "North-East" },
  { name: "Katol Road",     zone: "West" },
];

/* =====================================================================
   RENDERING & BEHAVIOUR (no need to edit below this line)
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- helpers ---------- */
  const hasNumber = /^\d{10,15}$/.test(CONFIG.whatsapp);
  function waLink(message) {
    const base = hasNumber ? `https://wa.me/${CONFIG.whatsapp}` : "https://wa.me/";
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  function formatINR(n) {
    if (n >= 10000000) return "₹" + trim(n / 10000000) + " Cr";
    if (n >= 100000) return "₹" + trim(n / 100000) + " Lakh";
    return "₹" + n.toLocaleString("en-IN");
  }
  function trim(x) { return (Math.round(x * 100) / 100).toString(); }
  function typeLabel(t) { return t === "rent" ? "For Rent" : t === "sale" ? "For Sale" : "Plots & Land"; }
  function priceLine(l) {
    const p = formatINR(l.price);
    if (l.type === "rent") return `<span class="price__num">${p}</span><span class="price__note"> / month</span>`;
    return `<span class="price__num">${p}</span>${l.priceNote ? `<span class="price__note"> ${l.priceNote}</span>` : ""}`;
  }
  function enquiryMessage(l) {
    return `Hello ${CONFIG.businessName}, I saw "${l.title}" (${typeLabel(l.type)}, ${formatINR(l.price)}${l.type === "rent" ? "/month" : ""}) in ${l.areas.slice(0, 3).join(" / ")} on your website. Ref ${l.id}. Please share details.`;
  }

  /* ---------- global WhatsApp links ---------- */
  const generalMsg = `Hello ${CONFIG.businessName}, I am looking for a property in North Nagpur. Please get in touch.`;
  $$("[data-wa]").forEach(a => { a.href = waLink(generalMsg); });
  $$("[data-phone]").forEach(a => {
    a.textContent = CONFIG.phoneDisplay;
    a.href = hasNumber ? `tel:+${CONFIG.whatsapp}` : "#contact";
  });
  $$("[data-hours]").forEach(el => { el.textContent = CONFIG.officeHours; });
  $$("[data-maps]").forEach(a => { a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CONFIG.mapsQuery); });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- listings ---------- */
  const grid = $("#listingGrid");
  const areaSelect = $("#areaFilter");
  const countEl = $("#listingCount");
  let activeType = "rent";
  let activeArea = "";

  AREAS.forEach(a => {
    const o = document.createElement("option");
    o.value = a.name; o.textContent = a.name;
    areaSelect.appendChild(o);
  });

  function cardHTML(l, i) {
    const cover = `images/thumbs/${l.images[0]}`;
    return `
      <article class="card${l.featured ? " card--featured" : ""} reveal" style="--d:${(i % 6) * 70}ms">
        <button class="card__media" type="button" data-open="${l.id}" aria-label="View details of ${l.title}">
          <img src="${cover}" alt="${l.title} — ${l.areas[0]}" loading="lazy" decoding="async">
          <span class="card__tag">${typeLabel(l.type)}</span>
          ${l.images.length > 1 ? `<span class="card__photos">${l.images.length} photos</span>` : ""}
        </button>
        <div class="card__body">
          <h3 class="card__title"><button type="button" data-open="${l.id}">${l.title}</button></h3>
          <p class="card__areas">${l.areas.join(" · ")}</p>
          <div class="card__foot">
            <p class="price">${priceLine(l)}</p>
            <div class="card__actions">
              <button class="btn btn--ghost btn--sm" type="button" data-open="${l.id}">Details</button>
              <a class="btn btn--wa btn--sm" href="${waLink(enquiryMessage(l))}" target="_blank" rel="noopener">
                ${waIcon()} Enquire
              </a>
            </div>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const list = LISTINGS.filter(l => l.type === activeType && (!activeArea || l.areas.includes(activeArea)));
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<p class="empty">No ${typeLabel(activeType).toLowerCase()} listing in ${activeArea} right now. <a href="${waLink(`Hello ${CONFIG.businessName}, I am looking for ${typeLabel(activeType).toLowerCase()} property in ${activeArea}. Please help.`)}" target="_blank" rel="noopener">Ask on WhatsApp</a> — new properties come in every week.</p>`;
    countEl.textContent = `${list.length} ${list.length === 1 ? "property" : "properties"}${activeArea ? " in " + activeArea : ""}`;
    observeReveals(grid);
  }

  $$(".tab").forEach(t => t.addEventListener("click", () => {
    $$(".tab").forEach(x => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
    t.classList.add("is-active"); t.setAttribute("aria-selected", "true");
    activeType = t.dataset.type;
    render();
  }));
  areaSelect.addEventListener("change", () => { activeArea = areaSelect.value; render(); });

  /* area tiles → filter */
  $$("[data-area]").forEach(el => el.addEventListener("click", () => {
    activeArea = el.dataset.area;
    areaSelect.value = activeArea;
    const t = LISTINGS.some(l => l.type === activeType && l.areas.includes(activeArea)) ? activeType
      : (["rent", "sale", "plot"].find(ty => LISTINGS.some(l => l.type === ty && l.areas.includes(activeArea))) || activeType);
    $(`.tab[data-type="${t}"]`).click();
    document.getElementById("properties").scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  /* ---------- detail modal ---------- */
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  let lastFocus = null;

  function openModal(id) {
    const l = LISTINGS.find(x => x.id === id);
    if (!l) return;
    lastFocus = document.activeElement;
    const details = Object.entries(l.details).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    modalBody.innerHTML = `
      <div class="gallery">
        <div class="gallery__main"><img id="galleryMain" src="images/${l.images[0]}" alt="${l.title}"></div>
        ${l.images.length > 1 ? `<div class="gallery__thumbs">${l.images.map((im, i) =>
          `<button type="button" class="${i === 0 ? "is-active" : ""}" data-src="images/${im}" aria-label="Photo ${i + 1}"><img src="images/thumbs/${im}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>
      <div class="modal__info">
        <p class="eyebrow">${typeLabel(l.type)} · Ref ${l.id}</p>
        <h2 class="modal__title">${l.title}</h2>
        <p class="modal__areas">${l.areas.join(" · ")}</p>
        <p class="price price--lg">${priceLine(l)}</p>
        <p class="modal__desc">${l.description}</p>
        <dl class="specs">${details}</dl>
        <div class="modal__cta">
          <a class="btn btn--wa" href="${waLink(enquiryMessage(l))}" target="_blank" rel="noopener">${waIcon()} Enquire on WhatsApp</a>
          <a class="btn btn--ghost" href="${hasNumber ? `tel:+${CONFIG.whatsapp}` : "#contact"}">Call Manoj Patra</a>
        </div>
      </div>`;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    $(".modal__close", modal).focus();
    $$(".gallery__thumbs button", modalBody).forEach(b => b.addEventListener("click", () => {
      $("#galleryMain").src = b.dataset.src;
      $$(".gallery__thumbs button", modalBody).forEach(x => x.classList.remove("is-active"));
      b.classList.add("is-active");
    }));
  }
  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(() => { modal.hidden = true; }, 280);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-open]");
    if (b) openModal(b.dataset.open);
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* ---------- "Tell us what you need" → WhatsApp ---------- */
  const form = $("#needForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form);
    const lines = [
      `Hello ${CONFIG.businessName}, this is ${f.get("name")}.`,
      `I want to: ${f.get("intent")}`,
      `Property: ${f.get("ptype")}`,
      `Area: ${f.get("area") || "Any"}`,
      `Budget: ${f.get("budget") || "Not fixed"}`,
      `My number: ${f.get("phone")}`,
      f.get("notes") ? `Notes: ${f.get("notes")}` : "",
      "(Sent from your website)",
    ].filter(Boolean);
    const link = waLink(lines.join("\n"));
    const fallback = $("#formFallback");
    fallback.href = link;
    fallback.hidden = false;
    const a = document.createElement("a");
    a.href = link; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  });
  AREAS.forEach(a => {
    const o = document.createElement("option");
    o.value = a.name; o.textContent = a.name;
    $("#formArea").appendChild(o);
  });

  /* ---------- nav ---------- */
  const header = $(".header");
  const navToggle = $("#navToggle");
  const nav = $("#nav");
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open);
    document.body.classList.toggle("no-scroll", open);
    header.classList.toggle("nav-open", open);
  });
  $$("#nav a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open"); navToggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("no-scroll"); header.classList.remove("nav-open");
  }));

  /* ---------- scroll effects ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroImg = $(".hero__img");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 24);
      if (!reduce && heroImg && y < window.innerHeight * 1.2) {
        heroImg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.06)`;
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  function observeReveals(scope = document) {
    $$(".reveal", scope).forEach(el => { if (reduce) el.classList.add("is-in"); else io.observe(el); });
  }

  render();
  observeReveals();

  function waIcon() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>`;
  }
})();
