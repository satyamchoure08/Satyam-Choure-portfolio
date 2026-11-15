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

## What is on every preview (rebuilt 15 Nov 2026)
Calm, compact pages with normal-size headings. Photos appear only in the project areas, sorted into categories. Buttons are plain text (no icons).
1. **Homepage** (about 4.5 laptop screens): a text intro (name, one line in the studio's voice, WhatsApp and Call, a fact box with the Google rating, review count, two "Your number" blanks and the address), **Projects** (5 photos, the first one big, with category tabs such as Living rooms, Bedrooms, Kitchens, Exteriors, Commercial), What we do, How a project runs (5 steps), the person behind the studio with the Google rating, contact details next to the WhatsApp enquiry, footer.
2. **Projects page** (`projects/`): By project (cards, filter by property type) or By room (every photo, filter by category). `projects/?view=photos&room=kitchens` opens one room; `?photo=<id>` opens one photo.
3. **Sample project page** (`project/`): title and facts, cover photo, the story (brief, design, result), photos by room, drawing vs finished slider, enquiry pre-filled for this project.
4. **Photo viewer**: full screen, arrows, swipe, Esc or the back button closes it, counter, "Open project", and WhatsApp "I like this photo" with the photo's link.
5. **"Your project here" tags** on every stock photo; "Your number", "Your story" and "Your name" placeholders for what only the studio can give.
6. **Enquiry**: three short steps (property, project, you), budgets that fit the project, a live preview of the WhatsApp message. Nothing is stored on the site.
7. **Phones**: Call and WhatsApp bar at the bottom from the first moment; the page links sit in the Menu.
8. Live "Open now / Closed now" in Indian time where hours are known; a one-time note to the studio owner explaining the tags (`LIVE_IN` in build.py); favicon letter and `og.jpg` link picture in the studio's name.
Removed on 15 Nov 2026 at Satyam's request, do not bring back: the opening photo flip, giant uppercase headings, a photo in every section (services, process, founder, contact, strips), the giant "ALL PROJECTS" / "LET'S TALK" links, WhatsApp icons, the custom cursor and scrollbar, and the GSAP / Lenis libraries.

## Rules
- Photos are stock samples and must carry a "Your project here" tag. Replace them with the client's own project photos before anything goes live as their real site. Never show stock photos as a client's own work on a live site.
- Only real, checked facts about a client: name, address, phone, Google rating and review count, and hours or email from their public listings. No invented reviews, years, project counts or awards: unknown numbers stay as "Your number".
- Readable fonts only, no neon colours, no empty photo spots, no AI credits.
- Each client gets their own accent colour, wording and project mix.

## Adding a client
1. Add an entry to `CLIENTS` in `build.py` (copy one that fits: architect `kind="arch"` or uPVC furniture `kind="furn"`). Pick 6 projects (photo, name, property type), a drawing-vs-finished photo (`ba`) and a hero photo (used for the WhatsApp link picture and as the big first gallery photo).
2. The `ba` photo needs a line drawing: run `sketch.py` for it.
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
