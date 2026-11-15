# Client homepage previews

_This file sits in `previews/_build/` so GitHub Pages does not publish it (folders starting with "_" stay private to the repo)._

Free website previews for studios that asked to see their website before ordering. Each client folder is a complete small website: homepage, projects page, one page per project, About and Contact.
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
- All text, client details and projects live in `build.py` (this folder) (the `CLIENTS` list; each project is one `P(...)` line: name, property type, photos, what the studio did, what the enquiry form pre-selects). Change them there, then run `python3 previews/_build/build.py`. Never edit a client's pages by hand: the next build overwrites them. (CarpenterBabu is the exception, see below.)
- Every photo belongs to exactly one project per studio; its room comes from the `PHOTOS` list. The first photo of a project is its cover. The build stops with a clear message if a photo is used twice or does not exist.
- The build also writes 720 px copies of the photos to `../assets/img/sm/`, so phones and small tiles load smaller files. It needs Pillow, fontTools and brotli once: `python3 -m pip install --user pillow fonttools brotli`.
- Shared look and behaviour: `../assets/preview.css` and `../assets/preview.js`. Fonts (Newsreader, Mona Sans) and photos are inside `assets/`, so nothing loads from another website.
- Line drawings (`<photo>-sketch.webp`) are made from the photos by `sketch.py` (this folder): `python3 previews/_build/sketch.py kitchen-island`. Needs `opencv-python` and `numpy`. Every project photo has one (cards show it on hover, project pages use it in the drawing vs finished slider).
- The enquiry form sends nothing to a server. It opens WhatsApp to the studio's number with the message already typed, and shows a live preview of that message while the visitor types.
- If a project is renamed, its old folder in `<studio>/projects/` stays behind: delete it by hand.

## What is on every preview (rebuilt 15 Nov 2026, afternoon)
Calm, compact pages with normal-size headings. Photos appear only in the project areas. Buttons are plain text (no icons).
1. **Homepage** (about 5 laptop screens): a text intro (name, one line in the studio's voice, WhatsApp and Call, a fact box with the Google rating, review count, two "Your number" blanks and the address); **Projects**: the 6 projects as cards (1 big + 2 small, the next row mirrored), filter chips by property type, the line drawing fades in on hover, "View project" on phones, and links to browse every photo by room; **What we do** with an "Ask about ..." WhatsApp link per service; **How a project runs** (5 steps, "Time: Your timeline", a line that fills as you scroll, "Book step 1" on WhatsApp); the person behind the studio with the Google rating; contact details next to the WhatsApp enquiry; footer.
2. **Projects page** (`projects/`): Property and Room filters that combine, with counts on every chip and empty ones greyed out; Projects or Photos view; Grid or List layout (List fades rows that don't match and shows the hovered row's photo); 12 photos at a time with "Show more". The filters stay in the link, so a filtered page can be shared: `projects/?type=villa-bungalow&space=kitchen`, `?view=photos`, `?layout=list`, `?photo=<photo name>`. Every WhatsApp button on the page then names the filter.
3. **Project pages** (`projects/<project>/`, one per project): title, type and city, facts (location, type, what we did, area, year, time taken), cover photo revealed by a wipe, the story as accordions (brief, design, result), photos in chapters by room with "Jump to" chips (rooms with several photos in pairs, rooms with one photo side by side), drawing vs finished slider, enquiry pre-filled with the project's type and scope, next project. The old address `project/` forwards to the first project.
4. **About** (`about/`): the person behind the studio, Google rating and reviews, address with live open/closed status, map link. **Contact** (`contact/`): contact details next to the enquiry form.
5. **Photo viewer**: full screen, arrows, swipe, Esc or the back button closes it, counter, "Open project", and WhatsApp "I liked this {room} from '{project}'" with a link to that exact photo.
6. **WhatsApp messages match the page**: homepage, project ("I liked your project ..."), photo, filtered projects, each service, "Book step 1"; every message ends with the page link. The enquiry message reads: name, project (on project pages), property, scope, city, budget, timeline, note, page.
7. **"Your project here" tags** on every stock photo; "Your number", "Your story", "Your timeline" and "Your name" placeholders for what only the studio can give.
8. **Phones**: Call and WhatsApp bar at the bottom from the first moment; the page links sit in the Menu; filter chips scroll sideways and stay at the top.
9. Small touches from shed.design, kept quiet: things come in slowly and leave fast, rolling words on hover, chips that fill from below, lines that draw themselves, headings that rise word by word, a soft change between pages. With "reduce motion" switched on, everything simply shows.
10. Live "Open now / Closed now" in Indian time where hours are known; a one-time note to the studio owner explaining the tags (`LIVE_IN` in build.py); favicon letter and `og.jpg` link picture in the studio's name.
Removed on 15 Nov 2026 at Satyam's request, do not bring back: the opening photo flip, giant uppercase headings, a photo in every section (services, process, founder, contact, strips), the giant "ALL PROJECTS" / "LET'S TALK" links, WhatsApp icons, the custom cursor and scrollbar, and the GSAP / Lenis libraries.

## Rules
- Photos are stock samples and must carry a "Your project here" tag. Replace them with the client's own project photos before anything goes live as their real site. Never show stock photos as a client's own work on a live site.
- Only real, checked facts about a client: name, address, phone, Google rating and review count, and hours or email from their public listings. No invented reviews, years, project counts or awards: unknown numbers stay as "Your number".
- Readable fonts only, no neon colours, no empty photo spots, no AI credits.
- Each client gets their own accent colour, wording and project mix.

## Adding a client
1. Add an entry to `CLIENTS` in `build.py` (copy one that fits: architect `kind="arch"` or uPVC furniture `kind="furn"`). Write 6 projects as `P(...)` lines (each photo used once; the first project gets the most photos) and pick a hero photo (used only for the WhatsApp link picture `og.jpg`).
2. Every photo needs a line drawing: run `sketch.py` for any new photo.
3. Run the build, open the pages at phone width and desktop width, then push.

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
