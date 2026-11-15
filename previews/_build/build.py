"""Builds every studio preview from one place.

For each client in CLIENTS it writes:
    previews/<slug>/index.html            the homepage
    previews/<slug>/projects/index.html   all projects: by project (property filter) or by room (photo filter)
    previews/<slug>/project/index.html    a sample project page (what every project gets in the full website)
    previews/<slug>/og.jpg                the picture WhatsApp shows when the link is shared (made once; --og remakes it)

Run from anywhere:  python3 previews/_build/build.py   (needs Pillow, fontTools and brotli)
Edit CLIENTS below to add a client or change text, then run it again.
Shared look and behaviour live in previews/assets/ (preview.css, preview.js, fonts/, img/).

Design (rebuilt 15 Nov 2026): calm, compact pages with normal-size headings. Photos appear only where they
belong: the project photo gallery on the homepage (sorted into categories), the projects page and the
project page. Buttons are plain text, no icons. Nothing loads from another website.
Line drawings of photos are made with sketch.py (same folder).
Jekyll does not publish folders that start with "_", so this script stays private to the repo.
"""
import datetime, html, io, json, os, re, sys, unicodedata
from urllib.parse import quote
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # previews/
IMG = os.path.join(ROOT, "assets", "img")
SITE = "https://satyamchoure08.github.io/Satyam-Choure-portfolio/previews/"
LIVE_IN = "7 days"  # promise shown to the studio owner in the preview note
_today = datetime.date.today()
MADE_ON = f"{_today.day} {_today:%B %Y}"  # e.g. 15 November 2026, shown in the owner note
VER = f"{_today:%Y%m%d}"  # added to the CSS and JS links, so browsers fetch the new files after a rebuild

# What each stock photo shows: alt text, the space it belongs to and its group
# (used to give each home project fitting extra photos). site and plans-desk are not project photos.
PHOTOS = {
    "living-atrium": ("Open-plan living room with a double-height window", "Living room", "home"),
    "living-styled": ("Bright living room with a gallery wall", "Living room", "home"),
    "living-warm": ("Corner with a yellow armchair and a floor lamp", "Living room", "home"),
    "living-bright": ("Living room with a sofa and round coffee table", "Living room", "home"),
    "living-tv": ("Living room with a TV wall and open shelving", "Living room", "home"),
    "tv-unit": ("Dark TV unit with open shelves", "Living room", "home"),
    "bedroom": ("Bedroom with an upholstered bed and dark walls", "Bedroom", "home"),
    "kitchen-island": ("White kitchen with an island and pendant lights", "Kitchen", "home"),
    "bath": ("White bathroom with plants", "Bathroom", "home"),
    "dining-table": ("Dining table set for dinner", "Dining", "home"),
    "dining-warm": ("Warm dining room with a pendant light", "Dining", "work"),
    "office": ("Office corridor with glass cabins", "Workspace", "work"),
    "clinic": ("Bright clinic room", "Consultation room", "work"),
    "house-dusk": ("Modern house lit up at dusk", "Exterior", "outside"),
    "villa-pool": ("White villa with a long pool", "Exterior", "outside"),
    "villa-day": ("Modern white villa with a pool", "Exterior", "outside"),
    "villa-modern": ("Modern white house with a pool and lawn", "Exterior", "outside"),
    "villa-terrace": ("Villa terrace beside a pool", "Exterior", "outside"),
    "site": ("Team on a building site", None, None),
    "plans-desk": ("Hands drawing a plan with a scale ruler", None, None),
}
PROPERTY_TYPES = ["Apartment", "Villa / Bungalow", "Independent house", "Office", "Shop / Showroom", "Café / Restaurant", "Clinic"]
SPACES = ["Living room", "Bedroom", "Kitchen", "Wardrobe", "Bathroom", "Dining", "Pooja room", "Kids' room",
          "Reception", "Workspace", "Consultation room", "Exterior"]
# Which extra photos suit a project of each property type (after photos of the same space). Commercial projects keep
# only same-space photos, so an office never borrows a bedroom.
FITS = {"Apartment": ["home"], "Villa / Bungalow": ["outside", "home"], "Independent house": ["outside", "home"]}

# Gallery categories: the tabs above the project photos. Photos from offices, shops, cafes and clinics go
# under "Commercial"; home photos go under their room.
COMMERCIAL = {"Office", "Shop / Showroom", "Café / Restaurant", "Clinic"}
ROOM_CAT = {"Living room": "Living rooms", "Bedroom": "Bedrooms", "Kitchen": "Kitchens", "Wardrobe": "Wardrobes",
            "Bathroom": "Bathrooms", "Dining": "Dining", "Pooja room": "Pooja rooms", "Kids' room": "Kids' rooms",
            "Exterior": "Exteriors", "Reception": "Commercial", "Workspace": "Commercial", "Consultation room": "Commercial"}
CAT_ORDER = ["Living rooms", "Bedrooms", "Kitchens", "Wardrobes", "Dining", "Bathrooms", "Kids' rooms", "Pooja rooms",
             "Exteriors", "Commercial"]

# Services: name, one line (the third value is an old photo name, no longer shown)
ARCH_SERVICES = [
    ("Architecture", "Houses, villas and buildings, from the first sketch to approved drawings.", "house-dusk"),
    ("Interior design", "Layouts, materials, lighting and furniture, planned room by room.", "living-atrium"),
    ("Turnkey projects", "One team from design to handover, so you deal with one person instead of ten.", "villa-terrace"),
    ("3D views", "See every room in 3D before a single wall goes up.", "living-bright"),
    ("Renovation", "Older homes and offices reworked for the way you live and work now.", "living-tv"),
]
FURN_SERVICES = [
    ("Modular kitchens", "Measured, designed and fitted in uPVC that stands up to water and heat.", "kitchen-island"),
    ("Wardrobes", "Sliding or hinged, with the inside planned around what you actually store.", "bedroom"),
    ("TV units and storage", "Wall units and shelving made to the exact size of your wall.", "tv-unit"),
    ("Furniture for the whole home", "Beds, side units and study tables in matching finishes.", "living-tv"),
    ("Office and shop furniture", "Counters, cabinets and storage that survive daily use.", "office"),
]
# Five steps, design to handover: title, what happens, what you get (the fourth value is an old photo name, not shown)
ARCH_STEPS = [
    ("Consultation and site visit", "We listen to what you need, measure every room and photograph the site.", "a measured plan", "site"),
    ("Design and 3D", "Layout, mood board and 3D views. Changes happen on screen, where they cost nothing.", "approved designs", "{hero}-sketch"),
    ("Quote and materials", "An itemised quote with every item and its price, and materials picked with you from real samples.", "a fixed quote", "living-warm"),
    ("Work on site", "Carpentry, ceilings, electrical and painting, with weekly photo updates on WhatsApp.", "progress updates", "tv-unit"),
    ("Handover", "A final walkthrough, every small defect fixed, cleaning done and warranty papers handed over.", "a ready home", "{hero}"),
]
FURN_STEPS = [
    ("Measurement at your home", "We measure the kitchen or room at your home, so every unit fits the wall it is made for.", "exact measurements", "living-bright"),
    ("Design and finish", "Choose the layout, shutters and colours with us. You see the design before anything is made.", "an approved design", "{hero}-sketch"),
    ("Quote and materials", "An itemised quote with every unit and its price, and finishes picked from real samples.", "a fixed quote", "living-warm"),
    ("Made to size", "Each unit is made in uPVC to your measurements: it won't swell with water and termites leave it alone.", "furniture made for your walls", "living-styled"),
    ("Fitting and handover", "Our team fits everything at your home and checks every door, drawer and hinge before leaving.", "a ready kitchen or room", "{hero}"),
]
# Qualified WhatsApp enquiry: three short steps, mostly taps
SIZES = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"]
TIMELINES = ["Within 1 month", "1–3 months", "3–6 months", "Just exploring"]
ENQ = {
    "arch": dict(
        types=["Apartment", "Villa / Bungalow", "Independent house", "Office", "Shop / Showroom", "Café / Restaurant"],
        scopes=["Full home", "Kitchen", "Wardrobes", "Living room", "Bedroom", "Bathroom", "Renovation", "New build"],
        budgets={"small": ["Under ₹2 lakh", "₹2–5 lakh", "₹5–10 lakh", "Above ₹10 lakh", "Not sure yet"],
                 "big": ["Under ₹10 lakh", "₹10–25 lakh", "₹25–50 lakh", "Above ₹50 lakh", "Not sure yet"],
                 "build": ["Under ₹50 lakh", "₹50 lakh–1 crore", "₹1–2 crore", "Above ₹2 crore", "Not sure yet"]},
        big=["Full home", "Renovation"], build=["New build"], default="big"),
    "furn": dict(
        types=["Apartment", "Villa / Bungalow", "Independent house", "Office", "Shop / Showroom"],
        scopes=["Modular kitchen", "Wardrobes", "TV unit", "Furniture for the whole home", "Office or shop furniture"],
        budgets={"small": ["Under ₹1 lakh", "₹1–3 lakh", "₹3–6 lakh", "Above ₹6 lakh", "Not sure yet"],
                 "big": ["Under ₹3 lakh", "₹3–6 lakh", "₹6–12 lakh", "Above ₹12 lakh", "Not sure yet"]},
        big=["Furniture for the whole home", "Office or shop furniture"], build=[], default="small"),
}
# The sample project page: its photos, by room (the studio's drawing-vs-finished photo is the cover)
PROJECT_ROOMS = [
    ("Living room", ["living-atrium", "living-styled", "living-bright", "living-warm", "living-tv", "tv-unit"]),
    ("Kitchen", ["kitchen-island"]),
    ("Bedroom and bathroom", ["bedroom", "bath"]),
]

CLIENTS = [
    dict(slug="habitat-interior", name="Habitat Interior and Architect", short="Habitat", hero_name="Habitat",
         label="Interiors & architecture", city="Indore", what="Interiors and architecture in Indore.", accent="#7E4E30",
         phone="8889832888", rating="4.8", reviews=114, place="ChIJgyY1bBH9YjkRCynIBkl3Kdc",
         address="27, Shanti Nagar Road, Indore", hours=None, open=None, email=None,
         hero=("full", "living-atrium", "Open-plan living room with a double-height window"),
         say="A home should feel calm on an ordinary weekday, not only on the day it is photographed.",
         more="Interiors and architecture in Indore, planned around how your family actually uses each room.",
         projects=[("living-styled", "Living room", "Apartment"), ("villa-modern", "Private villa", "Villa / Bungalow"),
                   ("bedroom", "Master bedroom", "Apartment"), ("dining-warm", "Restaurant", "Café / Restaurant"),
                   ("kitchen-island", "Kitchen", "Independent house"), ("office", "Office", "Office")],
         ba="kitchen-island", kind="arch", wa_home="I saw your website and want to discuss my home interiors.", quotes=[]),
    dict(slug="adhira-home-decor", name="Adhira Home Decor & uPVC Furniture", short="Adhira", hero_name="Adhira Home Decor",
         label="uPVC kitchens & furniture", city="Indore", what="uPVC kitchens, wardrobes and furniture in Indore.", accent="#3E5A52",
         phone="6264434866", rating="4.5", reviews=41, place="ChIJSxwRBe4-lksRARPtMKoBOj8",
         address="Shop 1, Makwana Complex, Indore", hours=None, open=None, email=None,
         hero=("split", "kitchen-island", "White kitchen with an island and pendant lights"),
         say="Kitchens and wardrobes that stay straight through every monsoon.",
         more="uPVC doesn't swell with water, doesn't attract termites and wipes clean. We make kitchens, wardrobes and furniture in it, measured for your home.",
         projects=[("kitchen-island", "Modular kitchen", "Apartment"), ("bedroom", "Wardrobe and bed", "Apartment"),
                   ("tv-unit", "TV unit", "Apartment"), ("living-tv", "Living room storage", "Independent house"),
                   ("living-warm", "Side unit and shelving", "Apartment"), ("office", "Office storage", "Office")],
         ba="bedroom", kind="furn", wa_home="I saw your website and want to discuss furniture for my home.", quotes=[]),
    dict(slug="skript-architect-studio", name="SKript Architect Studio", short="SKript", hero_name="SKript Architect Studio",
         label="Architects", city="Gwalior", what="Architecture and interiors in Gwalior.", accent="#34405E",
         phone="7869484497", rating="4.9", reviews=167, place="ChIJbYyFrRjEdjkRlpY4b1zu_-c",
         address="H.No. I-13, behind Hotel Central Park, City Center, Patel Nagar, Gwalior 474011",
         hours="Monday to Saturday, 10 am to 7 pm", open=([0, 1, 2, 3, 4, 5], 10 * 60, 19 * 60), email="architect.kas@gmail.com",
         hero=("split", "house-dusk", "Modern house lit up at dusk"),
         say="Good architecture starts with the site: where the sun rises, where the breeze comes from, and how you want to live.",
         more="Houses and interiors in Gwalior, designed with you and followed through on site until the work is done.",
         projects=[("villa-day", "House, front elevation", "Independent house"), ("living-atrium", "Living room", "Villa / Bungalow"),
                   ("clinic", "Clinic", "Clinic"), ("villa-pool", "Pool and terrace", "Villa / Bungalow"),
                   ("bedroom", "Bedroom", "Apartment"), ("dining-table", "Dining room", "Independent house")],
         ba="living-warm", kind="arch", wa_home="I saw your website and want to discuss my project.", quotes=[]),
    dict(slug="hauss-studio", name="Hauss Studio Architects & Interior Designers", short="Hauss Studio", hero_name="Hauss Studio",
         label="Architects & interior designers", city="Ludhiana",
         what="Architects and interior designers in Ludhiana, working on projects across India.", accent="#7A3B2E",
         phone="7973238073", rating="5.0", reviews=116, place="ChIJQ4oycNGFGjkRRWG1JcxDwC0",
         address="S City Road, Ayali Khurd, Ludhiana", hours="Monday to Saturday, 10 am to 6:30 pm",
         open=([0, 1, 2, 3, 4, 5], 10 * 60, 18 * 60 + 30), email="hauss.studio9@gmail.com",
         hero=("split flip", "villa-pool", "White villa with a long pool"),
         say="Every project begins with your brief and ends with a space that feels like it was always yours.",
         more="Architecture and interiors from Ludhiana, for homes and workplaces across India.",
         projects=[("living-atrium", "Living room", "Villa / Bungalow"), ("house-dusk", "Residence", "Independent house"),
                   ("dining-warm", "Restaurant", "Café / Restaurant"), ("living-warm", "Reading corner", "Apartment"),
                   ("villa-day", "Villa", "Villa / Bungalow"), ("office", "Office", "Office")],
         ba="bedroom", kind="arch", wa_home="I saw your website and want to discuss my home interiors.", quotes=[]),
    dict(slug="ra3designs", name="Ra3Designs", short="Ra3Designs", hero_name="Ra3Designs",
         label="Architects", city="Sonipat", what="Architects in Sonipat.", accent="#6E5628",
         phone="9729073147", rating="4.9", reviews=229, place="ChIJD3J_-DmwDTkReQmeGO-EaFU",
         address="Sector 12, near Gateway International School, Sonipat", hours=None, open=None, email=None,
         hero=("full", "villa-day", "Modern white villa with a pool"),
         say="Buildings that look as good in ten years as they do on the first day.",
         more="Architecture for homes and workplaces in Sonipat, planned around light, fresh air and a budget agreed before work starts.",
         projects=[("house-dusk", "House at dusk", "Independent house"), ("villa-modern", "Villa and lawn", "Villa / Bungalow"),
                   ("office", "Office", "Office"), ("living-styled", "Living room", "Apartment"),
                   ("villa-terrace", "Terrace and pool", "Villa / Bungalow"), ("clinic", "Clinic", "Clinic")],
         ba="kitchen-island", kind="arch", wa_home="I saw your website and want to discuss my project.", quotes=[]),
    dict(slug="yashraj-architects", name="Yashraj Architects & Interiors", short="Yashraj", hero_name="Yashraj Architects & Interiors",
         label="Architects & interiors", city="Khandwa", what="Architecture and interiors in Khandwa.", accent="#4F5530",
         phone="9414965368", rating="5.0", reviews=86, place="ChIJCyHwbd4b2DsR_SQRKi8DurA",
         address="Murlidhar Business Park, above Zudio, Khandwa", hours=None, open=None, email=None,
         hero=("split", "living-styled", "Bright living room with a gallery wall"),
         say="Rooms planned around the people who live in them, finished in materials that age well.",
         more="Architecture and interiors in Khandwa, from the floor plan to the last light fitting.",
         projects=[("house-dusk", "Residence", "Independent house"), ("bedroom", "Bedroom", "Apartment"),
                   ("dining-table", "Dining room", "Apartment"), ("villa-modern", "Villa", "Villa / Bungalow"),
                   ("living-atrium", "Living room", "Villa / Bungalow"), ("bath", "Bathroom", "Apartment")],
         ba="living-warm", kind="arch", wa_home="I saw your website and want to discuss my home interiors.", quotes=[]),
]
# Google review quotes: add 3 to 6 per studio, copied word for word from their Google listing, as
#   quotes=[("Exact words of the review.", "First name", "Month Year"), ...]
# While a studio's list is empty, the studio section shows the rating block instead of quotes.

STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/></svg>'

e = html.escape
# Runs before the page shows. "js": scripts work. "mo": gentle movement allowed (not "reduce motion").
# If preview.js has not started within 3 s (blocked or slow), the movement is switched off so everything simply shows.
HEAD_SCRIPT = ('<script>(function(d){d.classList.add("js");var m=window.matchMedia;'
               'if(m&&m("(prefers-reduced-motion: no-preference)").matches)d.classList.add("mo");'
               'setTimeout(function(){if(!window.PREVIEW_READY)d.classList.remove("mo")},3000)})(document.documentElement)</script>')


def fmt_phone(d):
    return "+91 " + d[:5] + " " + d[5:]


def size(name):
    return Image.open(os.path.join(IMG, name + ".webp")).size


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def alt_of(name):
    if name.endswith("-sketch"):
        return "Line drawing of the room"
    return PHOTOS.get(name, ("",))[0]


def img(name, base, alt=None, cls="", load="lazy", extra=""):
    """load: "lazy" (default), "high" (first screen) or "low" (needed soon, not urgent)."""
    a = e(alt_of(name) if alt is None else alt)
    how = {"lazy": 'loading="lazy" decoding="async"', "high": 'fetchpriority="high"',
           "low": 'fetchpriority="low" decoding="async"'}[load]
    w, h = size(name)
    c = f' class="{cls}"' if cls else ""
    x = f" {extra}" if extra else ""
    return f'<img{c} src="{base}assets/img/{name}.webp" width="{w}" height="{h}" alt="{a}" {how}{x}>'


def tag(text="Your project here"):
    return f'<span class="yours" aria-hidden="true"><span class="yours-dot"></span>{e(text)}</span>'


def stars():
    return f'<span class="stars" aria-hidden="true">{STAR * 5}</span>'


def favicon(c):
    letter = e(c["short"][0])
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='{c['accent']}'/>"
           f"<text x='32' y='44' font-family='Georgia,serif' font-size='38' text-anchor='middle' fill='white'>{letter}</text></svg>")
    return "data:image/svg+xml," + quote(svg)


def wa(c, line, page):
    """WhatsApp link whose first line says where the visitor is; every message ends with the page link."""
    return "https://wa.me/91" + c["phone"] + "?text=" + quote(f"Hello {c['short']}, {line}\nPage: {page}")


def maps(c):
    return ("https://www.google.com/maps/search/?api=1&query=" + quote(c["name"] + ", " + c["city"])
            + "&query_place_id=" + c["place"])


def landscape(n):
    w, h = size(n)
    return w >= 1100 and w > h * 1.15


def cat_of(name, ptype):
    return "Commercial" if ptype in COMMERCIAL else ROOM_CAT.get(PHOTOS[name][1], PHOTOS[name][1])


def counts(values, order):
    return [(v, values.count(v)) for v in order if v in values]


def project_kind(c):
    return "Full home interior" if c["kind"] == "arch" else "Kitchen, wardrobes and storage"


def prepare(c):
    """Gives each project its photos, then lists every photo once, in the order the gallery shows them."""
    used = {p[0] for p in c["projects"]}
    pool = [n for n in PHOTOS if PHOTOS[n][1] and n not in used]
    pdata = []
    for i, (cover, title, ptype) in enumerate(c["projects"]):
        space = PHOTOS[cover][1]
        prefs = [n for n in pool if PHOTOS[n][1] == space] + \
                [n for g in FITS.get(ptype, []) for n in pool if PHOTOS[n][2] == g]
        extra = []
        for n in prefs:
            if n not in extra:
                extra.append(n)
            if len(extra) == 2:
                break
        for n in extra:
            pool.remove(n)
        pdata.append(dict(i=i, cover=cover, title=title, type=ptype, photos=[cover] + extra))
    c["pdata"] = pdata
    owner = {n: p for p in pdata for n in p["photos"]}
    covers = [p["cover"] for p in pdata]
    # The first photo leads the gallery (the big tile on laptops): the studio's hero photo, else the first wide cover.
    lead = next((n for n in [c["hero"][1]] + covers if n in owner and landscape(n)), covers[0])
    order = []
    for n in [lead] + covers + [n for p in pdata for n in p["photos"]]:
        if n not in order:
            order.append(n)
    c["gallery"] = [dict(id=f'{owner[n]["i"]}-{n}', name=n, project=owner[n], space=PHOTOS[n][1],
                         cat=cat_of(n, owner[n]["type"])) for n in order]


def ctx_for(c, kind):
    pre = "" if kind == "home" else "../"
    path = {"home": "", "projects": "projects/", "project": "project/"}[kind]
    url = SITE + c["slug"] + "/" + path
    if kind == "home":
        line = c["wa_home"]
    elif kind == "projects":
        line = "I was looking at your projects."
    else:
        line = f"I liked your project 'Your project name' ({project_kind(c)}, {c['city']}) and want something similar."
    return dict(kind=kind, pre=pre, home=pre or "./", base="../" if kind == "home" else "../../", url=url,
                wa=wa(c, line, url), tel="tel:+91" + c["phone"])


def head(c, ctx, title, desc):
    base = ctx["base"]
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
<meta property="og:url" content="{ctx["url"]}">
<meta property="og:image" content="{SITE}{c["slug"]}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="theme-color" content="#F4F2ED">
<link rel="icon" href="{favicon(c)}">
<link rel="preload" href="{base}assets/fonts/mona-sans-full.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{base}assets/preview.css?v={VER}">
{HEAD_SCRIPT}
</head>'''


def nav_items(ctx):
    pre = ctx["pre"]
    return [("Projects", pre + "projects/"), ("Services", pre + "#services"), ("Process", pre + "#process"),
            ("Studio", pre + "#studio"), ("Contact", pre + "#contact")]


def header(c, ctx):
    """Slim header: name, page links (laptops), Call and WhatsApp (tablets and laptops), Menu (phones and tablets)."""
    links = ""
    for t, h in nav_items(ctx):
        cur = ' aria-current="page"' if t == "Projects" and ctx["kind"] == "projects" else ""
        links += f'<a href="{h}"{cur}>{t}</a>'
    return f'''<header class="hd">
  <div class="wrap hd-row">
    <a class="hd-name" href="{ctx["home"]}" aria-label="{e(c["name"])}, home">{e(c["short"])}</a>
    <nav class="hd-nav" aria-label="Main">{links}</nav>
    <div class="hd-cta"><a class="btn btn-line btn-sm" href="{ctx["tel"]}">Call</a><a class="btn btn-solid btn-sm" href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp</a></div>
    <button type="button" class="hd-menu" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
</header>'''


def menu(c, ctx):
    links = "".join(f'<a href="{h}">{t}</a>' for t, h in nav_items(ctx))
    return f'''<div class="mn" id="menu" hidden>
  <nav class="mn-nav" aria-label="Menu">{links}</nav>
  <div class="mn-cta"><a class="btn btn-line" href="{ctx["tel"]}">Call {fmt_phone(c["phone"])}</a><a class="btn btn-solid" href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp</a></div>
  <p class="mn-addr">{e(c["address"])}</p>
</div>'''


def pbar(c, ctx):
    """Phones: Call and WhatsApp stay at the bottom of the screen from the first moment."""
    return f'''<div class="pbar" role="region" aria-label="Contact {e(c["short"])}">
  <a class="btn btn-line" href="{ctx["tel"]}">Call</a>
  <a class="btn btn-solid" href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp</a>
</div>'''


def owner_note(c):
    return f'''<aside class="owner" data-key="{e(c["slug"])}" hidden aria-labelledby="owner-h">
  <p class="owner-h" id="owner-h">{e(c["short"])}, this is your homepage preview</p>
  <p>Every photo marked <span class="mini-tag">Your project here</span> gets replaced with your own work, and every line can be changed to your words.</p>
  <p>It goes live within {LIVE_IN} of getting your photos.</p>
  <div class="owner-foot"><span>Made for you by Satyam Choure<br>on {MADE_ON}</span><button type="button" class="btn btn-line btn-sm owner-close">Got it</button></div>
</aside>'''


def extras(c, ctx):
    return f'''{menu(c, ctx)}
{pbar(c, ctx)}
{owner_note(c)}'''


def footer(c, ctx):
    links = "".join(f'<a href="{h}">{t}</a>' for t, h in nav_items(ctx))
    visit = f'<a href="{e(maps(c))}" target="_blank" rel="noopener">{e(c["address"])}</a>'
    if c["hours"]:
        visit += f'<span class="muted">{e(c["hours"])}</span>'
    talk = (f'<a href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp</a>'
            f'<a href="{ctx["tel"]}">{fmt_phone(c["phone"])}</a>')
    if c["email"]:
        talk += f'<a href="mailto:{e(c["email"])}">{e(c["email"])}</a>'
    return f'''<footer class="ft">
  <div class="wrap">
    <div class="ft-top">
      <div class="ft-brand"><p class="ft-name">{e(c["name"])}</p><p class="ft-what">{e(c["what"])}</p></div>
      <div class="ft-col"><p class="ft-h">Visit</p>{visit}</div>
      <div class="ft-col"><p class="ft-h">Talk to us</p>{talk}</div>
      <div class="ft-col"><p class="ft-h">Pages</p>{links}</div>
      <div class="ft-col"><p class="ft-h">Social</p><span class="yours-text">Your Instagram</span><span class="yours-text">Your Facebook</span></div>
    </div>
    <div class="ft-bot"><span>&copy; {e(c["name"])}</span><span>Homepage preview by Satyam Choure</span></div>
  </div>
</footer>'''


def viewer(items):
    """Photo viewer: full screen, arrows, swipe, counter, caption, Open project, WhatsApp "I like this photo"."""
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    return f'''<div class="viewer" role="dialog" aria-modal="true" aria-label="Photo viewer" hidden>
  <div class="vw-top"><span class="vw-count" aria-live="polite"></span><button type="button" class="vw-close">Close</button></div>
  <div class="vw-stage"><figure class="vw-fig"><img class="vw-img" alt="">{tag()}</figure></div>
  <button type="button" class="vw-nav vw-prev" aria-label="Previous photo"><span aria-hidden="true">&larr;</span></button>
  <button type="button" class="vw-nav vw-next" aria-label="Next photo"><span aria-hidden="true">&rarr;</span></button>
  <div class="vw-bot"><p class="vw-cap"></p><div class="vw-act"><a class="btn btn-line-light btn-sm vw-open" href="#">Open project</a><a class="btn btn-solid btn-sm vw-wa" href="#" target="_blank" rel="noopener">I like this photo</a></div></div>
</div>
<script type="application/json" id="photo-data">{data}</script>'''


def scripts(base):
    return f'<script src="{base}assets/preview.js?v={VER}" defer></script>'


def status_el(c):
    d, o, cl = c["open"]
    return f'<span class="status" data-days="{",".join(map(str, d))}" data-open="{o}" data-close="{cl}" hidden></span>'


def tab_row(cats, total, label):
    out = f'<button type="button" class="tab" data-cat="all" aria-pressed="true">All <span class="tab-n">{total}</span></button>'
    for name, n in cats:
        out += f'<button type="button" class="tab" data-cat="{slug(name)}" aria-pressed="false">{e(name)} <span class="tab-n">{n}</span></button>'
    return f'<div class="tabs" role="group" aria-label="{e(label)}">{out}</div>'


def tile(pid, name, cat, title, meta, base, hidden=False, lead=False, load="lazy"):
    """One photo in a gallery: the photo (opens the viewer) and a two-line caption."""
    cls = "tile is-lead" if lead else "tile"
    h = " hidden" if hidden else ""
    return f'''
          <figure class="{cls}" data-cat="{slug(cat)}"{h}>
            <button type="button" class="ph" data-photo="{e(pid)}" aria-label="Open the photo: {e(alt_of(name))}">{img(name, base, alt="", load=load)}{tag()}</button>
            <figcaption class="cap"><span class="cap-t">{e(title)}</span><span class="cap-m">{e(meta)}</span></figcaption>
          </figure>'''


def gallery_tiles(c, base, limit=0):
    # On the homepage the photos that show from the start load right away; the rest wait until they are needed.
    return "".join(tile(g["id"], g["name"], g["cat"], g["space"], f'{g["project"]["type"]}, {c["city"]}', base,
                        hidden=bool(limit) and i >= limit, lead=bool(limit) and i == 0 and len(c["gallery"]) >= limit,
                        load="low" if limit and i < limit else "lazy")
                   for i, g in enumerate(c["gallery"]))


def photo_items(c, ctx, href):
    """Viewer data. The caption names the room and the property ("Exterior · Villa / Bungalow, Indore")."""
    return [dict(id=g["id"], src=f'{ctx["base"]}assets/img/{g["name"]}.webp', alt=alt_of(g["name"]),
                 cap=f'{g["space"]} · {g["project"]["type"]}, {c["city"]}', href=href,
                 share=ctx["url"] + "?photo=" + g["id"]) for g in c["gallery"]]


def chips_html(name, values, kind="radio", checked=()):
    return "".join(f'<label class="chip"><input type="{kind}" name="{name}" value="{e(v)}"{" checked" if v in checked else ""}>'
                   f'<span>{e(v)}</span></label>' for v in values)


def enquiry_form(c, ctx, pid, scope_preset=()):
    """Qualified WhatsApp enquiry: three short steps, mostly taps, with a live preview of the message."""
    o = ENQ[c["kind"]]
    start = o["default"]
    if any(s in o["build"] for s in scope_preset):
        start = "build"
    elif any(s in o["big"] for s in scope_preset):
        start = "big"
    frm = {"home": "homepage", "projects": "projects page", "project": "'Your project name' project page"}[ctx["kind"]]
    area_eg = "Vijay Nagar" if c["city"] == "Indore" else "your area"
    data = json.dumps(dict(budgets=o["budgets"], big=o["big"], build=o["build"], default=o["default"]), ensure_ascii=False)
    return f'''<form class="enq" id="{pid}-form" data-studio="{e(c["short"])}" data-wa="91{c["phone"]}" data-from="{e(frm)}" data-page="{e(ctx["url"])}" data-opts="{e(data)}" novalidate>
          <ol class="enq-prog" aria-hidden="true"><li class="is-on"><span>1</span> Property</li><li><span>2</span> Project</li><li><span>3</span> You</li></ol>
          <fieldset class="enq-step is-on" data-step="1">
            <legend class="enq-lg">Your property</legend>
            <div class="q"><p class="q-l" id="{pid}-type-l">Property type <span class="req">required</span></p>
              <div class="chips" role="radiogroup" aria-labelledby="{pid}-type-l">{chips_html("type", o["types"])}</div></div>
            <div class="q"><p class="q-l" id="{pid}-size-l">Size</p>
              <div class="chips" role="radiogroup" aria-labelledby="{pid}-size-l">{chips_html("size", SIZES)}</div>
              <div class="field field-s"><label for="{pid}-sqft">or area in sq ft</label><input id="{pid}-sqft" name="sqft" inputmode="numeric" autocomplete="off" placeholder="e.g. 1450"></div></div>
            <div class="two">
              <div class="field"><label for="{pid}-city">City <span class="req">required</span></label><input id="{pid}-city" name="city" value="{e(c["city"])}" autocomplete="address-level2" required></div>
              <div class="field"><label for="{pid}-area">Area or locality</label><input id="{pid}-area" name="area" placeholder="e.g. {e(area_eg)}"></div>
            </div>
            <p class="form-error" role="alert" hidden></p>
            <div class="enq-nav"><button type="button" class="btn btn-solid enq-next">Next</button></div>
          </fieldset>
          <fieldset class="enq-step" data-step="2">
            <legend class="enq-lg">Your project</legend>
            <div class="q"><p class="q-l" id="{pid}-scope-l">What do you need? <span class="req">required</span></p>
              <div class="chips" role="group" aria-labelledby="{pid}-scope-l">{chips_html("scope", o["scopes"], "checkbox", scope_preset)}</div></div>
            <div class="q"><p class="q-l" id="{pid}-budget-l">Budget</p>
              <div class="chips budget-chips" role="radiogroup" aria-labelledby="{pid}-budget-l">{chips_html("budget", o["budgets"][start])}</div></div>
            <div class="q"><p class="q-l" id="{pid}-time-l">When do you want to start?</p>
              <div class="chips" role="radiogroup" aria-labelledby="{pid}-time-l">{chips_html("timeline", TIMELINES)}</div></div>
            <p class="form-error" role="alert" hidden></p>
            <div class="enq-nav"><button type="button" class="btn btn-line enq-back">Back</button><button type="button" class="btn btn-solid enq-next">Next</button></div>
          </fieldset>
          <fieldset class="enq-step" data-step="3">
            <legend class="enq-lg">About you</legend>
            <div class="field"><label for="{pid}-name">Your name <span class="req">required</span></label><input id="{pid}-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="{pid}-note">Anything else (optional)</label><textarea id="{pid}-note" name="note" rows="2"></textarea></div>
            <div class="bubble-wrap" aria-live="polite"><p class="bubble-label">The studio receives this on WhatsApp</p><p class="bubble">Hello {e(c["short"])}, I'm …</p></div>
            <p class="form-error" role="alert" hidden></p>
            <div class="enq-nav"><button type="button" class="btn btn-line enq-back">Back</button><button class="btn btn-solid enq-send" type="submit">Send on WhatsApp</button></div>
            <p class="form-note">Nothing is stored on this website. Your message goes straight to the studio's WhatsApp.</p>
            <p class="enq-thanks" role="status" hidden></p>
          </fieldset>
        </form>'''


def ba_block(name, base):
    w, h = size(name)
    return f'''<div class="ba" style="--pos:50%" data-rv>
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


def hero(c, ctx):
    """Text only: what the studio does, its name, one line in its own voice, WhatsApp and Call, and a fact box."""
    arch = c["kind"] == "arch"
    yours = ("Projects completed", "Years in practice") if arch else ("Homes fitted", "Years in business")
    studio = f'<a href="{e(maps(c))}" target="_blank" rel="noopener">{e(c["address"])}</a>'
    if c["hours"]:
        studio += status_el(c)
    cells = (f'<div><dt>Google rating</dt><dd>{e(c["rating"])} {stars()}</dd></div>'
             f'<div><dt>Google reviews</dt><dd>{c["reviews"]}</dd></div>'
             f'<div><dt>{yours[0]}</dt><dd class="yours-text">Your number</dd></div>'
             f'<div><dt>{yours[1]}</dt><dd class="yours-text">Your number</dd></div>'
             f'<div class="tb-wide"><dt>Studio</dt><dd>{studio}</dd></div>')
    return f'''<section class="hero" aria-labelledby="hero-h">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">{e(c["label"])}, {e(c["city"])}</p>
        <h1 class="hero-h" id="hero-h">{e(c["hero_name"])}</h1>
        <p class="hero-lead">{e(c["say"])}</p>
        <div class="hero-cta"><a class="btn btn-solid" href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp the studio</a><a class="btn btn-line" href="{ctx["tel"]}">Call {fmt_phone(c["phone"])}</a></div>
      </div>
      <dl class="tblock" aria-label="Studio facts">{cells}</dl>
    </div>
  </section>'''


def work(c, ctx):
    """The one place for photos on the homepage: every project photo, sorted into categories (tabs)."""
    g = c["gallery"]
    shown = min(5, len(g))
    return f'''<section class="sec work" id="work" aria-labelledby="work-h">
    <div class="wrap">
      <div class="sec-head sec-head-row" data-rv>
        <div><h2 class="h2" id="work-h">Projects</h2><p class="sec-note">Sorted by room. Tap any photo to see it full size.</p></div>
        <a class="link" href="projects/">All projects</a>
      </div>
      <div class="gal" data-filter data-max="5" data-lead data-all-href="projects/?view=photos">
        {tab_row(counts([x["cat"] for x in g], CAT_ORDER), len(g), "Show photos of")}
        <div class="grid" data-count="{shown}">{gallery_tiles(c, ctx["base"], limit=5)}
        </div>
        <div class="gal-foot"><p class="gal-note">Every photo marked <span class="mini-tag">Your project here</span> is where your own work goes.</p><a class="link gal-all" href="projects/?view=photos">See all {len(g)} photos</a></div>
      </div>
    </div>
  </section>'''


def services(c, ctx):
    lst = ARCH_SERVICES if c["kind"] == "arch" else FURN_SERVICES
    items = "".join(f'<li><h3 class="svc-t">{e(n)}</h3><p class="svc-d">{e(d)}</p></li>' for n, d, _ in lst)
    return f'''<section class="sec" id="services" aria-labelledby="services-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="services-h">What we do</h2><p class="sec-note yours-text">Your exact list of services goes here.</p></div>
      <ol class="svc" data-rv-kids>{items}</ol>
    </div>
  </section>'''


def process(c, ctx):
    arch = c["kind"] == "arch"
    steps = ARCH_STEPS if arch else FURN_STEPS
    items = "".join(f'<li class="step"><span class="step-n">Step {i + 1}</span><h3 class="step-t">{e(t)}</h3>'
                    f'<p class="step-d">{e(d)}</p><p class="step-get"><b>You get:</b> {e(get)}</p></li>'
                    for i, (t, d, get, _) in enumerate(steps))
    title = "How a project runs" if arch else "How your furniture gets made"
    note = ("Five steps from the first site visit to the day you move in." if arch
            else "Five steps from measuring your home to the day it is fitted.")
    return f'''<section class="sec sec-tint" id="process" aria-labelledby="process-h">
    <div class="wrap">
      <div class="sec-head" data-rv><h2 class="h2" id="process-h">{e(title)}</h2><p class="sec-note">{e(note)}</p></div>
      <ol class="steps" data-rv-kids>{items}</ol>
    </div>
  </section>'''


def studio(c, ctx):
    """The person behind the studio, and what Google reviewers say."""
    arch = c["kind"] == "arch"
    title = "Ar. " if arch else ""
    google = f'<a class="link" href="{e(maps(c))}" target="_blank" rel="noopener">Read the reviews on Google</a>'
    if c["quotes"]:
        qs = "".join(f'<figure class="quote"><blockquote><p>&ldquo;{e(q)}&rdquo;</p></blockquote>'
                     f'<figcaption>{e(who)}, {e(when)} &middot; Google review</figcaption></figure>'
                     for q, who, when in c["quotes"][:3])
        proof = (f'<div class="rating"><div class="quotes">{qs}</div>'
                 f'<p>{stars()} {e(c["rating"])} on Google from {c["reviews"]} reviews.</p>{google}</div>')
    else:
        proof = (f'<div class="rating"><p class="rating-n">{e(c["rating"])}<small> / 5</small></p>{stars()}'
                 f'<p>Average rating from {c["reviews"]} reviews on Google.</p>{google}</div>')
    return f'''<section class="sec" id="studio" aria-labelledby="studio-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="studio-h">The person behind {e(c["short"])}</h2></div>
      <div class="studio-body" data-rv>
        <div>
          <p class="studio-more">{e(c["more"])}</p>
          <p class="studio-story yours-text">Your story goes here: how {e(c["short"])} started, the projects you are proudest of, and how you like to work with clients.</p>
          <p class="sign"><b>{title}<span class="yours-text">Your name</span></b><span>Founder, {e(c["short"])}</span></p>
        </div>
        {proof}
      </div>
    </div>
  </section>'''


def contact(c, ctx, title, note, pid, preset=(), extra=""):
    """Contact details and the WhatsApp enquiry form side by side."""
    visit = f'<a href="{e(maps(c))}" target="_blank" rel="noopener">{e(c["address"])}</a>'
    if c["hours"]:
        visit += f'<span class="muted">{e(c["hours"])}</span>{status_el(c)}'
    rows = (f'<div><dt>Visit</dt><dd>{visit}</dd></div>'
            f'<div><dt>WhatsApp</dt><dd><a href="{e(ctx["wa"])}" target="_blank" rel="noopener">{fmt_phone(c["phone"])}</a></dd></div>'
            f'<div><dt>Call</dt><dd><a href="{ctx["tel"]}">{fmt_phone(c["phone"])}</a></dd></div>')
    if c["email"]:
        rows += f'<div><dt>Email</dt><dd><a href="mailto:{e(c["email"])}">{e(c["email"])}</a></dd></div>'
    return f'''<section class="sec" id="contact" aria-labelledby="{pid}-contact-h">
    <div class="wrap contact-grid">
      <div class="contact-info" data-rv>
        <h2 class="h2" id="{pid}-contact-h">{e(title)}</h2>
        <p class="sec-note">{e(note)}</p>
        <dl class="cinfo">{rows}</dl>{extra}
      </div>
      <div class="enq-card" data-rv>
        {enquiry_form(c, ctx, pid, preset)}
      </div>
    </div>
  </section>'''


def page(c):
    ctx = ctx_for(c, "home")
    rated = f"Rated {c['rating']} on Google from {c['reviews']} reviews."
    title = "Tell us about your home" if c["kind"] == "furn" else "Tell us about your project"
    hello = f"Hello {c['short']}, "
    return head(c, ctx, f'{c["name"]}, {c["city"]}', f'{c["what"]} {rated}') + f'''
<body class="home" data-wa="91{c["phone"]}" data-hello="{e(hello)}">
<a class="skip" href="#main">Skip to content</a>
{header(c, ctx)}
<main id="main">
  {hero(c, ctx)}

  {work(c, ctx)}

  {services(c, ctx)}

  {process(c, ctx)}

  {studio(c, ctx)}

  {contact(c, ctx, title, "Three short steps, mostly taps. WhatsApp then opens with your message ready to send.", "c")}
</main>
{footer(c, ctx)}
{extras(c, ctx)}
{viewer(photo_items(c, ctx, "project/"))}
{scripts(ctx["base"])}
</body>
</html>
'''


def projects_page(c):
    """All projects: by project (filter by property type) or by room (every photo, filter by category)."""
    ctx = ctx_for(c, "projects")
    base = ctx["base"]
    pdata, g = c["pdata"], c["gallery"]
    cards = ""
    for p in pdata:
        cards += f'''
          <article class="pcard" data-cat="{slug(p["type"])}">
            <a href="../project/">
              <span class="pcard-ph">{img(p["cover"], base)}{tag()}</span>
              <span class="pcard-t">{e(p["title"])}</span>
              <span class="pcard-m">{e(p["type"])}, {e(c["city"])} &middot; {len(p["photos"])} photo{"" if len(p["photos"]) == 1 else "s"}</span>
            </a>
          </article>'''
    hello = f"Hello {c['short']}, "
    return head(c, ctx, f'Projects | {c["name"]}', f'All projects by {c["name"]}, {c["city"]}.') + f'''
<body class="projects-page" data-wa="91{c["phone"]}" data-hello="{e(hello)}">
<a class="skip" href="#main">Skip to content</a>
{header(c, ctx)}
<main id="main">
  <section class="sec pj-top" aria-labelledby="pj-h">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span aria-hidden="true">/</span><span aria-current="page">Projects</span></nav>
      <h1 class="h1" id="pj-h">Projects</h1>
      <p class="sec-note">{len(pdata)} projects, {len(g)} photos. Every photo marked <span class="mini-tag">Your project here</span> is where your own work goes.</p>
      <div class="seg" role="group" aria-label="Show"><button type="button" data-view="projects" aria-pressed="true">By project</button><button type="button" data-view="photos" aria-pressed="false">By room</button></div>
    </div>
  </section>
  <section class="sec pj-body" aria-label="Projects and photos">
    <div class="wrap">
      <div class="pj-view" data-v="projects" data-filter>
        {tab_row(counts([p["type"] for p in pdata], PROPERTY_TYPES), len(pdata), "Property type")}
        <div class="cards">{cards}
        </div>
      </div>
      <div class="pj-view" data-v="photos" data-filter hidden>
        {tab_row(counts([x["cat"] for x in g], CAT_ORDER), len(g), "Show photos of")}
        <div class="grid">{gallery_tiles(c, base)}
        </div>
      </div>
    </div>
  </section>
</main>
{footer(c, ctx)}
{extras(c, ctx)}
{viewer(photo_items(c, ctx, "../project/"))}
{scripts(base)}
</body>
</html>
'''


def project_page(c):
    """Sample project page: title and facts, cover photo, story, photos by room, drawing vs finished, enquiry."""
    ctx = ctx_for(c, "project")
    base = ctx["base"]
    arch = c["kind"] == "arch"
    main_img = c["ba"]
    kind = project_kind(c)
    scope = "Interiors and furniture" if arch else "Kitchen, wardrobes and storage"
    preset = ("Full home",) if arch else ("Modular kitchen", "Wardrobes")
    share = ctx["url"] + "?photo="
    entries = [(n, room) for room, names in PROJECT_ROOMS for n in names if n != main_img]
    items = [dict(id=main_img, src=f"{base}assets/img/{main_img}.webp", alt=alt_of(main_img),
                  cap=f'{PHOTOS[main_img][1]} · Your project name, {c["city"]}', href="", share=share + main_img)]
    items += [dict(id=n, src=f"{base}assets/img/{n}.webp", alt=alt_of(n), cap=f'{room} · Your project name, {c["city"]}',
                   href="", share=share + n) for n, room in entries]
    tiles = "".join(tile(n, n, room, room, alt_of(n), base) for n, room in entries)
    rooms = counts([room for _, room in entries], [r for r, _ in PROJECT_ROOMS])
    yc = ' class="yours-text"'
    facts = [("Location", e(c["city"]), False), ("Type", e(kind), False), ("What we did", e(scope), False),
             ("Area", "Your number", True), ("Year", "Your number", True), ("Time taken", "Your number", True)]
    dl = "".join(f'<div><dt>{t}</dt><dd{yc if y else ""}>{v}</dd></div>' for t, v, y in facts)
    story = [("The brief", "What the client asked for, the budget and the deadline."),
             ("The design", "The idea that solved the site: layout, light and materials."),
             ("The result", "How the family uses the space today, and what they said at handover.")]
    story_html = "".join(f'<div class="story-i"><h3>{t}</h3><p>{d} <span class="yours-text">Your words go here.</span></p></div>'
                         for t, d in story)
    more = '<p class="p-more"><a class="link" href="../projects/">See all projects</a></p>'
    hello = f"Hello {c['short']}, "
    return head(c, ctx, f'Your project name | {c["name"]}', f'A sample project page for {c["name"]}, {c["city"]}.') + f'''
<body class="project-page" data-wa="91{c["phone"]}" data-hello="{e(hello)}">
<a class="skip" href="#main">Skip to content</a>
{header(c, ctx)}
<main id="main">
  <section class="sec p-top" aria-labelledby="p-title">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span aria-hidden="true">/</span><a href="../projects/">Projects</a><span aria-hidden="true">/</span><span aria-current="page">Your project name</span></nav>
      <div class="p-title-row">
        <div><h1 class="h1" id="p-title">Your project name</h1><p class="p-sub">{e(kind)}, {e(c["city"])}</p></div>
        <a class="btn btn-solid" href="{e(ctx["wa"])}" target="_blank" rel="noopener">Ask about this project</a>
      </div>
      <dl class="tblock tblock-row" aria-label="Project facts">{dl}</dl>
    </div>
  </section>

  <div class="wrap p-cover"><button type="button" class="ph" data-photo="{main_img}" aria-label="Open the photo: {e(alt_of(main_img))}">{img(main_img, base, alt="", load="high")}{tag()}</button></div>

  <section class="sec p-story" aria-labelledby="story-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="story-h">The story</h2></div>
      <div class="story" data-rv-kids>{story_html}</div>
    </div>
  </section>

  <section class="sec p-photos" id="photos" aria-labelledby="photos-h">
    <div class="wrap">
      <div class="sec-head" data-rv><h2 class="h2" id="photos-h">Photos</h2><p class="sec-note">Sorted by room. Tap any photo to see it full size.</p></div>
      <div class="gal" data-filter>
        {tab_row(rooms, len(entries), "Show photos of")}
        <div class="grid">{tiles}
        </div>
      </div>
    </div>
  </section>

  <section class="sec p-compare" aria-labelledby="compare-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="compare-h">Drawing vs finished</h2><p class="sec-note">The plan and the finished room in one frame. Drag the line to compare.</p></div>
      {ba_block(main_img, base)}
    </div>
  </section>

  {contact(c, ctx, "Want something similar?", "The form already knows which project you were looking at. Change anything you like.", "s", preset, more)}
</main>
{footer(c, ctx)}
{extras(c, ctx)}
{viewer(items)}
{scripts(base)}
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
    write_og = "--og" in sys.argv  # og.jpg only changes when a hero photo or name changes
    for c in CLIENTS:
        prepare(c)
        for sub, fn in (("", page), ("projects", projects_page), ("project", project_page)):
            folder = os.path.join(ROOT, c["slug"], sub)
            os.makedirs(folder, exist_ok=True)
            with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as f:
                f.write(fn(c))
        if write_og or not os.path.exists(os.path.join(ROOT, c["slug"], "og.jpg")):
            og(c)
        print("built", c["slug"])
