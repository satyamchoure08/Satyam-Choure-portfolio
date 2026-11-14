"""Builds the homepage preview and one sample project page per client:
    previews/<slug>/index.html          the homepage
    previews/<slug>/project/index.html  a sample project page (shows what each project gets in the full site)
    previews/<slug>/og.jpg              the picture WhatsApp shows when the link is shared

Run from anywhere:  python3 previews/_build/build.py
Edit CLIENTS below to add a client or change text, then run it again.
Shared look and behaviour live in previews/assets/ (preview.css, preview.js, fonts, img).
Line drawings of photos are made with sketch.py (same folder).
Jekyll does not publish folders that start with "_", so this script stays private to the repo.
"""
import datetime, html, io, os
from urllib.parse import quote
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # previews/
IMG = os.path.join(ROOT, "assets", "img")
SITE = "https://satyamchoure08.github.io/Satyam-Choure-portfolio/previews/"
LIVE_IN = "7 days"  # promise shown to the studio owner in the preview note
_today = datetime.date.today()
MADE_ON = f"{_today.day} {_today:%B %Y}"  # e.g. 14 November 2026, shown in the owner note

ARCH_STEPS = [
    ("Site visit and measuring", "We visit the site, take exact measurements and listen to how you want to use every room."),
    ("Layout and 3D design", "You see the floor plan and 3D views before anything is built, so changes happen on paper, where they cost nothing."),
    ("Materials and work on site", "Finishes are chosen with you from real samples, and the work on site follows the approved drawings."),
    ("Handover", "A final walk-through together, every last fix closed, and the space handed back ready to live in."),
]
FURN_STEPS = [
    ("Measurement at your home", "We measure the kitchen or room at your home, so every unit fits the wall it is made for."),
    ("Design and finish", "Choose the layout, shutters and colours with us. You see the design before anything is made."),
    ("Made to size", "Each unit is made in uPVC to your measurements: it won't swell with water and termites leave it alone."),
    ("Fitting at home", "Our team fits everything at your home and checks every door, drawer and hinge before leaving."),
]
ARCH_SERVICES = [
    ("Architecture", "Houses, villas and buildings, from the first sketch to approved drawings."),
    ("Interior design", "Layouts, materials, lighting and furniture, planned room by room."),
    ("Turnkey projects", "One team from design to handover, so you deal with one person instead of ten."),
    ("3D views", "See every room in 3D before a single wall goes up."),
    ("Renovation", "Older homes and offices reworked for the way you live and work now."),
]
FURN_SERVICES = [
    ("Modular kitchens", "Measured, designed and fitted in uPVC that stands up to water and heat."),
    ("Wardrobes", "Sliding or hinged, with the inside planned around what you actually store."),
    ("TV units and storage", "Wall units and shelving made to the exact size of your wall."),
    ("Furniture for the whole home", "Beds, side units and study tables in matching finishes."),
    ("Office and shop furniture", "Counters, cabinets and storage that survive daily use."),
]
ARCH_SPACES = ["New house", "Flat interior", "Villa", "Office or shop", "Renovation", "Something else"]
ARCH_BUDGETS = ["Under ₹10 lakh", "₹10–25 lakh", "₹25–50 lakh", "Above ₹50 lakh", "Not sure yet"]
FURN_SPACES = ["Modular kitchen", "Wardrobe", "Furniture for the whole home", "Office or shop", "Something else"]
FURN_BUDGETS = ["Under ₹1 lakh", "₹1–3 lakh", "₹3–6 lakh", "Above ₹6 lakh", "Not sure yet"]
ARCH_CATS = ["Homes", "Interiors", "Commercial"]
FURN_CATS = ["Kitchens", "Wardrobes", "Living", "Office"]

# Gallery pool for the sample project page (interiors only, so it reads as one project).
PROJECT_POOL = ["living-atrium", "living-styled", "living-warm", "bedroom", "kitchen-island", "living-bright", "living-tv", "bath", "tv-unit"]

CLIENTS = [
    dict(slug="habitat-interior", name="Habitat Interior and Architect", short="Habitat", hero_name="Habitat",
         city="Indore", what="Interiors and architecture in Indore.", accent="#7E4E30",
         phone="8889832888", rating="4.8", reviews=114, place="ChIJgyY1bBH9YjkRCynIBkl3Kdc",
         address="27, Shanti Nagar Road, Indore", hours=None, open=None, email=None,
         hero=("full", "living-atrium", "Open-plan living room with a double-height window"),
         say="A home should feel calm on an ordinary weekday, not only on the day it is photographed.",
         more="Interiors and architecture in Indore, planned around how your family actually uses each room.",
         projects=[("living-styled", "Living room", "Interiors"), ("villa-modern", "Private villa", "Homes"),
                   ("bedroom", "Master bedroom", "Interiors"), ("dining-warm", "Restaurant", "Commercial"),
                   ("kitchen-island", "Kitchen", "Interiors"), ("office", "Office", "Commercial")],
         ba="kitchen-island", shots=["site", "living-atrium-sketch", "living-warm", "living-atrium"], kind="arch"),
    dict(slug="adhira-home-decor", name="Adhira Home Decor & uPVC Furniture", short="Adhira", hero_name="Adhira Home Decor",
         city="Indore", what="uPVC kitchens, wardrobes and furniture in Indore.", accent="#3E5A52",
         phone="6264434866", rating="4.5", reviews=41, place="ChIJSxwRBe4-lksRARPtMKoBOj8",
         address="Shop 1, Makwana Complex, Indore", hours=None, open=None, email=None,
         hero=("split", "kitchen-island", "White kitchen with an island and pendant lights"),
         say="Kitchens and wardrobes that stay straight through every monsoon.",
         more="uPVC doesn't swell with water, doesn't attract termites and wipes clean. We make kitchens, wardrobes and furniture in it, measured for your home.",
         projects=[("kitchen-island", "Modular kitchen", "Kitchens"), ("bedroom", "Wardrobe and bed", "Wardrobes"),
                   ("tv-unit", "TV unit", "Living"), ("living-tv", "Living room storage", "Living"),
                   ("living-warm", "Side unit and shelving", "Living"), ("office", "Office storage", "Office")],
         ba="bedroom", shots=["living-bright", "kitchen-island-sketch", "kitchen-island", "tv-unit"], kind="furn"),
    dict(slug="skript-architect-studio", name="SKript Architect Studio", short="SKript", hero_name="SKript Architect Studio",
         city="Gwalior", what="Architecture and interiors in Gwalior.", accent="#34405E",
         phone="7869484497", rating="4.9", reviews=167, place="ChIJbYyFrRjEdjkRlpY4b1zu_-c",
         address="H.No. I-13, behind Hotel Central Park, City Center, Patel Nagar, Gwalior 474011",
         hours="Monday to Saturday, 10 am to 7 pm", open=([0, 1, 2, 3, 4, 5], 10 * 60, 19 * 60), email="architect.kas@gmail.com",
         hero=("split", "house-dusk", "Modern house lit up at dusk"),
         say="Good architecture starts with the site: where the sun rises, where the breeze comes from, and how you want to live.",
         more="Houses and interiors in Gwalior, designed with you and followed through on site until the work is done.",
         projects=[("villa-day", "House, front elevation", "Homes"), ("living-atrium", "Living room", "Interiors"),
                   ("clinic", "Clinic", "Commercial"), ("villa-pool", "Pool and terrace", "Homes"),
                   ("bedroom", "Bedroom", "Interiors"), ("dining-table", "Dining room", "Interiors")],
         ba="living-warm", shots=["site", "house-dusk-sketch", "living-warm", "house-dusk"], kind="arch"),
    dict(slug="hauss-studio", name="Hauss Studio Architects & Interior Designers", short="Hauss Studio", hero_name="Hauss Studio",
         city="Ludhiana", what="Architects and interior designers in Ludhiana, working on projects across India.", accent="#7A3B2E",
         phone="7973238073", rating="5.0", reviews=116, place="ChIJQ4oycNGFGjkRRWG1JcxDwC0",
         address="S City Road, Ayali Khurd, Ludhiana", hours="Monday to Saturday, 10 am to 6:30 pm",
         open=([0, 1, 2, 3, 4, 5], 10 * 60, 18 * 60 + 30), email="hauss.studio9@gmail.com",
         hero=("split flip", "villa-pool", "White villa with a long pool"),
         say="Every project begins with your brief and ends with a space that feels like it was always yours.",
         more="Architecture and interiors from Ludhiana, for homes and workplaces across India.",
         projects=[("living-atrium", "Living room", "Interiors"), ("house-dusk", "Residence", "Homes"),
                   ("dining-warm", "Restaurant", "Commercial"), ("living-warm", "Reading corner", "Interiors"),
                   ("villa-day", "Villa", "Homes"), ("office", "Office", "Commercial")],
         ba="bedroom", shots=["site", "villa-pool-sketch", "living-warm", "villa-pool"], kind="arch"),
    dict(slug="ra3designs", name="Ra3Designs", short="Ra3Designs", hero_name="Ra3Designs",
         city="Sonipat", what="Architects in Sonipat.", accent="#6E5628",
         phone="9729073147", rating="4.9", reviews=229, place="ChIJD3J_-DmwDTkReQmeGO-EaFU",
         address="Sector 12, near Gateway International School, Sonipat", hours=None, open=None, email=None,
         hero=("full", "villa-day", "Modern white villa with a pool"),
         say="Buildings that look as good in ten years as they do on the first day.",
         more="Architecture for homes and workplaces in Sonipat, planned around light, fresh air and a budget agreed before work starts.",
         projects=[("house-dusk", "House at dusk", "Homes"), ("villa-modern", "Villa and lawn", "Homes"),
                   ("office", "Office", "Commercial"), ("living-styled", "Living room", "Interiors"),
                   ("villa-terrace", "Terrace and pool", "Homes"), ("clinic", "Clinic", "Commercial")],
         ba="kitchen-island", shots=["site", "villa-day-sketch", "living-warm", "villa-day"], kind="arch"),
    dict(slug="yashraj-architects", name="Yashraj Architects & Interiors", short="Yashraj", hero_name="Yashraj Architects & Interiors",
         city="Khandwa", what="Architecture and interiors in Khandwa.", accent="#4F5530",
         phone="9414965368", rating="5.0", reviews=86, place="ChIJCyHwbd4b2DsR_SQRKi8DurA",
         address="Murlidhar Business Park, above Zudio, Khandwa", hours=None, open=None, email=None,
         hero=("split", "living-styled", "Bright living room with a gallery wall"),
         say="Rooms planned around the people who live in them, finished in materials that age well.",
         more="Architecture and interiors in Khandwa, from the floor plan to the last light fitting.",
         projects=[("house-dusk", "Residence", "Homes"), ("bedroom", "Bedroom", "Interiors"),
                   ("dining-table", "Dining room", "Interiors"), ("villa-modern", "Villa", "Homes"),
                   ("living-atrium", "Living room", "Interiors"), ("bath", "Bathroom", "Interiors")],
         ba="living-warm", shots=["site", "living-styled-sketch", "living-warm", "living-styled"], kind="arch"),
]

ALT = {
    "living-atrium": "Open-plan living room with a double-height window",
    "bedroom": "Bedroom with an upholstered bed and dark walls",
    "kitchen-island": "White kitchen with an island and pendant lights",
    "house-dusk": "Modern house lit up at dusk",
    "villa-pool": "White villa with a long pool",
    "villa-day": "Modern white villa with a pool",
    "villa-modern": "Modern white house with a pool and lawn",
    "villa-terrace": "Villa terrace beside a pool",
    "living-styled": "Bright living room with a gallery wall",
    "living-bright": "Living room with a sofa and round coffee table",
    "living-warm": "Corner with a yellow armchair and a floor lamp",
    "living-tv": "Living room with a TV wall and open shelving",
    "tv-unit": "Dark TV unit with open shelves",
    "bath": "White bathroom with plants",
    "office": "Office corridor with glass cabins",
    "clinic": "Bright clinic room",
    "dining-warm": "Warm dining room with a pendant light",
    "dining-table": "Dining table set for dinner",
    "site": "Team on a building site",
    "plans-desk": "Hands drawing a plan with a scale ruler",
}

CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.6a8 8 0 0 1-11.7 7.1L4 20l1.3-4.1A8 8 0 1 1 20 11.6Z"/><path d="M9.2 9.3c.3 1.9 1.6 3.7 3.6 4.6l1.3-1 1.7.8"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.3 5.3l1.2-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/></svg>'
STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/></svg>'

e = html.escape


def fmt_phone(d):
    return "+91 " + d[:5] + " " + d[5:]


def size(name):
    return Image.open(os.path.join(IMG, name + ".webp")).size


def img(name, base, alt=None, eager=False, cls=""):
    a = "" if alt == "" else e(alt or ALT.get(name, ""))
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    w, h = size(name)
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{base}assets/img/{name}.webp" width="{w}" height="{h}" alt="{a}" {load}>'


def tag(text="Your project here"):
    return f'<span class="yours" aria-hidden="true"><span class="yours-dot"></span>{e(text)}</span>'


def stars():
    return f'<span class="stars" aria-hidden="true">{STAR * 5}</span>'


def favicon(c):
    letter = e(c["short"][0])
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='{c['accent']}'/>"
           f"<text x='32' y='44' font-family='Georgia,serif' font-size='38' text-anchor='middle' fill='white'>{letter}</text></svg>")
    return "data:image/svg+xml," + quote(svg)


def links(c):
    wa = "91" + c["phone"]
    return dict(
        wa=wa,
        hello="https://wa.me/" + wa + "?text=" + quote(f"Hello {c['short']}, I found your website and would like to talk about a project."),
        tel="tel:+91" + c["phone"],
        maps="https://www.google.com/maps/search/?api=1&query=" + quote(c["name"] + ", " + c["city"]) + "&query_place_id=" + c["place"],
    )


def head(c, title, desc, url, base):
    return f'''<!doctype html>
<html lang="en" style="--accent:{c["accent"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(c["name"])}">
<meta property="og:description" content="Homepage preview for {e(c["name"])}, {e(c["city"])}.">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{c["slug"]}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="theme-color" content="#E4E3DE">
<link rel="icon" href="{favicon(c)}">
<link rel="preload" href="{base}assets/fonts/newsreader-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{base}assets/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{base}assets/preview.css">
</head>'''


def header(c, L, home):
    pre = "" if home else "../"
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap">
    <a class="mark" href="{pre}#main" aria-label="{e(c["name"])}, home">{e(c["short"])}</a>
    <nav class="nav" aria-label="Main">
      <a class="hide-sm" href="{pre}#work">Projects</a>
      <a class="hide-sm" href="{pre}#studio">Studio</a>
      <a class="hide-sm" href="{pre}#process">Process</a>
      <a class="hide-sm" href="{pre}#contact">Contact</a>
      <a class="btn btn-solid" href="{e(L["hello"])}" target="_blank" rel="noopener">{CHAT}WhatsApp</a>
    </nav>
  </div>
</header>'''


def footer(c, L):
    foot_hours = f'<p class="muted">{e(c["hours"])}</p>' if c["hours"] else ""
    foot_email = f'<p><a href="mailto:{e(c["email"])}">{e(c["email"])}</a></p>' if c["email"] else ""
    return f'''<footer class="site-foot">
  <div class="wrap">
    <div class="cols">
      <div><p class="name">{e(c["name"])}</p><p class="muted">{e(c["what"])}</p></div>
      <div><p><a href="{e(L["maps"])}" target="_blank" rel="noopener">{e(c["address"])}</a></p>{foot_hours}</div>
      <div><p><a href="{L["tel"]}">{fmt_phone(c["phone"])}</a></p>{foot_email}</div>
    </div>
    <div class="credit"><span>&copy; {e(c["name"])}</span><span>Homepage preview by Satyam Choure</span></div>
  </div>
</footer>
<div class="bar" aria-label="Contact {e(c["short"])}">
  <a class="btn btn-line" href="{L["tel"]}">{PHONE}Call</a>
  <a class="btn btn-solid" href="{e(L["hello"])}" target="_blank" rel="noopener">{CHAT}WhatsApp</a>
</div>'''


def owner_note(c):
    return f'''<aside class="owner" data-key="{e(c["slug"])}" hidden aria-labelledby="owner-h">
  <p class="owner-h" id="owner-h">{e(c["short"])}, this is your homepage preview</p>
  <p>Every photo marked <span class="owner-tag">Your project here</span> gets replaced with your own work, and every line can be changed to your words.</p>
  <p>It goes live within {LIVE_IN} of getting your photos.</p>
  <div class="owner-foot"><span>Made for you by Satyam Choure<br>on {MADE_ON}</span><button type="button" class="owner-close">Got it</button></div>
</aside>'''


def ba_block(name, base, title, note):
    w, h = size(name)
    return f'''<div class="ba" style="--pos:50%">
        <div class="ba-frame" style="aspect-ratio:{w} / {h}">
          {img(name + "-sketch", base, alt="Line drawing of the same room", cls="ba-before")}
          <div class="ba-after">{img(name, base)}</div>
          <span class="ba-line" aria-hidden="true"><span class="ba-knob"></span></span>
          <span class="ba-label ba-l" aria-hidden="true">Drawing</span>
          <span class="ba-label ba-r" aria-hidden="true">Finished</span>
          {tag()}
          <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Compare the drawing with the finished room">
        </div>
      </div>'''


def page(c):
    L = links(c)
    base = "../"
    variant, hero_img, hero_alt = c["hero"]
    url = SITE + c["slug"] + "/"
    arch = c["kind"] == "arch"
    spaces = ARCH_SPACES if arch else FURN_SPACES
    budgets = ARCH_BUDGETS if arch else FURN_BUDGETS
    cats = ARCH_CATS if arch else FURN_CATS
    rated = f"Rated {c['rating']} on Google from {c['reviews']} reviews."

    hero_stack = f'''<div class="hero-img">
        {img(hero_img + "-sketch", base, alt="", eager=True, cls="hero-sketch")}
        <div class="hero-photo">{img(hero_img, base, hero_alt, eager=True)}</div>
        <span class="hero-scan" aria-hidden="true"></span>
        {tag()}
      </div>'''
    hero_copy = f'''<div class="hero-copy">
        <h1>{e(c["hero_name"])}</h1>
        <p class="what">{e(c["what"])}</p>
        <p class="rated">{stars()}<span>{e(c["rating"])} on Google, {c["reviews"]} reviews</span></p>
        <div class="actions">
          <a class="btn btn-solid" href="{e(L["hello"])}" target="_blank" rel="noopener">{CHAT}WhatsApp the studio</a>
          <a class="btn btn-line" href="{L["tel"]}">{PHONE}Call {fmt_phone(c["phone"])}</a>
        </div>
      </div>'''
    if variant.startswith("full"):
        hero = f'''<section class="hero hero-full" aria-label="Introduction">
    {hero_stack}
    <div class="wrap">{hero_copy}</div>
  </section>'''
    else:
        flip = " flip" if "flip" in variant else ""
        order = f"{hero_stack}{hero_copy}" if flip else f"{hero_copy}{hero_stack}"
        hero = f'''<section class="hero hero-split{flip}" aria-label="Introduction">
    <div class="wrap">{order}</div>
  </section>'''

    facts_labels = [("Projects completed", "Your number"), ("Years in practice", "Your number")] if arch else \
                   [("Homes fitted", "Your number"), ("Years in business", "Your number")]
    facts = f'''<div class="fact"><p class="fig">{e(c["rating"])}</p><p class="cap">Google rating</p></div>
        <div class="fact"><p class="fig">{c["reviews"]}</p><p class="cap">Google reviews</p></div>'''
    for label, ph in facts_labels:
        facts += f'''
        <div class="fact fact-yours"><p class="fig">{e(ph)}</p><p class="cap">{e(label)}</p></div>'''

    chips = '<button type="button" class="chip" aria-pressed="true" data-cat="all">All</button>' + "".join(
        f'<button type="button" class="chip" aria-pressed="false" data-cat="{e(k)}">{e(k)}</button>'
        for k in cats if any(p[2] == k for p in c["projects"]))
    cols = ["", ""]
    for i, (name, kind, cat) in enumerate(c["projects"]):
        w, h = size(name)
        shape = "tall" if h > w * 1.05 else "wide"
        inner = f'''<div class="ph">{img(name, base)}{tag()}</div>
          <figcaption><span class="t">{e(kind)}</span><span class="c">{e(c["city"])}</span></figcaption>'''
        if i == 0:
            cols[i % 2] += f'''
          <figure class="tile {shape} first" data-cat="{e(cat)}" style="order:{i}"><a href="project/" class="tile-link">{inner}<span class="open">Open the project page</span></a></figure>'''
        else:
            cols[i % 2] += f'''
          <figure class="tile {shape}" data-cat="{e(cat)}" style="order:{i}">{inner}</figure>'''
    tiles = f'''
        <div class="col">{cols[0]}
        </div>
        <div class="col">{cols[1]}
        </div>'''

    services = "".join(f'''
        <li><h3>{e(n)}</h3><p>{e(d)}</p></li>''' for n, d in (ARCH_SERVICES if arch else FURN_SERVICES))

    stage = "".join(img(s, base, alt="") for s in c["shots"])
    steps = ""
    for i, ((h, p), s) in enumerate(zip(ARCH_STEPS if arch else FURN_STEPS, c["shots"]), 1):
        steps += f'''
          <li class="step"><span class="num">Step {i}</span><h3>{e(h)}</h3><p>{e(p)}</p><div class="inline-ph">{img(s, base, alt="")}</div></li>'''

    reach = f'''<p class="label">WhatsApp or call</p><a href="{L["tel"]}">{fmt_phone(c["phone"])}</a>'''
    if c["email"]:
        reach += f'''<p class="label">Email</p><a href="mailto:{e(c["email"])}">{e(c["email"])}</a>'''
    reach += f'''<p class="label">Studio</p><a href="{e(L["maps"])}" target="_blank" rel="noopener">{e(c["address"])}</a>'''
    if c["hours"]:
        d, o, cl = c["open"]
        reach += f'''<p class="label">Open</p><span>{e(c["hours"])}</span>
          <p class="status" data-days="{",".join(map(str, d))}" data-open="{o}" data-close="{cl}" data-city="{e(c["city"])}" hidden></p>'''

    space_opts = "".join(f"<option>{e(s)}</option>" for s in spaces)
    budget_opts = "".join(f"<option>{e(b)}</option>" for b in budgets)
    process_title = "How your furniture gets made" if not arch else "How a project runs"
    process_note = "Four steps from the first visit to the day it is ready." if not arch else "Four steps from the first site visit to the day you move in."
    form_title = "Tell us about your home" if not arch else "Tell us about your project"
    founder_name = "Ar. Your name" if arch else "Your name"
    area_eg = "Vijay Nagar" if c["city"] == "Indore" else c["city"]

    return head(c, f'{c["name"]}, {c["city"]}', f'{c["what"]} {rated}', url, base) + f'''
<body>
{header(c, L, True)}
<main id="main">
  {hero}

  <section class="intro" aria-label="About the studio">
    <div class="wrap">
      <p class="say">{e(c["say"])}</p>
      <p class="more">{e(c["more"])}</p>
    </div>
  </section>

  <section class="facts" aria-label="The studio in numbers">
    <div class="wrap">
      <div class="facts-row">
        {facts}
      </div>
    </div>
  </section>

  <section class="work" id="work" aria-labelledby="work-h">
    <div class="wrap">
      <div class="section-head"><h2 id="work-h">Selected projects</h2><p>Every photo marked &ldquo;Your project here&rdquo; is where your own work goes. Open the first one to see a full project page.</p></div>
      <div class="chips" role="group" aria-label="Show projects">{chips}</div>
      <div class="tiles">{tiles}
      </div>
    </div>
  </section>

  <section class="compare" aria-labelledby="compare-h">
    <div class="wrap">
      <div class="section-head"><h2 id="compare-h">From drawing to finished room</h2><p>Show clients the plan and the result side by side. Drag the line to compare.</p></div>
      {ba_block(c["ba"], base, "", "")}
    </div>
  </section>

  <section class="services" aria-labelledby="services-h">
    <div class="wrap">
      <div class="section-head"><h2 id="services-h">What we do</h2><p>Your exact list of services goes here.</p></div>
      <ul class="svc">{services}
      </ul>
    </div>
  </section>

  <section class="process" id="process" aria-labelledby="process-h">
    <div class="wrap">
      <div class="section-head"><h2 id="process-h">{process_title}</h2><p>{process_note}</p></div>
      <div class="story">
        <div class="stage" aria-hidden="true">{stage}</div>
        <ol class="steps">{steps}
        </ol>
      </div>
    </div>
  </section>

  <section class="founder" id="studio" aria-labelledby="founder-h">
    <div class="wrap">
      <div class="founder-ph">{img("plans-desk", base)}{tag("Your photo here")}</div>
      <div class="founder-copy">
        <h2 id="founder-h">The person behind {e(c["short"])}</h2>
        <p class="founder-story">Your story goes here: how {e(c["short"])} started, the projects you are proudest of, and how you like to work with clients.</p>
        <p class="sign"><span>{e(founder_name)}</span><span class="muted">Founder, {e(c["short"])}</span></p>
      </div>
    </div>
  </section>

  <section class="proof" aria-labelledby="proof-h">
    <div class="wrap">
      <p class="score" id="proof-h">{e(c["rating"])}<small>/5</small></p>
      <div class="said">{stars()}<p>Average rating from {c["reviews"]} reviews on Google.</p><a href="{e(L["maps"])}" target="_blank" rel="noopener">Read the reviews on Google Maps</a></div>
    </div>
  </section>

  <section class="contact" id="contact" aria-labelledby="contact-h">
    <div class="wrap">
      <div>
        <h2 id="contact-h">{form_title}</h2>
        <p class="lead">Fill this in and WhatsApp opens with your message ready to send to the studio.</p>
        <div class="reach">{reach}</div>
      </div>
      <form class="enquiry" data-wa="{L["wa"]}" data-studio="{e(c["short"])}" novalidate>
        <div class="two">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="f-area">Area or locality</label><input id="f-area" name="area" autocomplete="address-level2" placeholder="e.g. {e(area_eg)}"></div>
        </div>
        <div class="two">
          <div class="field"><label for="f-space">What are you planning?</label><select id="f-space" name="space"><option value="">Choose one</option>{space_opts}</select></div>
          <div class="field"><label for="f-budget">Budget</label><select id="f-budget" name="budget"><option value="">Choose one</option>{budget_opts}</select></div>
        </div>
        <div class="field"><label for="f-msg">Anything else (optional)</label><textarea id="f-msg" name="message" rows="3"></textarea></div>
        <div class="bubble-wrap" aria-live="polite">
          <p class="bubble-label">The studio receives this on WhatsApp</p>
          <p class="bubble" data-empty="Hello {e(c["short"])}, I'm …">Hello {e(c["short"])}, I'm …</p>
        </div>
        <p class="form-error" role="alert" hidden></p>
        <button class="btn btn-solid" type="submit">{CHAT}Send on WhatsApp</button>
        <p class="form-note">Nothing is stored on this website. Your message goes straight to the studio's WhatsApp.</p>
      </form>
    </div>
  </section>
</main>
{footer(c, L)}
{owner_note(c)}
<script src="{base}assets/preview.js" defer></script>
</body>
</html>
'''


def project_page(c):
    L = links(c)
    base = "../../"
    url = SITE + c["slug"] + "/project/"
    arch = c["kind"] == "arch"
    main_img = c["ba"]
    kind = "Full home interior" if arch else "Kitchen, wardrobes and storage"
    pool = [n for n in PROJECT_POOL if n != main_img][:5]
    cols = ["", ""]
    for i, name in enumerate(pool):
        w, h = size(name)
        shape = "tall" if h > w * 1.05 else "wide"
        cols[i % 2] += f'''
          <figure class="tile {shape}" style="order:{i}"><div class="ph">{img(name, base)}{tag()}</div></figure>'''
    gallery = f'''
        <div class="col">{cols[0]}
        </div>
        <div class="col">{cols[1]}
        </div>'''
    scope = "Interiors and furniture" if arch else "Kitchen, wardrobes and storage"

    return head(c, f'Your project name | {c["name"]}', f'A sample project page for {c["name"]}, {c["city"]}.', url, base) + f'''
<body class="project-page">
{header(c, L, False)}
<main id="main">
  <section class="p-head" aria-labelledby="p-title">
    <div class="wrap">
      <a class="back" href="../#work">All projects</a>
      <h1 id="p-title">Your project name</h1>
      <p class="p-sub">{e(kind)}, {e(c["city"])}</p>
      <dl class="p-facts">
        <div><dt>Location</dt><dd>{e(c["city"])}</dd></div>
        <div><dt>Type</dt><dd>{e(kind)}</dd></div>
        <div><dt>Area</dt><dd class="yours-text">Your figure</dd></div>
        <div><dt>Year</dt><dd class="yours-text">Your figure</dd></div>
        <div><dt>Scope</dt><dd>{e(scope)}</dd></div>
      </dl>
    </div>
  </section>

  <div class="p-hero">{img(main_img, base, eager=True)}{tag()}</div>

  <section class="p-story" aria-label="Project story">
    <div class="wrap">
      <p class="say">Your project story goes here: what the client asked for, what made the site difficult, and the idea that solved it.</p>
      <p class="more">Clients read this before they call. One short, true story about a project builds more trust than a long list of services.</p>
    </div>
  </section>

  <section class="compare" aria-labelledby="compare-h">
    <div class="wrap">
      <div class="section-head"><h2 id="compare-h">The drawing and the finished room</h2><p>Drag the line to compare.</p></div>
      {ba_block(main_img, base, "", "")}
    </div>
  </section>

  <section class="work" aria-labelledby="gallery-h">
    <div class="wrap">
      <div class="section-head"><h2 id="gallery-h">More from this project</h2><p>Every project in the full website gets its own page like this one.</p></div>
      <div class="tiles">{gallery}
      </div>
    </div>
  </section>

  <section class="p-cta" aria-labelledby="cta-h">
    <div class="wrap">
      <h2 id="cta-h">Planning something similar?</h2>
      <div class="actions">
        <a class="btn btn-solid" href="{e(L["hello"])}" target="_blank" rel="noopener">{CHAT}WhatsApp the studio</a>
        <a class="btn btn-line" href="../#work">See all projects</a>
      </div>
    </div>
  </section>
</main>
{footer(c, L)}
{owner_note(c)}
<script src="{base}assets/preview.js" defer></script>
</body>
</html>
'''


# WhatsApp link card: the client's own name on their hero photo.
_FONTS = {}


def font(file, px):
    key = (file, px)
    if key not in _FONTS:
        from fontTools.ttLib import TTFont
        if file not in _FONTS:
            f = TTFont(os.path.join(ROOT, "assets", "fonts", file))
            f.flavor = None
            buf = io.BytesIO()
            f.save(buf)
            _FONTS[file] = buf.getvalue()
        _FONTS[key] = ImageFont.truetype(io.BytesIO(_FONTS[file]), px)
    return _FONTS[key]


def og(c):
    src = Image.open(os.path.join(IMG, c["hero"][1] + ".webp")).convert("RGB")
    tw, th = 1200, 630
    scale = max(tw / src.width, th / src.height)
    im = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
    l, t = (im.width - tw) // 2, (im.height - th) // 2
    im = im.crop((l, t, l + tw, t + th))
    shade = Image.new("L", (tw, th))
    for y in range(th):
        shade.paste(int(max(0, (y - th * 0.35) / (th * 0.65)) * 190), (0, y, tw, y + 1))
    im = Image.composite(Image.new("RGB", (tw, th), (20, 23, 22)), im, shade)
    d = ImageDraw.Draw(im)
    name = c["hero_name"]
    px = 96
    while px > 48 and d.textlength(name, font=font("newsreader-display.woff2", px)) > tw - 120:
        px -= 4
    d.text((60, th - 70), name, font=font("newsreader-display.woff2", px), fill=(244, 242, 238), anchor="ls")
    d.text((62, th - 34), f"Homepage preview, {c['city']}", font=font("mona-sans.woff2", 26), fill=(214, 212, 206), anchor="ls")
    im.save(os.path.join(ROOT, c["slug"], "og.jpg"), quality=84, optimize=True, progressive=True)


if __name__ == "__main__":
    for c in CLIENTS:
        os.makedirs(os.path.join(ROOT, c["slug"], "project"), exist_ok=True)
        with open(os.path.join(ROOT, c["slug"], "index.html"), "w", encoding="utf-8") as f:
            f.write(page(c))
        with open(os.path.join(ROOT, c["slug"], "project", "index.html"), "w", encoding="utf-8") as f:
            f.write(project_page(c))
        og(c)
        print("built", c["slug"])
