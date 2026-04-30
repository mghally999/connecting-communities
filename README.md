# Connecting Communities — v3.1

Production-ready marketing site built with Next.js 16 (App Router), React 19,
styled-components 6, framer-motion, and **three.js / @react-three/fiber** for
the scroll-driven WebGL TrAC walkthrough on `/our-model`. All copy lives in
`src/lib/site-content.js` and all imagery ships in `public/images/`.

## The /our-model WebGL journey

The "Inside a TrAC" section is a scroll-driven WebGL camera tour, built from a
**single deterministic scroll-progress value (0..1)**. Scroll to 45% → the
scene renders the same camera angle, model rotation, lighting, text state,
and background every time. There are no independent timers or random
animations.

All keyframes are declared in `src/lib/journey-keyframes.js` (camera position,
camera target, model rotation/scale, light intensity/hue, fog, background,
section opacities). Editing a keyframe and reloading is enough to retune the
journey — no other file needs to change.

The procedural TrAC building lives in
`src/components/our-model/TrACModel.js`. The scene rig (camera, lights, fog,
background) lives in `src/components/our-model/JourneyScene.js`. The HTML
overlay layer (captions, hotspots, right-side dot rail, scroll nudge) and
the master sticky stage live in
`src/components/our-model/OurModelJourney.js`.

The WebGL scene is loaded via `next/dynamic({ ssr: false })` so it doesn't run
during SSR and the three.js bundle is code-split into its own ~820 KB chunk
that only downloads when you reach the page.

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
- The TrAC model is procedural (composed from primitives) so it ships at
  near-zero asset cost and the wireframe-blend works cleanly. When AKA
  Partners deliver a real `.glb`, drop it into `public/models/` and load it
  via `useLoader(GLTFLoader, ...)` inside `TrACModel.js` — keep the same
  `wireframeRef` opacity blend on its materials and the rest of the journey
  works unchanged.

## Notes

- Manrope is loaded at runtime via a `<link>` tag in `<head>`, not via
  `next/font/google`. This avoids a build-time fetch (the build can succeed
  in any environment, even without internet) while still giving users the
  proper font in the browser.
- `next.config.mjs` includes `__dirname` workaround for ESM and explicit
  `turbopack.root` to silence Next 16's lockfile-detection warning.
- All photographs are deduplicated and sit in `public/images/<page>/` — see
  the comments in `src/lib/site-content.js` for which file goes where.
