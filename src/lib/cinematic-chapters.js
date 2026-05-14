/**
 * cinematic-chapters.js
 *
 * Model 3 — "Cinematic Showcase" timeline.
 *
 * Where /our-model (Model 1) is a scroll-driven walk-through and
 * /our-model-2 (Model 2) is a Drake-style click-to-walk explorer,
 * /our-model-3 is the high-polish editorial cinematic version. Every
 * chapter is a shot a cinematographer would frame on purpose:
 * orbits, dollies, tight close-ups, pull-backs. No top-down except
 * one descending aerial. No claim of "walking inside the rooms" —
 * this page leans into what the GLB is actually good at and uses
 * post-processing (bloom, vignette, particles, drift) to do the
 * heavy emotional lifting that Pyramids of Meroë's pure camera-
 * work alone does.
 *
 * Shared with the rest of the site:
 *   - ROOM_RECTS from journey-chapters.js (single source of room
 *     coordinates — change once, every page follows).
 *   - The TrACModel component itself.
 *
 * Each chapter declares:
 *   id         — stable string id
 *   eyebrow    — small caption above title (e.g. "01 / 11")
 *   label      — short label for the rail
 *   title      — main caption
 *   body       — sub-caption
 *   layout     — caption position (center-bottom | side-left | side-right)
 *   cam, target — Vector3-shaped, in three.js auto-fit world coords
 *   fov        — per-chapter field of view (35°-65°)
 *   drift      — { ax, az, ay, speed } continuous camera idle motion
 *                 (so the camera never freezes — straight from the
 *                 Meroë playbook)
 *   key        — sun direction + colour for the directional key light
 *   ambient    — ambient intensity and tint
 *   bg         — top + bottom hex for the gradient sky behind the model
 *   bloom      — { threshold, strength } overlay-bloom intensity
 *   vignette   — 0..1 strength of the dark vignette
 *   fog        — 0..1 strength of the depth fog
 *   highlight  — { roomId | "tank" | null } what to glow on the floor
 *   beatMs     — desired tween duration for the move INTO this chapter
 */

import { ROOM_RECTS } from "@/lib/journey-chapters";

const R = ROOM_RECTS;

/* The chapters --------------------------------------------------------- */

export const CINEMATIC_CHAPTERS = [
  /* 0 — Ignite. Camera high, looking down at the still-dark site.
   *      Title fades up out of black with a bloom-glow flare. */
  {
    id: "ignite",
    eyebrow: "PROLOGUE",
    label: "Ignite",
    title: "Where dusk meets dawn",
    body:
      "A community hub takes its first breath at the edge of a quiet evening.",
    layout: "center-bottom",
    cam:    { x: -6.0, y: 9.0, z: 18.0 },
    target: { x:  0.0, y: 1.4, z: -0.5 },
    fov:    52,
    drift:  { ax: 0.04, az: 0.06, ay: 0.02, speed: 0.16 },
    key:    { x: -2, y: 3, z: 14, intensity: 0.9,  color: "#ffb46c" },
    ambient:{ intensity: 0.35, color: "#3a3650" },
    bg:     { top: "#0c0d18", bot: "#241828" },
    bloom:  { threshold: 0.55, strength: 0.95 },
    vignette: 0.55,
    fog:    0.85,
    highlight: null,
    beatMs: 1400,
  },

  /* 1 — Hero establishing. The whole site lit by a low warm sun,
   *      camera slowly rotating around the building. */
  {
    id: "hero",
    eyebrow: "01 / 11",
    label: "The hub",
    title: "A single building, every essential service",
    body:
      "Eight functions under one roof — connectivity, finance, learning, agriculture, water, energy, health, and a coffee at the centre of it all.",
    layout: "side-left",
    cam:    { x: -10.0, y: 4.5, z: 14.0 },
    target: { x:   0.0, y: 1.6, z: -0.2 },
    fov:    48,
    drift:  { ax: 0.20, az: 0.30, ay: 0.04, speed: 0.10 },
    key:    { x: -4, y: 7, z: 8, intensity: 1.6, color: "#ffd098" },
    ambient:{ intensity: 0.55, color: "#5a4c6a" },
    bg:     { top: "#1a1426", bot: "#4a2d2e" },
    bloom:  { threshold: 0.62, strength: 0.75 },
    vignette: 0.42,
    fog:    0.65,
    highlight: null,
    beatMs: 1500,
  },

  /* 2 — Slow approach. Dolly in along +Z, keeping the building
   *      centred. Camera descends slightly. */
  {
    id: "approach",
    eyebrow: "02 / 11",
    label: "Approach",
    title: "Step closer",
    body:
      "Past the courtyard paving, the signage pillar, and the bench out front — the entrance reveals itself.",
    layout: "side-right",
    cam:    { x: -1.0, y: 3.4, z: 10.5 },
    target: { x: -0.4, y: 1.3, z:  2.0 },
    fov:    50,
    drift:  { ax: 0.06, az: 0.18, ay: 0.03, speed: 0.13 },
    key:    { x: -2, y: 6, z: 10, intensity: 1.7, color: "#ffd7a0" },
    ambient:{ intensity: 0.6, color: "#664e5e" },
    bg:     { top: "#231828", bot: "#5b2f2a" },
    bloom:  { threshold: 0.65, strength: 0.65 },
    vignette: 0.38,
    fog:    0.55,
    highlight: null,
    beatMs: 1400,
  },

  /* 3 — Signage pillar. Eye-level, framed straight on the signage. */
  {
    id: "signpost",
    eyebrow: "03 / 11",
    label: "The signpost",
    title: "Every hub begins with one welcoming address",
    body:
      "Connectivity, finance, education, agriculture, water, tele-health — listed before you step a foot inside.",
    layout: "side-right",
    cam:    { x: -5.7, y: 1.8, z: +7.4 },
    target: { x: -5.7, y: 2.0, z: +3.0 },
    fov:    44,
    drift:  { ax: 0.05, az: 0.04, ay: 0.02, speed: 0.18 },
    key:    { x: -8, y: 5, z: 10, intensity: 1.8, color: "#ffd6a0" },
    ambient:{ intensity: 0.5, color: "#5c4d62" },
    bg:     { top: "#1f1a2a", bot: "#5c3329" },
    bloom:  { threshold: 0.58, strength: 0.85 },
    vignette: 0.42,
    fog:    0.5,
    highlight: null,
    beatMs: 1300,
  },

  /* 4 — Aerial descent. Down from high, into a medium-aerial that
   *      tips slightly forward so the front face reads. */
  {
    id: "aerial",
    eyebrow: "04 / 11",
    label: "From above",
    title: "Six rooms, one continuous community",
    body:
      "Each room is a different service. From up here you can see how they share a single corridor — water at one end, learning at the other.",
    layout: "side-left",
    cam:    { x:  0.5, y: 17.5, z: +6.0 },
    target: { x:  0.5, y:  0.0, z: -0.4 },
    fov:    52,
    drift:  { ax: 0.10, az: 0.08, ay: 0.02, speed: 0.10 },
    key:    { x: 6, y: 14, z: 6, intensity: 1.5, color: "#ffd9aa" },
    ambient:{ intensity: 0.75, color: "#74616d" },
    bg:     { top: "#241c2c", bot: "#724337" },
    bloom:  { threshold: 0.7, strength: 0.55 },
    vignette: 0.35,
    fog:    0.4,
    highlight: null,
    beatMs: 1600,
  },

  /* 5 — Middle room reveal. Angled aerial that LOOKS like the camera
   *      is descending through the missing roof toward the counter. */
  {
    id: "middle-room",
    eyebrow: "05 / 11",
    label: "The middle room",
    title: "Two counters, one shared lobby",
    body:
      "The orange counter handles TrAC services. The blue counter handles Aspire microfinance. The same cup of coffee crosses both.",
    layout: "side-right",
    cam:    { x: R["middle-room"].cx + 0.0, y: 6.0, z: R["middle-room"].cz + 3.0 },
    target: { x: R["middle-room"].cx + 0.0, y: 0.6, z: R["middle-room"].cz + 0.0 },
    fov:    46,
    drift:  { ax: 0.05, az: 0.08, ay: 0.02, speed: 0.14 },
    key:    { x: 0, y: 9, z: 4, intensity: 1.5, color: "#ffceaa" },
    ambient:{ intensity: 0.7, color: "#74566a" },
    bg:     { top: "#241827", bot: "#693f30" },
    bloom:  { threshold: 0.55, strength: 0.95 },
    vignette: 0.45,
    fog:    0.45,
    highlight: "middle-room",
    beatMs: 1500,
  },

  /* 6 — Orange counter detail. Tight diagonal, narrow FOV. */
  {
    id: "orange-counter",
    eyebrow: "06 / 11",
    label: "Orange counter",
    title: "TrAC services brewed in orange",
    body:
      "Identity, education enrolment, agricultural extension, tele-health — initiated alongside a fresh cup of locally-sourced coffee.",
    layout: "side-left",
    cam:    { x: R["middle-room"].cx + 1.6, y: 3.0, z: R["middle-room"].cz + 2.2 },
    target: { x: R["middle-room"].cx - 0.7, y: 0.8, z: R["middle-room"].cz + 0.3 },
    fov:    42,
    drift:  { ax: 0.05, az: 0.04, ay: 0.02, speed: 0.16 },
    key:    { x: 3, y: 6, z: 4, intensity: 1.6, color: "#ffba85" },
    ambient:{ intensity: 0.65, color: "#7a4f55" },
    bg:     { top: "#241723", bot: "#7a3a28" },
    bloom:  { threshold: 0.55, strength: 1.0 },
    vignette: 0.48,
    fog:    0.4,
    highlight: "middle-room",
    beatMs: 1400,
  },

  /* 7 — Blue counter detail. Mirror of orange. */
  {
    id: "blue-counter",
    eyebrow: "07 / 11",
    label: "Blue counter",
    title: "Aspire microfinance, served in blue",
    body:
      "Savings, loans, group banking. A farmer applies for credit in the same visit as registering a child for school.",
    layout: "side-right",
    cam:    { x: R["middle-room"].cx - 1.6, y: 3.0, z: R["middle-room"].cz + 2.2 },
    target: { x: R["middle-room"].cx + 0.7, y: 0.8, z: R["middle-room"].cz + 0.3 },
    fov:    42,
    drift:  { ax: 0.05, az: 0.04, ay: 0.02, speed: 0.16 },
    key:    { x: -3, y: 6, z: 4, intensity: 1.4, color: "#aac4ff" },
    ambient:{ intensity: 0.6, color: "#4a5878" },
    bg:     { top: "#161a2a", bot: "#2b416a" },
    bloom:  { threshold: 0.58, strength: 0.95 },
    vignette: 0.45,
    fog:    0.42,
    highlight: "middle-room",
    beatMs: 1400,
  },

  /* 8 — Rooms sweep. Slow lateral pan over the building's floor,
   *      highlight slides between rooms in time with the chapter
   *      progress (handled in the scene rig). */
  {
    id: "rooms-sweep",
    eyebrow: "08 / 11",
    label: "Every room",
    title: "Shop, classroom, consulting, office",
    body:
      "Beyond the central lobby, four more rooms shape the day: groceries, learning, private consultation, and the back office that keeps it all running.",
    layout: "side-left",
    cam:    { x: -1.0, y: 7.5, z: 8.0 },
    target: { x:  1.2, y: 0.4, z: -0.8 },
    fov:    50,
    drift:  { ax: 0.22, az: 0.08, ay: 0.03, speed: 0.09 },
    key:    { x: 4, y: 9, z: 4, intensity: 1.55, color: "#ffd1a2" },
    ambient:{ intensity: 0.65, color: "#6b5366" },
    bg:     { top: "#1f1827", bot: "#653a30" },
    bloom:  { threshold: 0.6, strength: 0.78 },
    vignette: 0.4,
    fog:    0.45,
    /* "sweep" is a special token. RoomHighlight reads this and
     * slides between rooms based on chapter sub-progress. */
    highlight: "sweep",
    beatMs: 1700,
  },

  /* 9 — AQUASOL kit close-up. Camera pushes onto the logo plate. */
  {
    id: "aquasol",
    eyebrow: "09 / 11",
    label: "Tank & solar",
    title: "Water in the tank, sun on the roof",
    body:
      "The AQUASOL kit is both the water tower and the power station. Its logo plate marks the hub from the road in.",
    layout: "side-right",
    cam:    { x: +10.8, y: 2.6, z: +7.8 },
    target: { x:  +8.4, y: 2.2, z: +4.0 },
    fov:    40,
    drift:  { ax: 0.06, az: 0.04, ay: 0.02, speed: 0.16 },
    key:    { x: 6, y: 5, z: 6, intensity: 1.85, color: "#ffd09a" },
    ambient:{ intensity: 0.5, color: "#71535e" },
    bg:     { top: "#21172a", bot: "#7c3e2c" },
    bloom:  { threshold: 0.52, strength: 1.05 },
    vignette: 0.48,
    fog:    0.42,
    highlight: "tank",
    beatMs: 1400,
  },

  /* 10 — Pull-back finale. Long slow zoom-out, building shrinks into
   *       the dusk landscape, title fades over the top. */
  {
    id: "finale",
    eyebrow: "11 / 11",
    label: "Beginning",
    title: "Connection is only the beginning",
    body:
      "From one hub to the next, a network forms — and a community keeps growing long after the lights come on.",
    layout: "center-bottom",
    cam:    { x: -8.0, y: 7.5, z: 22.0 },
    target: { x:  0.0, y: 1.2, z: -1.0 },
    fov:    50,
    drift:  { ax: 0.30, az: 0.18, ay: 0.04, speed: 0.07 },
    key:    { x: -4, y: 4, z: 12, intensity: 1.2, color: "#ffb076" },
    ambient:{ intensity: 0.42, color: "#3e3450" },
    bg:     { top: "#0e0d1a", bot: "#2e1c2a" },
    bloom:  { threshold: 0.55, strength: 0.9 },
    vignette: 0.55,
    fog:    0.75,
    highlight: null,
    beatMs: 2000,
  },
];

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

/* Each chapter's room rectangle (if any) — for the highlight overlay. */
export function highlightRectAt(chapterIndex, chapterProgress) {
  const ch = CINEMATIC_CHAPTERS[chapterIndex];
  if (!ch || !ch.highlight) return null;
  if (ch.highlight === "sweep") {
    /* Special: tween highlight between rooms as chapter progresses. */
    const SWEEP_ORDER = ["shop", "classroom", "office", "pantry"];
    const seg = chapterProgress * SWEEP_ORDER.length;
    const i = Math.min(SWEEP_ORDER.length - 1, Math.floor(seg));
    const j = Math.min(SWEEP_ORDER.length - 1, i + 1);
    const f = seg - i;
    const a = R[SWEEP_ORDER[i]];
    const b = R[SWEEP_ORDER[j]];
    return {
      cx: a.cx + (b.cx - a.cx) * f,
      cz: a.cz + (b.cz - a.cz) * f,
      hx: a.hx + (b.hx - a.hx) * f,
      hz: a.hz + (b.hz - a.hz) * f,
    };
  }
  if (ch.highlight === "tank") {
    /* Tank highlight is a small disc near the AQUASOL kit at +8.4, +4.0 */
    return { cx: 8.4, cz: 4.0, hx: 1.4, hz: 1.4 };
  }
  return R[ch.highlight] || null;
}

/* Smooth easing for chapter transitions — quartic out felt the most
 * cinematic in tests (quick start, long graceful settle). */
export const easeOutCine = (t) => 1 - Math.pow(1 - t, 4);

/* Linear interp on numbers + hex colours. */
export const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  const v = parseInt(h, 16);
  return { r: ((v >> 16) & 0xff) / 255, g: ((v >> 8) & 0xff) / 255, b: (v & 0xff) / 255 };
}

export function lerpHexRgb(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return { r: lerp(A.r, B.r, t), g: lerp(A.g, B.g, t), b: lerp(A.b, B.b, t) };
}

export function rgbToHex({ r, g, b }) {
  const to = (v) => {
    const x = Math.round(Math.max(0, Math.min(1, v)) * 255);
    return x.toString(16).padStart(2, "0");
  };
  return `#${to(r)}${to(g)}${to(b)}`;
}
