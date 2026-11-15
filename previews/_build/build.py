"""Builds every studio preview website from one place.

For each client in CLIENTS it writes, inside previews/<slug>/:
    index.html                      homepage
    projects/index.html             all projects: filter by property type and room (filters combine and stay in the
                                    link), Projects or Photos view, Grid or List layout, "Show more"
    projects/<project>/index.html   one page per project: facts, cover, story, photos by room, drawing vs finished,
                                    enquiry pre-filled for that project, next project
    about/index.html                the studio: the person behind it, Google rating and reviews, address
    contact/index.html              contact details next to the WhatsApp enquiry
    project/index.html              old address of the single sample project page: forwards to the first project
    og.jpg                          the picture WhatsApp shows when the link is shared (made once; --og remakes it)
It also writes card-size copies of the photos to previews/assets/img/sm/ (720 px wide), so phones load smaller files.

Run from anywhere:  python3 previews/_build/build.py
Needs Pillow, fontTools and brotli once:  python3 -m pip install --user pillow fonttools brotli
Edit CLIENTS below to add a client, a project or change text, then run it again.
Shared look and behaviour live in previews/assets/ (preview.css, preview.js, fonts/, img/).

Design (15 Nov 2026): calm, compact pages with normal-size headings. Photos appear only in the project areas
(homepage projects, projects page, project pages), each photo belongs to exactly one project and one room.
Buttons are plain text, no icons. Nothing loads from another website.
Line drawings of photos (<photo>-sketch.webp) are made with sketch.py (same folder).
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
SM_W = 720  # width of the card-size photo copies in assets/img/sm/

# What each stock photo shows: alt text, the room (space) it belongs to.
# site and plans-desk are not project photos and are not used on the pages.
PHOTOS = {
    "living-atrium": ("Open-plan living room with a double-height window", "Living room"),
    "living-styled": ("Bright living room with a gallery wall", "Living room"),
    "living-warm": ("Corner with a yellow armchair and a floor lamp", "Living room"),
    "living-bright": ("Living room with a sofa and round coffee table", "Living room"),
    "living-tv": ("Living room with a TV wall and open shelving", "Living room"),
    "tv-unit": ("Dark TV unit with open shelves", "Living room"),
    "bedroom": ("Bedroom with an upholstered bed and dark walls", "Bedroom"),
    "kitchen-island": ("White kitchen with an island and pendant lights", "Kitchen"),
    "bath": ("White bathroom with plants", "Bathroom"),
    "dining-table": ("Dining table set for dinner", "Dining"),
    "dining-warm": ("Warm dining room with a pendant light", "Dining"),
    "office": ("Office corridor with glass cabins", "Workspace"),
    "clinic": ("Bright clinic room", "Consultation room"),
    "house-dusk": ("Modern house lit up at dusk", "Exterior"),
    "villa-pool": ("White villa with a long pool", "Exterior"),
    "villa-day": ("Modern white villa with a pool", "Exterior"),
    "villa-modern": ("Modern white house with a pool and lawn", "Exterior"),
    "villa-terrace": ("Villa terrace beside a pool", "Exterior"),
    "site": ("Team on a building site", None),
    "plans-desk": ("Hands drawing a plan with a scale ruler", None),
}
# Filter chips on the projects page. The plan's standard chips always show (greyed out at 0, so the owner sees where
# his own categories go); other rooms and types show only when a project uses them.
TYPE_ORDER = ["Apartment", "Villa / Bungalow", "Independent house", "Office", "Shop / Showroom", "Café / Restaurant", "Clinic"]
SPACE_ORDER = ["Living room", "Bedroom", "Kitchen", "Wardrobe", "Bathroom", "Dining", "Pooja room", "Kids' room",
               "Exterior", "Reception", "Workspace", "Consultation room"]
PLAN_SPACES = ["Living room", "Bedroom", "Kitchen", "Wardrobe", "Bathroom", "Pooja room", "Kids' room", "Reception"]
ROOM_PLURAL = {"Living room": "Living rooms", "Bedroom": "Bedrooms", "Kitchen": "Kitchens", "Wardrobe": "Wardrobes",
               "Bathroom": "Bathrooms", "Dining": "Dining rooms", "Pooja room": "Pooja rooms", "Kids' room": "Kids' rooms",
               "Exterior": "Exteriors", "Reception": "Receptions", "Workspace": "Workspaces",
               "Consultation room": "Consultation rooms"}

# Services: name and one line
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
# Five steps, design to handover: title, what happens, what you get
ARCH_STEPS = [
    ("Consultation and site visit", "We listen to what you need, measure every room and photograph the site.", "a measured plan"),
    ("Design and 3D", "Layout, mood board and 3D views. Changes happen on screen, where they cost nothing.", "approved designs"),
    ("Quote and materials", "An itemised quote with every item and its price, and materials picked with you from real samples.", "a fixed quote"),
    ("Work on site", "Carpentry, ceilings, electrical and painting, with weekly photo updates on WhatsApp.", "progress updates"),
    ("Handover", "A final walkthrough, every small defect fixed, cleaning done and warranty papers handed over.", "a ready home"),
]
FURN_STEPS = [
    ("Measurement at your home", "We measure the kitchen or room at your home, so every unit fits the wall it is made for.", "exact measurements"),
    ("Design and finish", "Choose the layout, shutters and colours with us. You see the design before anything is made.", "an approved design"),
    ("Quote and materials", "An itemised quote with every unit and its price, and finishes picked from real samples.", "a fixed quote"),
    ("Made to size", "Each unit is made in uPVC to your measurements: it won't swell with water and termites leave it alone.", "furniture made for your walls"),
    ("Fitting and handover", "Our team fits everything at your home and checks every door, drawer and hinge before leaving.", "a ready kitchen or room"),
]
# Qualified WhatsApp enquiry: three short steps, mostly taps
SIZES = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"]
TIMELINES = ["Within 1 month", "1–3 months", "3–6 months", "Just exploring"]
ENQ = {
    "arch": dict(
        types=["Apartment", "Villa / Bungalow", "Independent house", "Office", "Shop / Showroom", "Café / Restaurant", "Clinic"],
        scopes=["Full home", "Kitchen", "Wardrobes", "Living room", "Bedroom", "Bathroom", "Renovation", "New build"],
        budgets={"small": ["Under ₹2 lakh", "₹2–5 lakh", "₹5–10 lakh", "Above ₹10 lakh", "Not sure yet"],
                 "big": ["Under ₹10 lakh", "₹10–25 lakh", "₹25–50 lakh", "Above ₹50 lakh", "Not sure yet"],
                 "build": ["Under ₹50 lakh", "₹50 lakh–1 crore", "₹1–2 crore", "Above ₹2 crore", "Not sure yet"]},
        big=["Full home", "Renovation"], build=["New build"], default="big"),
    "furn": dict(
        types=["Apartment", "Villa / Bungalow", "Independent house", "Office", "Shop / Showroom", "Clinic"],
        scopes=["Modular kitchen", "Wardrobes", "TV unit", "Furniture for the whole home", "Office or shop furniture"],
        budgets={"small": ["Under ₹1 lakh", "₹1–3 lakh", "₹3–6 lakh", "Above ₹6 lakh", "Not sure yet"],
                 "big": ["Under ₹3 lakh", "₹3–6 lakh", "₹6–12 lakh", "Above ₹12 lakh", "Not sure yet"]},
        big=["Furniture for the whole home", "Office or shop furniture"], build=[], default="small"),
}


def P(title, ptype, photos, did, scope=()):
    """One project: its name, property type, photos (the first is the cover; each photo's room comes from PHOTOS),
    what the studio did, and what the enquiry form pre-selects when it is opened from this project."""
    return dict(title=title, type=ptype, photos=list(photos), did=did, scope=list(scope))


# Six sample projects per studio. Every photo is used once per studio. The first project leads the homepage, so it gets
# the most photos (it shows the owner how a full project page looks with several rooms).
CLIENTS = [
    dict(slug="habitat-interior", name="Habitat Interior and Architect", short="Habitat", hero_name="Habitat",
         label="Interiors & architecture", city="Indore", what="Interiors and architecture in Indore.", accent="#7E4E30",
         phone="8889832888", rating="4.8", reviews=114, place="ChIJgyY1bBH9YjkRCynIBkl3Kdc",
         address="27, Shanti Nagar Road, Indore", hours=None, open=None, email=None,
         hero=("full", "living-atrium", "Open-plan living room with a double-height window"),
         say="A home should feel calm on an ordinary weekday, not only on the day it is photographed.",
         more="Interiors and architecture in Indore, planned around how your family actually uses each room.",
         projects=[P("Apartment interior", "Apartment", ["living-styled", "living-warm", "tv-unit", "bedroom", "bath", "dining-table"], "Interiors and furniture", ["Full home"]),
                   P("Private villa", "Villa / Bungalow", ["villa-modern", "villa-terrace", "living-atrium"], "Architecture and interiors", ["New build"]),
                   P("Modern house", "Independent house", ["house-dusk", "kitchen-island", "living-bright"], "Architecture and interiors", ["New build"]),
                   P("Villa with a pool", "Villa / Bungalow", ["villa-pool", "villa-day", "living-tv"], "Architecture and interiors", ["New build"]),
                   P("Restaurant", "Café / Restaurant", ["dining-warm"], "Interior design"),
                   P("Office", "Office", ["office"], "Interior design")],
         kind="arch", wa_home="I saw your website and want to discuss my home interiors.", quotes=[]),
    dict(slug="adhira-home-decor", name="Adhira Home Decor & uPVC Furniture", short="Adhira", hero_name="Adhira Home Decor",
         label="uPVC kitchens & furniture", city="Indore", what="uPVC kitchens, wardrobes and furniture in Indore.", accent="#3E5A52",
         phone="6264434866", rating="4.5", reviews=41, place="ChIJSxwRBe4-lksRARPtMKoBOj8",
         address="Shop 1, Makwana Complex, Indore", hours=None, open=None, email=None,
         hero=("split", "kitchen-island", "White kitchen with an island and pendant lights"),
         say="Kitchens and wardrobes that stay straight through every monsoon.",
         more="uPVC doesn't swell with water, doesn't attract termites and wipes clean. We make kitchens, wardrobes and furniture in it, measured for your home.",
         projects=[P("Kitchen and wardrobes", "Apartment", ["kitchen-island", "bedroom", "dining-table", "bath"], "Modular kitchen, wardrobes and storage", ["Modular kitchen", "Wardrobes"]),
                   P("TV unit and shelving", "Apartment", ["tv-unit", "living-styled", "living-warm"], "TV unit and storage", ["TV unit"]),
                   P("Living room storage", "Independent house", ["living-bright", "living-tv", "living-atrium"], "Furniture for the whole home", ["Furniture for the whole home"]),
                   P("Dining room", "Villa / Bungalow", ["dining-warm"], "Furniture for the whole home", ["Furniture for the whole home"]),
                   P("Office storage", "Office", ["office"], "Office furniture", ["Office or shop furniture"]),
                   P("Clinic cabinets", "Clinic", ["clinic"], "Cabinets and storage", ["Office or shop furniture"])],
         kind="furn", wa_home="I saw your website and want to discuss furniture for my home.", quotes=[]),
    dict(slug="skript-architect-studio", name="SKript Architect Studio", short="SKript", hero_name="SKript Architect Studio",
         label="Architects", city="Gwalior", what="Architecture and interiors in Gwalior.", accent="#34405E",
         phone="7869484497", rating="4.9", reviews=167, place="ChIJbYyFrRjEdjkRlpY4b1zu_-c",
         address="H.No. I-13, behind Hotel Central Park, City Center, Patel Nagar, Gwalior 474011",
         hours="Monday to Saturday, 10 am to 7 pm", open=([0, 1, 2, 3, 4, 5], 10 * 60, 19 * 60), email="architect.kas@gmail.com",
         hero=("split", "house-dusk", "Modern house lit up at dusk"),
         say="Good architecture starts with the site: where the sun rises, where the breeze comes from, and how you want to live.",
         more="Houses and interiors in Gwalior, designed with you and followed through on site until the work is done.",
         projects=[P("House, front elevation", "Independent house", ["villa-day", "house-dusk", "kitchen-island", "dining-table", "bath"], "Architecture and interiors", ["New build"]),
                   P("Villa with a pool", "Villa / Bungalow", ["villa-pool", "villa-terrace", "living-atrium"], "Architecture and interiors", ["New build"]),
                   P("Clinic", "Clinic", ["clinic"], "Interior design"),
                   P("Apartment interior", "Apartment", ["bedroom", "living-warm", "living-styled"], "Interiors and furniture", ["Full home"]),
                   P("Modern house", "Independent house", ["villa-modern", "living-bright"], "Architecture", ["New build"]),
                   P("Living room renovation", "Apartment", ["living-tv", "tv-unit"], "Renovation", ["Renovation"])],
         kind="arch", wa_home="I saw your website and want to discuss my project.", quotes=[]),
    dict(slug="hauss-studio", name="Hauss Studio Architects & Interior Designers", short="Hauss Studio", hero_name="Hauss Studio",
         label="Architects & interior designers", city="Ludhiana",
         what="Architects and interior designers in Ludhiana, working on projects across India.", accent="#7A3B2E",
         phone="7973238073", rating="5.0", reviews=116, place="ChIJQ4oycNGFGjkRRWG1JcxDwC0",
         address="S City Road, Ayali Khurd, Ludhiana", hours="Monday to Saturday, 10 am to 6:30 pm",
         open=([0, 1, 2, 3, 4, 5], 10 * 60, 18 * 60 + 30), email="hauss.studio9@gmail.com",
         hero=("split flip", "villa-pool", "White villa with a long pool"),
         say="Every project begins with your brief and ends with a space that feels like it was always yours.",
         more="Architecture and interiors from Ludhiana, for homes and workplaces across India.",
         projects=[P("Villa with a long pool", "Villa / Bungalow", ["villa-pool", "villa-day", "living-atrium", "kitchen-island", "bedroom", "bath"], "Architecture and interiors", ["New build"]),
                   P("Residence", "Independent house", ["house-dusk", "villa-terrace", "dining-table"], "Architecture and interiors", ["New build"]),
                   P("Restaurant", "Café / Restaurant", ["dining-warm"], "Interior design"),
                   P("Apartment interior", "Apartment", ["living-warm", "living-styled", "tv-unit"], "Interiors and furniture", ["Full home"]),
                   P("Office", "Office", ["office"], "Interior design"),
                   P("Modern house", "Independent house", ["villa-modern", "living-bright", "living-tv"], "Architecture and interiors", ["New build"])],
         kind="arch", wa_home="I saw your website and want to discuss my home interiors.", quotes=[]),
    dict(slug="ra3designs", name="Ra3Designs", short="Ra3Designs", hero_name="Ra3Designs",
         label="Architects", city="Sonipat", what="Architects in Sonipat.", accent="#6E5628",
         phone="9729073147", rating="4.9", reviews=229, place="ChIJD3J_-DmwDTkReQmeGO-EaFU",
         address="Sector 12, near Gateway International School, Sonipat", hours=None, open=None, email=None,
         hero=("full", "villa-day", "Modern white villa with a pool"),
         say="Buildings that look as good in ten years as they do on the first day.",
         more="Architecture for homes and workplaces in Sonipat, planned around light, fresh air and a budget agreed before work starts.",
         projects=[P("Modern villa", "Villa / Bungalow", ["villa-day", "villa-terrace", "living-atrium", "dining-table", "bedroom", "bath"], "Architecture and interiors", ["New build"]),
                   P("House at dusk", "Independent house", ["house-dusk", "kitchen-island", "living-bright"], "Architecture and interiors", ["New build"]),
                   P("Villa and lawn", "Villa / Bungalow", ["villa-modern", "villa-pool", "living-tv"], "Architecture", ["New build"]),
                   P("Office", "Office", ["office"], "Architecture and interiors"),
                   P("Apartment interior", "Apartment", ["living-styled", "living-warm", "tv-unit"], "Interiors and furniture", ["Full home"]),
                   P("Clinic", "Clinic", ["clinic"], "Interior design")],
         kind="arch", wa_home="I saw your website and want to discuss my project.", quotes=[]),
    dict(slug="yashraj-architects", name="Yashraj Architects & Interiors", short="Yashraj", hero_name="Yashraj Architects & Interiors",
         label="Architects & interiors", city="Khandwa", what="Architecture and interiors in Khandwa.", accent="#4F5530",
         phone="9414965368", rating="5.0", reviews=86, place="ChIJCyHwbd4b2DsR_SQRKi8DurA",
         address="Murlidhar Business Park, above Zudio, Khandwa", hours=None, open=None, email=None,
         hero=("split", "living-styled", "Bright living room with a gallery wall"),
         say="Rooms planned around the people who live in them, finished in materials that age well.",
         more="Architecture and interiors in Khandwa, from the floor plan to the last light fitting.",
         projects=[P("Apartment interior", "Apartment", ["living-styled", "bedroom", "bath", "dining-table", "kitchen-island", "tv-unit"], "Interiors and furniture", ["Full home"]),
                   P("Residence", "Independent house", ["house-dusk", "villa-terrace", "living-warm"], "Architecture and interiors", ["New build"]),
                   P("Villa", "Villa / Bungalow", ["villa-modern", "villa-pool", "living-atrium"], "Architecture and interiors", ["New build"]),
                   P("Modern villa", "Villa / Bungalow", ["villa-day", "living-bright", "living-tv"], "Architecture and interiors", ["New build"]),
                   P("Restaurant", "Café / Restaurant", ["dining-warm"], "Interior design"),
                   P("Office", "Office", ["office"], "Interior design")],
         kind="arch", wa_home="I saw your website and want to discuss my home interiors.", quotes=[]),
]
# Google review quotes: add 3 to 6 per studio, copied word for word from their Google listing, as
#   quotes=[("Exact words of the review.", "First name", "Month Year"), ...]
# While a studio's list is empty, the pages show the Google rating block instead of quotes.

STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/></svg>'
CARD_SIZES = "(min-width: 900px) 620px, 92vw"
TILE_SIZES = "(min-width: 900px) 400px, 50vw"
COVER_SIZES = "(min-width: 960px) 720px, 100vw"
BLOCK_SIZES = "(min-width: 900px) 600px, 92vw"

e = html.escape
# Runs before the page shows. "js": scripts work. "mo": gentle movement allowed (not "reduce motion").
# If preview.js has not started within 3 s (blocked or slow), the movement is switched off so everything simply shows.
HEAD_SCRIPT = ('<script>(function(d){d.classList.add("js");var m=window.matchMedia;'
               'if(m&&m("(prefers-reduced-motion: no-preference)").matches)d.classList.add("mo");'
               'setTimeout(function(){if(!window.PREVIEW_READY)d.classList.remove("mo")},3000)})(document.documentElement)</script>')


def fmt_phone(d):
    return "+91 " + d[:5] + " " + d[5:]


_SIZE = {}


def size(name):
    if name not in _SIZE:
        _SIZE[name] = Image.open(os.path.join(IMG, name + ".webp")).size
    return _SIZE[name]


def shape(name):
    w, h = size(name)
    r = w / h
    return "wide" if r >= 1.25 else ("tall" if r < 0.9 else "square")


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def uniq(items):
    out = []
    for x in items:
        if x not in out:
            out.append(x)
    return out


def plural(n, word):
    return f"{n} {word}" + ("" if n == 1 else "s")


def alt_of(name):
    if name.endswith("-sketch"):
        return "Line drawing of the room"
    return PHOTOS.get(name, ("",))[0]


def small(name):
    """Card-size copy (720 px wide) for grids and cards; photos already that small have none."""
    src = os.path.join(IMG, name + ".webp")
    if not os.path.exists(src) or size(name)[0] <= SM_W:
        return
    out = os.path.join(IMG, "sm", name + ".webp")
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
        return
    os.makedirs(os.path.dirname(out), exist_ok=True)
    w, h = size(name)
    im = Image.open(src).convert("RGB").resize((SM_W, round(h * SM_W / w)), Image.LANCZOS)
    im.save(out, "WEBP", quality=80, method=6)


def src_small(name, base):
    return f'{base}assets/img/{"sm/" if size(name)[0] > SM_W else ""}{name}.webp'


def img(name, base, alt=None, cls="", load="lazy", sizes=None):
    """load: "lazy" (default), "high" (first screen) or "low" (needed soon, not urgent).
    With sizes, phones and small tiles get the 720 px copy, big screens the full photo."""
    a = e(alt_of(name) if alt is None else alt)
    how = {"lazy": 'loading="lazy" decoding="async"', "high": 'fetchpriority="high"',
           "low": 'fetchpriority="low" decoding="async"'}[load]
    w, h = size(name)
    c = f' class="{cls}"' if cls else ""
    src = f"{base}assets/img/{name}.webp"
    ss = f' srcset="{base}assets/img/sm/{name}.webp {SM_W}w, {src} {w}w" sizes="{sizes}"' if sizes and w > SM_W else ""
    return f'<img{c} src="{src}"{ss} width="{w}" height="{h}" alt="{a}" {how}>'


def tag(text="Your project here"):
    return f'<span class="yours" aria-hidden="true"><span class="yours-dot"></span>{e(text)}</span>'


def rl(text):
    """Rolling word on hover: the word slides up and an identical copy rolls in from below (the copy is hidden from screen readers)."""
    t = e(text)
    return f'<span class="rl"><span class="rl-a">{t}</span><span class="rl-b" aria-hidden="true">{t}</span></span>'


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


def lower_first(s):
    """'Turnkey projects' -> 'turnkey projects', but 'TV units' and '3D views' stay as they are."""
    return s[0].lower() + s[1:] if len(s) > 1 and s[0].isupper() and not s[1].isupper() else s


def counts(values, order):
    return [(v, values.count(v)) for v in order if v in values]


def prepare(c):
    """Checks every project's photos, gives each project its address (slug) and rooms, and lists every photo once."""
    seen, slugs = set(), set()
    for i, p in enumerate(c["projects"]):
        s = base = slug(p["title"])
        k = 2
        while s in slugs:
            s = f"{base}-{k}"
            k += 1
        slugs.add(s)
        for n in p["photos"]:
            if n not in PHOTOS or not PHOTOS[n][1]:
                sys.exit(f"{c['slug']}: '{n}' is not a project photo in PHOTOS")
            if n in seen:
                sys.exit(f"{c['slug']}: photo '{n}' is used in two projects")
            seen.add(n)
        p.update(i=i, slug=s, cover=p["photos"][0], spaces=uniq([PHOTOS[n][1] for n in p["photos"]]))
    c["gallery"] = [dict(name=n, project=p, space=PHOTOS[n][1]) for p in c["projects"] for n in p["photos"]]


def type_values(c):
    present = {p["type"] for p in c["projects"]}
    wanted = present | set(ENQ[c["kind"]]["types"])
    order = [t for t in TYPE_ORDER if t in wanted] + sorted(wanted - set(TYPE_ORDER))
    return [t for t in order if t in present] + [t for t in order if t not in present]


def space_values(c):
    present = {g["space"] for g in c["gallery"]}
    order = [s for s in SPACE_ORDER if s in present or s in PLAN_SPACES]
    return [s for s in order if s in present] + [s for s in order if s not in present]


# Page addresses. depth = folders below the studio folder.
KINDS = {"home": (0, ""), "projects": (1, "projects/"), "about": (1, "about/"), "contact": (1, "contact/"), "project": (2, None)}


def ctx_for(c, kind, p=None):
    depth, path = KINDS[kind]
    if kind == "project":
        path = f"projects/{p['slug']}/"
    pre = "../" * depth
    url = SITE + c["slug"] + "/" + path
    line = {"home": c["wa_home"], "projects": "I was looking at your projects.",
            "about": "I read about your studio on your website and want to discuss my project.",
            "contact": c["wa_home"]}.get(kind)
    if kind == "project":
        line = f"I liked your project '{p['title']}' ({p['type']}, {c['city']}) and want something similar."
    cur = {"projects": "Projects", "project": "Projects", "about": "About", "contact": "Contact"}.get(kind)
    return dict(kind=kind, pre=pre, home=pre or "./", base="../" * (depth + 1), url=url, wa=wa(c, line, url),
                tel="tel:+91" + c["phone"], cur=cur, p=p)


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
<meta property="og:description" content="Website preview for {e(c["name"])}, {e(c["city"])}.">
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


def body_open(c, ctx, cls):
    """The body carries what the scripts need: WhatsApp number, greeting and this page's address."""
    return (f'<body class="{cls}" data-wa="91{c["phone"]}" data-hello="{e("Hello " + c["short"] + ", ")}" data-page="{e(ctx["url"])}">\n'
            f'<a class="skip" href="#main">Skip to content</a>')


def nav_items(ctx):
    pre = ctx["pre"]
    return [("Projects", pre + "projects/"), ("Services", pre + "#services"), ("Process", pre + "#process"),
            ("About", pre + "about/"), ("Contact", pre + "contact/")]


def nav_links(ctx, roll=True):
    out = ""
    for t, h in nav_items(ctx):
        cur = ' aria-current="page"' if t == ctx["cur"] else ""
        out += f'<a href="{h}"{cur}>{rl(t) if roll else e(t)}</a>'
    return out


def header(c, ctx):
    """Slim header: name, page links (laptops), Call and WhatsApp (tablets and laptops), Menu (phones and tablets)."""
    return f'''<header class="hd">
  <div class="wrap hd-row">
    <a class="hd-name" href="{ctx["home"]}" aria-label="{e(c["name"])}, home">{e(c["short"])}</a>
    <nav class="hd-nav" aria-label="Main">{nav_links(ctx)}</nav>
    <div class="hd-cta"><a class="btn btn-line btn-sm" href="{ctx["tel"]}">{rl("Call")}</a><a class="btn btn-solid btn-sm js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">{rl("WhatsApp")}</a></div>
    <button type="button" class="hd-menu" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
</header>'''


def menu(c, ctx):
    links = ""
    for i, (t, h) in enumerate(nav_items(ctx)):
        cur = ' aria-current="page"' if t == ctx["cur"] else ""
        links += f'<a href="{h}" style="--i:{i}"{cur}>{e(t)}</a>'
    return f'''<div class="mn" id="menu" hidden>
  <nav class="mn-nav" aria-label="Menu">{links}</nav>
  <div class="mn-cta"><a class="btn btn-line" href="{ctx["tel"]}">Call {fmt_phone(c["phone"])}</a><a class="btn btn-solid js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp</a></div>
  <p class="mn-addr">{e(c["address"])}</p>
</div>'''


def pbar(c, ctx):
    """Phones: Call and WhatsApp stay at the bottom of the screen from the first moment."""
    return f'''<div class="pbar" role="region" aria-label="Contact {e(c["short"])}">
  <a class="btn btn-line" href="{ctx["tel"]}">Call</a>
  <a class="btn btn-solid js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">WhatsApp</a>
</div>'''


def owner_note(c):
    return f'''<aside class="owner" data-key="{e(c["slug"])}" hidden aria-labelledby="owner-h">
  <p class="owner-h" id="owner-h">{e(c["short"])}, this is your website preview</p>
  <p>Every photo marked <span class="mini-tag">Your project here</span> gets replaced with your own work, and every line can be changed to your words.</p>
  <p>It goes live within {LIVE_IN} of getting your photos.</p>
  <div class="owner-foot"><span>Made for you by Satyam Choure<br>on {MADE_ON}</span><button type="button" class="btn btn-line btn-sm owner-close">Got it</button></div>
</aside>'''


def footer(c, ctx):
    links = "".join(f'<a href="{h}">{rl(t)}</a>' for t, h in nav_items(ctx))
    visit = f'<a href="{e(maps(c))}" target="_blank" rel="noopener">{e(c["address"])}</a>'
    if c["hours"]:
        visit += f'<span class="muted">{e(c["hours"])}</span>'
    talk = (f'<a class="js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">{rl("WhatsApp")}</a>'
            f'<a href="{ctx["tel"]}">{rl(fmt_phone(c["phone"]))}</a>')
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
    <div class="ft-bot" data-wl><span>&copy; {e(c["name"])}</span><span>Website preview by Satyam Choure</span></div>
  </div>
</footer>'''


def page_end(c, ctx, viewer_items=None):
    v = viewer(viewer_items) if viewer_items else ""
    return f'''{footer(c, ctx)}
{menu(c, ctx)}
{pbar(c, ctx)}
{owner_note(c)}
{v}
<script src="{ctx["base"]}assets/preview.js?v={VER}" defer></script>
</body>
</html>
'''


def viewer(items):
    """Photo viewer: full screen, arrows, swipe, counter, caption, Open project, WhatsApp "I liked this ..."."""
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    return f'''<div class="viewer" role="dialog" aria-modal="true" aria-label="Photo viewer" hidden>
  <div class="vw-top"><span class="vw-count" aria-live="polite"></span><button type="button" class="vw-close">Close</button></div>
  <div class="vw-stage"><figure class="vw-fig"><img class="vw-img" alt="">{tag()}</figure></div>
  <button type="button" class="vw-nav vw-prev" aria-label="Previous photo"><span aria-hidden="true">&larr;</span></button>
  <button type="button" class="vw-nav vw-next" aria-label="Next photo"><span aria-hidden="true">&rarr;</span></button>
  <div class="vw-bot"><p class="vw-cap"></p><div class="vw-act"><a class="btn btn-line-light btn-sm vw-open" href="#">Open project</a><a class="btn btn-solid btn-sm vw-wa" href="#" target="_blank" rel="noopener">I like this photo</a></div></div>
</div>
<script type="application/json" id="photo-data">{data}</script>'''


def photo_item(c, g, base, href):
    """Viewer data for one photo. Its WhatsApp message names the room and the project and links to that exact photo."""
    p, n = g["project"], g["name"]
    share = f'{SITE}{c["slug"]}/projects/{p["slug"]}/?photo={n}'
    return dict(id=n, src=f"{base}assets/img/{n}.webp", alt=alt_of(n), cap=f'{g["space"]} · {p["title"]}, {c["city"]}',
                href=href, wa=wa(c, f"I liked this {lower_first(g['space'])} from '{p['title']}'.", share))


def status_el(c):
    d, o, cl = c["open"]
    return f'<span class="status" data-days="{",".join(map(str, d))}" data-open="{o}" data-close="{cl}" hidden></span>'


def chip_row(key, values, total, label, title=None):
    """Filter chips. values: [(value, count)]. preview.js keeps the counts right as filters combine; 0 = greyed out."""
    head_ = f'<span class="tabs-l" aria-hidden="true">{e(title)}</span>' if title else ""
    out = f'<button type="button" class="tab" data-k="{key}" data-v="all" aria-pressed="true">All <span class="tab-n">{total}</span></button>'
    for v, n in values:
        dis = " disabled" if n == 0 else ""
        out += (f'<button type="button" class="tab" data-k="{key}" data-v="{slug(v)}" aria-pressed="false"{dis}>'
                f'{e(v)} <span class="tab-n">{n}</span></button>')
    return f'<div class="tabs" role="group" aria-label="{e(label)}">{head_}{out}</div>'


def card(c, p, base, href, load="lazy"):
    """Project card: cover photo (its line drawing fades in on hover, laptops), name, type, city and photo count."""
    n = p["cover"]
    k = len(p["photos"])
    spaces = " ".join(slug(s) for s in p["spaces"])
    return f'''
        <article class="pc" data-type="{slug(p["type"])}" data-spaces="{spaces}">
          <a class="pc-a" href="{href}">
            <span class="pc-ph">{img(n, base, alt="", cls="pc-img", load=load, sizes=CARD_SIZES)}<img class="pc-sk" data-src="{src_small(n + "-sketch", base)}" alt="">{tag()}</span>
            <span class="pc-t">{e(p["title"])}</span>
            <span class="pc-m">{e(p["type"])}, {e(c["city"])} &middot; {plural(k, "photo")}</span>
            <span class="pc-go" aria-hidden="true">View project</span>
          </a>
        </article>'''


def lv_row(c, p, base, href):
    k = len(p["photos"])
    spaces = " ".join(slug(s) for s in p["spaces"])
    return f'''
            <li class="lv-row" data-type="{slug(p["type"])}" data-spaces="{spaces}" data-wl><a class="lv-a" href="{href}" data-peek="{src_small(p["cover"], base)}"><span class="lv-t">{e(p["title"])}</span><span class="lv-c">{e(p["type"])}</span><span class="lv-c">{e(c["city"])}</span><span class="lv-c lv-y yours-text">Your number</span><span class="lv-c lv-n">{plural(k, "photo")}</span></a></li>'''


def tile(c, g, base, href):
    """One photo in the projects page Photos view: opens the viewer; the caption links to its project."""
    n, p = g["name"], g["project"]
    return f'''
          <figure class="tile" data-type="{slug(p["type"])}" data-space="{slug(g["space"])}">
            <button type="button" class="ph" data-photo="{e(n)}" aria-label="Open the photo: {e(alt_of(n))}">{img(n, base, alt="", sizes=TILE_SIZES)}{tag()}</button>
            <figcaption class="cap"><span class="cap-t">{e(g["space"])}</span><a class="cap-m" href="{href}">{e(p["title"])}, {e(c["city"])}</a></figcaption>
          </figure>'''


def chips_html(name, values, kind="radio", checked=()):
    return "".join(f'<label class="chip"><input type="{kind}" name="{name}" value="{e(v)}"{" checked" if v in checked else ""}>'
                   f'<span>{e(v)}</span></label>' for v in values)


def enquiry_form(c, ctx, pid, scope_preset=(), type_preset=None):
    """Qualified WhatsApp enquiry: three short steps, mostly taps, with a live preview of the message.
    Opened from a project page, the project's property type and scope are already picked (and can be changed)."""
    o = ENQ[c["kind"]]
    start = o["default"]
    if any(s in o["build"] for s in scope_preset):
        start = "build"
    elif any(s in o["big"] for s in scope_preset):
        start = "big"
    frm = f"'{ctx['p']['title']}' project" if ctx["kind"] == "project" else ""
    area_eg = "Vijay Nagar" if c["city"] == "Indore" else "your area"
    data = json.dumps(dict(budgets=o["budgets"], big=o["big"], build=o["build"], default=o["default"]), ensure_ascii=False)
    types_checked = (type_preset,) if type_preset in o["types"] else ()
    return f'''<form class="enq" id="{pid}-form" data-studio="{e(c["short"])}" data-wa="91{c["phone"]}" data-from="{e(frm)}" data-page="{e(ctx["url"])}" data-opts="{e(data)}" novalidate>
          <ol class="enq-prog" aria-hidden="true"><li class="is-on"><span>1</span> Property</li><li><span>2</span> Project</li><li><span>3</span> You</li></ol>
          <fieldset class="enq-step is-on" data-step="1">
            <legend class="enq-lg">Your property</legend>
            <div class="q"><p class="q-l" id="{pid}-type-l">Property type <span class="req">required</span></p>
              <div class="chips" role="radiogroup" aria-labelledby="{pid}-type-l">{chips_html("type", o["types"], checked=types_checked)}</div></div>
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
    tall = " ba-tall" if shape(name) == "tall" else ""
    return f'''<div class="ba{tall}" style="--pos:50%" data-rv>
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


def proof(c):
    """Google rating, and real review quotes once the studio's list has them."""
    google = f'<a class="link" href="{e(maps(c))}" target="_blank" rel="noopener">Read all reviews on Google</a>'
    if c["quotes"]:
        qs = "".join(f'<figure class="quote"><blockquote><p>&ldquo;{e(q)}&rdquo;</p></blockquote>'
                     f'<figcaption>{e(who)}, {e(when)} &middot; Google review</figcaption></figure>'
                     for q, who, when in c["quotes"])
        return (f'<div class="rating"><div class="quotes">{qs}</div>'
                f'<p>{stars()} {e(c["rating"])} on Google from {c["reviews"]} reviews.</p>{google}</div>')
    return (f'<div class="rating"><p class="rating-n">{e(c["rating"])}<small> / 5</small></p>{stars()}'
            f'<p>Average rating from {c["reviews"]} reviews on Google.</p>{google}</div>')


def founder(c):
    title = "Ar. " if c["kind"] == "arch" else ""
    return (f'<p class="studio-more">{e(c["more"])}</p>'
            f'<p class="studio-story yours-text">Your story goes here: how {e(c["short"])} started, the projects you are proudest of, and how you like to work with clients.</p>'
            f'<p class="sign"><b>{title}<span class="yours-text">Your name</span></b><span>Founder, {e(c["short"])}</span></p>')


def contact_rows(c, ctx):
    visit = f'<a href="{e(maps(c))}" target="_blank" rel="noopener">{e(c["address"])}</a>'
    if c["hours"]:
        visit += f'<span class="muted">{e(c["hours"])}</span>{status_el(c)}'
    rows = (f'<div data-wl><dt>Visit</dt><dd>{visit}</dd></div>'
            f'<div data-wl><dt>WhatsApp</dt><dd><a class="js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">{fmt_phone(c["phone"])}</a></dd></div>'
            f'<div data-wl><dt>Call</dt><dd><a href="{ctx["tel"]}">{fmt_phone(c["phone"])}</a></dd></div>')
    if c["email"]:
        rows += f'<div data-wl><dt>Email</dt><dd><a href="mailto:{e(c["email"])}">{e(c["email"])}</a></dd></div>'
    return f'<dl class="cinfo">{rows}</dl>'


def contact(c, ctx, title, note, pid, preset=(), ptype=None, extra="", h1=False, crumbs=""):
    """Contact details and the WhatsApp enquiry form side by side."""
    h = (f'{crumbs}<h1 class="h1" id="{pid}-contact-h">{e(title)}</h1>' if h1
         else f'<h2 class="h2" id="{pid}-contact-h">{e(title)}</h2>')
    return f'''<section class="sec" id="contact" aria-labelledby="{pid}-contact-h">
    <div class="wrap contact-grid">
      <div class="contact-info" data-rv>
        {h}
        <p class="sec-note">{e(note)}</p>
        {contact_rows(c, ctx)}{extra}
      </div>
      <div class="enq-card" data-rv>
        {enquiry_form(c, ctx, pid, preset, ptype)}
      </div>
    </div>
  </section>'''


def cta_band(c, ctx):
    return f'''<section class="sec cta-band" aria-labelledby="cta-h">
    <div class="wrap cta-row" data-rv>
      <div><h2 class="h2" id="cta-h">Planning your own project?</h2><p class="sec-note">Tell us about it in three short steps, or message the studio straight away.</p></div>
      <div class="cta-btns"><a class="btn btn-solid" href="{ctx["pre"]}contact/">{rl("Tell us about your project")}</a><a class="btn btn-line js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">{rl("WhatsApp")}</a></div>
    </div>
  </section>'''


def crumbs(items):
    """items: [(text, href or None)]; the last one is the current page."""
    out = []
    for i, (t, h) in enumerate(items):
        if i:
            out.append('<span aria-hidden="true">/</span>')
        out.append(f'<a href="{h}">{e(t)}</a>' if h else f'<span aria-current="page">{e(t)}</span>')
    return f'<nav class="crumbs" aria-label="Breadcrumb">{"".join(out)}</nav>'


# ------------------------------------------------------------------------------------------------ homepage

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
        <div class="hero-cta"><a class="btn btn-solid js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">{rl("WhatsApp the studio")}</a><a class="btn btn-line" href="{ctx["tel"]}">{rl("Call " + fmt_phone(c["phone"]))}</a></div>
      </div>
      <dl class="tblock" aria-label="Studio facts">{cells}</dl>
    </div>
  </section>'''


def work(c, ctx):
    """Homepage projects: the six projects as cards (1 big + 2 small, repeating), filtered by property type,
    with quick links into the projects page by room."""
    ps = c["projects"]
    types = counts([p["type"] for p in ps], TYPE_ORDER)
    cards = "".join(card(c, p, ctx["base"], f'projects/{p["slug"]}/', load="low" if i < 3 else "lazy") for i, p in enumerate(ps))
    rooms = counts([g["space"] for g in c["gallery"]], SPACE_ORDER)
    room_links = "".join(f'<a class="tab" href="projects/?view=photos&amp;space={slug(s)}">{e(ROOM_PLURAL[s])} <span class="tab-n">{n}</span></a>'
                         for s, n in rooms)
    return f'''<section class="sec work" id="work" aria-labelledby="work-h">
    <div class="wrap" data-gal>
      <div class="sec-head sec-head-row" data-rv>
        <div><h2 class="h2" id="work-h">Projects</h2><p class="sec-note">{len(ps)} projects, sorted by property type. Open one to see all its photos, room by room.</p></div>
        <a class="link" href="projects/" data-all="projects/">All projects</a>
      </div>
      {chip_row("type", types, len(ps), "Show projects of type")}
      <div class="cards">{cards}
      </div>
      <div class="rooms" data-rv><p class="rooms-l">Or browse every photo by room</p><div class="tabs tabs-links">{room_links}</div></div>
      <p class="gal-note">Every photo marked <span class="mini-tag">Your project here</span> is where your own work goes.</p>
    </div>
  </section>'''


def services(c, ctx):
    lst = ARCH_SERVICES if c["kind"] == "arch" else FURN_SERVICES
    items = ""
    for n, d in lst:
        link = wa(c, "I'm interested in " + lower_first(n) + ".", ctx["url"] + "#services")
        items += (f'<li data-wl><h3 class="svc-t">{e(n)}</h3><p class="svc-d">{e(d)}</p>'
                  f'<a class="svc-ask" href="{e(link)}" target="_blank" rel="noopener">Ask about {e(lower_first(n))}</a></li>')
    return f'''<section class="sec" id="services" aria-labelledby="services-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="services-h">What we do</h2><p class="sec-note yours-text">Your exact list of services goes here.</p></div>
      <ol class="svc">{items}</ol>
    </div>
  </section>'''


def process(c, ctx):
    arch = c["kind"] == "arch"
    steps = ARCH_STEPS if arch else FURN_STEPS
    items = "".join(f'<li class="step"><span class="step-n">Step {i + 1}</span><h3 class="step-t">{e(t)}</h3>'
                    f'<p class="step-d">{e(d)}</p><p class="step-get"><b>You get:</b> {e(get)}</p>'
                    f'<p class="step-time">Time: <span class="yours-text">Your timeline</span></p></li>'
                    for i, (t, d, get) in enumerate(steps))
    title = "How a project runs" if arch else "How your furniture gets made"
    note = ("Five steps from the first site visit to the day you move in." if arch
            else "Five steps from measuring your home to the day it is fitted.")
    book = ("Book step 1: site visit", "I'd like to book step 1, the site visit.") if arch else \
           ("Book step 1: measurement at your home", "I'd like to book step 1, the measurement at my home.")
    return f'''<section class="sec sec-tint" id="process" aria-labelledby="process-h">
    <div class="wrap">
      <div class="sec-head" data-rv><h2 class="h2" id="process-h">{e(title)}</h2><p class="sec-note">{e(note)}</p></div>
      <div class="steps-wrap" data-fill>
        <span class="steps-line" aria-hidden="true"><span></span></span>
        <ol class="steps" data-rv-kids>{items}</ol>
      </div>
      <div class="steps-foot" data-rv><a class="btn btn-solid" href="{e(wa(c, book[1], ctx["url"] + "#process"))}" target="_blank" rel="noopener">{rl(book[0])}</a></div>
    </div>
  </section>'''


def studio(c, ctx):
    """The person behind the studio, and what Google reviewers say."""
    return f'''<section class="sec" id="studio" aria-labelledby="studio-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="studio-h">The person behind {e(c["short"])}</h2></div>
      <div class="studio-body" data-rv>
        <div>{founder(c)}<p class="studio-link"><a class="link" href="about/">More about {e(c["short"])}</a></p></div>
        {proof(c)}
      </div>
    </div>
  </section>'''


def page(c):
    ctx = ctx_for(c, "home")
    rated = f"Rated {c['rating']} on Google from {c['reviews']} reviews."
    title = "Tell us about your home" if c["kind"] == "furn" else "Tell us about your project"
    return head(c, ctx, f'{c["name"]}, {c["city"]}', f'{c["what"]} {rated}') + f'''
{body_open(c, ctx, "home")}
{header(c, ctx)}
<main id="main">
  {hero(c, ctx)}

  {work(c, ctx)}

  {services(c, ctx)}

  {process(c, ctx)}

  {studio(c, ctx)}

  {contact(c, ctx, title, "Three short steps, mostly taps. WhatsApp then opens with your message ready to send.", "c")}
</main>
''' + page_end(c, ctx)


# ------------------------------------------------------------------------------------------------ projects page

def projects_page(c):
    """All projects. Two filters that combine (property type and room), counts on every chip, chips with nothing to show
    greyed out, Projects or Photos view, Grid or List layout, 12 photos at a time. The link keeps the filters."""
    ctx = ctx_for(c, "projects")
    base = ctx["base"]
    ps, g = c["projects"], c["gallery"]
    tvals = [(t, sum(p["type"] == t for p in ps)) for t in type_values(c)]
    svals = [(s, sum(s in p["spaces"] for p in ps)) for s in space_values(c)]
    cards = "".join(card(c, p, base, f'{p["slug"]}/', load="low" if i < 3 else "lazy") for i, p in enumerate(ps))
    rows = "".join(lv_row(c, p, base, f'{p["slug"]}/') for p in ps)
    tiles = "".join(tile(c, x, base, f'{x["project"]["slug"]}/') for x in g)
    items = [photo_item(c, x, base, f'{x["project"]["slug"]}/') for x in g]
    return head(c, ctx, f'Projects | {c["name"]}', f'All projects by {c["name"]}, {c["city"]}.') + f'''
{body_open(c, ctx, "projects-page")}
{header(c, ctx)}
<main id="main">
  <section class="sec pj-top" aria-labelledby="pj-h">
    <div class="wrap">
      {crumbs([("Home", "../"), ("Projects", None)])}
      <h1 class="h1" id="pj-h">Projects</h1>
      <p class="sec-note">{plural(len(ps), "project")} and {plural(len(g), "photo")}. Filter by property and room: the page link keeps your filters, so a filtered list can be shared on WhatsApp.</p>
    </div>
  </section>
  <div class="pj" data-gal data-url data-step="12">
    <div class="fbar">
      <div class="wrap">
        {chip_row("type", tvals, len(ps), "Property type", "Property")}
        {chip_row("space", svals, len(ps), "Room", "Room")}
      </div>
    </div>
    <section class="sec pj-body" aria-label="Projects and photos">
      <div class="wrap">
        <div class="pj-bar">
          <div class="seg" role="group" aria-label="Show"><button type="button" data-view="projects" aria-pressed="true">Projects <span class="seg-n">{len(ps)}</span></button><button type="button" data-view="photos" aria-pressed="false">Photos <span class="seg-n">{len(g)}</span></button></div>
          <p class="pj-status" role="status">Showing all {plural(len(ps), "project")}</p>
          <button type="button" class="pj-clear" hidden>Clear filters</button>
          <div class="seg seg-sm" role="group" aria-label="Layout" data-layouts><button type="button" data-layout="grid" aria-pressed="true">Grid</button><button type="button" data-layout="list" aria-pressed="false">List</button></div>
        </div>
        <div class="pj-view" data-panel="projects">
          <div class="cards">{cards}
          </div>
          <div class="lv" hidden>
            <div class="lv-main">
              <div class="lv-head" aria-hidden="true"><span>Project</span><span>Type</span><span>City</span><span>Year</span><span>Photos</span></div>
              <ul class="lv-list">{rows}
              </ul>
            </div>
            <div class="lv-peek" aria-hidden="true"><img alt="" src="{src_small(ps[0]["cover"], base)}">{tag()}</div>
          </div>
        </div>
        <div class="pj-view" data-panel="photos" hidden>
          <div class="grid">{tiles}
          </div>
          <div class="more-row"><button type="button" class="btn btn-line pj-more" hidden>Show more</button></div>
        </div>
        <div class="pj-empty" hidden><p>Nothing matches these filters yet.</p><button type="button" class="btn btn-line pj-clear">Clear filters</button></div>
        <p class="gal-note">Every photo marked <span class="mini-tag">Your project here</span> is where your own work goes.</p>
      </div>
    </section>
  </div>

  {cta_band(c, ctx)}
</main>
''' + page_end(c, ctx, items)


# ------------------------------------------------------------------------------------------------ project pages

def figure(n, base, cls="b", style="", sizes=BLOCK_SIZES):
    st = f' style="{style}"' if style else ""
    return f'''
            <figure class="{cls}"{st}>
              <button type="button" class="ph" data-photo="{e(n)}" aria-label="Open the photo: {e(alt_of(n))}">{img(n, base, alt="", sizes=sizes)}{tag()}</button>
              <figcaption class="b-cap">{e(alt_of(n))}</figcaption>
            </figure>'''


def blocks(names, base):
    """Fixed block shapes on a 12-column grid, so 2 photos or 20 look equally neat: photos go in pairs (two wide photos
    side by side, or an uneven pair when one is upright, with matching heights) and a photo left over never fills the width."""
    out, i = [], 0
    while i < len(names):
        if i + 1 < len(names):
            pair = names[i:i + 2]
            tall = [shape(n) == "tall" for n in pair]
            if tall[0] != tall[1]:
                spec = [(n, 4, "4 / 5") if t else (n, 8, "16 / 10") for n, t in zip(pair, tall)]
            elif tall[0]:
                spec = [(n, 4, "4 / 5") for n in pair]
            else:
                spec = [(n, 6, "3 / 2") for n in pair]
            solo = False
            i += 2
        else:
            n = names[i]
            spec = [(n, 4, "4 / 5") if shape(n) == "tall" else (n, 6, "3 / 2")]
            solo = True
            i += 1
        for n, span, ar in spec:
            out.append(figure(n, base, f'b is-{shape(n)}' + (" b-solo" if solo else ""), f"--span:{span};--ar:{ar}"))
    return "".join(out)


def chapters(p, base):
    """The project's photos after the cover, in chapters, one per room. Rooms with several photos come first, in fixed
    block shapes; rooms with a single photo sit side by side (three to a row on laptops), so a small project never
    turns into a column of lonely photos. Returns the rooms in page order, the photos in page order and the HTML."""
    groups = {}
    for n in p["photos"][1:]:
        groups.setdefault(PHOTOS[n][1], []).append(n)
    multi = [(s, v) for s, v in groups.items() if len(v) > 1]
    single = [(s, v[0]) for s, v in groups.items() if len(v) == 1]
    html_ = ""
    for space, names in multi:
        sid = "room-" + slug(space)
        html_ += f'''
        <section class="chap" id="{sid}" aria-labelledby="{sid}-h">
          <div class="chap-h" data-wl><h3 id="{sid}-h">{e(space)}</h3><p>{plural(len(names), "photo")}</p></div>
          <div class="blocks">{blocks(names, base)}
          </div>
        </section>'''
    for i in range(0, len(single), 3):
        cells = ""
        for space, n in single[i:i + 3]:
            sid = "room-" + slug(space)
            cells += f'''
          <section class="mini" id="{sid}" aria-labelledby="{sid}-h">
            <div class="chap-h" data-wl><h3 id="{sid}-h">{e(space)}</h3><p>1 photo</p></div>{figure(n, base, sizes=TILE_SIZES)}
          </section>'''
        html_ += f'''
        <div class="minis">{cells}
        </div>'''
    rooms = [(s, len(v)) for s, v in multi] + [(s, 1) for s, _ in single]
    order = [n for _, v in multi for n in v] + [n for _, n in single]
    return rooms, order, html_


def project_page(c, p):
    ctx = ctx_for(c, "project", p)
    base = ctx["base"]
    n0 = p["cover"]
    ps = c["projects"]
    nxt = ps[(p["i"] + 1) % len(ps)]
    yc = ' class="yours-text"'
    facts = [("Location", e(c["city"]), False), ("Property type", e(p["type"]), False), ("What we did", e(p["did"]), False),
             ("Area", "Your number", True), ("Year", "Your number", True), ("Time taken", "Your number", True)]
    dl = "".join(f'<div><dt>{t}</dt><dd{yc if y else ""}>{v}</dd></div>' for t, v, y in facts)
    story = [("The brief", "What the client asked for, the budget and the deadline."),
             ("The design", "The idea that solved the site: layout, light and materials."),
             ("The result", "How the family uses the space today, and what they said at handover.")]
    story_html = "".join(f'''
          <details class="acc" name="story" data-wl{" open" if i == 0 else ""}><summary><span>{t}</span><span class="acc-ic" aria-hidden="true"></span></summary>
            <div class="acc-body"><p>{d} <span class="yours-text">Your words go here.</span></p></div></details>'''
                         for i, (t, d) in enumerate(story))
    rooms, order, chap_html = chapters(p, base)
    jump = ""
    if len(rooms) > 1:
        jump = ('<nav class="tabs jump" aria-label="Rooms in this project"><span class="tabs-l" aria-hidden="true">Jump to</span>'
                + "".join(f'<a class="tab" href="#room-{slug(s)}">{e(s)} <span class="tab-n">{k}</span></a>' for s, k in rooms)
                + "</nav>")
    photos_sec = ""
    if rooms:
        photos_sec = f'''
  <section class="sec p-photos" id="photos" aria-labelledby="photos-h">
    <div class="wrap">
      <div class="sec-head" data-rv><h2 class="h2" id="photos-h">Photos</h2><p class="sec-note">{plural(len(p["photos"]), "photo")}, sorted by room. Tap any photo to see it full size.</p></div>
      {jump}
      <div class="chaps">{chap_html}
      </div>
    </div>
  </section>'''
    cover_cls = " is-tall" if shape(n0) == "tall" else ""
    more = '<p class="p-more"><a class="link" href="../">See all projects</a></p>'
    k = len(nxt["photos"])
    items = [photo_item(c, g, base, "") for g in c["gallery"] if g["project"] is p]
    # Viewer order follows the page: the cover first, then the rooms in order.
    order = [n0] + order
    items.sort(key=lambda it: order.index(it["id"]))
    return head(c, ctx, f'{p["title"]} | {c["name"]}', f'{p["title"]}: {p["type"]} in {c["city"]} by {c["name"]}.') + f'''
{body_open(c, ctx, "project-page")}
{header(c, ctx)}
<main id="main">
  <section class="sec p-hero" aria-labelledby="p-title">
    <div class="wrap">
      {crumbs([("Home", "../../"), ("Projects", "../"), (p["title"], None)])}
      <div class="p-hero-grid">
        <div class="p-hero-title">
          <h1 class="h1" id="p-title">{e(p["title"])}</h1>
          <p class="p-sub">{e(p["type"])}, {e(c["city"])}</p>
        </div>
        <div class="p-hero-ph{cover_cls}"><button type="button" class="ph wipe" data-photo="{e(n0)}" aria-label="Open the photo: {e(alt_of(n0))}">{img(n0, base, alt="", load="high", sizes=COVER_SIZES)}{tag()}</button></div>
        <div class="p-hero-facts">
          <dl class="tblock tblock-p" aria-label="Project facts">{dl}</dl>
          <div class="p-cta"><a class="btn btn-solid" href="#contact">{rl("Ask about this project")}</a><a class="btn btn-line js-wa" href="{e(ctx["wa"])}" target="_blank" rel="noopener">{rl("WhatsApp")}</a></div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec p-story" aria-labelledby="story-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="story-h">The story</h2><p class="sec-note yours-text">Your project story goes here, in your own words.</p></div>
      <div class="accs">{story_html}
      </div>
    </div>
  </section>
{photos_sec}

  <section class="sec p-compare" aria-labelledby="compare-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="compare-h">Drawing vs finished</h2><p class="sec-note">The plan and the finished room in one frame. Drag the line to compare.</p></div>
      {ba_block(n0, base)}
    </div>
  </section>

  {contact(c, ctx, "Want something similar?", "The form already knows which project you were looking at. Change anything you like.", "s", p["scope"], p["type"], more)}

  <section class="sec nextp" aria-label="Next project">
    <div class="wrap">
      <a class="np" href="../{nxt["slug"]}/">
        <span class="np-txt"><span class="np-l">Next project</span><span class="np-t">{e(nxt["title"])}</span><span class="np-m">{e(nxt["type"])}, {e(c["city"])} &middot; {plural(k, "photo")}</span><span class="np-go">{rl("View project")}</span></span>
        <span class="np-ph">{img(nxt["cover"], base, alt="", sizes=TILE_SIZES)}{tag()}</span>
      </a>
    </div>
  </section>
</main>
''' + page_end(c, ctx, items)


def old_project_page(c):
    """The single sample project page used to live at project/. Old links now open the first project."""
    first = c["projects"][0]["slug"]
    target = f"../projects/{first}/"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>{e(c["name"])}</title>
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{SITE}{c["slug"]}/projects/{first}/">
<script>location.replace("{target}" + location.search + location.hash)</script>
</head>
<body><p><a href="{target}">Open the project page</a></p></body>
</html>
'''


# ------------------------------------------------------------------------------------------------ about and contact

def about_page(c):
    ctx = ctx_for(c, "about")
    status = ""
    if c["hours"]:
        status = f'<p class="ab-hours">{e(c["hours"])}{status_el(c)}</p>'
    return head(c, ctx, f'About | {c["name"]}', f'About {c["name"]}, {c["city"]}.') + f'''
{body_open(c, ctx, "about-page")}
{header(c, ctx)}
<main id="main">
  <section class="sec ab-top" aria-labelledby="ab-h">
    <div class="wrap">
      {crumbs([("Home", "../"), ("About", None)])}
      <p class="eyebrow">{e(c["label"])}, {e(c["city"])}</p>
      <h1 class="h1" id="ab-h">About {e(c["short"])}</h1>
      <p class="ab-lead">{e(c["say"])}</p>
    </div>
  </section>

  <section class="sec" aria-labelledby="ab-person-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="ab-person-h">The person behind {e(c["short"])}</h2></div>
      <div class="ab-body" data-rv>{founder(c)}</div>
    </div>
  </section>

  <section class="sec" aria-labelledby="ab-rev-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="ab-rev-h">What clients say</h2><p class="sec-note">From the studio's Google listing.</p></div>
      <div class="ab-proof" data-rv>{proof(c)}</div>
    </div>
  </section>

  <section class="sec" aria-labelledby="ab-visit-h">
    <div class="wrap split">
      <div class="sec-head" data-rv><h2 class="h2" id="ab-visit-h">Visit the studio</h2>{status}</div>
      <div data-rv>{contact_rows(c, ctx)}<p class="p-more"><a class="link" href="{e(maps(c))}" target="_blank" rel="noopener">Open in Google Maps</a></p></div>
    </div>
  </section>

  {cta_band(c, ctx)}
</main>
''' + page_end(c, ctx)


def contact_page(c):
    ctx = ctx_for(c, "contact")
    title = "Tell us about your home" if c["kind"] == "furn" else "Tell us about your project"
    maps_link = f'<p class="p-more"><a class="link" href="{e(maps(c))}" target="_blank" rel="noopener">Open in Google Maps</a></p>'
    return head(c, ctx, f'Contact | {c["name"]}', f'Contact {c["name"]}, {c["city"]}: WhatsApp, call or visit.') + f'''
{body_open(c, ctx, "contact-page")}
{header(c, ctx)}
<main id="main">
  {contact(c, ctx, title, "Three short steps, mostly taps. WhatsApp then opens with your message ready to send. Or call, or visit the studio.", "k", extra=maps_link, h1=True, crumbs=crumbs([("Home", "../"), ("Contact", None)]))}
</main>
''' + page_end(c, ctx)


# ------------------------------------------------------------------------------------------------ WhatsApp link card

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
    d.text((62, th - 34), f"Website preview, {c['city']}", font=font("mona-sans.woff2", 26), fill=(214, 212, 206), anchor="ls")
    im.save(os.path.join(ROOT, c["slug"], "og.jpg"), quality=84, optimize=True, progressive=True)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


if __name__ == "__main__":
    write_og = "--og" in sys.argv  # og.jpg only changes when a hero photo or name changes
    for n in PHOTOS:
        if PHOTOS[n][1]:  # project photos only
            small(n)
            small(n + "-sketch")
    for c in CLIENTS:
        prepare(c)
        folder = os.path.join(ROOT, c["slug"])
        write(os.path.join(folder, "index.html"), page(c))
        write(os.path.join(folder, "projects", "index.html"), projects_page(c))
        for p in c["projects"]:
            write(os.path.join(folder, "projects", p["slug"], "index.html"), project_page(c, p))
        write(os.path.join(folder, "about", "index.html"), about_page(c))
        write(os.path.join(folder, "contact", "index.html"), contact_page(c))
        write(os.path.join(folder, "project", "index.html"), old_project_page(c))
        if write_og or not os.path.exists(os.path.join(folder, "og.jpg")):
            og(c)
        print("built", c["slug"], "-", len(c["projects"]), "project pages,", len(c["gallery"]), "photos")
