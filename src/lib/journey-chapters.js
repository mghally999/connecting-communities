/**
 * journey-chapters.js
 *
 * The 8-chapter walkthrough timeline. Each chapter declares a complete
 * scene state (camera, model rot, lighting, background, fog, AND copy
 * + layout). The renderer (JourneyScene + Overlay) lerps between
 * adjacent chapters using a continuous fractional `chapterRef.current`
 * value driven by useChapterNav.
 *
 * LAYOUTS (matches the Pyramids of Meroë reference):
 *   - "title-center"   : full-bleed model with title overlay centered
 *                        (used for the opening shot)
 *   - "text-only-dark" : black background, full-width centered text,
 *                        the model is hidden / off-frame
 *   - "side-left"      : model fills the right half, caption block on
 *                        the left margin
 *   - "side-right"     : model fills the left half, caption block on
 *                        the right margin
 *   - "wireframe"      : cream background, model rendered as orange
 *                        wireframe, caption on the side
 *
 * Camera positions are calibrated for the real building.glb at
 * SCALE=0.85 (footprint ~5m × 5m, height ~5.4m, base at y=0).
 */

export const CHAPTERS = [
  /* 0 — OPENING SHOT
     Establishing 3/4 wide angle of the building. Caption block sits at
     bottom-left so it never overlaps the model. */
  {
    id: "open",
    layout: "bottom-left",
    eyebrow: "01 / 08",
    label: "The hubsite",
    title: "Inside a TrAC",
    body:
      "A guided walkthrough of one Connecting Communities Transformation Aspirational Centre.",
    cam:    { x:  7.0, y:  4.5, z: 14.0 },
    target: { x:  0.0, y:  2.6, z:  0.0 },
    model:  { rotY: -0.30, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.40, ambIntensity: 0.70, hue: "warm" },
    bg:     "#fff6eb",
    fog:    0.0,
  },

  /* 1 — ESTABLISHING TEXT
     Black background, model hidden, full-width centered text.
     Sets the cinematic tone like Pyramids' "Uncover a city..." */
  {
    id: "intro-text",
    layout: "text-only-dark",
    eyebrow: "02 / 08",
    label: "Beginning in Rwanda",
    title: "A single welcoming address for every essential service.",
    body:
      "Connecting Communities is launching across East Africa, beginning in Rwanda. The hubsite is the building that holds it all together.",
    cam:    { x:  0.0, y:  3.0, z: 30.0 },     // pulled WAY back
    target: { x:  0.0, y:  2.0, z:  0.0 },
    model:  { rotY:  0.0, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 0.0 },
    light:  { keyIntensity: 0.10, ambIntensity: 0.10, hue: "cool" },
    bg:     "#0a0d12",
    fog:    1.0,
  },

  /* 2 — APPROACH (left text + side-on view)
     Model fills the right half, copy block on the left. */
  {
    id: "approach",
    layout: "side-left",
    eyebrow: "03 / 08",
    label: "The approach",
    title: "Built for the community it serves",
    body:
      "Each TrAC sits within walking distance of the families it serves — close to the road, the market, and the surrounding farms.",
    cam:    { x: -7.0, y:  3.5, z:  9.0 },
    target: { x:  0.5, y:  2.4, z:  0.0 },
    model:  { rotY:  0.20, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.40, ambIntensity: 0.65, hue: "golden" },
    bg:     "#f4dcb6",
    fog:    0.0,
  },

  /* 3 — FRONT DOOR (right text + dolly-in)
     Pushed in close, looking at the entrance.  Caption on the right. */
  {
    id: "frontdoor",
    layout: "side-right",
    eyebrow: "04 / 08",
    label: "One front door",
    title: "Every service starts here",
    body:
      "Aspire microfinance and TrAC services share a single counter, so a farmer applying for a loan and a parent enrolling a child both start in the same place.",
    cam:    { x:  0.0, y:  2.4, z:  7.0 },
    target: { x:  0.0, y:  2.2, z:  0.0 },
    model:  { rotY:  0.0, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.50, ambIntensity: 0.70, hue: "warm" },
    bg:     "#fff6eb",
    fog:    0.0,
  },

  /* 4 — TRANSITION TO INTERIOR (text-only, dark)
     Like Pyramids' chamber transition: black/dark, full-width centered
     text giving the next idea before we pull back to a new viewpoint. */
  {
    id: "interior-text",
    layout: "text-only-dark",
    eyebrow: "05 / 08",
    label: "Inside the hubsite",
    title: "Reception, Tele-conferencing, EdTech, AgriTech.",
    body:
      "Tele-conferencing rooms, classrooms, and AgroEdu counters all live under the same roof, behind the same single front desk.",
    cam:    { x:  0.0, y:  2.0, z: 30.0 },
    target: { x:  0.0, y:  2.0, z:  0.0 },
    model:  { rotY:  0.0, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 0.0 },
    light:  { keyIntensity: 0.10, ambIntensity: 0.10, hue: "interior" },
    bg:     "#0a0d12",
    fog:    1.0,
  },

  /* 5 — SKY VIEW (left text + high angle)
     Pull up high, looking down the roofline. */
  {
    id: "skyview",
    layout: "side-left",
    eyebrow: "06 / 08",
    label: "From above",
    title: "A complete site, by design",
    body:
      "A modular roofline accommodates tele-conferencing, classrooms, AgroEdu counters and a community marketplace under one continuous structure.",
    cam:    { x:  4.5, y: 10.0, z: 10.5 },
    target: { x:  0.0, y:  1.8, z:  0.0 },
    model:  { rotY:  0.30, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.30, ambIntensity: 0.55, hue: "warm" },
    bg:     "#dde9f1",
    fog:    0.10,
  },

  /* 6 — WIREFRAME / ARCHITECTURE
     The Pyramids "underground tomb" moment: cream background, model
     rendered as bright orange wireframe, caption on the LEFT. */
  {
    id: "wireframe",
    layout: "wireframe",
    eyebrow: "07 / 08",
    label: "The architecture",
    title: "How the model fits together",
    body:
      "Each block is a service. Together they make a single, replicable system that grows with the network — stripped to its lines, the logic is visible.",
    cam:    { x:  6.5, y:  5.5, z: 10.0 },
    target: { x:  0.0, y:  2.5, z:  0.0 },
    model:  { rotY: -0.50, scale: 1.00, posY: 0.0, wireframe: 1.0, visible: 1.0 },
    light:  { keyIntensity: 0.20, ambIntensity: 0.10, hue: "ember" },
    bg:     "#fff6eb",
    fog:    0.0,
  },

  /* 7 — FINALE
     Warm full reveal, slow rotation, slight zoom. Caption bottom-right. */
  {
    id: "finale",
    layout: "bottom-right",
    eyebrow: "08 / 08",
    label: "Together",
    title: "One building. Many services. One community.",
    body:
      "Connecting Communities exists to put every essential service within one welcoming address — beginning in Rwanda, scaling across East Africa.",
    cam:    { x:  0.0, y:  3.5, z: 12.0 },
    target: { x:  0.0, y:  2.5, z:  0.0 },
    model:  { rotY:  0.30, scale: 1.04, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.50, ambIntensity: 0.70, hue: "warm" },
    bg:     "#fff6eb",
    fog:    0.0,
  },
];

/* -------------------------------------------------------------------------- */
/* Math + interpolation                                                        */
/* -------------------------------------------------------------------------- */

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;

/* Sample a continuous fractional chapter (e.g. 2.4) → blended scene
 * state. Numeric values lerp; string fields (hue, bg) snap halfway. */
export function sampleAt(c) {
  const i = Math.floor(c);
  const f = c - i;
  const a = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i))];
  const b = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i + 1))];
  const t = clamp(f, 0, 1);

  return {
    camX: lerp(a.cam.x, b.cam.x, t),
    camY: lerp(a.cam.y, b.cam.y, t),
    camZ: lerp(a.cam.z, b.cam.z, t),
    targetX: lerp(a.target.x, b.target.x, t),
    targetY: lerp(a.target.y, b.target.y, t),
    targetZ: lerp(a.target.z, b.target.z, t),
    modelRotY: lerp(a.model.rotY, b.model.rotY, t),
    modelScale: lerp(a.model.scale, b.model.scale, t),
    modelPosY: lerp(a.model.posY, b.model.posY, t),
    wireframe: lerp(a.model.wireframe, b.model.wireframe, t),
    modelVisible: lerp(a.model.visible, b.model.visible, t),
    keyIntensity: lerp(a.light.keyIntensity, b.light.keyIntensity, t),
    ambIntensity: lerp(a.light.ambIntensity, b.light.ambIntensity, t),
    hueA: a.light.hue,
    hueB: b.light.hue,
    hueT: t,
    bgA: a.bg,
    bgB: b.bg,
    bgT: t,
    fog: lerp(a.fog, b.fog, t),
  };
}

/* -------------------------------------------------------------------------- */
/* Hue + bg colour mixing                                                     */
/* -------------------------------------------------------------------------- */

export const HUE_PALETTE = {
  warm:     { r: 1.00, g: 0.86, b: 0.65 },
  cool:     { r: 0.55, g: 0.70, b: 0.95 },
  golden:   { r: 1.00, g: 0.78, b: 0.45 },
  interior: { r: 1.00, g: 0.72, b: 0.45 },
  ember:    { r: 1.00, g: 0.45, b: 0.18 },
};

export function mixHue(hueA, hueB, t) {
  const a = HUE_PALETTE[hueA] || HUE_PALETTE.warm;
  const b = HUE_PALETTE[hueB] || HUE_PALETTE.warm;
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
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
