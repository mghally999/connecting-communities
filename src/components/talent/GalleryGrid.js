"use client";

/**
 * GalleryGrid — 3D draggable cluster of 20 artist thumbnails.
 *
 * Each card is positioned in 3D space using its authored (x, y, z)
 * coordinate (translate3d on a wrapper, perspective on the parent).
 * The whole cluster lives inside one rotating motion.div whose
 * rotateX / rotateY are driven by pointer-drag deltas — feels like
 * spinning a planet. On release the rotation decays with inertia;
 * if the user keeps gesturing, the rotation accumulates without limit
 * (no constraints — the planet can spin freely).
 *
 * The data file's pos3 is already a real 3D scatter (not a sphere
 * projection); using the z value as-is gives genuine depth — cards
 * with z=0 sit at the front of the cluster, z=-20 sit ~600 px back.
 * Cards do not billboard; they tilt with the rotation, which is what
 * makes it read as a 3D cluster rather than a flat dial.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { placeholderImage } from "@/lib/talent-placeholder";

/* Scatter factors. The previous values (36 / 38) bunched the cluster
 * tightly around the cluster origin — the perspective foreshortening
 * made the cards look squeezed together. Bumped X/Y so the cluster
 * spreads roughly 2× the viewport width and 1.5× its height, giving
 * the scattered-cloud look from foam.org. Z is increased modestly so
 * the depth still reads as 3D without pushing back cards out of view. */
const SCALE_X = 82;    // px per authored x-unit (horizontal scatter)
const SCALE_Y = 68;    // px per authored y-unit (vertical scatter)
const SCALE_Z = 38;    // px per authored z-unit (depth)
const PERSPECTIVE = 1800; // CSS perspective on the parent
const CARD_W_VW = 9;

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
  // Pixel offsets from the cluster origin, in 3D space.
  const px = (x - centroid.cx) * SCALE_X;
  const py = (y - centroid.cy) * SCALE_Y;
  // Depth: authored z is negative (foam.org puts most cards behind the
  // primary at z=0). Multiplying gives "back" cards negative translateZ
  // so they recede from the camera.
  const pz = z * SCALE_Z;
  // Per-card "presence" scale based on z — closer cards a touch bigger.
  // Combined with translateZ this reads as the perspective doing real
  // work without the size ratio being absurd.
  const t = Math.max(0, Math.min(1, (z + 20) / 20));
  const sizeScale = 0.7 + t * 0.5;
  const slug = artist.slug || "";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const rot = ((h % 100) / 100 - 0.5) * 4.8;
  return { px, py, pz, sizeScale, rot };
}

export default function GalleryGrid({ artists, hoveredSlug, onHover, onLeave, onPick, activeFilter }) {
  // Lock body scroll while the gallery is mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const centroid = useMemo(() => computeCentroid(artists), [artists]);
  const PROJ = (a) => projectArtist(a, centroid);

  /* Rotation motion values. rotY tracks horizontal pointer movement,
   * rotX tracks vertical pointer movement. Both unconstrained — the
   * cluster spins freely like a planet you flick. */
  const rotY = useMotionValue(0);
  const rotX = useMotionValue(0);
  // Velocity for inertia after release.
  const velY = useRef(0);
  const velX = useRef(0);
  const lastMove = useRef(0);
  const wrapperRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // The composed transform string the cluster applies. rotateY runs
  // first so vertical drag tilts the cluster in front-back rather than
  // left-right after the horizontal spin.
  const transform = useTransform(
    [rotX, rotY],
    ([rx, ry]) => `rotateY(${ry}deg) rotateX(${rx}deg)`
  );

  // Sensitivity: how many degrees per pixel of pointer travel.
  const DPP = 0.32;

  const onPointerDown = useCallback((e) => {
    // Only drag on background — clicks on cards go through onClick.
    // We still allow grab anywhere on the wrapper; the cards stop
    // event propagation via their own onClick handling.
    dragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotX.get(),
      rotY: rotY.get(),
    };
    velY.current = 0;
    velX.current = 0;
    lastMove.current = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [rotX, rotY]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newRotY = dragStart.current.rotY + dx * DPP;
    const newRotX = dragStart.current.rotX - dy * DPP;
    // Track velocity (px/ms) for the inertia release.
    const now = performance.now();
    const dt = Math.max(1, now - lastMove.current);
    velY.current = (e.movementX * DPP) / dt;
    velX.current = (-e.movementY * DPP) / dt;
    lastMove.current = now;
    rotY.set(newRotY);
    rotX.set(newRotX);
  }, [rotX, rotY]);

  const onPointerUp = useCallback((e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    // Apply inertia using framer-motion's animate(). Velocity is in
    // deg/ms; multiply by 1000 to get deg/s which `animate(type:'decay')`
    // expects. timeConstant 750 ms = same feel as the previous 2D drag.
    const vY = velY.current * 1000;
    const vX = velX.current * 1000;
    animate(rotY, rotY.get() + vY * 0.4, {
      type: "decay",
      velocity: vY,
      power: 0.7,
      timeConstant: 750,
    });
    animate(rotX, rotX.get() + vX * 0.4, {
      type: "decay",
      velocity: vX,
      power: 0.7,
      timeConstant: 750,
    });
  }, [rotX, rotY]);

  // Wheel: vertical wheel tips the cluster forward/back (rotX), shift+
  // wheel or horizontal trackpad tilts left/right (rotY). Each tick
  // applies a small impulse animated with inertia for a smooth feel.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const stepX = e.deltaY * 0.18;
      const stepY = e.deltaX * 0.18;
      animate(rotX, rotX.get() - stepX, {
        type: "inertia",
        velocity: -stepX * 6,
        power: 0.35,
        timeConstant: 320,
      });
      animate(rotY, rotY.get() + stepY, {
        type: "inertia",
        velocity: stepY * 6,
        power: 0.35,
        timeConstant: 320,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [rotX, rotY]);

  return (
    <div
      className="gallery-grid"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        overflow: "hidden",
        perspective: `${PERSPECTIVE}px`,
      }}
    >
      {/* Pointer-event capture surface — covers the entire viewport so
       *  the user can grab and rotate the cluster from any empty space.
       *  Cards stop propagation in their own onClick to avoid starting
       *  a rotation when the user really wants to navigate. */}
      <div
        ref={wrapperRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "absolute",
          inset: 0,
          cursor: dragging.current ? "grabbing" : "grab",
          touchAction: "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* The rotating cluster. transformStyle: preserve-3d lets the
         *  child cards keep their 3D depth as the cluster spins. */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform,
          }}
        >
          {/* Filter network graph — 2D SVG overlaid behind the cluster.
           *  It's a flat plane sitting at z=0 so it tilts with the
           *  cluster's rotation, which gives a nice planar grid feel. */}
          {activeFilter && artists.length > 1 && (
            <svg
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -2000,
                top: -2000,
                width: 4000,
                height: 4000,
                pointerEvents: "none",
                overflow: "visible",
                transformStyle: "preserve-3d",
              }}
              viewBox="-2000 -2000 4000 4000"
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
                        x1={pts[i].px}
                        y1={pts[i].py}
                        x2={pts[j].px}
                        y2={pts[j].py}
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
            const { px, py, pz, sizeScale, rot } = PROJ(a);
            const isHovered = hoveredSlug === a.slug;
            const isDimmed = hoveredSlug && !isHovered;
            const isPrimary = !!a.isPrimary;
            const cardWidthVw = CARD_W_VW * sizeScale;

            return (
              <motion.button
                key={a.slug}
                onPointerEnter={() => onHover?.(a)}
                onPointerLeave={() => onLeave?.(a)}
                onClick={(e) => {
                  // Stop the rotation drag from also treating this as a
                  // pointer-up release of an empty-space drag — if the
                  // pointer barely moved this still registers as a click.
                  e.stopPropagation();
                  onPick?.(a);
                }}
                aria-label={`${a.exhibition || a.name} by ${a.name}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
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
                  delay: isPrimary ? 0 : 0.05 * (i % 8),
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  // 3D placement: translate into position FIRST, then
                  // shift back by half-size so the card centers on (px, py, pz).
                  // framer-motion's `rotate` and `scale` animate ON TOP of
                  // this CSS transform via its `transform` write — they
                  // appear as additional matrix factors, preserving the
                  // 3D placement. (framer-motion writes transform LAST,
                  // so its rotate/scale wrap around our translate3d.)
                  transform: `translate3d(${px}px, ${py}px, ${pz}px) translate(-50%, -50%)`,
                  width: `${cardWidthVw}vw`,
                  aspectRatio: "4 / 3",
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  pointerEvents: isDimmed ? "none" : "auto",
                  willChange: "transform, opacity",
                  zIndex: isHovered ? 20 : isPrimary ? 12 : 10,
                  // Each card preserves 3D so its scale/rotate inside the
                  // cluster's preserve-3d parent retains depth ordering.
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
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
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
