# Connecting Communities — v3

Production-ready marketing site built with Next.js 16 (App Router), React 19,
styled-components 6, and framer-motion. **No Sanity. No 3D.** All content lives
in `src/lib/site-content.js` and all imagery ships in `public/images/`.

## Run it

```bash
npm install     # legacy-peer-deps is on by default via .npmrc
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # runs the production build
```

If `npm install` complains about peer deps for any reason, the fallback is
`npm install --force`.

## Pages

| Route          | What's there |
| -------------- | ------------ |
| `/`            | Hero (60/40 image vs. light-blue text panel), Why we exist + stair graphic, Our approach (3 image cards), Impact stats with count-up, Partner carousel with arrows, Contact form |
| `/about`       | Hero with 3-line title, Our story with side image, Our launch accordion, Partners & collaboration 2×3 grid with hover zoom, AKA Partners block, Our leaders 4-up with hover zoom |
| `/our-model`   | Hero, "Our model" left text + vertical image right, ecosystem strip (light blue), Rwanda map block, full-width landscape band |
| `/ecosystem`   | Hero, scattered floating cards with framer-motion + filterable category tabs (Ecosystem visual treatment is intentionally provisional — to be polished in next pass) |
| `/partners`    | New page. Hero + same 2×3 sector grid as About |
| `/contact`     | Hero, intro side-by-side block, Kigali HQ with embedded map iframe + form on the right |

## Customising

Edit `src/lib/site-content.js`. Every word and image path on the site is
declared there. Swap an image by dropping a new file into the matching folder
under `public/images/`.

Brand colours live in `src/styles/theme.js` — sourced from the official Figma
brand kit (`#21384F` navy, `#FD542B` orange, `#B0D4E6` light blue,
`#F8FCFF` off-white).

The CC logo is an inline SVG in `src/components/Logo.js`.

## What I left for the next pass

- The Ecosystem floating cards layout works but the placement values are
  hand-tuned approximations. The exact pixel-perfect Figma positions can be
  pulled in once the final 3D / scroll experience design is locked.
- Per the brief, the Our Model 3D experience is deferred until the GLB model
  arrives. The current layout is the figma 2D version.

## Notes

- Manrope is loaded at runtime via a `<link>` tag in `<head>`, not via
  `next/font/google`. This avoids a build-time fetch (the build can succeed
  in any environment, even without internet) while still giving users the
  proper font in the browser.
- `next.config.mjs` includes `__dirname` workaround for ESM and explicit
  `turbopack.root` to silence Next 16's lockfile-detection warning.
- All photographs are deduplicated and sit in `public/images/<page>/` — see
  the comments in `src/lib/site-content.js` for which file goes where.
