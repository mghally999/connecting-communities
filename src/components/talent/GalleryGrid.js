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
import { animate, motion, useMotionValue } from "framer-motion";
import { placeholderImage } from "@/lib/talent-placeholder";

/* Sphere distribution constants.
 *
 * Cards are arranged on a Fibonacci sphere — an even point distribution
 * on the surface of a ball — so the cluster reads as a 3D orb you spin,
 * not a flat scatter. The primary artist is pinned at the sphere centre
 * so the intro's shrink-handoff still lands on a single visible card.
 * Other artists occupy points around the sphere surface. */
const SPHERE_RADIUS = 460; // px — half-diagonal of the cluster
const PERSPECTIVE = 1800;  // px — CSS perspective on the parent
const CARD_W_VW = 9;       // base card width in vw
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.4;

/* Fibonacci-sphere distribution. For N points, returns the i-th point
 * on a unit sphere. Multiplied by SPHERE_RADIUS to land in pixel space. */
function fibonacciSphere(i, n) {
  // Skip-by-two so the sphere doesn't have a card on each pole exactly.
  const y = 1 - ((i + 0.5) / n) * 2;          // -1..1
  const r = Math.sqrt(Math.max(0, 1 - y * y)); // radius at that y-slice
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const theta = goldenAngle * i;
  return {
    x: Math.cos(theta) * r,
    y,
    z: Math.sin(theta) * r,
  };
}

/* Build the placement for every artist once. Primary lands at origin
 * (z slightly forward so it sits in front of any nearby sphere card);
 * others get a Fibonacci-sphere slot. Stable across renders so cards
 * don't reshuffle when the artists array re-references. */
function buildPlacements(artists) {
  const others = artists.filter((a) => !a.isPrimary);
  const placement = new Map();
  artists.forEach((a) => {
    if (a.isPrimary) {
      placement.set(a.slug, { px: 0, py: 0, pz: 60 });
    }
  });
  others.forEach((a, i) => {
    const p = fibonacciSphere(i, others.length);
    placement.set(a.slug, {
      px: p.x * SPHERE_RADIUS,
      py: p.y * SPHERE_RADIUS,
      pz: p.z * SPHERE_RADIUS,
    });
  });
  return placement;
}

function cardExtras(artist) {
  // Mild per-slug rotation so cards aren't perfectly aligned with the
  // sphere tangent — feels more like a hand-pinned collection.
  const slug = artist.slug || "";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const rot = ((h % 100) / 100 - 0.5) * 4.8;
  const sizeScale = artist.isPrimary ? 1.2 : 1.0;
  return { rot, sizeScale };
}

export default function GalleryGrid({ artists, hoveredSlug, onHover, onLeave, onPick, activeFilter }) {
  // Lock body scroll while the gallery is mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const placements = useMemo(() => buildPlacements(artists), [artists]);

  /* Rotation motion values. rotY tracks horizontal pointer movement,
   * rotX tracks vertical pointer movement. Both unconstrained — the
   * sphere spins freely like a planet you flick. */
  const rotY = useMotionValue(0);
  const rotX = useMotionValue(0);
  /* Zoom motion value — scales the whole cluster. Wheel/pinch on the
   * trackpad sends impulses that smoothly approach a target zoom level.
   * Clamped to [ZOOM_MIN, ZOOM_MAX] so the user can't lose the sphere
   * off-screen. */
  const zoom = useMotionValue(1);
  // Velocity for inertia after release.
  const velY = useRef(0);
  const velX = useRef(0);
  const lastMove = useRef(0);
  const wrapperRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

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

  // Wheel + pinch → zoom. Both gestures arrive as wheel events on
  // macOS trackpads (pinch sets ctrlKey, two-finger scroll does not).
  // We treat both as zoom so the cluster grows/shrinks smoothly with
  // any trackpad gesture. Rotation stays exclusively on drag.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      // Pinch carries large negative deltaY for spread-apart; wheel
      // gives ±100ish per notch. Normalise the factor so a single
      // wheel notch produces ~6% zoom change, and a pinch gesture
      // smoothly tracks the fingers.
      const factor = e.ctrlKey ? 0.012 : 0.0015;
      const next = Math.max(
        ZOOM_MIN,
        Math.min(ZOOM_MAX, zoom.get() * Math.exp(-e.deltaY * factor))
      );
      animate(zoom, next, {
        type: "spring",
        stiffness: 220,
        damping: 26,
        mass: 0.6,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

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
         *  child cards keep their 3D depth as the cluster spins.
         *  rotateX / rotateY are passed as native framer-motion props
         *  (not via a composed `transform` string) so framer-motion's
         *  matrix writer doesn't clobber the children's translate3d. */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            rotateX: rotX,
            rotateY: rotY,
            scale: zoom,
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
                const pts = artists.map((a) => placements.get(a.slug) || { px: 0, py: 0 });
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
            const { px, py, pz } = placements.get(a.slug) || { px: 0, py: 0, pz: 0 };
            const { rot, sizeScale } = cardExtras(a);
            const isHovered = hoveredSlug === a.slug;
            const isDimmed = hoveredSlug && !isHovered;
            const isPrimary = !!a.isPrimary;
            const cardWidthVw = CARD_W_VW * sizeScale;

            /* CRITICAL: split positioning and animation across two nodes.
             *
             * The outer <div> is plain HTML — its `transform: translate3d(...)`
             * places the card in 3D space and stays untouched.
             *
             * The inner <motion.button> animates opacity / scale / rotate /
             * hover. framer-motion writes its own `transform: matrix(...)`
             * to whichever element it controls. If we put the translate3d
             * on the motion.button it would be CLOBBERED every frame the
             * scale/rotate animation runs — that's the bug where every
             * card collapses to (0, 0, 0). Putting the 3D placement on a
             * non-motion parent fixes it. */
            return (
              <div
                key={a.slug}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `translate3d(${px}px, ${py}px, ${pz}px) translate(-50%, -50%)`,
                  transformStyle: "preserve-3d",
                  width: `${cardWidthVw}vw`,
                  aspectRatio: "4 / 3",
                  zIndex: isHovered ? 20 : isPrimary ? 12 : 10,
                  pointerEvents: isDimmed ? "none" : "auto",
                  willChange: "transform",
                }}
              >
                <motion.button
                  onPointerEnter={() => onHover?.(a)}
                  onPointerLeave={() => onLeave?.(a)}
                  onClick={(e) => {
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
                    display: "block",
                    width: "100%",
                    height: "100%",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    willChange: "transform, opacity",
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
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
