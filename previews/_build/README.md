# Client homepage previews

_This file sits in `previews/_build/` so GitHub Pages does not publish it (folders starting with "_" stay private to the repo)._

Free one-page previews for studios that asked to see their homepage before ordering a full website.
Each folder is one client. Pages are unlisted and carry `noindex`, so search engines skip them.

| Folder | Client | City |
|---|---|---|
| `habitat-interior/` | Habitat Interior and Architect | Indore |
| `adhira-home-decor/` | Adhira Home Decor & uPVC Furniture | Indore |
| `skript-architect-studio/` | SKript Architect Studio | Gwalior |
| `hauss-studio/` | Hauss Studio Architects & Interior Designers | Ludhiana |
| `ra3designs/` | Ra3Designs | Sonipat |
| `yashraj-architects/` | Yashraj Architects & Interiors | Khandwa |

Live address: `https://satyamchoure08.github.io/Satyam-Choure-portfolio/previews/<folder>/`

## How it works
- All text and client details live in `build.py` (this folder) (the `CLIENTS` list). Change them there, then run `python3 previews/_build/build.py`. Never edit a client's `index.html` by hand: the next build overwrites it.
- Shared look and behaviour: `../assets/preview.css` and `assets/preview.js`. Fonts (Newsreader, Mona Sans) and photos are inside `assets/`, so nothing loads from another website.
- The enquiry form sends nothing to a server. It opens WhatsApp to the studio's number with the message already typed.

## Rules
- Photos are stock samples and are marked "Sample photo". Replace them with the client's own project photos before anything goes live as their real site. Never show stock photos as a client's own work on a live site.
- Only real, checked facts about a client: name, address, phone, Google rating and review count, and hours or email from their public listings. No invented reviews, years, project counts or awards.
- Readable fonts only, no neon colours, no empty photo spots, no AI credits.
- Each client gets their own accent colour and hero layout so two previews never look the same.

## Adding a client
1. Add an entry to `CLIENTS` in `build.py` (this folder) (copy one that fits: architect or uPVC furniture).
2. Pick a hero photo and three work photos from `assets/img/`, or add the client's own photos there as `.webp`.
3. Run the build, open the page at phone width and desktop width, then push.
