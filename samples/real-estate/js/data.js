/* ============================================================
   KOHINOOR ESTATES — demo dataset.
   Every number/price/review here is [SAMPLE].
   ============================================================ */
window.KE_DATA = {

  /* price stored in ₹ lakh for easy math */
  properties: [
    { id: "p01", name: "The Glasshouse Villa", type: "Villa", area: "Kolar Road", city: "Bhopal",
      bhk: 4, baths: 5, sqft: 4200, priceLakh: 420, status: "Ready to move", facing: "East",
      year: 2023, img: "images/hero-villa.webp", w: 1600, h: 1061, featured: true, tilt: "l",
      alt: "White modernist villa with glass balustrades beside a turquoise pool under hard daylight",
      tags: ["Private pool", "Terrace deck", "Vastu-aligned"],
      blurb: "A double-height glass house on a quiet Kolar Road plot. East-facing courts pull morning light through every room; the pool terrace faces the ridge, not the road.",
      amenities: ["Private pool", "Home lift", "Solar 8 kW", "Staff quarter", "3-car porch", "Smart locks"] },

    { id: "p02", name: "Lakeview Heights · 3BHK", type: "Apartment", area: "Arera Colony", city: "Bhopal",
      bhk: 3, baths: 3, sqft: 1650, priceLakh: 118, status: "Ready to move", facing: "North",
      year: 2021, img: "images/tower-day.webp", w: 1200, h: 1600, featured: true, tilt: "r",
      alt: "Tall white apartment tower with stacked balconies against a pale sky",
      tags: ["Lake glimpse", "Corner unit", "2 parking"],
      blurb: "Corner 3BHK on the 11th floor with a long north balcony toward the Upper Lake treeline. Society has a working club, and maintenance actually shows in the lift lobby.",
      amenities: ["Club house", "2 parking", "Power backup", "Gym", "24×7 security", "Gas line"] },

    { id: "p03", name: "Sanchi Sky Penthouse", type: "Penthouse", area: "TT Nagar", city: "Bhopal",
      bhk: 4, baths: 4, sqft: 3100, priceLakh: 265, status: "Ready to move", facing: "West",
      year: 2022, img: "images/hero-atrium.webp", w: 1400, h: 952, featured: true, tilt: "l",
      alt: "Bright double-height atrium interior with a sculptural staircase",
      tags: ["Duplex", "600 sqft terrace", "Sunset view"],
      blurb: "Duplex penthouse with a double-height living atrium and a 600 sqft terrace that catches the sunset over TT Nagar. The kind of volume you cannot build new at this price.",
      amenities: ["Private terrace", "Home lift", "Italian marble", "VRV cooling", "2 parking", "Concierge"] },

    { id: "p04", name: "Kolar Ridge Row Villas", type: "Row House", area: "Kolar Road", city: "Bhopal",
      bhk: 3, baths: 3, sqft: 2050, priceLakh: 145, status: "Under construction", facing: "East",
      year: 2025, img: "images/townhouse-row.webp", w: 1200, h: 800, featured: true, tilt: "r",
      alt: "Row of warm-toned modern townhouses along a tree-lined street",
      tags: ["Possession Dec 2026", "Gated 24 homes", "Garden"],
      blurb: "A gated lane of 24 row villas with private gardens and a shared orchard spine. Construction-linked plan available; RERA escrow confirmed [PLACEHOLDER].",
      amenities: ["Private garden", "Gated lane", "Orchard", "Club", "EV point", "Rain harvesting"] },

    { id: "p05", name: "Vijay Nagar Skyline · 2BHK", type: "Apartment", area: "Vijay Nagar", city: "Indore",
      bhk: 2, baths: 2, sqft: 1180, priceLakh: 72, status: "Ready to move", facing: "East",
      year: 2020, img: "images/tower-glass.webp", w: 1200, h: 800, featured: true, tilt: "l",
      alt: "Graphic glass facade of a contemporary residential block",
      tags: ["Rental yield", "Metro 800 m", "First buyers"],
      blurb: "The sensible first buy: a rented-out 2BHK near Vijay Nagar square with a clean tenant history and society accounts we have personally audited [SAMPLE].",
      amenities: ["Lift", "Parking", "Security", "Park", "Power backup", "Gas line"] },

    { id: "p06", name: "Courtyard House, Shahpura", type: "Villa", area: "Shahpura", city: "Bhopal",
      bhk: 4, baths: 4, sqft: 3400, priceLakh: 210, status: "Ready to move", facing: "North",
      year: 2019, img: "images/villa-exterior.webp", w: 1200, h: 800, featured: true, tilt: "r",
      alt: "Modern villa exterior with layered terraces at dusk",
      tags: ["Central courtyard", "Mango trees", "Corner plot"],
      blurb: "Rooms wrap a planted courtyard so every window opens to green, not a neighbour's wall. Corner plot with two mature mango trees the owners refuse to cut.",
      amenities: ["Courtyard", "Corner plot", "Bore well", "Solar 5 kW", "Study", "Store room"] },

    { id: "p07", name: "Ayodhya Bypass Plot · 2400 sqft", type: "Plot", area: "Ayodhya Bypass", city: "Bhopal",
      bhk: 0, baths: 0, sqft: 2400, priceLakh: 58, status: "Ready to move", facing: "East",
      year: 2024, img: "images/proc-site.webp", w: 1200, h: 800, featured: false, tilt: "l",
      alt: "Cleared residential construction site with a crane against open sky",
      tags: ["Clear title", "Colony of 60", "40 ft road"],
      blurb: "East-facing plot in a developed colony, 90 seconds off the bypass. Title searched twice by our empanelled lawyer; mutation papers in order [SAMPLE].",
      amenities: ["Clear title", "40 ft road", "Water line", "Electricity", "Compound wall", "Park facing"] },

    { id: "p08", name: "Super Corridor 3BHK", type: "Apartment", area: "Super Corridor", city: "Indore",
      bhk: 3, baths: 3, sqft: 1720, priceLakh: 96, status: "New launch", facing: "West",
      year: 2026, img: "images/tower-dusk.webp", w: 1200, h: 800, featured: false, tilt: "r",
      alt: "Residential tower lit at dusk with landscaped foreground",
      tags: ["Launch price", "Twin towers", "Sky deck"],
      blurb: "Launch-phase pricing in the corridor's most credible project. We negotiated a floor-rise waiver for our buyers on the first 10 units [SAMPLE].",
      amenities: ["Sky deck", "Club", "Gym", "Pool", "2 parking", "Smart home"] },

    { id: "p09", name: "Hoshangabad Rd · 3BHK", type: "Apartment", area: "Hoshangabad Road", city: "Bhopal",
      bhk: 3, baths: 2, sqft: 1480, priceLakh: 68, status: "Ready to move", facing: "East",
      year: 2018, img: "images/duplex-corner.webp", w: 1200, h: 800, featured: false, tilt: "l",
      alt: "Corner duplex home with warm brick and white volumes",
      tags: ["Best value", "Near Aashima", "Low maintenance"],
      blurb: "The value pick of our board: a well-run 2018 society where maintenance is ₹1.2/sqft and the sinking fund is real [SAMPLE]. Fresh paint, new lifts.",
      amenities: ["Lift", "Parking", "Park", "Security", "Temple", "Shop row"] },

    { id: "p10", name: "Katara Hills Farmhouse", type: "Villa", area: "Katara Hills", city: "Bhopal",
      bhk: 5, baths: 6, sqft: 5600, priceLakh: 520, status: "Ready to move", facing: "South",
      year: 2021, img: "images/villa-pool.webp", w: 1200, h: 800, featured: false, tilt: "r",
      alt: "Minimal villa with infinity pool at golden hour",
      tags: ["1.2 acre", "Infinity pool", "Guest house"],
      blurb: "A weekend house that became a full-time home for its owners — now relocating abroad. Infinity pool, guest cottage, and the quietest air in Bhopal.",
      amenities: ["1.2 acre", "Infinity pool", "Guest house", "Orchard", "Caretaker room", "Generator"] },

    { id: "p11", name: "Bicholi Mardana Duplex", type: "Row House", area: "Bicholi Mardana", city: "Indore",
      bhk: 3, baths: 3, sqft: 1900, priceLakh: 88, status: "Under construction", facing: "East",
      year: 2025, img: "images/int-stairs.webp", w: 1200, h: 800, featured: false, tilt: "l",
      alt: "Sculptural interior staircase with soft daylight on plaster walls",
      tags: ["Possession Jun 2026", "Premium finish", "Roof rights"],
      blurb: "Duplexes with full roof rights and a finish schedule that reads like a boutique hotel spec sheet. Structure complete; finishes in progress [SAMPLE].",
      amenities: ["Roof rights", "Premium fittings", "Parking", "Garden", "Gate", "Solar-ready"] },

    { id: "p12", name: "New Market Studio Loft", type: "Apartment", area: "TT Nagar", city: "Bhopal",
      bhk: 1, baths: 1, sqft: 640, priceLakh: 34, status: "Ready to move", facing: "North",
      year: 2017, img: "images/int-living-warm.webp", w: 1200, h: 1059, featured: false, tilt: "r",
      alt: "Warm compact living room with walnut and ivory tones",
      tags: ["Walk to market", "Rental ready", "Loft bed"],
      blurb: "A lofted studio three minutes from New Market. Rents within a week, every time [SAMPLE]. Perfect pied-à-terre or first asset.",
      amenities: ["Lift", "Security", "Furnished", "AC", "WiFi-ready", "Terrace access"] }
  ],

  /* gallery interiors for lightbox + property detail */
  interiors: [
    { img: "images/int-living.webp",      w: 1200, h: 675,  cap: "Living room — south light, lime plaster" },
    { img: "images/int-kitchen.webp",     w: 1200, h: 800,  cap: "Kitchen — quartz island, matte fronts" },
    { img: "images/int-bedroom.webp",     w: 1200, h: 1200, cap: "Bedroom — layered neutrals" },
    { img: "images/int-balcony.webp",     w: 1200, h: 900,  cap: "Balcony — the 4 pm seat" },
    { img: "images/int-stairs.webp",      w: 1200, h: 800,  cap: "Stair — cast in one pour" },
    { img: "images/int-dining.webp",      w: 1200, h: 800,  cap: "Dining — north light, no glare" },
    { img: "images/int-bath.webp",        w: 1100, h: 1649, cap: "Bath — terrazzo, brass" },
    { img: "images/int-living-warm.webp", w: 1200, h: 1059, cap: "Den — walnut and wool" }
  ],

  testimonials: [ /* [SAMPLE] */
    { name: "Ananya & Rohan Trivedi", area: "Arera Colony", rating: 5,
      quote: "Meera killed a deal we were in love with because the society had a hidden loan. Then found us a better one in eleven days.", who: "Bought 3BHK, 2025" },
    { name: "S. K. Rathore", area: "Kolar Road", rating: 5,
      quote: "I have sold land before through brokers who never visited the site. She walked every inch, quoted a number, and we closed 4% above it.", who: "Sold plot, 2024" },
    { name: "Fatima Qureshi", area: "TT Nagar", rating: 5,
      quote: "As a single buyer I expected pressure. I got spreadsheets, three honest options, and a registry that finished before the deadline.", who: "First home, 2025" },
    { name: "Devansh Jain", area: "Vijay Nagar, Indore", rating: 4,
      quote: "Remote purchase from Pune felt impossible until video visits, lawyer calls and a negotiated floor-rise waiver landed in one WhatsApp thread.", who: "Investor, 2026" },
    { name: "The Malhotras", area: "Katara Hills", rating: 5,
      quote: "They handled the sale of our farmhouse and the purchase of our city flat in the same month. One team, zero chaos is not a tagline, it happened.", who: "Sold + bought, 2025" }
  ],

  posts: [
    { slug: "kolar-road-2026", tag: "Market notes", date: "2026-09-18", read: 6,
      img: "images/proc-neighbourhood.webp", w: 1200, h: 1501,
      title: "Kolar Road after the ring-road link: what actually moved",
      dek: "We tracked 41 registered sales near the new link [SAMPLE]. Prices rose — but not where everyone says.",
      body: [
        "Every headline says the ring-road link 'doubled' Kolar Road prices. Our registry data says something quieter and more useful: ready villas within 800 metres of the link moved 9–12% [SAMPLE], while plots two kilometres deep barely moved at all.",
        "The reason is simple. End-users buy readiness, not promises. A finished villa saves a buyer eighteen months of rent and construction supervision; that saving is worth paying for. A raw plot still carries the same approval risk it carried in 2024.",
        "If you are selling a ready home near the link, this is your window — comparable stock is thin and serious buyers are circulating. If you are buying, look one lane behind the main road: the premium evaporates, the quiet stays."
      ] },
    { slug: "rera-escrow-101", tag: "Guides", date: "2026-08-02", read: 8,
      img: "images/proc-blueprint.webp", w: 1200, h: 675,
      title: "RERA escrow, in plain Hindi-English",
      dek: "Where does your instalment actually go? A five-minute explainer we send every under-construction buyer.",
      body: [
        "When a project is RERA-registered, 70% of what you pay must sit in a separate escrow account, released to the builder only against certified construction progress. That single rule is the difference between a delayed project and a vanished one.",
        "Ask for three things before you pay a token: the RERA number, the latest CA certificate of construction percentage, and the escrow bank's statement header. A credible builder produces all three in a day.",
        "We keep a running file on every active project we recommend. If a builder hesitates on any of the three, we simply move on — and so should you."
      ] },
    { slug: "staging-that-sells", tag: "Selling", date: "2026-06-21", read: 5,
      img: "images/int-dining.webp", w: 1200, h: 800,
      title: "₹40,000 of staging that added ₹6 lakh to a sale [SAMPLE]",
      dek: "The before/after on our homepage is real. Here is the itemised bill and what it changed.",
      body: [
        "The house was sound but tired: yellowed switchboards, one dark corridor, a balcony used as a dump. Buyers photographed the worst corner and negotiated from there.",
        "We spent on paint in two rooms, neutral soft furnishing, mirror placement in the corridor, and professional photos at 7 am. Total ₹40,000. The flat sold in three weeks at ₹6 lakh over the previous failed listing price [SAMPLE].",
        "Staging is not decoration. It is the art of deciding what a buyer photographs first. Control the first photo and you control the negotiation."
      ] }
  ],

  faqs: [
    { q: "Do you charge buyers any brokerage?",
      a: "For most ready homes our fee is paid by the seller, so buyers pay us nothing. Where we do charge (typically plot deals), the percentage is written in the first message, never at the end. [SAMPLE]" },
    { q: "Are all your listings RERA-compliant?",
      a: "Under-construction stock is only listed with a live RERA number and escrow confirmation. Ready/resale stock is title-searched by our empanelled lawyer before it appears here. Anything we couldn't verify is simply not listed." },
    { q: "Can you help with home loans?",
      a: "Yes — we work with three banks and one HFC [PLACEHOLDER], compare sanctions side by side, and push for the rate your profile actually deserves. The calculator on the homepage uses current ballpark rates; your sanction letter is the truth." },
    { q: "I'm in another city. Can I buy remotely?",
      a: "Half our 2025 buyers did [SAMPLE]. We run video visits at your hour, share society accounts, and coordinate lawyer and registry through one WhatsApp thread. You visit once — to collect the keys." },
    { q: "Do you also sell and rent out properties?",
      a: "Both. Sellers get a written valuation, a staging plan, and one negotiated offer at a time — no flood of 'serious buyers' who never come. Rentals are handled for existing clients first." },
    { q: "What does a site visit cost?",
      a: "Nothing, ever. Book a slot on this site, we confirm on WhatsApp within working hours, and the car (and the chai) is on us." }
  ],

  areas: [
    { name: "Arera Colony", city: "Bhopal", count: 24 },
    { name: "Kolar Road", city: "Bhopal", count: 31 },
    { name: "TT Nagar", city: "Bhopal", count: 18 },
    { name: "Hoshangabad Road", city: "Bhopal", count: 27 },
    { name: "Katara Hills", city: "Bhopal", count: 9 },
    { name: "Shahpura", city: "Bhopal", count: 12 },
    { name: "Vijay Nagar", city: "Indore", count: 22 },
    { name: "Super Corridor", city: "Indore", count: 16 }
  ],

  stats: [ /* [SAMPLE] */
    { n: 480, suf: "+", label: "Families housed since 2009" },
    { n: 210, suf: " Cr", label: "Property value transacted (₹)" },
    { n: 17, suf: "", label: "Years in Bhopal & Indore" },
    { n: 96, suf: "%", label: "Visits that become offers" }
  ],

  steps: [
    { t: "Enquire", d: "One WhatsApp or a booked slot. You get a human, a budget sheet, and zero spam — we reply within working hours." },
    { t: "Shortlist", d: "Three honest options, not thirty links. Each comes with society accounts, title status and our written verdict." },
    { t: "Visit", d: "Scheduled at your hour, car included. We point out the damp patch before you find it — that's the job." },
    { t: "Negotiate", d: "We trade registry data, not emotions. Our buyers averaged 4.2% under asking in 2025 [SAMPLE]." },
    { t: "Registry", d: "Lawyer, stamp duty math, token-to-registry timeline — one thread, one team, keys in hand." }
  ]
};
