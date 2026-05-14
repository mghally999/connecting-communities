# Camera audit — round 7

Hard rule: **only chapter 1 is top-down. Every other chapter is a
human walk-in framing** at eye level (≈ 1.5–1.7 m), camera inside
or at the doorway of the relevant room, looking horizontally at
fixtures. No more compensating for bad cameras by switching to
overhead.

All coordinates are in the auto-fit three.js world established by
TrACModel: FIT_SIZE=18, tight-footprint centred on origin. After
that fit:

```
Building floor:                     Y = 0
Building wall top (~95th %ile):     Y ≈ 1.5 m
Building exterior / roof peak:      Y ≈ 3.6 m
Building footprint X span:          [-3.8, +3.8]
Building footprint Z span:          [-3.9, +3.9]
Front face (entrance + doorways):   Z = +3.8
Signage pillar (outside):           (-5.6, *, +3.2)
AQUASOL kit (outside):              (+8.4, *, +4.0)
```

## Chapter table

| # | Chapter | Cam (x, y, z) | Target (x, y, z) | FOV | Subject | Why this angle |
|---|---|---|---|---|---|---|
| 0 | Pillar / signage | (-5.6, 1.7, +7.0) | (-5.6, 2.0, +3.2) | 50° | Full signage pillar — CC + TrAC + Aspire + AQUASOL panels readable | Eye-level, directly in front of the pillar's readable face, 3.8 m back. Earlier rounds had the camera offset right of the pillar which cropped the signage at the left edge. |
| 1 | Bird's-eye | (+1.0, 22.0, +5.0) | (+1.0, 0, -0.5) | 55° | Whole site: signage + building + AQUASOL + paving | At 22 m up with a 55° FOV the visible diagonal is ~24 m. Site footprint is ~14 m × 8 m so the whole site fits with margin including the back-left signage pillar and back-right AQUASOL kit. Slight +Z lean angles the entrance into view. |
| 2 | Middle room walk-in | (0, 1.6, +2.8) | (0, 1.1, +0.4) | 55° | Inside the lobby, both counters in frame | Camera just inside the middle room's +Z doorway (front face of room at z=+3.0). Looking back into the room sees both orange + blue counters flanking the spine. Wider FOV catches both at once. |
| 3 | Orange counter | (+0.7, 1.5, +2.4) | (-0.9, 1.0, +0.4) | 50° | Orange counter, viewer facing it from the right side | Camera moved to the right of the lobby, head turned left — like a visitor looking at the orange counter from the doorway. |
| 4 | Blue counter | (-0.7, 1.5, +2.4) | (+0.9, 1.0, +0.4) | 50° | Blue counter, viewer facing it from the left side | Mirror of ch 3. |
| 5 | Shop walk-in | (-2.6, 1.6, +2.2) | (-2.6, 1.0, -2.5) | 55° | Long shop, shelves of produce stretching back | Shop runs the full depth of the building — camera at its +Z doorway, looking down the long axis to the back wall. Wider FOV for a corridor-like shot. |
| 6 | Classroom walk-in | (0, 1.6, -0.8) | (0, 1.0, -2.8) | 55° | Desks in formation | Classroom is the back-middle room. Its doorway is on its +Z side facing the middle room corridor. Camera there, looking toward -Z, captures all desks. |
| 7 | Office (consulting) | (+2.4, 1.5, -0.6) | (+2.4, 1.0, -2.5) | 50° | Single desk and chair, private | Small room — narrower FOV. Camera at +Z doorway, looking back at the desk. |
| 8 | Pantry (back office) | (+1.3, 1.5, +1.0) | (+2.6, 1.0, +1.0) | 50° | Shelving and supplies | Pantry's doorway faces the middle of the building (-X side), so the camera sits there and looks east (+X) into the room. Different doorway orientation from the others — see "uncertainties" below. |
| 9 | Tank + solar | (+10.5, 2.2, +7.5) | (+8.4, 2.2, +4.0) | 45° | AQUASOL kit centred — water tank, solar panel, logo plate | Eye-level on the kit, narrower FOV (45°) so the logo fills more of the frame and the "tank + solar" message reads. |

## What was changed in this round

- All previous "angled aerial" cameras with high Y replaced with
  walk-in framings at Y = 1.5–1.7 (except ch 1 which is intentionally
  top-down, the brief allows that for the bird's-eye and only there).
- FOV is now per-chapter rather than fixed at the Canvas level.
  `JourneyScene` reads it from the chapter sample and updates the
  projection matrix only when the value changes — no per-frame
  matrix churn.
- `BUILDING_ROT_Y` in `TrACModel.js` is now URL-overridable via
  `?rot=0/1/2/3`. Useful for verifying which face is the "front"
  before committing the right value to the source.
- Active-room highlight ring opacity 0.55 → 0.32 (it's less needed
  when the camera is already physically inside the room).
- Dim-non-active-rooms overlay opacity 0.28 → 0.18 (same reasoning).

## Uncertainties / things you'll want to verify in browser

1. **Building orientation.** `BUILDING_ROT_Y = 0` is the default. The
   bird's-eye render in the round-6 video confirmed the rooms are
   where I expected, so 0 should be correct. If anything looks
   reversed (e.g. you scroll to "middle room" and see the exterior
   wall instead of the lobby), append `?rot=1` to the URL and check
   if it improves. Repeat with `?rot=2` and `?rot=3` to find the
   right value, then update the constant.

2. **Pantry doorway side.** I'm assuming it's on the -X side (camera
   at +1.3 looking east toward +2.6). If the pantry actually opens
   on its +Z side like the others, that frame will show a wall. The
   easy swap is:
   ```js
   /* ch 8 pantry — +Z doorway variant */
   cam:    { x: +2.4, y: 1.5, z: +2.3 },
   target: { x: +2.4, y: 1.0, z: +0.5 },
   ```

3. **Orange vs blue counter sides.** The image you sent shows the
   orange feature in the bottom-left when looking down at the middle
   room. Reading that as "orange on the left from a visitor entering
   the doorway", ch 3 and ch 4 are configured accordingly. If
   reversed in person, swap the X signs on ch 3 and ch 4 cam and
   target values.

4. **Wall heights.** If the partition walls inside the building
   are below 1.5 m, the camera at y=1.6 will see over them into
   neighbouring rooms (lose the "I'm in this room" feeling). If that
   happens, drop interior chapter Y values to 1.0 — still legibly
   human, just kneeling-viewer height.

## Tuning knobs

All in one place at the top of `journey-chapters.js`:
- `ROOM_RECTS_LIST` — drives chapter cameras, highlight ring,
  dimmer overlays, AND `/our-model-2`'s room positions. One edit
  cascades to all four.
- Each chapter's `cam`, `target`, `fov` is a plain object literal —
  tweak per chapter as needed.

In `TrACModel.js`:
- `BUILDING_ROT_Y` — code constant or `?rot=N` URL override.
- `TIGHT_OFFSET_X / Z` — re-centring offsets if the architect
  re-exports the GLB and the building shifts inside its world coords.
- `FIT_SIZE` — current 18 m gives ~14 m wide / 3.6 m tall building.
  Bump it if you want the building bigger relative to the bench /
  AQUASOL outliers.

## Hard rules going forward

- Chapter 1 (bird's-eye) is the only top-down stop in the entire
  experience. Everything else stays at human walk-in level.
- If a future chapter "doesn't work" with a walk-in cam (camera in
  a wall, view obscured), the fix is to move the camera to a better
  doorway angle — never to switch the chapter to top-down.
- If the GLB itself blocks a shot (e.g. a column literally in front
  of the camera at any usable angle), call it out and we ask the
  architect for a doorway/wall adjustment in the GLB. The web build
  doesn't compensate by going overhead.
