/**
 * journey-chapters.js
 *
 * 9-chapter cinematic walkthrough timeline. Each chapter declares a
 * complete scene state (camera, model rotation, model wireframe,
 * model visibility, lighting, fog, background, plus copy + layout).
 *
 * Driven by a continuous fractional `chapter` index that lerps between
 * adjacent chapter keyframes. Same index value → identical scene state.
 *
 * Chapter 0 is the GLOBE intro — a photorealistic Earth rotated to
 * show East Africa, with the globe zooming slowly toward Rwanda. After
 * the globe chapters, the scene cuts to the building model for the
 * architectural walkthrough.
 *
 * Building footprint after SCALE=0.85: ~5m × 5.4m × 5m, base at y=0.
 */

export const CHAPTERS = [
  /* ------------------------------------------------------------------ */
  /* 0 — GLOBE establishing shot                                        */
  /* The globe sits at world-position 0,0,0 with a radius of ~5m. The
   * camera starts a long way out and frames the planet against deep
   * space. Scene type "globe" is interpreted by JourneyScene to render
   * the earth instead of the building.                                  */
  /* ------------------------------------------------------------------ */
  {
    id: "globe-establish",
    layout: "bottom-left",
    scene: "globe",
    eyebrow: "01 / 09",
    label: "From orbit",
    title: "From the air, every community is a node",
    body:
      "Connecting Communities is a single network of essential services that links villages across East Africa.",
    cam:    { x:  0.0, y:  0.0, z: 22.0 },
    target: { x:  0.0, y:  0.0, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 1.0 },
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 0.0 },
    light:  { keyIntensity: 1.0, ambIntensity: 0.10, hue: "cool" },
    bg:     "#04060a",
    fog:    0.0,
  },

  /* 1 — GLOBE pull in toward East Africa */
  {
    id: "globe-zoom",
    layout: "bottom-left",
    scene: "globe",
    eyebrow: "02 / 09",
    label: "East Africa",
    title: "Beginning in Rwanda, scaling across the region",
    body:
      "Rwanda is our regional headquarters. From there we expand into the DRC, Tanzania, Uganda, and Kenya — connecting communities across East Africa.",
    /* Closer camera, and we offset the globe so Rwanda sits near
     * frame centre. Earth radius is 5m so a small XY offset shifts
     * the visible region. */
    cam:    { x:  0.0, y:  0.5, z: 12.0 },
    target: { x:  0.0, y:  0.5, z:  0.0 },
    globe:  { rotY: 0.6, scale: 1.05, visible: 1.0 },
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 0.0 },
    light:  { keyIntensity: 1.2, ambIntensity: 0.18, hue: "cool" },
    bg:     "#080d18",
    fog:    0.0,
  },

  /* 2 — TRANSITION TEXT (model hidden, dark)                            */
  {
    id: "intro-text",
    layout: "text-only-dark",
    scene: "model",
    eyebrow: "03 / 09",
    label: "Inside the hubsite",
    title: "A single welcoming address for every essential service.",
    body:
      "The hubsite is the building that holds it all together — connectivity, finance, education, agriculture, water, and tele-conferencing under one roof.",
    cam:    { x:  0.0, y:  3.0, z: 30.0 },
    target: { x:  0.0, y:  2.0, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY: 0.0, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 0.0 },
    light:  { keyIntensity: 0.10, ambIntensity: 0.10, hue: "cool" },
    bg:     "#0a0d12",
    fog:    1.0,
  },

  /* 3 — BUILDING hero 3/4 wide                                          */
  {
    id: "open",
    layout: "bottom-left",
    scene: "model",
    eyebrow: "04 / 09",
    label: "The hubsite",
    title: "Inside a TrAC",
    body:
      "Each Transformation Aspirational Centre — TrAC — brings every Connecting Communities service together.",
    cam:    { x:  7.0, y:  4.5, z: 14.0 },
    target: { x:  0.0, y:  2.6, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY: -0.30, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.40, ambIntensity: 0.70, hue: "warm" },
    bg:     "#fff6eb",
    fog:    0.0,
  },

  /* 4 — APPROACH (low + side)                                          */
  {
    id: "approach",
    layout: "side-left",
    scene: "model",
    eyebrow: "05 / 09",
    label: "The approach",
    title: "Built for the community it serves",
    body:
      "Each TrAC sits within walking distance of the families it serves — close to the road, the market, and the surrounding farms.",
    cam:    { x: -7.5, y:  2.5, z:  9.0 },
    target: { x:  0.5, y:  2.4, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY:  0.20, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.40, ambIntensity: 0.65, hue: "golden" },
    bg:     "#f4dcb6",
    fog:    0.05,
  },

  /* 5 — FRONT DOOR (close, eye-level)                                  */
  {
    id: "frontdoor",
    layout: "side-right",
    scene: "model",
    eyebrow: "06 / 09",
    label: "One front door",
    title: "Every service starts here",
    body:
      "Aspire microfinance and TrAC services share a single counter, so a farmer applying for a loan and a parent enrolling a child both start in the same place.",
    cam:    { x:  0.0, y:  2.4, z:  7.5 },
    target: { x:  0.0, y:  2.2, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY:  0.0,  scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.50, ambIntensity: 0.70, hue: "warm" },
    bg:     "#fff6eb",
    fog:    0.0,
  },

  /* 6 — FROM ABOVE (top-down)                                          */
  {
    id: "topdown",
    layout: "bottom-right",
    scene: "model",
    eyebrow: "07 / 09",
    label: "From above",
    title: "A complete site, by design",
    body:
      "A modular roofline accommodates tele-conferencing rooms, classrooms, AgroEdu counters and a community marketplace under one continuous structure.",
    cam:    { x:  0.5, y: 14.0, z:  0.6 },
    target: { x:  0.0, y:  0.0, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY:  0.30, scale: 1.00, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.30, ambIntensity: 0.55, hue: "warm" },
    bg:     "#dde9f1",
    fog:    0.10,
  },

  /* 7 — X-RAY wireframe                                                */
  {
    id: "wireframe",
    layout: "side-left",
    scene: "model",
    eyebrow: "08 / 09",
    label: "The architecture",
    title: "How the model fits together",
    body:
      "Each block is a service. Together they make a single, replicable system that grows with the network — stripped to its lines, the logic is visible.",
    cam:    { x:  6.5, y:  4.5, z: 11.0 },
    target: { x:  0.0, y:  2.5, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY: -0.40, scale: 1.00, posY: 0.0, wireframe: 1.0, visible: 1.0 },
    light:  { keyIntensity: 0.40, ambIntensity: 0.20, hue: "ember" },
    bg:     "#fff6eb",
    fog:    0.0,
  },

  /* 8 — FINALE (warm wide)                                             */
  {
    id: "finale",
    layout: "bottom-left",
    scene: "model",
    eyebrow: "09 / 09",
    label: "Together",
    title: "One building. Many services. One community.",
    body:
      "Connecting Communities exists to put every essential service within one welcoming address — beginning in Rwanda, scaling across East Africa.",
    cam:    { x:  0.0, y:  3.5, z: 13.0 },
    target: { x:  0.0, y:  2.5, z:  0.0 },
    globe:  { rotY: 0.0, scale: 1.00, visible: 0.0 },
    model:  { rotY:  0.30, scale: 1.04, posY: 0.0, wireframe: 0.0, visible: 1.0 },
    light:  { keyIntensity: 1.50, ambIntensity: 0.70, hue: "warm" },
    bg:     "#fff6eb",
    fog:    0.0,
  },
];

/* -------------------------------------------------------------------------- */
/* Math + interpolation                                                       */
/* -------------------------------------------------------------------------- */

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;

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
    globeRotY: lerp(a.globe.rotY, b.globe.rotY, t),
    globeScale: lerp(a.globe.scale, b.globe.scale, t),
    globeVisible: lerp(a.globe.visible, b.globe.visible, t),
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

export const HUE_PALETTE = {
  warm:     { r: 1.00, g: 0.86, b: 0.65 },
  cool:     { r: 0.55, g: 0.70, b: 0.95 },
  golden:   { r: 1.00, g: 0.78, b: 0.45 },
  interior: { r: 1.00, g: 0.72, b: 0.45 },
  ember:    { r: 1.00, g: 0.55, b: 0.30 },
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
