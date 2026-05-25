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

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { placeholderImage } from "@/lib/talent-placeholder";

/**
 * Project an artist's authored 3D (x, y, z) coordinate into 2D viewport space.
 *
 * Phase 2 (May 2026 parity sweep): the previous projection pushed cards
 * near the extreme x values off-screen because it used the raw authored
 * coordinate. We now normalise (subtract the centroid of all positions)
 * so the cluster centers on the viewport instead of biasing in whatever
 * direction the data leans, and we tighten the per-axis multiplier so
 * the spread comfortably fits inside the viewport without edge-clipping.
 *
 * Authored ranges in talent-artists.js:
 *   x ∈ [-13, 15.5]   y ∈ [-8, 8.5]   z ∈ [-20, 0]
 * Projected after centroid normalisation:
 *   leftPct = 50 + (x - cx) * 3.6  → ~5% .. ~104%  (tightened from 4.2)
 *   topPct  = 50 + (y - cy) * 4.2  → ~14% .. ~88%  (tightened from 4.8)
 *   scale   = 0.7 + ((z + 20)/20) * 0.5  → 0.7 .. 1.2 (closer z = bigger)
 *   rot     = ±2.4° stable hash of slug
 */
function computeCentroid(arr) {
  if (arr.length === 0) return { cx: 0, cy: 0 };
  const xs = arr.map((a) => parseFloat(a.pos3?.x ?? 0));
  const ys = arr.map((a) => parseFloat(a.pos3?.y ?? 0));
  const cx = xs.reduce((s, v) => s + v, 0) / xs.length;
  const cy = ys.reduce((s, v) => s + v, 0) / ys.length;
  return { cx, cy };
}

function projectArtist(artist, centroid) {
  const x = parseFloat(artist.pos3?.x ?? 0);
  const y = parseFloat(artist.pos3?.y ?? 0);
  const z = parseFloat(artist.pos3?.z ?? 0);
  const leftPct = 50 + (x - centroid.cx) * 3.6;
  const topPct  = 50 + (y - centroid.cy) * 4.2;
  // z range [-20..0] → t [0..1] → scale [0.7..1.2]
  const t = Math.max(0, Math.min(1, (z + 20) / 20));
  const scale = 0.7 + t * 0.5;
  const slug = artist.slug || "";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const rot = ((h % 100) / 100 - 0.5) * 4.8;
  return { leftPct, topPct, scale, rot };
}

const CARD_W_VW = 8; // base card width in vw — PROJ.scale multiplies this

export default function GalleryGrid({ artists, hoveredSlug, onHover, onLeave, onPick, activeFilter }) {
  // Lock body scroll while the gallery is mounted; thumbnails are positioned
  // absolutely in a fixed-height stage.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Compute the centroid once per artist set. Subtracting it inside the
  // projection centers the constellation regardless of how the authored
  // coordinates lean (currently small ~0.16, ~0.53 — but the data could
  // shift if artists are added/removed and we want the spread to remain
  // centered).
  const centroid = useMemo(() => computeCentroid(artists), [artists]);
  const PROJ = (a) => projectArtist(a, centroid);

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
