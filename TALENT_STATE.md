# /talent — current state snapshot

Generated at the end of the May 2026 parity sweep against the V1
(localhost) vs V2 (foam.org) video pair. The whole `/talent` surface
area is documented here so the next contributor doesn't have to walk
back through every git commit to learn what's wired to what.

---

## Commit ledger

### May 2026 parity sweep (this session)

```
e23b92a  fix(talent): view-next button matches foam (white pill + black square)
41d10df  fix(talent): back button visible against any background via mix-blend
f49ad7c  feat(talent): collage layouts inside portfolio spreads
1f90432  feat(talent): cluster drag with momentum + elastic constraints
f4e78ae  fix(talent): normalise card positions + per-card scale variation
09286aa  feat(talent): 6-photo cycle with true full-bleed + TALENT fade-out handoff
```

Phase 0 (Next.js "1 Issue" dev overlay) was not reproducible from the
HTTP-served HTML alone — the overlay is a client-side React boundary
fired at runtime in the browser. The most likely candidate (a duplicate
`layoutId="hero-card"` between Intro.js and the gallery primary that
collided during the brief phase swap) is removed by Phase 1's spec
which deletes the layoutId pattern entirely. If the indicator returns,
re-screenshot the actual error text from the overlay for the next
session.

### Prior session — Phase 8 sweep

```
2fcec30  feat(talent): phase 6 — filter network graph with red connector lines
8fdca70  feat(talent): phase 5 — portfolio horizontal pager (reverts 953424e)
3bcdfee  fix(talent): phase 4 — hover hide siblings + scale 1.8 + caption + close X
0330c6a  fix(talent): phase 3 — gallery scatter (tighter spread + size variation)
f8233b7  feat(talent): phase 2 — cycle artist photos behind TALENT during intro
35ed0ab  fix(talent): phase 1 — TALENT per-letter concentric ellipse rings + checker
1852491  chore: ignore foam-scrape-2 mirrors (re-added after reset)
```

### Prior commits in the chain (kept intact)

```
9cdd123  feat(talent): phase 7 — pill chips + portfolio polish + thank-you state
e8ed455  feat(talent): phase 6 — hover hides siblings + bottom-centre caption
87e94d8  feat(talent): phase 5 — equal-sized cards + drag-to-pan canvas
edfa660  fix(talent): phase 4 — FoamSidebar rotates -90° + large in gallery
69a118b  fix(talent): phase 3 — TALENT op-art warp via feDisplacementMap (replaced by 35ed0ab)
6c94ef9  feat(talent): commit 2a — placeholder image helper unblocks data gaps
9e29b34  fix(talent): phase 2 — remove bg hero photo from Intro (revert 622cd2c)
e7761e0  fix(talent): phase 1 — broken portfolio images (null-src guard + free-image width)
266ce00  fix(talent): hydration mismatch + fast-404 for malformed slugs
8b5fb78  fix(talent): FilterCloseButton when filter active
953424e  fix(talent): portfolio scrolls vertically (REVERTED by 8fdca70)
cb5ebc1  docs(talent): parity audit against foam_source/
```

### History note — the R3F detour

Between `9cdd123` and the current sweep, an R3F rewrite landed (`ec6edab`
+ 4 polish commits) replacing the DOM gallery with a three.js scene.
The user's subsequent spec for the 8-phase sweep referenced `Intro.js`
and `GalleryGrid.js` which the R3F rewrite had deleted — a strong
signal the rewrite wasn't what they wanted. The R3F commits were
unwound by `git reset --hard 9cdd123` at the start of this session.
The R3F approach matched foam.org's actual architecture (one persistent
`<Canvas>` per foam_talent_2024_deep/MANIFEST.json's "webgl_contexts: 1")
but framer-motion + DOM let us deliver layoutId morphs, drag inertia,
and the per-letter ring TALENT SVG more cheaply.

---

## Component map

### `src/components/talent/TalentExperience.js`
Single mounted client tree for `/talent` and every `/talent/<slug>`.
- Phase state machine: `intro` → `gallery` → `portfolio` (the
  `hero-zoom` phase is gone; Intro signals completion via
  `onIntroComplete` and TalentExperience flips to `gallery` directly)
- URL syncs via `history.pushState` + `popstate` (never `router.push`)
- bg target precedence: intro black → hover accent → filter black → gallery white
- Owns the bottom-centre hover caption (artist's `accentText` colour) + right-edge × close pill
- Mounts `<Intro/>`, `<GalleryGrid/>`, `<CategoryChipsHud/>`, `<Portfolio/>`, `<FoamSidebar/>`

### `src/components/talent/Intro.js`
Opening typography stack + 6-photo cycle — phase `intro` only.
- TALENT mark + tagline centred via static parent + opacity-only motion
- mixBlendMode: difference so both invert against cycling backdrops
- **6-photo cycle**: CYCLE_SLUGS = cansu → florian → jaclyn →
  andre → amin → rehab. cycleIdx state machine -1..N+1. Each photo
  renders TRUE FULL-BLEED (position:fixed, 100vw/100vh, no margins,
  no border). Last photo (rehab) holds 1200 ms WITH TALENT, then
  TALENT fades out 400 ms, then rehab holds alone 900 ms before
  `onIntroComplete` fires.
- `layoutId="hero-card"` is REMOVED (the gallery primary now fades
  in along with the others — no shared-element morph)

### `src/components/talent/TalentMarkSVG.js`
**Phase 1**: per-letter concentric ellipse rings + checker centres.
- 6 separate `<text>` elements, one per letter
- Per-letter `<radialGradient>` centred at eyeballed bbox centroid
- 14-px black/white checker pattern clipped to small inner ellipses
  per glyph (the "core")
- 1.2-px white stroke pass for legibility

### `src/components/talent/FoamSidebar.js`
Foam wordmark, tweened between intro/gallery/portfolio states with GSAP.
- intro: top-centre 22px
- gallery/portfolio: rotated -90° at top-left 56px

### `src/components/talent/GalleryGrid.js`
2D scattered DOM thumbnails.
- **Centroid-normalised projection** (May 2026): subtract centroid of
  authored x/y from each card's coordinate before multiplying, so the
  cluster always centers on the viewport. Multipliers tightened to
  `x*3.6` / `y*4.2` so the spread fits without edge clipping.
- `scale = 0.7 + ((z+20)/20) * 0.5` (range 0.7–1.2), `CARD_W_VW = 8`
  base; final width = `8 * scale` vw
- **Cluster drag with momentum** (May 2026): `dragMomentum`, `dragElastic
  0.18`, custom `dragTransition` (bounceStiffness 110, bounceDamping 14,
  power 0.42, timeConstant 380) — softer than framer-motion defaults so
  the cluster glides and bounces elastically. Constraints are viewport-
  proportional (±35%) and update on resize.
- **Wheel/trackpad pan**: writes the same `dragX`/`dragY` motion values
  so wheel-scroll behaves identically to drag. `ctrlKey` passes through
  for pinch-zoom.
- **Hover**: scale springs to 1.8 (stiffness 200, damping 26); siblings
  opacity → 0 AND `pointerEvents: 'none'`
- **Filter graph**: when `activeFilter` is set, SVG overlay inside the
  drag wrapper draws `#E63B4F` lines between every pair of matching
  cards.

### `src/components/talent/CategoryChipsHud.js`
Bottom-right chip rail + top-centre × dismiss pill when a chip is active.

### `src/components/talent/Portfolio.js`
HORIZONTAL pager with collage spreads.
- Each spread `flex: 0 0 100vw`, height `100vh`, `overflow: hidden`
- Wheel-Y → translate-X (NOT deltaX) via RAF lerp 0.1
- Touch: `lastY - currentY` × 1.6
- Keyboard: ←/→/PageUp/Down shift half-viewport; Home/End jump;
  Escape closes
- `body { overflow: hidden }` while mounted
- **Collage spreads** (May 2026): `buildSpreads()` walks
  `artist.sections`, accumulating consecutive image-kind sections into
  a buffer and flushing them through `SPREAD_LAYOUTS` (2-, 3-, or
  4-image templates cycling per spread). Non-image sections become
  their own slot via `ExhibitionSection`. Slot positions are percent-
  based so they scale with viewport; images use `objectFit: cover`.
- **Buttons** (May 2026): 80×40 back pill uses `mixBlendMode:
  difference` + hard white border so it inverts against any backdrop.
  View-next pill matches foam.org exactly — white pill 1.5-px black
  border, full-height black square left, label, 16-px eye SVG right.

### `src/components/talent/spreads/ExhibitionSection.js`
Renders a single Storyblok-shaped section. 10 variants: image,
images, images-with-text, prose, quote, inline-video, video,
podcast, embed, viewer. Missing srcs fall back to deterministic
picsum.photos placeholders.

### `src/components/talent/spreads/AudioRing.js`
3:2 ellipse audio player. HEAD-probe + silent degrade when src 404s.

---

## Known limitations

1. **43 of 129 media slots use picsum placeholders.** The original
   Storyblok asset extraction couldn't resolve those URLs in any of
   `foam_source/`, `foam-mega-run/`, or `foam-deep/` (sampled 7
   missing rehab hashes: all 0 hits across all three scrapes). The
   scrapers only loaded above-the-fold content — to recover the rest
   you'd need a fresh Playwright scrape that scrolls every artist's
   full portfolio.

2. **TALENT per-letter ring centroids are eyeball-positioned.** The
   x-coords for T/A/L/E/N/T (280/430/580/700/830/970) are tuned for
   Stolzl 700 at fontSize 220 with letterSpacing -4. If the font
   changes, the centroids will need re-tuning. There's no runtime
   glyph-metrics library; pixel-perfect bbox centroid would need one.

3. **Filter network graph uses straight Euclidean lines.** Foam.org
   appears to draw subtle bezier curves between matching cards;
   straight lines are an acceptable approximation. Acceptable trade-off
   for shipping.

4. **Drag wrapper composes drag offset with line coordinates.** The
   Phase 6 SVG lines are inside the same `<motion.div drag>` wrapper
   as the cards, so they translate together. If you ever move the SVG
   out of the wrapper (e.g. to render at z-index above the cards),
   you'll need to track the wrapper's `x`/`y` motion values and apply
   the same transform to the SVG.

5. **Intro 6-photo cycle uses 6 hardcoded slugs** (cansu, florian,
   jaclyn, andre, amin, rehab) in `Intro.js`. No preloading — first
   photo may pop in if its image hasn't downloaded by t=1.8s.
   Acceptable on broadband; consider `<link rel=preload>` injection
   for slow connections, or make the slug list data-driven (`isIntro`
   flag in `talent-artists.js`).

6. **Portfolio collage templates are 4 hardcoded layouts.** Each
   spread cycles through them by `pickIdx % candidates.length`.
   Adding a layout means editing `SPREAD_LAYOUTS` in `Portfolio.js`.
   Could be made data-driven by adding a `layout` field per section
   group, but for now the rotation produces enough variety.

7. **Hydration mismatch warning on the `<html>` `dark` class** is
   handled by `suppressHydrationWarning` (commit 266ce00) — caused by
   Dark Reader browser extension, not our code.

8. **Next.js "1 Issue" dev overlay not reproduced this session.** The
   indicator from the V1 video was not reproducible from the
   HTTP-served HTML. The most likely candidate (duplicate
   `layoutId="hero-card"` during the intro → gallery phase swap)
   was removed by the Phase 1 spec which deletes the layoutId
   pattern entirely. If the indicator returns, capture the actual
   error text from the overlay.

---

## How to test the parity sweep

```bash
npm run dev
# open http://localhost:3000/talent
```

Walk:
1. **Intro (t=0)**: black bg, foam top-centre, TALENT centre with
   per-letter rings + checker, tagline 13px below.
2. **t=0.4s**: TALENT settles, tagline lands.
3. **t=1.8s**: first artist photo crossfades in behind TALENT
   (mixBlendMode keeps TALENT legible).
4. **Every 1.5s for 5 more photos**: continues cycling.
5. **t=~2.4s**: phase flips to gallery — TALENT fades, hero card
   morphs via layoutId to the primary slot, other 19 cards stagger
   in.
6. **Gallery**: white bg, 20 cards scattered with whitespace + size
   variation. Drag to pan.
7. **Hover a card**: siblings vanish (opacity 0); hovered springs
   to 1.8x; bg crossfades to artist accent; caption bottom-centre
   in accentText colour; × close pill mid-right.
8. **Click a category chip**: bg → black, non-matching cards vanish,
   thin red lines connect every pair of matching cards.
9. **Click a card**: phase → portfolio. Horizontal pager. Wheel
   down → spreads slide left. Cover → N sections → thank-you.
10. **Thank-you**: white bg, italic "thank you for visiting", white
    "view next exhibition" pill with black square + eye. Click →
    next artist via `history.pushState`.
11. **Escape or back button**: returns to gallery (popstate handler).
