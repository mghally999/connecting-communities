# Round 7 — Human walk-in cameras (no more top-down compensation)

## What changed

### 1. Every chapter except bird's-eye is now a human walk-in

The previous build dropped to overhead views whenever the angled
aerial showed the awning instead of a room. Mohammed flagged this as
violating the brief. Fixed: chapter 1 is the only top-down stop;
chapters 0 and 2–9 all sit at human eye level (y ≈ 1.5–1.7 m),
positioned just inside or at the doorway of the relevant room, looking
horizontally at the fixtures.

Full table in `CAMERA_AUDIT.md` at the project root.

### 2. Per-chapter field-of-view

The Canvas FOV is no longer fixed at 42°. Each chapter now carries
its own `fov` value (40°–55° depending on subject size and shot
type). `JourneyScene` reads it from the chapter sample each frame
and calls `updateProjectionMatrix` only when the value has actually
changed by > 0.05°. The same FOV plumbing was added to
`/our-model-2`'s `RoomScene`, with `RoomExperience` interpolating
the value alongside cam/target during the room-to-room tween.

### 3. URL knobs for live tuning

- `?test=1` on `/our-model` → small bottom-right panel that shows
  the active chapter's `cam` / `target` / `fov` values, with a
  one-click button to copy a paste-ready snippet for
  `journey-chapters.js`. Combined with the existing arrow-key
  chapter navigation (already wired in `useChapterSnap`), you can
  walk through every chapter and copy any that need adjustment in a
  couple of minutes, without a rebuild.
- `?rot=0/1/2/3` on either model page → hot-swaps `BUILDING_ROT_Y`
  in 90° increments. If the building's entry face came out on the
  wrong side, you can flip through orientations without touching
  code. Once the right rotation is identified, hard-code it as the
  `BUILDING_ROT_Y` constant in `TrACModel.js`.

### 4. Highlight + dimmer toned down

The orange ring around the active room dropped from 0.55 → 0.32
opacity, and the dim-non-active-rooms overlay from 0.28 → 0.18.
Reasoning: when the camera is already physically inside a room at
eye level, the user can see they're inside it — the ring's job is
just a soft confirmation, not a "you are here" marker.

### 5. Prior fixes preserved

- `Header.js` exact-match active link (so `/our-model` and
  `/our-model-2` don't both light up).
- `useChapterSnap.js` GESTURE_GAP_MS=280 + SCROLL_TWEEN_MS=1100 (one
  fling = one chapter, cinematic tween).
- `TIGHT_OFFSET_X/Z` re-centring on the building's tight footprint
  in `TrACModel.js`.

## What to test in the browser

1. `/our-model` — scroll from top to bottom. Each chapter should
   show the labelled subject, not exterior columns or awning.
2. `/our-model?test=1` — same scroll, with a small panel at
   bottom-right showing the current chapter's values. If anything
   looks wrong, arrow-keys to that chapter, eyeball what the
   correct values would be, paste the snippet into
   `journey-chapters.js` for the next build.
3. `/our-model?rot=0`, `?rot=1`, `?rot=2`, `?rot=3` — only one
   should look correct (entry face / signage pillar visible from
   the pillar chapter). Settle on that value and commit it as
   `BUILDING_ROT_Y`.
4. `/our-model-2` — click each room button at the bottom. Camera
   should walk to a clear interior view of each room, not overhead.
5. Nav bar — only one link highlighted at a time (`/our-model` vs
   `/our-model-2`).

## Known uncertainties

Listed in detail in `CAMERA_AUDIT.md` under the "Uncertainties"
section. The big ones:

- **Pantry doorway side** — I assumed -X. If the room comes up
  showing a wall, swap to the +Z variant at the bottom of the audit.
- **Orange vs blue counter sides** — I read the screenshot you sent
  as orange on the left. Two cameras to swap if reversed.
- **Wall heights** — if interior partitions are below 1.5 m, lower
  the interior chapter Y values to 1.0.

All of these are one-line edits in `journey-chapters.js`, no
architectural changes needed.

## Build status

```
$ npm run build
Compiled successfully
8/8 static routes generated
```

## File diff (what got touched)

```
REWRITTEN:
  src/lib/journey-chapters.js
    + Per-chapter fov on every CHAPTER
    + Walk-in cameras for chapters 0, 2–9
    + sampleAt now interpolates fov
    + 10-chapter list, ROOM_RECTS office/pantry swap from round 6 intact

EDITED:
  src/components/our-model/TrACModel.js
    + getBuildingRotY() reads ?rot=N URL param
    + RoomHighlight ring opacity 0.55 → 0.32
    + RoomDimmers dim 0.28 → 0.18

  src/components/our-model/JourneyScene.js
    + Applies sample.fov each frame (gated update)
    + Canvas default FOV 42 → 50
    + Initial camera position moved to chapter 0's pillar shot

  src/components/our-model/OurModelJourney.js
    + Inline TestPanel component visible when ?test=1

  src/components/our-model-2/rooms.js
    + Walk-in cameras + fov per room

  src/components/our-model-2/RoomScene.js
    + Applies cameraStateRef.fov each frame (gated update)

  src/components/our-model-2/RoomExperience.js
    + cameraStateRef shape includes fov
    + Room tween interpolates fov along with cam/target

  NEW:
  CAMERA_AUDIT.md   — every chapter's intended view, position, FOV,
                       and tuning knobs in one place
```
