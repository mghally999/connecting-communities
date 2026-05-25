"use client";

/**
 * GalleryGrid — 2D scattered DOM thumbnails for the 'gallery' phase.
 *
 * Card positions are projected from each artist's authored 3D coordinate
 * (x, y, z) into 2D viewport space (see projectArtist below). The whole
 * 20-card cluster lives inside one drag wrapper so it pans as a tethered
 * group; the wrapper also accepts wheel/trackpad input via a shared pair
 * of motion values.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
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

  /* Ball-physics cluster drag.
   *
   * Constraints are loose (±60% of viewport) so the cluster can be
   * pushed comfortably off-center and is recovered by the user, not
   * yanked back by a magnet. dragElastic 0.55 lets the user pull
   * even further past the constraint while holding. The dragTransition
   * tuning (power 0.7, timeConstant 750, bounceStiffness 50, bounceDamping
   * 12) gives a 1.5–2 s glide on flick release, a soft cushion when
   * the cluster overshoots, and at most one mild overshoot before
   * settling — no perceptible snap-back.
   *
   * dragX/dragY are motion values so the wheel handler can apply
   * inertia-typed `animate()` calls to the same transform without
   * fighting framer-motion's matrix writer. */
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const wrapperRef = useRef(null);
  const [constraints, setConstraints] = useState({
    left: -700,
    right: 700,
    top: -420,
    bottom: 420,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const maxX = window.innerWidth * 0.6;
      const maxY = window.innerHeight * 0.6;
      setConstraints({ left: -maxX, right: maxX, top: -maxY, bottom: maxY });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Wheel/trackpad pan with physics. Each tick fires an inertia-typed
  // animate() so the cluster glides instead of teleporting to a new
  // position. ctrlKey is preserved so pinch-zoom passes through.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const maxX = window.innerWidth * 0.6;
      const maxY = window.innerHeight * 0.6;
      const nx = Math.max(-maxX, Math.min(maxX, dragX.get() - e.deltaX * 1.2));
      const ny = Math.max(-maxY, Math.min(maxY, dragY.get() - e.deltaY * 1.2));
      animate(dragX, nx, {
        type: "inertia",
        velocity: -e.deltaX * 8,
        power: 0.4,
        timeConstant: 400,
        bounceStiffness: 50,
        bounceDamping: 12,
        min: -maxX,
        max: maxX,
      });
      animate(dragY, ny, {
        type: "inertia",
        velocity: -e.deltaY * 8,
        power: 0.4,
        timeConstant: 400,
        bounceStiffness: 50,
        bounceDamping: 12,
        min: -maxY,
        max: maxY,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dragX, dragY]);

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
      {/* Ball-physics drag wrapper.
       *  power 0.7 throws further on a flick; timeConstant 750 lets
       *  velocity decay over ~1.8 s; bounceStiffness 50 + bounceDamping
       *  12 give a soft cushion (no snap-back) when overshooting the
       *  constraint. dragElastic 0.55 lets the user pull the cluster
       *  well past the constraint while holding. modifyTarget is the
       *  identity so framer-motion never snaps to a rounded value. */}
      <motion.div
        ref={wrapperRef}
        drag
        dragMomentum={true}
        dragElastic={0.55}
        dragConstraints={constraints}
        dragTransition={{
          power: 0.7,
          timeConstant: 750,
          bounceStiffness: 50,
          bounceDamping: 12,
          modifyTarget: (t) => t,
        }}
        whileDrag={{ cursor: "grabbing" }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "none",
          x: dragX,
          y: dragY,
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
