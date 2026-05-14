/**
 * journey-chapters.js
 *
 * 10-chapter cinematic walkthrough timeline — round 7.
 *
 * Hard rule for this iteration: only ONE chapter is top-down (the
 * bird's-eye site overview, chapter 1). Every other chapter is a
 * human walk-in framing — camera at eye level (≈ 1.5–1.7 m),
 * positioned at the doorway or just inside the relevant room,
 * looking horizontally at the room's fixtures.
 *
 *   0  pillar          — eye-level outside, framed straight on the signage
 *   1  birdseye        — high above, the only top-down stop. Whole site
 *                        (signage + building + AQUASOL kit + paving) in frame
 *   2  middle-room     — INSIDE the middle room at the +Z doorway, both
 *                        counters in view
 *   3  middle-orange   — INSIDE the middle room, shifted right, looking
 *                        at the orange counter
 *   4  middle-blue     — INSIDE the middle room, shifted left, looking
 *                        at the blue counter
 *   5  shop            — INSIDE the shop, looking down the long axis
 *   6  classroom       — INSIDE the classroom, looking at the desks
 *   7  office          — INSIDE the consulting room, looking at the desk
 *   8  pantry          — INSIDE the pantry, looking at the shelves
 *   9  tank-solar      — exterior close-up on the AQUASOL kit + logo
 *
 * Each chapter carries its own FOV (40°–55°) so we can widen for big
 * subjects (bird's-eye, walk-ins) and narrow for close-ups (tank logo).
 * JourneyScene reads it each frame and calls updateProjectionMatrix.
 *
 * If interior cameras come out facing the wrong way (e.g. front of
 * building is at -Z not +Z in this GLB), the fix is `BUILDING_ROT_Y`
 * at the top of TrACModel.js — change once, all chapters re-orient
 * because their coords are in the building's own local frame.
 *
 * Sources of truth:
 *   - ROOM_RECTS_LIST drives the chapter cameras, the room highlight +
 *     dimmer overlays, and /our-model-2's room positions.
 *   - To nudge a room's position, change its rect; every downstream
 *     caller follows.
 */

import { HashMap, DoublyLinkedList } from "@/utils/data-structures";

/* -------------------------------------------------------------------------- */
/* Room rectangles in three.js auto-fit world (FIT_SIZE=18, tight-centred)     */
/* -------------------------------------------------------------------------- */

export const ROOM_RECTS_LIST = [
  /* LEFT column: long shop, full building depth. */
  { id: "shop",         cx: -2.6, cz: -0.5, hx: 1.0, hz: 3.0 },
  /* MIDDLE column: dual-counter middle room at FRONT (+Z), classroom
   * at BACK (-Z). */
  { id: "middle-room",  cx:  0.0, cz:  1.4, hx: 1.4, hz: 1.6 },
  { id: "classroom",    cx:  0.0, cz: -2.2, hx: 1.4, hz: 1.5 },
  /* RIGHT column: consulting office at BACK (-Z), pantry at FRONT (+Z). */
  { id: "office",       cx:  2.4, cz: -2.0, hx: 1.0, hz: 1.5 },
  { id: "pantry",       cx:  2.4, cz:  1.0, hx: 1.0, hz: 1.5 },
];

export const ROOM_RECTS = ROOM_RECTS_LIST.reduce(
  (m, r) => { m[r.id] = r; return m; },
  {}
);

/* -------------------------------------------------------------------------- */
/* Chapters                                                                   */
/* -------------------------------------------------------------------------- */
/* Camera Y conventions:
 *    1.5–1.7 m  → human eye level
 *    2.0 m     → tall human / slight elevated angle
 *    2.5–3 m   → for tank/AQUASOL (its logo plate is up around 2 m)
 *
 * FOV conventions:
 *    40°–45°   → close-ups (logo, single object)
 *    50°       → standard interior shot
 *    55°       → wider walk-in (whole room) or bird's-eye
 */

export const CHAPTERS = [
  /* 0 — Pillar / signage. Eye-level shot, camera directly in front of
   *    the signage face, far enough back that the whole pillar fits
   *    inside a 50° FOV. Previous build had the camera offset to the
   *    right of the pillar, which cropped the signage on the left. */
  {
    id: "pillar",
    layout: "side-right",
    eyebrow: "01 / 10",
    label: "The signpost",
    title: "Every TrAC begins with one welcoming address",
    body:
      "Outside the hubsite, the signage pillar names the services you'll find within — connectivity, finance, education, agriculture, water and tele-conferencing — all under a single roof.",
    cam:    { x: -5.6, y: 1.7, z: +7.0 },
    target: { x: -5.6, y: 2.0, z: +3.2 },
    fov:    50,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.55, ambIntensity: 0.80, hue: "golden" },
    bg:     "#fce0a8",
    fog:    0.0,
    glow:   true,
    room:   null,
  },

  /* 1 — Bird's-eye. The ONLY top-down chapter. Lifted high enough
   *    (y=22) at 55° FOV that the signage pillar (back-left), the
   *    building, and the AQUASOL kit (back-right) all fit in frame. */
  {
    id: "birdseye",
    layout: "bottom-left",
    eyebrow: "02 / 10",
    label: "From above",
    title: "Six rooms, one continuous community",
    body:
      "Drop the dot on a room to jump straight to it — or keep scrolling and let the camera take you through the hub in sequence.",
    cam:    { x: +1.0, y: 22.0, z: +5.0 },
    target: { x: +1.0, y:  0.0, z: -0.5 },
    fov:    55,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.40, ambIntensity: 0.85, hue: "warm" },
    bg:     "#dde9f1",
    fog:    0.0,
    glow:   true,
    hotspots: true,
    room:   null,
  },

  /* 2 — Middle room walk-in. Camera inside the room at its +Z doorway,
   *    looking back into the lobby at eye level. Wide FOV (55°) so
   *    BOTH counters frame inside the shot. */
  {
    id: "middle-room",
    layout: "side-right",
    eyebrow: "03 / 10",
    label: "The middle room",
    title: "Two counters, one shared lobby",
    body:
      "Step into the central room. The orange counter handles TrAC services; the blue Aspire counter handles microfinance. Two services, one queue, one cup of coffee.",
    cam:    { x:  0.0, y: 1.6, z: +2.8 },
    target: { x:  0.0, y: 1.1, z: +0.4 },
    fov:    55,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.20, ambIntensity: 1.15, hue: "interior" },
    bg:     "#fbe8c8",
    fog:    0.0,
    glow:   true,
    room:   "middle-room",
  },

  /* 3 — Orange counter. Camera shifted to the right side of the
   *    middle room, eye-level, turning the head left to look at the
   *    orange counter. */
  {
    id: "middle-orange",
    layout: "side-left",
    eyebrow: "04 / 10",
    label: "Orange counter",
    title: "TrAC services brewed in orange",
    body:
      "Identity, education enrolment, agricultural extension and tele-health — every TrAC service can be initiated at the orange counter, alongside a fresh cup of locally-sourced coffee.",
    cam:    { x: +0.7, y: 1.5, z: +2.4 },
    target: { x: -0.9, y: 1.0, z: +0.4 },
    fov:    50,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.10, ambIntensity: 1.10, hue: "ember" },
    bg:     "#f2c98b",
    fog:    0.0,
    glow:   true,
    room:   "middle-room",
  },

  /* 4 — Blue counter. Mirror of ch 3. */
  {
    id: "middle-blue",
    layout: "side-right",
    eyebrow: "05 / 10",
    label: "Blue counter",
    title: "Aspire microfinance, served in blue",
    body:
      "Savings, loan applications and group banking flow through the blue counter — so a farmer can apply for a loan in the same visit as registering a child for school.",
    cam:    { x: -0.7, y: 1.5, z: +2.4 },
    target: { x: +0.9, y: 1.0, z: +0.4 },
    fov:    50,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.10, ambIntensity: 1.10, hue: "cool" },
    bg:     "#b9c8e0",
    fog:    0.0,
    glow:   true,
    room:   "middle-room",
  },

  /* 5 — Shop walk-in. Camera at the shop's +Z doorway, eye level,
   *    looking down the long axis (the shop runs the full depth of
   *    the building). */
  {
    id: "shop",
    layout: "bottom-left",
    eyebrow: "06 / 10",
    label: "The shop",
    title: "A market on the doorstep",
    body:
      "Fresh produce, grains and household staples — the shop turns the hubsite into a daily destination, not a once-a-month visit.",
    cam:    { x: -2.6, y: 1.6, z: +2.2 },
    target: { x: -2.6, y: 1.0, z: -2.5 },
    fov:    55,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.15, ambIntensity: 1.10, hue: "warm" },
    bg:     "#f1d9a8",
    fog:    0.0,
    glow:   true,
    room:   "shop",
  },

  /* 6 — Classroom walk-in. Camera at the classroom's +Z doorway,
   *    looking back at the rows of desks. */
  {
    id: "classroom",
    layout: "bottom-right",
    eyebrow: "07 / 10",
    label: "Education",
    title: "A classroom open to every age",
    body:
      "After-school tutoring, adult literacy, vocational courses — the education room hosts every age and skill, delivered with our partner network of teachers and trainers.",
    cam:    { x:  0.0, y: 1.6, z: -0.8 },
    target: { x:  0.0, y: 1.0, z: -2.8 },
    fov:    55,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.15, ambIntensity: 1.10, hue: "warm" },
    bg:     "#f4dcb6",
    fog:    0.0,
    glow:   true,
    room:   "classroom",
  },

  /* 7 — Office / consulting room. Small room at back-right; camera
   *    at its +Z doorway, narrower FOV (50°) because the room is
   *    tight. */
  {
    id: "office",
    layout: "side-left",
    eyebrow: "08 / 10",
    label: "Consulting room",
    title: "A quiet table for one-to-one work",
    body:
      "Loan applications, health consults, ID verification — anything that needs privacy happens in the small consulting room beside the entrance.",
    cam:    { x: +2.4, y: 1.5, z: -0.6 },
    target: { x: +2.4, y: 1.0, z: -2.5 },
    fov:    50,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.10, ambIntensity: 1.15, hue: "interior" },
    bg:     "#ecd9b3",
    fog:    0.0,
    glow:   true,
    room:   "office",
  },

  /* 8 — Pantry / back office. Different doorway orientation — its
   *    doorway is on the -X side (toward the middle of the building),
   *    so the camera sits there and looks east (+X) into the room. */
  {
    id: "pantry",
    layout: "side-right",
    eyebrow: "09 / 10",
    label: "Back office",
    title: "Where the stock and the day's work live",
    body:
      "Storage shelves, paperwork drawers, the staff working bench — the back office keeps the front of house clean and welcoming.",
    cam:    { x: +1.3, y: 1.5, z: +1.0 },
    target: { x: +2.6, y: 1.0, z: +1.0 },
    fov:    50,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.10, ambIntensity: 1.15, hue: "interior" },
    bg:     "#e6dcc5",
    fog:    0.0,
    glow:   true,
    room:   "pantry",
  },

  /* 9 — AQUASOL kit close-up. Eye level, framed on the logo plate at
   *    ~2 m. Narrower FOV (45°) so the logo fills more of the screen
   *    and the "tank + solar" message reads. */
  {
    id: "tank-solar",
    layout: "bottom-right",
    eyebrow: "10 / 10",
    label: "Tank & solar",
    title: "Water, power, and the mark above the door",
    body:
      "Rooftop solar drives the pumps, the tank stores the day's supply, and the logo on the panel marks the hub as both a water tower and a power station — visible from the road in.",
    cam:    { x: +10.5, y: 2.2, z: +7.5 },
    target: { x:  +8.4, y: 2.2, z: +4.0 },
    fov:    45,
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0 },
    light:  { keyIntensity: 1.55, ambIntensity: 0.80, hue: "golden" },
    bg:     "#f4dcb6",
    fog:    0.0,
    glow:   true,
    room:   null,
  },
];

/* -------------------------------------------------------------------------- */
/* Bird's-eye click-mode hotspots                                              */
/* -------------------------------------------------------------------------- */

export const BIRDSEYE_HOTSPOTS = [
  { id: "shop",         chapter: 5, x: ROOM_RECTS["shop"].cx,        z: ROOM_RECTS["shop"].cz,        label: "Shop" },
  { id: "classroom",    chapter: 6, x: ROOM_RECTS["classroom"].cx,   z: ROOM_RECTS["classroom"].cz,   label: "Classroom" },
  { id: "office",       chapter: 7, x: ROOM_RECTS["office"].cx,      z: ROOM_RECTS["office"].cz,      label: "Office" },
  { id: "middle-room",  chapter: 2, x: ROOM_RECTS["middle-room"].cx, z: ROOM_RECTS["middle-room"].cz, label: "Middle room" },
  { id: "pantry",       chapter: 8, x: ROOM_RECTS["pantry"].cx,      z: ROOM_RECTS["pantry"].cz,      label: "Back office" },
  { id: "tank-solar",   chapter: 9, x: 8.4,                          z: 4.0,                          label: "Tank + solar" },
];

/* -------------------------------------------------------------------------- */
/* Helpers used by TrACModel for highlight / dimmer logic                      */
/* -------------------------------------------------------------------------- */

export function activeRoomIdAt(c) {
  const n = CHAPTERS.length - 1;
  const cc = c < 0 ? 0 : c > n ? n : c;
  const i = Math.round(cc);
  return CHAPTERS[i]?.room ?? null;
}

export function activeRoomRectAt(c) {
  const id = activeRoomIdAt(c);
  return id ? ROOM_RECTS[id] : null;
}

/* -------------------------------------------------------------------------- */
/* Math + sampling                                                            */
/* -------------------------------------------------------------------------- */

export const CHAPTER_RING = (() => {
  const list = new DoublyLinkedList();
  for (let i = 0; i < CHAPTERS.length; i++) list.push(i);
  return list;
})();

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

/* Allocation-free sample object reused every frame. */
const _sample = {
  camX: 0, camY: 0, camZ: 0,
  targetX: 0, targetY: 0, targetZ: 0,
  fov: 50,
  modelRotY: 0, modelScale: 1, modelPosY: 0,
  keyIntensity: 1, ambIntensity: 1,
  hueA: "warm", hueB: "warm", hueT: 0,
  bgA: "#fff", bgB: "#fff", bgT: 0,
  fog: 0,
};

export function sampleAt(c) {
  const n = CHAPTERS.length - 1;
  const cc = c < 0 ? 0 : c > n ? n : c;
  const i = Math.floor(cc);
  const f = cc - i;
  const a = CHAPTERS[i];
  const b = CHAPTERS[i === n ? n : i + 1];
  const t = smooth(f);
  _sample.camX = lerp(a.cam.x, b.cam.x, t);
  _sample.camY = lerp(a.cam.y, b.cam.y, t);
  _sample.camZ = lerp(a.cam.z, b.cam.z, t);
  _sample.targetX = lerp(a.target.x, b.target.x, t);
  _sample.targetY = lerp(a.target.y, b.target.y, t);
  _sample.targetZ = lerp(a.target.z, b.target.z, t);
  _sample.fov = lerp(a.fov ?? 50, b.fov ?? 50, t);
  _sample.modelRotY = lerp(a.model.rotY, b.model.rotY, t);
  _sample.modelScale = lerp(a.model.scale, b.model.scale, t);
  _sample.modelPosY = lerp(a.model.posY, b.model.posY, t);
  _sample.keyIntensity = lerp(a.light.keyIntensity, b.light.keyIntensity, t);
  _sample.ambIntensity = lerp(a.light.ambIntensity, b.light.ambIntensity, t);
  _sample.hueA = a.light.hue;
  _sample.hueB = b.light.hue;
  _sample.hueT = t;
  _sample.bgA = a.bg;
  _sample.bgB = b.bg;
  _sample.bgT = t;
  _sample.fog = lerp(a.fog, b.fog, t);
  return _sample;
}

export const HUE_PALETTE = {
  warm:     { r: 1.00, g: 0.86, b: 0.65 },
  cool:     { r: 0.55, g: 0.70, b: 0.95 },
  golden:   { r: 1.00, g: 0.78, b: 0.45 },
  interior: { r: 1.00, g: 0.78, b: 0.55 },
  ember:    { r: 1.00, g: 0.55, b: 0.30 },
};

export function mixHue(hueA, hueB, t) {
  const a = HUE_PALETTE[hueA] || HUE_PALETTE.warm;
  const b = HUE_PALETTE[hueB] || HUE_PALETTE.warm;
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

const _hexCache = new HashMap(32);
function hexToRgb(hex) {
  const hit = _hexCache.get(hex);
  if (hit) return hit;
  const h = hex.charCodeAt(0) === 35 ? hex.slice(1) : hex;
  const v = parseInt(h, 16);
  const rgb = {
    r: ((v >> 16) & 0xff) / 255,
    g: ((v >> 8) & 0xff) / 255,
    b: (v & 0xff) / 255,
  };
  _hexCache.set(hex, rgb);
  return rgb;
}

export function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return { r: lerp(A.r, B.r, t), g: lerp(A.g, B.g, t), b: lerp(A.b, B.b, t) };
}

export function rgbToCss({ r, g, b }) {
  const to = (v) => Math.round(clamp(v, 0, 1) * 255);
  return `rgb(${to(r)}, ${to(g)}, ${to(b)})`;
}
