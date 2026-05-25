# /talent — current state snapshot

Generated at the end of the 8-phase parity sweep against the new V2
video review. The whole `/talent` surface area is documented here so
the next contributor doesn't have to walk back through every git
commit to learn what's wired to what.

---

## Commit ledger

### Phase 8 sweep (this session)

```
2fcec30  feat(talent): phase 6 — filter network graph with red connector lines
8fdca70  feat(talent): phase 5 — portfolio horizontal pager (reverts 953424e)
3bcdfee  fix(talent): phase 4 — hover hide siblings + scale 1.8 + caption + close X
0330c6a  fix(talent): phase 3 — gallery scatter (tighter spread + size variation)
f8233b7  feat(talent): phase 2 — cycle artist photos behind TALENT during intro
35ed0ab  fix(talent): phase 1 — TALENT per-letter concentric ellipse rings + checker
1852491  chore: ignore foam-scrape-2 mirrors (re-added after reset)
```

Phase 7 (button polish) had no isolatable diff — the rectangular back
button, the white "view next exhibition" pill with black square + eye,
and the 13px intro tagline were all already in commits 8fdca70 + f8233b7.
Folded into those rather than landed as a no-op commit.

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
- Phase state machine: `intro` → `hero-zoom` → `gallery` → `portfolio`
- Phase transitions: 100 ms intro → hero-zoom, 2300 ms hero-zoom → gallery
- URL syncs via `history.pushState` + `popstate` (never `router.push`)
- bg target precedence: intro/hero-zoom black → hover accent → filter black → gallery white
- Owns the bottom-centre hover caption (artist's `accentText` colour) + right-edge × close pill
- Mounts `<Intro/>`, `<GalleryGrid/>`, `<CategoryChipsHud/>`, `<Portfolio/>`, `<FoamSidebar/>`

### `src/components/talent/Intro.js`
Opening typography stack — phases `intro` + `hero-zoom`.
- TALENT mark + tagline centred via static parent + opacity-only motion
- mixBlendMode: difference so both invert against cycling backdrops
- **Phase 2 photo cycle**: 6 artist heros crossfade behind TALENT at 1.5s intervals from t=1.8s
- `layoutId="hero-card"` element enters at t=1.6s for the gallery morph

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
- **Phase 3 projection**: `leftPct = 50 + x*4.2`, `topPct = 50 + y*4.8`,
  `scale = 0.7 + ((z+20)/20) * 0.5` (range 0.7–1.2)
- `CARD_W_VW = 8` base; final width = `8 * scale` vw
- Drag wrapper: framer-motion `drag dragElastic={0.05}` with inertia,
  constraints ±300/±180
- **Phase 4 hover**: scale springs to 1.8 (stiffness 200, damping 26);
  siblings opacity → 0 AND `pointerEvents: 'none'`
- **Phase 6 filter graph**: when `activeFilter` is set, SVG overlay
  inside the drag wrapper draws `#E63B4F` lines between every pair
  of matching cards. Coords reuse `PROJ(a).leftPct/topPct` so they
  translate with the drag wrapper for free.

### `src/components/talent/CategoryChipsHud.js`
Bottom-right chip rail + top-centre × dismiss pill when a chip is active.

### `src/components/talent/Portfolio.js`
**Phase 5**: HORIZONTAL pager (reverted 953424e).
- Each spread `flex: 0 0 100vw`, height `100vh`, `overflow: hidden`
  (inner content can't overflow viewport, fixes the prior vertical bug)
- Wheel-Y → translate-X (NOT deltaX) via RAF lerp 0.1
- Touch: `lastY - currentY` × 1.6
- Keyboard: ←/→/PageUp/Down shift half-viewport; Home/End jump;
  Escape closes
- `body { overflow: hidden }` while mounted
- Cover spread → N section spreads → thank-you spread
- Phase 7 buttons: rectangular 80×40 back pill (4px radius), white
  "view next exhibition" pill with black square left + black eye right

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

5. **Cycling photos in Phase 2 use 6 artists' raw hero URLs.** No
   preloading — first photo may pop in if its image hasn't downloaded
   by t=1.8s. Acceptable on broadband; consider preloading for slow
   connections.

6. **Hydration mismatch warning on the `<html>` `dark` class** is
   handled by `suppressHydrationWarning` (commit 266ce00) — caused by
   Dark Reader browser extension, not our code.

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
