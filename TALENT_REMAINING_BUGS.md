# /talent — Six remaining bugs to fix

Major progress is in. The hero op-art pattern, image flash, white-background gallery, foam logo rotation, category pills, photographer detail pages, and "thank you for visiting" end state are all working. Six bugs remain. Fix them in order — do not skip ahead.

**Project:** `/talent` route, running at `localhost:3002`. NOT the `find-site/` (Vamar real estate) project. Find the right working directory before touching files.

**Reference:** the `.wacz` extraction at `foam_source/` from the prior audit, plus the production foam.org/talent-2024 served via pywb at `localhost:8080` if it's still running.

---

## Bug 1 — White-empty frame during page transitions (P0)

**Symptom:** When navigating from the gallery to a photographer detail page (or back), the screen goes fully white for ~1–2 seconds. Evidence: a screen recording shows pure white from ~8s–10s with only a cursor visible. The destination page eventually loads.

**Likely root cause:** A `loading.tsx` file in `app/talent/` or `app/talent/[slug]/` returns just a white `<div className="bg-white h-screen" />` or `<></>`. Next.js renders this immediately while the destination page suspends.

**Fix:**
1. Find every `loading.tsx` under `app/talent/` (`find . -path "*/talent*" -name "loading.tsx"`).
2. Replace each with a transparent passthrough that keeps the previous page's background visible during navigation, OR with a tiny inline skeleton matching the destination (e.g., for a photographer page, show a yellow background and a centered spinner).
3. If you don't have `loading.tsx` files but still see the white flash, the issue is a `Suspense` boundary with no `fallback` — search for `<Suspense>` and add fallbacks.
4. Check the root `app/talent/layout.tsx` for a hard `background: #fff` that's overriding child route styles.

**Acceptance:** Navigating from `/talent` to `/talent/[slug]` and back shows no fully-white intermediate frame longer than ~150ms.

---

## Bug 2 — Black-empty frame during navigation (P0)

**Symptom:** Same as Bug 1 but inverted — screen goes pure black between certain states. Evidence: rec A around 14s, rec B around 70s.

**Likely root cause:** The `body` background is locked to `#000` by GSAP `gsap.set('body', { backgroundColor: '#000' })` in the `TalentHero` cleanup, but the unmount happens BEFORE the next page's CSS applies its own background. The body stays black until the new page's style hits.

**Fix:**
1. Find the GSAP cleanup that sets `body` color.
2. Move that color logic OFF the `body` and ONTO a page-local container. Each route should own its own background via Tailwind className on the page root, not by mutating `document.body`.
3. If multiple components are calling `gsap.set('body', ...)`, consolidate to a single source of truth (a `useTalentBackground` hook driven by the active route).

**Acceptance:** Navigating between any two talent routes shows no fully-black intermediate frame.

---

## Bug 3 — "Close" button stuck across non-detail states (P0)

**Symptom:** A red "Close" pill at bottom-left appears in states where it shouldn't — visible in gallery view, blank transition frames, and the yellow photographer detail page (where it might be correct), but not the hero. Evidence: rec B at 5s, 18s, 90s.

**Likely root cause:** The Close button is rendered in a layout file (`app/talent/layout.tsx` or similar) instead of inside the photographer detail page. So it leaks into sibling routes.

**Fix:**
1. Find the Close button JSX. Likely contains `'Close'` or has a class like `.btn-close` or `aria-label="close"`.
2. If it's in a layout, move it into `app/talent/[slug]/page.tsx` directly, or into a component that only renders inside that route.
3. If it must stay in the layout for layout reasons, gate its render on the current pathname: `const path = usePathname(); if (!path.startsWith('/talent/') || path === '/talent') return null;` — only show on `/talent/[slug]` deep routes.

**Acceptance:** Close button is visible ONLY on photographer detail pages (`/talent/[slug]`). It is NOT visible on `/talent` itself, during transitions, or on the "thank you for visiting" page (unless that page is the spec-correct place for it).

---

## Bug 4 — "1 Issue" Next.js runtime error indicator (P0)

**Symptom:** The Next.js dev overlay shows a red "1 Issue" pill at the bottom of the page, indicating an unresolved runtime error.

**Fix:**
1. In the browser console, open the Next.js error overlay (click the red pill, or open DevTools → Console).
2. Read the actual error. Common causes in this project:
   - `useGSAP` or `ScrollTrigger.create` called without `'use client'` directive on the file
   - Hydration mismatch from a server-rendered component using `Date.now()` or `Math.random()` for positions
   - `useGLTF` or any three.js import in a server component
   - `dynamic()` import without `ssr: false` on a component that uses `window`
3. Fix the root cause, not the symptom (don't just wrap in try/catch).
4. Reload, confirm the "1 Issue" pill is gone.

**Acceptance:** Page loads with zero entries in the Next.js error overlay. Browser console shows no errors (warnings about deprecated three.js Clock are acceptable — those are library-internal).

---

## Bug 5 — Photo constellation cards lack varied sizing (P1)

**Symptom:** Cards in the gallery view are too similar in size and feel densely clustered. Reference has dramatic size variation (some cards are 480px wide, others are 140px thumbnail-sized) and intentional whitespace between them.

**Fix:**
1. Open `src/data/talent.ts` (or wherever the card metadata lives).
2. For each card, ensure `w` (width) varies significantly: distribute across 140, 180, 220, 280, 340, 420 px buckets. Roughly 30% small, 50% medium, 20% large.
3. Increase the spread of `x` and `y` coordinates — current cards probably cluster in 30–70% of the viewport. Push some out to 10% / 85% to use the full width.
4. Verify rotation values (`rot`) span -8° to +8° — current cards may all be 0° or near-0°.

**Acceptance:** Side-by-side screenshot of gallery state at the same viewport size against the foam.org reference shows comparable density distribution and whitespace.

---

## Bug 6 — Unknown blue-background "frame/border" intermediate state (P1)

**Symptom:** Around 38s in the long recording, a blue background page appears briefly with what looks like a frame/border element. Not part of any documented spec state.

**Likely root cause:** Old design artifact, a deleted route that still exists at the file level, or a fallback `not-found.tsx` styled in blue.

**Fix:**
1. Search for the blue color: `grep -rn -E "#[0-9a-f]{6}" src/ | grep -iE "blue|3b|4d|navy" | head`
2. Find the component using it. If it's a deprecated state, delete the file/component.
3. If it's an intentional state that's just styled wrong, document what it's supposed to be and either restyle to match the foam reference (which uses yellow/cream for these intermediate states) or delete it.

**Acceptance:** Recording a full /talent traversal shows no unintended blue state.

---

## After fixing — verification

Record a fresh full-page traversal of `/talent`:
1. Land on hero. Scroll through image-flash sequence. Watch background flip to white. Gallery state appears.
2. Click 3 different photo cards in sequence. Each loads its photographer detail page. Back-button returns to gallery.
3. Navigate to "thank you for visiting" via the appropriate trigger.

Across this entire traversal, log:
- Zero fully-white frames longer than 150ms
- Zero fully-black frames longer than 150ms
- Close button visible only on /talent/[slug] routes
- No "1 Issue" indicator
- No blue-background mystery state
- Photo cards visually varied in size

Commit the traversal recording to the repo at `verification/talent-after-fixes.mov` for the user to compare against the foam.org reference.

---

## Do not

- Do NOT use sudo
- Do NOT touch `find-site/` (the Vamar real-estate project)
- Do NOT refactor unrelated code
- Do NOT mark any bug fixed without rerunning the traversal and visually confirming the fix
- Do NOT add new sections or features — these 6 fixes are the entire scope
