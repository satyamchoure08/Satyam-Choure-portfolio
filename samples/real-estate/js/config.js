/* ============================================================
   KOHINOOR ESTATES — config & i18n
   Everything client-specific lives here. Search [PLACEHOLDER]
   before launch.
   ============================================================ */
window.KE_CONFIG = {
  brand:        "Kohinoor Estates",
  agent:        "Meera Sharma",                       // [SAMPLE] lead agent name
  rera:         "MPRERA/AGT/0000/0000",               // [PLACEHOLDER] real RERA agent no.
  phoneDisplay: "+91 98765 43210",                    // [PLACEHOLDER]
  phoneHref:    "tel:+919876543210",                  // [PLACEHOLDER]
  waNumber:     "919876543210",                       // [PLACEHOLDER] digits only, country code first
  email:        "hello@kohinoorestates.in",           // [PLACEHOLDER]
  address:      "21, Malviya Nagar, Near New Market, Bhopal 462003, Madhya Pradesh", // [SAMPLE]
  hours:        "Mon–Sat · 10:00–19:00 IST",
  hoursNote:    "Sunday by appointment",
  coords:       { lat: 23.2599, lng: 77.4126 },
  mapsUrl:      "https://www.google.com/maps?q=23.2599,77.4126",
  domain:       "https://kohinoor-estates.example",   // [PLACEHOLDER] production domain
  formEndpoint: "",                                    // [PLACEHOLDER] POST URL (Formspree/CRM webhook). Empty = demo mode, stored on-device only.
  analytics:    false,                                 // flip true AFTER adding your GA4/Plausible id in <head>
  social: {                                            // [PLACEHOLDER] all handles
    instagram: "https://instagram.com/kohinoor.estates",
    facebook:  "https://facebook.com/kohinoorestates",
    x:         "https://x.com/kohinoorestates",
    youtube:   "https://youtube.com/@kohinoorestates",
    linkedin:  "https://linkedin.com/company/kohinoorestates",
    tiktok:    "https://tiktok.com/@kohinoor.estates",
    pinterest: "https://pinterest.com/kohinoorestates",
    whatsapp:  "https://wa.me/919876543210",
    threads:   "https://threads.net/@kohinoor.estates"
  }
};

/* Partial bilingual UI strings (EN / HI). Long-form body copy ships
   English-first; full Hindi translation of articles is [PLACEHOLDER]. */
window.KE_I18N = {
  en: {
    "nav.home": "Home", "nav.properties": "Properties", "nav.about": "About",
    "nav.journal": "Journal", "nav.contact": "Contact",
    "cta.book": "Book a site visit", "cta.browse": "Browse properties",
    "cta.call": "Call Meera", "cta.wa": "WhatsApp us",
    "hero.k1": "Est. 2009 — Bhopal & Indore", "hero.k2": "RERA-registered [PLACEHOLDER]",
    "hero.l1": "Homes", "hero.l2": "that", "hero.l3": "breathe.",
    "hero.sub": "One senior agent between you and the biggest purchase of your life. No call centres, no pressure — vetted homes, honest numbers, registry done right.",
    "sec.featured": "Featured", "sec.why": "Why us", "sec.calc": "Calculator",
    "sec.process": "Process", "sec.proof": "Proof", "sec.areas": "Areas",
    "sec.journal": "Journal", "sec.faq": "FAQ", "sec.contact": "Contact",
    "foot.note": "Stock photography stands in for client work — replace before launch.",
    "form.name": "Your name", "form.phone": "Mobile number", "form.email": "Email (optional)",
    "form.msg": "Anything we should know?", "form.submit": "Request this visit",
    "common.close": "Close", "common.next": "Next", "common.back": "Back"
  },
  hi: {
    "nav.home": "होम", "nav.properties": "प्रॉपर्टी", "nav.about": "हमारे बारे में",
    "nav.journal": "जर्नल", "nav.contact": "संपर्क",
    "cta.book": "साइट विज़िट बुक करें", "cta.browse": "प्रॉपर्टी देखें",
    "cta.call": "मीरा को कॉल करें", "cta.wa": "व्हाट्सएप करें",
    "hero.k1": "स्थापना 2009 — भोपाल और इंदौर", "hero.k2": "रेरा पंजीकृत [PLACEHOLDER]",
    "hero.l1": "ऐसे घर", "hero.l2": "जो", "hero.l3": "साँस लें।",
    "hero.sub": "आपकी ज़िंदगी की सबसे बड़ी खरीद और आपके बीच सिर्फ़ एक सीनियर एजेंट। न कॉल सेंटर, न दबाव — जाँची हुई प्रॉपर्टी, सच के आँकड़े, और सही रजिस्ट्री।",
    "sec.featured": "चुनी हुई", "sec.why": "क्यों हम", "sec.calc": "कैलकुलेटर",
    "sec.process": "प्रक्रिया", "sec.proof": "भरोसा", "sec.areas": "इलाक़े",
    "sec.journal": "जर्नल", "sec.faq": "सवाल-जवाब", "sec.contact": "संपर्क",
    "foot.note": "स्टॉक फोटो अस्थायी हैं — लॉन्च से पहले बदलें।",
    "form.name": "आपका नाम", "form.phone": "मोबाइल नंबर", "form.email": "ईमेल (वैकल्पिक)",
    "form.msg": "कुछ और बताना चाहें?", "form.submit": "विज़िट की अपील करें",
    "common.close": "बंद करें", "common.next": "आगे", "common.back": "पीछे"
  }
};
