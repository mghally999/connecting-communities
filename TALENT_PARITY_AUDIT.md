# /talent — Parity Audit vs foam_source/

Audit only. No code changes. Reference snapshots live at `foam_source/www.foam.org/`.

## Ground-truth references (verified via Phase B)

- **Gallery DOM (Vercel-gated)** → bypassed via `foam_source/www.foam.org/_next/data/ZabZRLuioobwAR3nGVeHy/en/talent-2024.json` (full `pageProps.adaptedOverviewArtists` with 20 artists, all `position` + `frameBackgroundColor` + `frameHighlightColor` intact)
- **Artist DOM** → `foam_source/www.foam.org/talent-2024/artist/{rehab-eldalil,xin-li,aaryan-sinha}/index.html`. NEXT_DATA payloads readable.
- **Gallery JS chunk** → `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js` (54 KB, the main page logic; ~26 × Vector3, 4 × Mesh, 4 × setTimeout, 14 × useFrames context calls, 7 × isIntroComplete)
- **Artist JS chunk** → `_next/static/chunks/pages/talent-2024/artist/%5Bslug%5D-ce3e1c41f330be29.js` (690 bytes — just the route registration; all real work is in shared chunks)
- **Shared section chunk** → `_next/static/chunks/8222-45588d110a4a4168.js` (123 KB; renders OnlineExhibition* sections; uses `useScrollProgress` 3×, `onWheel` 2×, `requestAnimationFrame` 2×, mounts `<audio>` elements)
- **_app chunk** → `_next/static/chunks/pages/_app-2dea851bca254b87.js` (492 KB; framer-motion `layoutId` 4×, `useScroll` 3×, `useSpring` 2×, `AnimatePresence` 2×; emotion `CloseButton` cursor-follower)
- **three.js core** → `_next/static/chunks/fb7d5399-5add6e3e54d315ba.js` (686 KB)

## Stack truth (from Phase B fingerprint)

Foam uses **framer-motion + emotion + three.js direct**. **No GSAP, no Lenis, no @react-three/fiber.** Dominant entry duration **1.0 s**; named easings: `linear` 30×, `easeInOut` 8×, `easeOut` 7×, `circOut` 1×; cubic-bezier curves include `(0.165, 0.84, 0.44, 1)`, `(0.19, 1, 0.22, 1)`, `(0.215, 0.61, 0.355, 1)`.

---

## Intro.js
- Delta 1: foam's intro shows a full-bleed artist photograph BEHIND the TALENT mark from t=0; ours shows pure black background until t=1.6 when the hero photo enters | evidence: `foam_source/www.foam.org/talent-2024/index.html` (the live page; matches `foam-mega/site/screenshots/index_y0.png` from prior round which is a Rehab photo + foliage with TALENT overlay) | severity: **P0**
- Delta 2: foam.org's gallery foam wordmark `<rotate(-90` is animated by chunk `talent-2024-...js`; we do it via GSAP in FoamSidebar.js — stack mismatch | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js:rotate(-90` | severity: **P2**
- Delta 3: tagline copy ("artists shaping the future of photography") matches reference verbatim | (match)
- Delta 4: word-stagger cadence in foam ≈ matches our 0.42 s per word with 0.04 stagger — within ±100 ms tolerance | (match)
- Delta 5: hero-zoom morph uses framer-motion `layoutId="hero-card"` in ours; foam.org uses a **camera dolly inside the three.js scene** (Vector3 26× in talent chunk, OrbitControls/PerspectiveCamera live in 4651 chunk) — different mechanism, same visible result | evidence: `_next/static/chunks/4651-546385825eba7165.js` has `OrbitControls`, `PerspectiveCamera`; ours is 2D framer-motion | severity: **P1**

## TalentMarkSVG.js (BRAND SIGNATURE — character-by-character)
- Delta 1: **the string "TALENT" appears in ZERO foam.org JS bundles** — confirms foam.org renders TALENT as canvas/three.js texture, not SVG | evidence: `grep -lE 'TALENT[^a-zA-Z]' foam_source/www.foam.org/_next/static/chunks/**.js` returns no hits | severity: **P2** (visual matches; architecture differs)
- Delta 2: foam.org's pattern is animated continuously (per `foam-mega/site/meta/index.animations.json` keyframes `hXckYf`/`cXIhFz` show font-variation drift); ours is a static checker+stripe SVG composite | evidence: `foam-mega/site/meta/index.animations.json:1-20` | severity: **P1**
- Delta 3: our 8-px black/white checker top half + 8-px vertical stripes bottom half is close to the visual in `foam-mega/.../screenshots/index_y0.png` but slightly more uniform — foam appears to have a SINGLE wavy-stripe pattern that wraps the glyph curves, not a horizontal split | evidence: `foam-mega/site/screenshots/index_y0.png` | severity: **P1**
- Delta 4: 1-px white outline + paint-order applied — matches reference | (match)
- Delta 5: aria-label="TALENT" + sibling stroke-only `<text>` — accessibility tree matches | (match)

## FoamSidebar.js (FLAG: stack mismatch)
- Delta 1: **uses GSAP `gsap.to(el, { left, top, rotation, opacity, xPercent })`** — foam.org uses 0 GSAP across all bundles | evidence: `src/components/talent/FoamSidebar.js:30-37` vs Phase B grep for `gsap` | severity: **P2** (architectural — works visually)
- Delta 2: foam.org's foam wordmark rotation is driven from the gallery page chunk via `rotate(-90` CSS, likely composed via emotion's css prop; we tween between four discrete `STATES` map | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js` has `rotate(-90`; our `STATES` constant in FoamSidebar.js:8-13 | severity: **P2**
- Delta 3: foam's wordmark in intro state sits at top-CENTRE and rotates to top-left-vertical only when the gallery activates; ours matches this two-state model | (match)
- Delta 4: portfolio state foam shows the wordmark as plain horizontal black `foam` at top-left in artist pages (visible in artist HTML head), opacity ≈ 1; ours dims to opacity 0.18 in `STATES.portfolio` — too faded | evidence: `foam_source/www.foam.org/talent-2024/artist/rehab-eldalil/index.html` header structure (foam wordmark not dimmed) vs `FoamSidebar.js:11 (opacity: 0.18)` | severity: **P1**
- Delta 5: foam.org uses `mix-blend-mode: difference` on the wordmark to stay readable against any bg (we already do this in talent.css `.foam-sidebar`) | (match)

## GalleryGrid.js
- Delta 1: **gallery in foam.org is a 3D three.js scene with OrbitControls + perspective camera + textured planes positioned at the authored (x,y,z)** — ours is 2D DOM with a 2D projection of (x,y,z) | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js:26× Vector3`, `4651 chunk:OrbitControls, PerspectiveCamera`; our `GalleryGrid.js:27-44 PROJ()` flattens to 2D | severity: **P0** (intentional design choice we already made because layoutId requires DOM; flag as known divergence)
- Delta 2: foam.org gallery has a **drag-the-canvas pan** (visible in `foam-mega/site/interactions/index_drag_*.png`) where mouse drag shifts the camera and reveals cards outside the initial frame; ours has no drag — cards are at fixed viewport positions | evidence: `foam-mega/site/interactions/index_drag_00.png` shows hero off-screen after pan | severity: **P0**
- Delta 3: foam.org's hover state shows a **CustomCursor that follows the mouse with the artist's exhibition name** (CursorIcon in talent chunk); ours shows a pill "enter portfolio →" under the hovered card | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js:53296` `CursorIcon` is mounted alongside FilterCloseButton | severity: **P1**
- Delta 4: per-artist data parity (slug/accent/accentText/position/tags) — **identical to foam.org** for 19 of 20 artists; only delta is `andre-ramos-woodard.accentText = '#000'` in ours vs `null` in foam | evidence: `_next/data/.../talent-2024.json` adaptedOverviewArtists | severity: **P2**
- Delta 5: card rotation in foam.org appears to be 0° (planes face the camera); ours adds ±2.4° rotation per slug-hash | evidence: drag screenshots show no per-card tilt | severity: **P1**
- Delta 6: foam.org dims non-hovered cards via material opacity in the shader (radius/opacity uniforms in `foam-mega/site/shaders/index_01.glsl`); ours uses framer-motion `opacity: 0.25` — visually equivalent | (match in effect)

## CategoryChipsHud.js
- Delta 1: foam.org has 8 chips: `overview · landscape · plants · collage · archival · collaborative · portrait · digital manipulation` — ours has the same 8 chips plus a separate trailing 'i' chip | evidence: `foam-mega/site/interactions/index_chip_00.png` chip row + `talent-2024.json` filter names from each artist's `filters[]` | severity: **P2** (the `i` chip is also visible in some chip screenshots, so plausibly correct)
- Delta 2: foam.org chips at bottom-right are styled with a different active state — active chip has a thin top-border underline; ours has a `1px solid black` bottom border | evidence: `foam-mega/site/interactions/index_chip_*.png` zoomed | severity: **P2**
- Delta 3: foam.org's filter-active state shows a **FilterCloseButton** (top-centre, 35×35 pill with X icon, `transition: {duration: 1, ease: [.43, .19, .02, 1]}`) — ours has no filter-dismiss button; clicking 'overview' clears the filter | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js:29990 FilterCloseButton_templateObject` | severity: **P1**
- Delta 4: chip-click on foam.org **animates the 3D scene to translate the camera toward the filter's authored (x,y,z) position**; ours only filters which cards are visible | evidence: filter positions in `talent-2024.json` adaptedOverviewArtists.filters[] are 3D coordinates (e.g. Archival at `x:-23, y:6, z:-17`); foam's 3D scene navigates to them | severity: **P1**
- Delta 5: chip order matches | (match)
- Delta 6: the 'i' chip on foam opens an `UI_InfoModal` (visible in talent chunk `:53296`); ours wires `onInfo` but the panel never renders | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js:53296 UI_InfoModal,{is...}` | severity: **P1**

## Portfolio.js (the click-into-artist view)
- Delta 1: **foam.org artist pages scroll VERTICALLY**, not horizontally — confirmed by 28 `overflow-hidden` rules in artist HTML AND `useScrollProgress` 3× in chunk 8222 (would be moot if horizontal-paged) | evidence: `foam_source/www.foam.org/talent-2024/artist/rehab-eldalil/index.html overflow-hidden` × 28 (these are on children, body itself scrolls); chunk 8222 `useScrollProgress` | severity: **P0**
- Delta 2: our `wheel-Y → translateX` horizontal pager is the OPPOSITE direction of what foam.org does | evidence: `src/components/talent/Portfolio.js:63-72` vs `_next/static/chunks/8222...js:useScrollProgress + onWheel 2×` (foam reads wheel into vertical scroll, not horizontal) | severity: **P0**
- Delta 3: foam.org's cover/intro section uses `OnlineExhibitionIntro` (18 hits in chunk 8222) with sub-components `OnlineExhibitionIntroImage` (10×), `OnlineExhibitionIntroTypography` (7×), `OnlineExhibitionIntroButton` (7×) — ours hand-rolls a single cover spread with artist name + exhibition + hero | evidence: chunk 8222 grep; our `Portfolio.js:130-180 cover section` | severity: **P1**
- Delta 4: foam.org artist `pageProps` exposes `chapters` and `nextExhibition` (with `{name, intro, slug, backgroundColor, isExhibitionIntroFixed}`); we don't surface chapters and our `nextArtist()` does its own walk through `ARTISTS` array instead of using server-provided `nextExhibition` | evidence: `foam_source/.../rehab-eldalil/index.html` NEXT_DATA pageProps; our `src/lib/talent-artists.js:nextArtist` | severity: **P1**
- Delta 5: `← gallery` close-affordance at top-left fixed — foam.org's close is the **cursor-following CloseButton** from `_app.js:172532-172737` (translates to mouse coords on mousemove); ours is a static top-left link | evidence: `_app-2dea851bca254b87.js:updateCloseButtonPosition` | severity: **P1**
- Delta 6: foam.org's portfolio bg matches the artist's `frameBackgroundColor` exactly — ours does the same | (match)
- Delta 7: foam.org has a 'scroll →' indicator only in our build, not foam — ours adds it as a hint (cosmetic addition) | evidence: `Portfolio.js:227-241` | severity: **P2**

## TalentExperience.js (overall choreography)
- Delta 1: **our intro→hero-zoom→gallery transition is `setTimeout`-driven** (100ms, 2300ms timers); foam's gallery chunk ALSO uses `setTimeout` (4×) and a custom `useFrames` context — NOT `useScroll` as I had projected in Phase B brief. Phase B brief was wrong about this. | evidence: `_next/static/chunks/pages/talent-2024-...js:setTimeout 4×, useFrames 14×, isIntroComplete 7×`; our `TalentExperience.js:60-67` | severity: **P2** (stack alignment — both timer-driven)
- Delta 2: foam.org gates state via `isIntroComplete` / `isIntroUnderway` / `isHoveringActiveFrame` (a Context); ours uses local `phase` state + `setHovered`. Functionally equivalent, architecturally different | evidence: same chunk grep | severity: **P2**
- Delta 3: foam.org renders **CursorIcon** (custom cursor with artist name on hover) and **CloseButton** (cursor-follower, visible during portfolio) as siblings to the page content; we render neither | evidence: `_next/static/chunks/pages/talent-2024-6c8dd850cbbdcb6e.js:53296 CursorIcon,{mouseX:j,mouseY:y}` | severity: **P1**
- Delta 4: foam.org sets `--accent` via the `<html style>` from `CanvasProvider` (talent-2024 chunk; tweens between artists); we set it inline on the `talent-root` div. Same effect | (match in behaviour)
- Delta 5: `history.pushState` for the `/talent/<slug>` URL — foam.org uses Next router's shallow routing (which also produces `pushState` under the hood). Same visible behaviour | (match)
- Delta 6: deep-link to `/talent/<slug>` jumps straight to `phase='portfolio'`, bypassing intro — foam.org does the same | (match)

## spreads/ExhibitionSection.js
- Delta 1: foam.org renders **14 section component types**: Image, Images, ImagesWithText, Prose, Quote, InlineVideo, Video, Podcast, Viewer, CustomEmbed, Collage, Chapter, Fact, Wrapper, Inner, Element, Intro, IntroImage, IntroTypography, IntroButton (from chunk 8222 grep). We render 10: image, images, images-with-text, prose, quote, inline-video, video, podcast, embed, viewer. **Missing**: Collage, Chapter, Fact, Intro/IntroImage/IntroTypography/IntroButton (the intro grouping) | evidence: `_next/static/chunks/8222-45588d110a4a4168.js` grep | severity: **P1**
- Delta 2: foam.org's `OnlineExhibitionPodcast` renders an `<audio>` element with custom `AudioControl*` styled wrapper (`componentId:"sc-c3243f39-0..4"` × 5 styled sub-components) and uses a `progress` element/bar for elapsed time — NOT an ellipse with an arc | evidence: chunk 8222 `jsx)(audio` + 5 `AudioControl*` styled components + `progress` 9× | severity: **P1** (visual deviation — see AudioRing section below)
- Delta 3: free-positioned images (`freeImage: true`, `top: X%`, `left: Y%`) — we handle these correctly via `position: absolute` and `top/left` percentages | (match)
- Delta 4: image grid layout — we use a CSS grid with `repeat(${cols}, 1fr)`; foam.org uses a more complex `image_layout` array in each section's data (`layout` field captured in our copy script). We pass through `layout: s.layout || s.image_layout || []` but don't render it | evidence: `src/components/talent/spreads/ExhibitionSection.js:106-130` ignores the layout array | severity: **P1**
- Delta 5: foam.org renders rich-text via `RichText.Render(textNode)` (Storyblok's runtime); we convert at build time via Python `richtext_to_html` in `scripts/build-talent-data.py`. Difference: dynamic Storyblok updates won't reflect; but for the static dataset, equivalent | (match)
- Delta 6: P2 batch (cosmetic): video poster handling, inline-video `loop:true` default, video without poster shows native controls only — all minor styling drift

## spreads/AudioRing.js
- Delta 1: **foam.org does NOT have an ellipse audio-ring**. The shape is a `<button>` with `AudioControl*` styled sub-components (`componentId:"sc-c3243f39-0..4"`) and a flat `progress` bar (likely linear, with 9× `progress` mentions). Our 480×320 ellipse with anti-clockwise progress arc is a stylistic addition, not present in the reference | evidence: `_next/static/chunks/8222-45588d110a4a4168.js` no `ellipse`/`AudioRing`/`RingPlayer` identifiers; 5× `AudioControl*` emotion components; 9× `progress` | severity: **P1** (the brief's reference video had "audio ring" — that was a misread of foam.org's UI; ours is over-designed)
- Delta 2: our 404-degrade behaviour (silent fallback when src missing) is sensible for dev with missing assets — no foam.org analogue but not harmful | (match — extra hardening)
- Delta 3: `<audio>` element mounting + play/pause + currentTime/duration display — matches foam's basic audio behaviour | (match)
- Delta 4: foam.org's podcast UI has 5 styled sub-components, suggesting: outer wrapper, play/pause button, title, duration, progress bar — we collapse all into a single button | severity: **P2**

---

## Totals

**P0: 5**  ·  **P1: 13**  ·  **P2: 13**

## Top 5 by user-visible impact

1. **Portfolio.js · wheel-Y → translateX is wrong direction** — foam.org artist pages scroll vertically; our horizontal pager doesn't match the reference. The brief I followed in the previous round was based on a misread of the recording. **(P0)**
2. **GalleryGrid.js · missing canvas drag-pan** — foam.org's 3D scene can be drag-panned to reveal cards outside the initial frame (see `foam-mega/.../index_drag_*.png`); ours has no drag interaction. **(P0)**
3. **Intro.js · missing full-bleed hero photo behind TALENT from t=0** — foam shows the artist photograph immediately as the page loads; ours stays pure black for the first 1.6 s. **(P0)**
4. **GalleryGrid.js · 2D DOM vs foam's 3D scene** — already a known intentional divergence (forced by `layoutId` requiring DOM); flagged as P0 so the trade-off is explicit. **(P0)**
5. **CategoryChipsHud.js · missing FilterCloseButton at top-centre when filter is active** — foam has a 35×35 pill dismiss button with a specific `cubic-bezier(0.43, 0.19, 0.02, 1)` transition; ours has none. **(P1, but high-visibility)**

---

## Cross-cutting architectural P2s (flag, don't fix yet)

- **Stack mismatch**: FoamSidebar.js + IntroTypography (now deleted) used GSAP; talent-artists.js was generated outside framer-motion idioms. Foam is pure framer-motion + emotion. Migrating away from GSAP entirely would be cleaner.
- **emotion vs styled-components**: our project uses styled-components for the rest of connecting-communities; foam uses emotion. Not worth migrating the talent components for parity.
- **CMS pipeline**: foam reads from Storyblok at runtime; we cache the data at build time via `scripts/build-talent-data.py`. Means content updates require a rebuild.
- **3D vs 2D gallery**: foam's three.js scene allows OrbitControls + camera dolly + per-frame textures with a custom GLSL material (`foam-mega/.../shaders/index_01.glsl` has `udRoundBox`, `aspect`, `zoom`, `grayscale`, `radius`). Our 2D DOM gallery sacrifices the 3D parallax for `layoutId` compatibility — a reasoned trade-off, but ground-truth divergence.
