/**
 * Foam Talent 2024 – artists data
 *
 * Source: FOAM_TALENT_SPEC.md §3
 *
 * `pos` is the authored absolute position of each card inside the gallery
 * board's CANVAS (3000 × 2400). Coordinates are in CSS pixels with the
 * top-left of the canvas as origin. `rot` is degrees of CSS rotation.
 *
 * `spreads` is the linear sequence of pages shown in the horizontal
 * portfolio. Each spread declares its background colour and a list of
 * absolutely positioned elements (kind = image | title | body | audio |
 * botanical | quote). The <Spread/> component branches on `kind`.
 */

export const CANVAS_W = 3000;
export const CANVAS_H = 2400;

export const CATEGORIES = [
  "illustration",
  "landscape",
  "plants",
  "collage",
  "archival",
  "collaborative",
  "portrait",
  "digital manipulation",
];

/** Placeholder asset URI used until real images are dropped in. Uses an inline
 *  SVG so missing files don't 404 in dev. */
const ph = (w, h, label, bg = "#222", fg = "#888") =>
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">` +
      `<rect width="100%" height="100%" fill="${bg}"/>` +
      `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"` +
      ` fill="${fg}" font-family="sans-serif" font-size="${Math.round(Math.min(w, h) / 10)}">${label}</text>` +
      `</svg>`
  );

const aaryanSpreads = [
  {
    type: "cover",
    bg: "#F26DA9",
    title: "This Isn’t Divide and Conquer",
    artist: "Aaryan Sinha",
    hero: ph(1600, 1000, "Aaryan — cover", "#F26DA9", "#FFFFFF"),
  },
  {
    type: "spread",
    bg: "#F26DA9",
    elements: [
      { kind: "image", src: ph(900, 1200, "archive 01", "#7a153c", "#fce0ed"), x: "8%", y: "10%", w: "36%", h: "80%" },
      { kind: "title", text: { en: "Borderlines" }, x: "52%", y: "22%", w: "38%" },
      { kind: "body",  text: { en: "An archive of contested cartographies, stitched from family albums, court records, and the satellite imagery I’ve been able to scrape from public datasets." }, x: "52%", y: "44%", w: "38%" },
    ],
  },
  {
    type: "spread",
    bg: "#F26DA9",
    elements: [
      { kind: "image", src: ph(1600, 900, "archive 02", "#7a153c", "#fce0ed"), x: "8%", y: "12%", w: "84%", h: "76%" },
    ],
  },
];

const rehabSpreads = [
  {
    type: "cover",
    bg: "#EFE9B8",
    title: "The Longing of the Stranger Whose Path Has Been Broken",
    titleSecondary: "شوق الغريب الذي يقفه مسد",
    artist: "Rehab Eldalil",
    hero: ph(1600, 1000, "Rehab — cover", "#EFE9B8", "#1A1A1A"),
  },
  {
    type: "spread",
    bg: "#EFE9B8",
    elements: [
      { kind: "image", src: ph(900, 1200, "desert hero", "#8e8a47", "#EFE9B8"), x: "55%", y: "10%", w: "40%", h: "80%" },
      { kind: "title", text: { en: "Al Laseeq", subtitle: "The Sticker" }, x: "8%", y: "42%", w: "30%" },
      { kind: "body",  text: { en: "Found extensively in the South Sinai, Al Laseeq attaches itself to passers-by — clothes, hair, the fur of a sheep — and is carried elsewhere. Bedouin women weave it into the embroidery that closes my grandmother’s stories.", ar: "الليصيق نبات يلتصق بالعابرين فينتقل بهم إلى أمكنة أخرى." }, x: "8%", y: "58%", w: "30%" },
      { kind: "botanical", src: ph(400, 800, "plant", "transparent", "#1A1A1A"), x: "-2%", y: "20%", w: "16%" },
    ],
  },
  {
    type: "spread",
    bg: "#EFE9B8",
    elements: [
      { kind: "image", src: ph(1600, 900, "three women on rocks", "#8e8a47", "#EFE9B8"), x: "8%", y: "12%", w: "55%", h: "76%" },
      { kind: "audio", title: "Oh Valley", caption: "A song from the valley, sung by my grandmother.", src: "/audio/rehab-1.mp3", duration: 41, x: "70%", y: "30%", w: "24%" },
    ],
  },
  {
    type: "spread",
    bg: "#EFE9B8",
    elements: [
      { kind: "quote", text: "There is a longing that belongs to the land before it belongs to the people. We borrow it back, briefly.", x: "16%", y: "36%", w: "68%" },
    ],
  },
];

const maryamSpreads = [
  {
    type: "cover",
    bg: "#F8DCD2",
    title: "Yesterday I Talked to My Teeth for the First Time",
    artist: "Maryam Touzani",
    hero: ph(1600, 1000, "Maryam — cover", "#F8DCD2", "#1A1A1A"),
  },
  {
    type: "spread",
    bg: "#F8DCD2",
    elements: [
      { kind: "audio", title: "Teeth", caption: "Yesterday I talked to my teeth for the first time.", src: "/audio/maryam-1.mp3", duration: 53, x: "12%", y: "28%", w: "32%" },
      { kind: "image", src: ph(900, 1200, "selfie zoom", "#8a4f3e", "#F8DCD2"), x: "50%", y: "10%", w: "40%", h: "80%" },
    ],
  },
  {
    type: "spread",
    bg: "#F8DCD2",
    elements: [
      { kind: "image", src: ph(700, 900, "grid 01", "#8a4f3e", "#F8DCD2"), x: "8%",  y: "15%", w: "22%", h: "32%" },
      { kind: "image", src: ph(700, 900, "grid 02", "#8a4f3e", "#F8DCD2"), x: "33%", y: "15%", w: "22%", h: "32%" },
      { kind: "image", src: ph(700, 900, "grid 03", "#8a4f3e", "#F8DCD2"), x: "58%", y: "15%", w: "22%", h: "32%" },
      { kind: "image", src: ph(700, 900, "grid 04", "#8a4f3e", "#F8DCD2"), x: "8%",  y: "53%", w: "22%", h: "32%" },
      { kind: "image", src: ph(700, 900, "grid 05", "#8a4f3e", "#F8DCD2"), x: "33%", y: "53%", w: "22%", h: "32%" },
      { kind: "image", src: ph(700, 900, "grid 06", "#8a4f3e", "#F8DCD2"), x: "58%", y: "53%", w: "22%", h: "32%" },
    ],
  },
];

export const ARTISTS = [
  {
    id: "aaryan-sinha",
    slug: "aaryan-sinha",
    name: "Aaryan Sinha",
    title: "This Isn’t Divide and Conquer",
    titleSecondary: null,
    accent: "#F26DA9",
    accentText: "#FFFFFF",
    tags: ["landscape", "collaborative", "archival"],
    thumb: ph(560, 720, "Aaryan", "#1d1d1d", "#F26DA9"),
    hero:  ph(1920, 1080, "Aaryan hero", "#1d1d1d", "#F26DA9"),
    pos:   { x: 720, y: 760, w: 220, h: 320, rot: -1.5 },
    spreads: aaryanSpreads,
  },
  {
    id: "rehab-eldalil",
    slug: "rehab-eldalil",
    name: "Rehab Eldalil",
    title: "The Longing of the Stranger Whose Path Has Been Broken",
    titleSecondary: "شوق الغريب الذي يقفه مسد",
    accent: "#EFE9B8",
    accentText: "#1A1A1A",
    tags: ["landscape", "collaborative", "portrait"],
    thumb: ph(720, 480, "Rehab", "#1d1d1d", "#EFE9B8"),
    hero:  ph(1920, 1080, "Rehab hero", "#1d1d1d", "#EFE9B8"),
    pos:   { x: 1100, y: 540, w: 360, h: 240, rot: 0.5 },
    spreads: rehabSpreads,
  },
  {
    id: "maryam-touzani",
    slug: "maryam-touzani",
    name: "Maryam Touzani",
    title: "Yesterday I Talked to My Teeth for the First Time",
    accent: "#F8DCD2",
    accentText: "#1A1A1A",
    tags: ["portrait", "digital manipulation", "archival"],
    thumb: ph(600, 760, "Maryam", "#1d1d1d", "#F8DCD2"),
    hero:  ph(1920, 1080, "Maryam hero", "#1d1d1d", "#F8DCD2"),
    pos:   { x: 410, y: 220, w: 300, h: 380, rot: 1.2 },
    spreads: maryamSpreads,
  },
  /* A handful of placeholder cards to populate the board until real
   * artists are loaded. These keep the gallery feeling like an exhibition
   * rather than a row of three. The accent palette mirrors the foam.org
   * reference (pinks, creams, peaches, jades). */
  {
    id: "placeholder-04", slug: "placeholder-04", name: "Iliana Sanz",
    title: "Marble Quarry", accent: "#9DC8A6", accentText: "#0B1018",
    tags: ["landscape"], thumb: ph(540, 380, "04", "#1d1d1d", "#9DC8A6"),
    hero: ph(1920, 1080, "04", "#1d1d1d", "#9DC8A6"),
    pos: { x: 220, y: 760, w: 220, h: 160, rot: -3.5 }, spreads: [],
  },
  {
    id: "placeholder-05", slug: "placeholder-05", name: "Marek Lewandowski",
    title: "After the Frost", accent: "#C2A6E0", accentText: "#0B1018",
    tags: ["plants", "archival"], thumb: ph(440, 600, "05", "#1d1d1d", "#C2A6E0"),
    hero: ph(1920, 1080, "05", "#1d1d1d", "#C2A6E0"),
    pos: { x: 1620, y: 220, w: 200, h: 280, rot: 2.8 }, spreads: [],
  },
  {
    id: "placeholder-06", slug: "placeholder-06", name: "Daiana Voss",
    title: "Sleep Studies", accent: "#7FB7D6", accentText: "#0B1018",
    tags: ["portrait", "collage"], thumb: ph(560, 420, "06", "#1d1d1d", "#7FB7D6"),
    hero: ph(1920, 1080, "06", "#1d1d1d", "#7FB7D6"),
    pos: { x: 2000, y: 880, w: 260, h: 180, rot: -1.2 }, spreads: [],
  },
  {
    id: "placeholder-07", slug: "placeholder-07", name: "Theo Achebe",
    title: "Carbon Pages", accent: "#E8B071", accentText: "#0B1018",
    tags: ["archival", "illustration"], thumb: ph(520, 720, "07", "#1d1d1d", "#E8B071"),
    hero: ph(1920, 1080, "07", "#1d1d1d", "#E8B071"),
    pos: { x: 1820, y: 1100, w: 220, h: 300, rot: 1.8 }, spreads: [],
  },
  {
    id: "placeholder-08", slug: "placeholder-08", name: "Suna Park",
    title: "Garden of Forking Selves", accent: "#F5A3A3", accentText: "#0B1018",
    tags: ["digital manipulation"], thumb: ph(540, 540, "08", "#1d1d1d", "#F5A3A3"),
    hero: ph(1920, 1080, "08", "#1d1d1d", "#F5A3A3"),
    pos: { x: 380, y: 1300, w: 240, h: 240, rot: -2.2 }, spreads: [],
  },
  {
    id: "placeholder-09", slug: "placeholder-09", name: "Joana Albuquerque",
    title: "Lighthouse Diary", accent: "#A4D4F5", accentText: "#0B1018",
    tags: ["landscape", "archival"], thumb: ph(720, 480, "09", "#1d1d1d", "#A4D4F5"),
    hero: ph(1920, 1080, "09", "#1d1d1d", "#A4D4F5"),
    pos: { x: 900, y: 1320, w: 280, h: 180, rot: 0.4 }, spreads: [],
  },
  {
    id: "placeholder-10", slug: "placeholder-10", name: "Yusra Khan",
    title: "Vinegar Mothers", accent: "#D1C0E8", accentText: "#0B1018",
    tags: ["plants", "collaborative"], thumb: ph(420, 600, "10", "#1d1d1d", "#D1C0E8"),
    hero: ph(1920, 1080, "10", "#1d1d1d", "#D1C0E8"),
    pos: { x: 1350, y: 1280, w: 200, h: 280, rot: 3.0 }, spreads: [],
  },
  {
    id: "placeholder-11", slug: "placeholder-11", name: "Otto Brandt",
    title: "Hex / Hex", accent: "#FFB36B", accentText: "#0B1018",
    tags: ["digital manipulation", "collage"], thumb: ph(560, 380, "11", "#1d1d1d", "#FFB36B"),
    hero: ph(1920, 1080, "11", "#1d1d1d", "#FFB36B"),
    pos: { x: 2100, y: 400, w: 240, h: 160, rot: -2.0 }, spreads: [],
  },
  {
    id: "placeholder-12", slug: "placeholder-12", name: "Mira Belov",
    title: "Salt Letters", accent: "#BDE0C8", accentText: "#0B1018",
    tags: ["landscape", "portrait"], thumb: ph(420, 560, "12", "#1d1d1d", "#BDE0C8"),
    hero: ph(1920, 1080, "12", "#1d1d1d", "#BDE0C8"),
    pos: { x: 100, y: 380, w: 200, h: 260, rot: 1.4 }, spreads: [],
  },
];

export function findArtist(slug) {
  return ARTISTS.find((a) => a.slug === slug);
}

export function nextArtist(slug) {
  const i = ARTISTS.findIndex((a) => a.slug === slug);
  if (i === -1) return ARTISTS[0];
  return ARTISTS[(i + 1) % ARTISTS.length];
}
