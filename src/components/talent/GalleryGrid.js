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
import { motion } from "framer-motion";
import { placeholderImage } from "@/lib/talent-placeholder";

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
/* Phase 3 (video review): the earlier x*4.5/y*5.5 spread pushed half
 * the cards off-screen on landing; only ~3 visible without drag. The
 * new video review showed foam's gallery has cards SCATTERED across
 * the viewport with whitespace between them AND with visible size
 * variation (z-depth). Tightened spread to x*4.2/y*4.8 and added a
 * 0.7–1.2 per-card scale variation driven by the authored z value. */
const PROJ = (artist) => {
  const x = parseFloat(artist.pos3?.x ?? 0);
  const y = parseFloat(artist.pos3?.y ?? 0);
  const z = parseFloat(artist.pos3?.z ?? 0);
  const leftPct = 50 + x * 4.2;
  const topPct  = 50 + y * 4.8;
  // z range [-20..0] → t [0..1] → scale [0.7..1.2]
  const t = Math.max(0, Math.min(1, (z + 20) / 20));
  const scale = 0.7 + t * 0.5;
  // Stable per-slug rotation: hash slug chars to ±2.4°
  const slug = artist.slug || "";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const rot = ((h % 100) / 100 - 0.5) * 4.8;
  return { leftPct, topPct, scale, rot };
};

const CARD_W_VW = 8; // base card width in vw — PROJ.scale multiplies this

export default function GalleryGrid({ artists, hoveredSlug, onHover, onLeave, onPick, activeFilter }) {
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
      {/* Drag-to-pan canvas wrapper. dragMomentum was off (Phase 5)
       *  but the new video review shows foam's gallery carries inertia.
       *  Tightened constraints since the spread itself is tighter now. */}
      <motion.div
        drag
        dragElastic={0.05}
        dragConstraints={{ left: -300, right: 300, top: -180, bottom: 180 }}
        whileTap={{ cursor: "grabbing" }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "grab",
        }}
      >
      {/* Phase 6: network-graph overlay. When a filter is active, draw
       *  thin red lines between every pair of matching cards. The SVG
       *  lives INSIDE the drag wrapper at 100% × 100% so the lines
       *  translate WITH the cards on drag; coords use the same
       *  leftPct / topPct projection PROJ() produces for cards. */}
      {activeFilter && artists.length > 1 && (
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 15,
            overflow: "visible",
          }}
          preserveAspectRatio="none"
        >
          {(() => {
            const pts = artists.map((a) => PROJ(a));
            const lines = [];
            for (let i = 0; i < pts.length; i++) {
              for (let j = i + 1; j < pts.length; j++) {
                lines.push(
                  <line
                    key={`${i}-${j}`}
                    x1={`${pts[i].leftPct}%`}
                    y1={`${pts[i].topPct}%`}
                    x2={`${pts[j].leftPct}%`}
                    y2={`${pts[j].topPct}%`}
                    stroke="#E63B4F"
                    strokeWidth="1"
                    opacity="0.55"
                  />
                );
              }
            }
            return lines;
          })()}
        </svg>
      )}
      {artists.map((a, i) => {
        const heroSrc = a.hero || placeholderImage(a.slug, 0, 800, 1000);
        const { leftPct, topPct, scale, rot } = PROJ(a);
        const isHovered = hoveredSlug === a.slug;
        const isDimmed  = hoveredSlug && !isHovered;
        const isPrimary = !!a.isPrimary;

        const cardWidth = `${CARD_W_VW * scale}vw`;
        return (
          <motion.button
            key={a.slug}
            onPointerEnter={() => onHover?.(a)}
            onPointerLeave={() => onLeave?.(a)}
            onClick={() => onPick?.(a)}
            aria-label={`${a.exhibition || a.name} by ${a.name}`}
            initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
            animate={{
              /* Phase 4 (video review): hovered card pops to 1.8x
               * (was 1.08) with a spring; siblings vanish fully
               * (opacity 0, also pointerEvents none so they can't
               * be raycast). */
              opacity: isDimmed ? 0 : 1,
              scale: isHovered ? 1.8 : 1,
              rotate: rot,
            }}
            transition={{
              opacity: { duration: isDimmed ? 0.3 : 0.4, ease: "easeOut" },
              scale: isHovered
                ? { type: "spring", stiffness: 200, damping: 26 }
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
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
              /* Dimmed siblings opt OUT of pointer events so the
               * hovered card stays the only target — prevents
               * accidental ghost-click on a 0-opacity neighbour. */
              pointerEvents: isDimmed ? "none" : "auto",
              willChange: "transform, opacity",
              zIndex: isHovered ? 20 : isPrimary ? 12 : 10,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt=""
              draggable={false}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Phase 6: the per-card "enter portfolio →" pill is removed.
             *  foam.org shows the exhibition title + artist name as a
             *  single bottom-centre caption instead; TalentExperience.js
             *  owns that caption since it spans the viewport, not the
             *  card. */}
          </motion.button>
        );
      })}
      </motion.div>
    </div>
  );
}
