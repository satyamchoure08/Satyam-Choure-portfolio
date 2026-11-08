"""Builds one homepage preview per client into previews/<slug>/index.html.

Run from anywhere:  python3 previews/_build/build.py
Edit CLIENTS below to add a client or change text, then run it again.
Shared look and behaviour live in previews/assets/ (preview.css, preview.js, fonts, img).
Jekyll does not publish folders that start with "_", so this script stays private to the repo.
"""
import html, os
from urllib.parse import quote
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # previews/
SITE = "https://satyamchoure08.github.io/Satyam-Choure-portfolio/previews/"

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
ARCH_SPACES = ["New house", "Flat interior", "Villa", "Office or shop", "Renovation", "Something else"]
ARCH_BUDGETS = ["Under ₹10 lakh", "₹10–25 lakh", "₹25–50 lakh", "Above ₹50 lakh", "Not sure yet"]
FURN_SPACES = ["Modular kitchen", "Wardrobe", "Furniture for the whole home", "Office or shop", "Something else"]
FURN_BUDGETS = ["Under ₹1 lakh", "₹1–3 lakh", "₹3–6 lakh", "Above ₹6 lakh", "Not sure yet"]

CLIENTS = [
    dict(slug="habitat-interior", name="Habitat Interior and Architect", short="Habitat", hero_name="Habitat",
         city="Indore", what="Interiors and architecture in Indore.", accent="#7E4E30",
         phone="8889832888", rating="4.8", reviews=114, place="ChIJgyY1bBH9YjkRCynIBkl3Kdc",
         address="27, Shanti Nagar Road, Indore", hours=None, email=None,
         hero=("full", "living-atrium", "Open-plan living room with a double-height window"),
         say="A home should feel calm on an ordinary weekday, not only on the day it is photographed.",
         more="Interiors and architecture in Indore, planned around how your family actually uses each room.",
         work=[("living-styled", "Living room"), ("bedroom", "Bedroom"), ("kitchen-island", "Kitchen")],
         steps=ARCH_STEPS, shots=["house-dusk", "drawing", "villa-day", "living-bright"], kind="arch"),
    dict(slug="adhira-home-decor", name="Adhira Home Decor & uPVC Furniture", short="Adhira", hero_name="Adhira Home Decor",
         city="Indore", what="uPVC kitchens, wardrobes and furniture in Indore.", accent="#3E5A52",
         phone="6264434866", rating="4.5", reviews=41, place="ChIJSxwRBe4-lksRARPtMKoBOj8",
         address="Shop 1, Makwana Complex, Indore", hours=None, email=None,
         hero=("split", "kitchen-island", "White kitchen with an island and pendant lights"),
         say="Kitchens and wardrobes that stay straight through every monsoon.",
         more="uPVC doesn't swell with water, doesn't attract termites and wipes clean. We make kitchens, wardrobes and furniture in it, measured for your home.",
         work=[("bedroom", "Bedroom and wardrobe"), ("living-styled", "Living room"), ("living-bright", "Living and storage")],
         steps=FURN_STEPS, shots=["drawing", "living-atrium", "kitchen-island", "house-dusk"], kind="furn"),
    dict(slug="skript-architect-studio", name="SKript Architect Studio", short="SKript", hero_name="SKript Architect Studio",
         city="Gwalior", what="Architecture and interiors in Gwalior.", accent="#34405E",
         phone="7869484497", rating="4.9", reviews=167, place="ChIJbYyFrRjEdjkRlpY4b1zu_-c",
         address="H.No. I-13, behind Hotel Central Park, City Center, Patel Nagar, Gwalior 474011",
         hours="Monday to Saturday, 10 am to 7 pm", email="architect.kas@gmail.com",
         hero=("split", "house-dusk", "Modern house lit up at dusk"),
         say="Good architecture starts with the site: where the sun rises, where the breeze comes from, and how you want to live.",
         more="Houses and interiors in Gwalior, designed with you and followed through on site until the work is done.",
         work=[("villa-day", "House, front elevation"), ("living-styled", "Living room"), ("villa-pool", "Pool and terrace")],
         steps=ARCH_STEPS, shots=["villa-terrace", "drawing", "kitchen-island", "bedroom"], kind="arch"),
    dict(slug="hauss-studio", name="Hauss Studio Architects & Interior Designers", short="Hauss Studio", hero_name="Hauss Studio",
         city="Ludhiana", what="Architects and interior designers in Ludhiana, working on projects across India.", accent="#7A3B2E",
         phone="7973238073", rating="5.0", reviews=116, place="ChIJQ4oycNGFGjkRRWG1JcxDwC0",
         address="S City Road, Ayali Khurd, Ludhiana", hours="Monday to Saturday, 10 am to 6:30 pm", email="hauss.studio9@gmail.com",
         hero=("split flip", "villa-pool", "White villa with a long pool"),
         say="Every project begins with your brief and ends with a space that feels like it was always yours.",
         more="Architecture and interiors from Ludhiana, for homes and workplaces across India.",
         work=[("living-atrium", "Living room"), ("bedroom", "Bedroom"), ("house-dusk", "House at dusk")],
         steps=ARCH_STEPS, shots=["villa-day", "drawing", "kitchen-island", "living-styled"], kind="arch"),
    dict(slug="ra3designs", name="Ra3Designs", short="Ra3Designs", hero_name="Ra3Designs",
         city="Sonipat", what="Architects in Sonipat.", accent="#6E5628",
         phone="9729073147", rating="4.9", reviews=229, place="ChIJD3J_-DmwDTkReQmeGO-EaFU",
         address="Sector 12, near Gateway International School, Sonipat", hours=None, email=None,
         hero=("full", "villa-day", "Modern white villa with a pool"),
         say="Buildings that look as good in ten years as they do on the first day.",
         more="Architecture for homes and workplaces in Sonipat, planned around light, fresh air and a budget agreed before work starts.",
         work=[("house-dusk", "House at dusk"), ("kitchen-island", "Kitchen"), ("villa-terrace", "Terrace and pool")],
         steps=ARCH_STEPS, shots=["villa-pool", "drawing", "living-bright", "living-atrium"], kind="arch"),
    dict(slug="yashraj-architects", name="Yashraj Architects & Interiors", short="Yashraj", hero_name="Yashraj Architects & Interiors",
         city="Khandwa", what="Architecture and interiors in Khandwa.", accent="#4F5530",
         phone="9414965368", rating="5.0", reviews=86, place="ChIJCyHwbd4b2DsR_SQRKi8DurA",
         address="Murlidhar Business Park, above Zudio, Khandwa", hours=None, email=None,
         hero=("split", "living-styled", "Bright living room with a gallery wall"),
         say="Rooms planned around the people who live in them, finished in materials that age well.",
         more="Architecture and interiors in Khandwa, from the floor plan to the last light fitting.",
         work=[("house-dusk", "House at dusk"), ("bedroom", "Bedroom"), ("living-atrium", "Living room")],
         steps=ARCH_STEPS, shots=["villa-day", "drawing", "kitchen-island", "living-bright"], kind="arch"),
]

ALT = {
    "living-atrium": "Open-plan living room with a double-height window",
    "bedroom": "Bedroom with an upholstered bed and dark walls",
    "kitchen-island": "White kitchen with an island and pendant lights",
    "house-dusk": "Modern house lit up at dusk",
    "villa-pool": "White villa with a long pool",
    "villa-day": "Modern white villa with a pool",
    "living-styled": "Bright living room with a gallery wall",
    "living-bright": "Living room with a sofa and round coffee table",
    "drawing": "Hands drawing a floor plan on paper",
    "villa-terrace": "Villa terrace beside a pool",
}

CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.6a8 8 0 0 1-11.7 7.1L4 20l1.3-4.1A8 8 0 1 1 20 11.6Z"/><path d="M9.2 9.3c.3 1.9 1.6 3.7 3.6 4.6l1.3-1 1.7.8"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.3 5.3l1.2-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/></svg>'

e = html.escape


def fmt_phone(d):
    return "+91 " + d[:5] + " " + d[5:]


def img(name, alt=None, eager=False, sizes="100vw"):
    a = e(alt or ALT[name])
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    w, h = Image.open(os.path.join(ROOT, "assets", "img", name + ".webp")).size
    return f'<img src="../assets/img/{name}.webp" width="{w}" height="{h}" alt="{a}" {load}>'


def page(c):
    wa = "91" + c["phone"]
    wa_hello = "https://wa.me/" + wa + "?text=" + quote(f"Hello {c['short']}, I found your website and would like to talk about a project.")
    tel = "tel:+91" + c["phone"]
    maps = "https://www.google.com/maps/search/?api=1&query=" + quote(c["name"] + ", " + c["city"]) + "&query_place_id=" + c["place"]
    variant, hero_img, hero_alt = c["hero"]
    url = SITE + c["slug"] + "/"
    spaces = FURN_SPACES if c["kind"] == "furn" else ARCH_SPACES
    budgets = FURN_BUDGETS if c["kind"] == "furn" else ARCH_BUDGETS
    rated = f"Rated {c['rating']} on Google from {c['reviews']} reviews."

    hero_copy = f'''<div class="hero-copy">
        <h1>{e(c["hero_name"])}</h1>
        <p class="what">{e(c["what"])}</p>
        <p class="rated">{e(rated)}</p>
        <div class="actions">
          <a class="btn btn-solid" href="{e(wa_hello)}" target="_blank" rel="noopener">{CHAT}WhatsApp the studio</a>
          <a class="btn btn-line" href="{tel}">{PHONE}Call {fmt_phone(c["phone"])}</a>
        </div>
      </div>'''
    if variant.startswith("full"):
        hero = f'''<section class="hero hero-full" aria-label="Introduction">
    <div class="hero-img">{img(hero_img, hero_alt, eager=True)}</div>
    <div class="wrap">{hero_copy}</div>
  </section>'''
    else:
        flip = " flip" if "flip" in variant else ""
        order = (f'<div class="hero-img">{img(hero_img, hero_alt, eager=True)}</div>{hero_copy}' if flip else f'{hero_copy}<div class="hero-img">{img(hero_img, hero_alt, eager=True)}</div>')
        hero = f'''<section class="hero hero-split{flip}" aria-label="Introduction">
    <div class="wrap">{order}</div>
  </section>'''

    frames = ""
    for (name, cap), cls in zip(c["work"], ["f-large", "f-tall", "f-wide"]):
        frames += f'''
      <figure class="frame {cls}"><div class="ph">{img(name)}</div><figcaption><span>{e(cap)}</span><span>Sample photo</span></figcaption></figure>'''

    stage = "".join(img(s) for s in c["shots"])
    steps = ""
    for i, ((h, p), s) in enumerate(zip(c["steps"], c["shots"]), 1):
        steps += f'''
          <li class="step"><span class="num">{i}</span><h3>{e(h)}</h3><p>{e(p)}</p><div class="inline-ph">{img(s)}</div></li>'''

    reach = f'''<p class="label">WhatsApp or call</p><a href="{tel}">{fmt_phone(c["phone"])}</a>'''
    if c["email"]:
        reach += f'''<p class="label">Email</p><a href="mailto:{e(c["email"])}">{e(c["email"])}</a>'''
    reach += f'''<p class="label">Studio</p><a href="{e(maps)}" target="_blank" rel="noopener">{e(c["address"])}</a>'''
    if c["hours"]:
        reach += f'''<p class="label">Open</p><span>{e(c["hours"])}</span>'''

    foot_hours = f'<p class="muted">{e(c["hours"])}</p>' if c["hours"] else ""
    foot_email = f'<p><a href="mailto:{e(c["email"])}">{e(c["email"])}</a></p>' if c["email"] else ""
    space_opts = "".join(f"<option>{e(s)}</option>" for s in spaces)
    budget_opts = "".join(f"<option>{e(b)}</option>" for b in budgets)
    process_title = "How your furniture gets made" if c["kind"] == "furn" else "How a project runs"
    process_note = "Four steps from the first visit to the day it is ready." if c["kind"] == "furn" else "Four steps from the first site visit to the day you move in."
    form_title = "Tell us about your home" if c["kind"] == "furn" else "Tell us about your project"

    return f'''<!doctype html>
<html lang="en" style="--accent:{c["accent"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{e(c["name"])}, {e(c["city"])}</title>
<meta name="description" content="{e(c["what"])} {e(rated)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(c["name"])}">
<meta property="og:description" content="Homepage preview for {e(c["name"])}, {e(c["city"])}.">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{url}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="theme-color" content="#E8E6E1">
<link rel="preload" href="../assets/fonts/newsreader-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../assets/preview.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="notice" role="note"><div class="wrap"><span>Free homepage preview for {e(c["name"])}, made by <a href="../../">Satyam Choure</a>.</span><span class="notice-more">Photos and text are samples. Your own projects and words replace them.</span></div></div>
<header class="site-head">
  <div class="wrap">
    <a class="mark" href="#main">{e(c["short"])}</a>
    <nav class="nav" aria-label="Main">
      <a class="hide-sm" href="#work">Work</a>
      <a class="hide-sm" href="#process">Process</a>
      <a class="hide-sm" href="#contact">Contact</a>
      <a class="btn btn-solid" href="{e(wa_hello)}" target="_blank" rel="noopener">{CHAT}WhatsApp</a>
    </nav>
  </div>
</header>
<main id="main">
  {hero}

  <section class="intro" aria-label="About the studio">
    <div class="wrap">
      <p class="say">{e(c["say"])}</p>
      <p class="more">{e(c["more"])}</p>
    </div>
  </section>

  <section class="work" id="work" aria-labelledby="work-h">
    <div class="wrap">
      <div class="section-head"><h2 id="work-h">Selected work</h2><p>These are sample photos for the preview. Your own finished projects go here.</p></div>
      <div class="frames">{frames}
      </div>
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

  <section class="proof" aria-labelledby="proof-h">
    <div class="wrap">
      <p class="score" id="proof-h">{e(c["rating"])}<small>/5</small></p>
      <p class="said">Average rating from {c["reviews"]} reviews on Google.<br><a href="{e(maps)}" target="_blank" rel="noopener">Read the reviews on Google Maps</a></p>
    </div>
  </section>

  <section class="contact" id="contact" aria-labelledby="contact-h">
    <div class="wrap">
      <div>
        <h2 id="contact-h">{form_title}</h2>
        <p class="lead">Fill this in and it opens WhatsApp with your message ready to send to the studio.</p>
        <div class="reach">{reach}</div>
      </div>
      <form class="enquiry" data-wa="{wa}" data-studio="{e(c["short"])}" novalidate>
        <div class="two">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="f-area">Area or locality</label><input id="f-area" name="area" autocomplete="address-level2" placeholder="e.g. {e("Vijay Nagar" if c["city"] == "Indore" else c["city"])}"></div>
        </div>
        <div class="two">
          <div class="field"><label for="f-space">What are you planning?</label><select id="f-space" name="space"><option value="">Choose one</option>{space_opts}</select></div>
          <div class="field"><label for="f-budget">Budget</label><select id="f-budget" name="budget"><option value="">Choose one</option>{budget_opts}</select></div>
        </div>
        <div class="field"><label for="f-msg">Anything else (optional)</label><textarea id="f-msg" name="message" rows="3"></textarea></div>
        <p class="form-error" role="alert" hidden></p>
        <button class="btn btn-solid" type="submit">{CHAT}Send on WhatsApp</button>
        <p class="form-note">Nothing is stored on this website. Your message goes straight to the studio's WhatsApp.</p>
      </form>
    </div>
  </section>
</main>
<footer class="site-foot">
  <div class="wrap">
    <div class="cols">
      <div><p class="name">{e(c["name"])}</p><p class="muted">{e(c["what"])}</p></div>
      <div><p><a href="{e(maps)}" target="_blank" rel="noopener">{e(c["address"])}</a></p>{foot_hours}</div>
      <div><p><a href="{tel}">{fmt_phone(c["phone"])}</a></p>{foot_email}</div>
    </div>
    <div class="credit"><span>Website preview by <a href="../../">Satyam Choure</a></span><span>Photos are samples</span></div>
  </div>
</footer>
<a class="wa-float" href="{e(wa_hello)}" target="_blank" rel="noopener" aria-label="WhatsApp {e(c["short"])}">{CHAT}</a>
<script src="../assets/preview.js" defer></script>
</body>
</html>
'''


def og(c):
    src = Image.open(os.path.join(ROOT, "assets", "img", c["hero"][1] + ".webp")).convert("RGB")
    w, h = src.size
    tw, th = 1200, 630
    scale = max(tw / w, th / h)
    im = src.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    l = (im.width - tw) // 2
    t = (im.height - th) // 2
    im.crop((l, t, l + tw, t + th)).save(os.path.join(ROOT, c["slug"], "og.jpg"), quality=84, optimize=True, progressive=True)


if __name__ == "__main__":
    for c in CLIENTS:
        os.makedirs(os.path.join(ROOT, c["slug"]), exist_ok=True)
        with open(os.path.join(ROOT, c["slug"], "index.html"), "w", encoding="utf-8") as f:
            f.write(page(c))
        og(c)
        print("built", c["slug"])
