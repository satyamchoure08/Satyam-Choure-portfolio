# Arkavolt Solar (concept site)

Source of the portfolio demo at `samples/solar/`. Arkavolt Solar is a fictional company: phone, email and reviews are placeholders.

Next.js 16 + Tailwind 4, exported as static files.

```bash
cd source/solar-site
npm install
npm run build          # writes out/
rm -rf ../../samples/solar && cp -R out ../../samples/solar
```

Photos: free Unsplash images (Unsplash License), sources listed in `src/config/visuals.ts`.
