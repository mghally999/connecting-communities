"use client";

/**
 * GalleryGrid — 2D scattered thumbnail layout for the 'gallery' phase.
 *
 * Replaces the previous R3F 3D scene because layoutId shared-element
 * morphs only work between DOM elements, not between DOM and WebGL
 * primitives. The hero-zoom entry requires the destination element to
 * be DOM-side, so the gallery had to come back into DOM.
 *
 * Card positions are projected from each artist's authored 3D coordinate
 * (x, y, z) into 2D viewport space:
 *
 *   leftPct = 50 + x * 2.8
 *   topPct  = 50 + y * 4.0
 *   scale   = clamp(0.6, 1.4 + z * 0.04, 1.2)
 *
 * The primary artist (Rehab Eldalil) sits at (0, 0, 0) → centre, full
 * scale; surrounding artists radiate outward at smaller sizes. The
 * primary card carries layoutId="hero-card" so the intro hero photo
 * morphs into it on phase transition.
 */

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Project an artist's authored 3D (x, y, z) coordinate into 2D viewport space.
 *
 * Bug 5: previous formula gave a 0.45→1.2 scale range (≈2.7x ratio).
 * The foam.org reference (interactions/index_canvas0.png) shows a
 * much wider dynamic range — tiny thumbnails ~3vw next to a hero ~25vw
 * (~8x ratio). Widened scale + tilted rotation so the constellation
 * reads as scattered rather than uniformly clustered.
 *
 * Authored ranges in talent-artists.js:
 *   x ∈ [-13, 15.5]   y ∈ [-8, 8.5]   z ∈ [-20, 0]
 * Projected:
 *   leftPct = 50 + x*3.2  → ~9% .. ~100% (full viewport)
 *   topPct  = 50 + y*4.6  → ~13% .. ~89%
 *   scale = 0.28 .. 1.15  (closer z = bigger)
 *   rot   = ±2.4° hashed off the slug
 */
const PROJ = (artist) => {
  const x = parseFloat(artist.pos3?.x ?? 0);
  const y = parseFloat(artist.pos3?.y ?? 0);
  const z = parseFloat(artist.pos3?.z ?? 0);
  const leftPct = 50 + x * 3.2;
  const topPct  = 50 + y * 4.6;
  // z maps -20..0 → 0.28..1.15 (linear)
  const t = Math.max(0, Math.min(1, (z + 20) / 20));
  const scale = 0.28 + t * 0.87;
  // stable per-slug rotation: hash slug chars to ±2.4°
  const slug = artist.slug || "";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const rot = ((h % 100) / 100 - 0.5) * 4.8;
  return { leftPct, topPct, scale, rot };
};

const CARD_W_VW = 14; // base card width in vw — primary card is bigger via scale

export default function GalleryGrid({ artists, hoveredSlug, onHover, onLeave, onPick }) {
  // Lock body scroll while the gallery is mounted; thumbnails are positioned
  // absolutely in a fixed-height stage.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="gallery-grid"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      {artists.map((a, i) => {
        if (!a.hero) return null;
        const { leftPct, topPct, scale, rot } = PROJ(a);
        const isHovered = hoveredSlug === a.slug;
        const isDimmed  = hoveredSlug && !isHovered;
        const isPrimary = !!a.isPrimary;

        const cardWidth = `${CARD_W_VW * scale * (isPrimary ? 1.8 : 1)}vw`;
        return (
          <motion.button
            key={a.slug}
            layoutId={isPrimary ? "hero-card" : undefined}
            onPointerEnter={() => onHover?.(a)}
            onPointerLeave={() => onLeave?.(a)}
            onClick={() => onPick?.(a)}
            aria-label={`${a.exhibition || a.name} by ${a.name}`}
            initial={
              isPrimary
                ? false  // primary card is morphed in by layoutId, skip initial
                : { opacity: 0, scale: 0.85, rotate: 0 }
            }
            animate={{
              opacity: isDimmed ? 0.25 : 1,
              scale: isHovered ? 1.08 : 1,
              rotate: rot,
            }}
            transition={{
              opacity: { duration: isDimmed ? 0.3 : 0.4, ease: "easeOut" },
              scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 0.7, ease: "easeOut" },
              layout: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
              delay: isPrimary ? 0 : 0.05 * (i % 8),
            }}
            style={{
              position: "absolute",
              left: `${leftPct}%`,
              top: `${topPct}%`,
              // No `transform: translate(-50%, -50%)` here — framer-motion would
              // overwrite it when animating scale/rotate. We use x/y as motion
              // values instead, which framer-motion composes into its matrix.
              x: "-50%",
              y: "-50%",
              width: cardWidth,
              aspectRatio: "4 / 3",
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              willChange: "transform, opacity",
              zIndex: isHovered ? 20 : isPrimary ? 12 : 10,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.hero}
              alt=""
              draggable={false}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Enter-portfolio CTA — appears under the hovered card */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "-2.6em",
                    transform: "translateX(-50%)",
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: a.accentText || "#000",
                    color: a.accent || "#fff",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "lowercase",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  enter portfolio →
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
