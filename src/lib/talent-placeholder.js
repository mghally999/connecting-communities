/**
 * Deterministic placeholder image URL — fills in for missing
 * Storyblok assets when the foam-deep / foam-mega-run / foam_source
 * scrapes couldn't resolve a src. Same slug+index pair always returns
 * the same image so the page reads consistently across reloads.
 *
 * User authorised placeholder imagery (picsum/unsplash/pexels) in
 * lieu of the original photographs — behaviour parity (animations,
 * drag, hover, scroll) doesn't depend on which photo appears in
 * each slot.
 */

export function placeholderImage(slug, index = 0, w = 1200, h = 1600) {
  const seed = encodeURIComponent(`${slug || "talent"}-${index}`);
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
