# Client homepage previews

_This file sits in `previews/_build/` so GitHub Pages does not publish it (folders starting with "_" stay private to the repo)._

Free homepage previews for studios that asked to see their website before ordering. Each client folder has the homepage (`index.html`) and one sample project page (`project/index.html`) that shows what every project gets in the full website.
Pages are unlisted and carry `noindex`, so search engines skip them.

| Folder | Client | City |
|---|---|---|
| `habitat-interior/` | Habitat Interior and Architect | Indore |
| `adhira-home-decor/` | Adhira Home Decor & uPVC Furniture | Indore |
| `skript-architect-studio/` | SKript Architect Studio | Gwalior |
| `hauss-studio/` | Hauss Studio Architects & Interior Designers | Ludhiana |
| `ra3designs/` | Ra3Designs | Sonipat |
| `yashraj-architects/` | Yashraj Architects & Interiors | Khandwa |
| `carpenterbabu/` | CarpenterBabu / Gorakhpur Interior Decor | Gorakhpur |

Live address: `https://satyamchoure08.github.io/Satyam-Choure-portfolio/previews/<folder>/`
When re-sending a link that was already shared on WhatsApp, add `?v=2` (then `?v=3`...) at the end so WhatsApp shows the new link picture instead of its old saved one.

## How it works
- All text and client details live in `build.py` (this folder) (the `CLIENTS` list). Change them there, then run `python3 previews/_build/build.py`. Never edit a client's `index.html` by hand: the next build overwrites it. (CarpenterBabu is the exception, see below.)
- Shared look and behaviour: `../assets/preview.css` and `../assets/preview.js`. Fonts (Newsreader, Mona Sans) and photos are inside `assets/`, so nothing loads from another website.
- Line drawings (`<photo>-sketch.webp`) are made from the photos by `sketch.py` (this folder): `python3 previews/_build/sketch.py kitchen-island`. Needs `opencv-python` and `numpy`.
- The enquiry form sends nothing to a server. It opens WhatsApp to the studio's number with the message already typed, and shows a live preview of that message while the visitor types.

## Redesign of 14 Nov 2026: what is on every preview, and why (persuasion details)
1. **Drawing to photo opening:** the hero opens as an architect's line drawing and the finished photo is drawn over it. It is what interior designers and architects do for a living.
2. **"Your project here" tags** on every stock photo (and "Your photo here" on the founder photo). The owner imagines his own work in each spot, and the stock photos are honestly marked.
3. **"Your number" figures:** two real numbers (Google rating, review count) next to two blanks for the owner to fill (projects completed, years in practice).
4. **Project filter** (Homes / Interiors / Commercial, or Kitchens / Wardrobes / Living / Office) and a **sample project page** linked from the first project.
5. **Drawing vs finished slider** (drag to compare), on the homepage and the project page. It nudges itself once so people notice it moves.
6. **Founder section** ("The person behind ..."), because clients hire the person.
7. **Live "Open now / Closed now"** in Indian time for studios whose hours are known.
8. **WhatsApp message preview** under the form, so the owner sees exactly what a lead will look like (name, area, planning, budget).
9. **Owner note** (bottom corner, once, remembered when closed): explains the tags, promises live within 7 days of getting photos (`LIVE_IN` in build.py), dated with the build day.
10. **Their name everywhere:** browser tab, favicon letter in their colour, WhatsApp link picture (`og.jpg` = their hero photo with their name), prefilled WhatsApp text.
11. Phone: call and WhatsApp bar at the bottom; header hides while scrolling down.
The old black "Free homepage preview" strip and the "Sample photo" labels were removed (the tags and owner note replace them). The photo with another company's logo on the shirt (`drawing.webp`) was deleted; `plans-desk.webp` is a crop of it without the logo.

## Rules
- Photos are stock samples and must carry a "Your project here" tag. Replace them with the client's own project photos before anything goes live as their real site. Never show stock photos as a client's own work on a live site.
- Only real, checked facts about a client: name, address, phone, Google rating and review count, and hours or email from their public listings. No invented reviews, years, project counts or awards: unknown numbers stay as "Your number".
- Readable fonts only, no neon colours, no empty photo spots, no AI credits.
- Each client gets their own accent colour, hero layout, hero photo and project mix, so two previews never look the same.

## Adding a client
1. Add an entry to `CLIENTS` in `build.py` (copy one that fits: architect `kind="arch"` or uPVC furniture `kind="furn"`). Pick 6 projects (photo, caption, category), a before/after photo (`ba`) and 4 process photos (`shots`).
2. Every photo used as a hero or `ba` needs a line drawing: run `sketch.py` for it.
3. Run the build, open the page at phone width and desktop width, then push.

## CarpenterBabu (Gorakhpur Interior Decor), added 8 Nov 2026
- Hand-built page, NOT made by `build.py`: edit `previews/carpenterbabu/index.html` directly. Its photos are in `previews/carpenterbabu/img/`.
- Satyam's rule for this client: no "demo", "preview" or "sample" wording anywhere on the page. It is their personal website.
- Reviews on the page are Gorakhpuri (Bhojpuri-style) translations of the business's real Google reviews (4.9, 144 reviews on 8 Nov 2026), each labelled "Google review, Gorakhpuri anuvaad" (anuvaad = translation). Satyam asked for a strong Gorakhpuri accent on 8 Nov. Keep the meaning of the real review; never add invented reviews.
- Business details came from the owner's own WhatsApp reply: brand CarpenterBabu, tagline "Dream | Design | Create", services (PVC and fluted panels, false ceiling, wardrobe, TV unit, modular kitchen, bedroom and living room design, 3D design + supply + installation), hours Monday to Sunday 9 AM to 6 PM, phone +91 88407 74021, email gorakhpurinteriordecor@gmail.com.
- Photos are stock for now. When the client sends their own photos, replace these files (keep the names, or update the `src` in index.html):
  - `img/living-room-wall-panels.webp` (top photo)
  - `img/modular-kitchen.webp`
  - `img/bedroom.webp`
  - `img/tv-unit.webp`
  - `img/living-room.webp`
  - `og.jpg` (1200 x 630, the picture WhatsApp shows when the link is shared)
- The page keeps `noindex` while stock photos are on it. Remove that meta tag once all photos are the client's own.
