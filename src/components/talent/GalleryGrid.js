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

/* Sphere distribution + drift constants. */
const SPHERE_RADIUS = 480;             // px — half-diagonal of the ball
const PERSPECTIVE = 2000;              // CSS perspective on the parent
const CARD_W_VW = 9;                   // base card width in vw
const IDLE_DRIFT_DEG_PER_SEC = 3.5;    // continuous rightward yaw
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.4;

/* Rotation limits.
 *   Yaw (horizontal): UNBOUNDED — the user can spin the sphere fully
 *                     left or right to inspect any face.
 *   Pitch (vertical): clamped to ±45° so the cluster never flips upside
 *                     down or tilts so far that the back hemisphere is
 *                     pointed at the user. */
const USER_PITCH_LIMIT = 45;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/* Fibonacci-sphere distribution — even spread on a unit sphere. */
function fibonacciSphere(i, n) {
  const y = 1 - ((i + 0.5) / n) * 2;          // -1..1
  const r = Math.sqrt(Math.max(0, 1 - y * y)); // ring radius at y
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const theta = goldenAngle * i;
  return {
    x: Math.cos(theta) * r,
    y,
    z: Math.sin(theta) * r,
  };
}

/* Build a stable slug → 3D position map. Primary artist sits at the
 * cluster origin (z slightly forward so the intro's shrink-handoff
 * lands on top of any near-sphere card behind it); the other 19
 * occupy points around the sphere surface. */
function buildPlacements(artists) {
  const placement = new Map();
  const others = artists.filter((a) => !a.isPrimary);
  artists.forEach((a) => {
    if (a.isPrimary) placement.set(a.slug, { px: 0, py: 0, pz: 60 });
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
  /* Foam.org reference: every card in the gallery sits at exactly 0°
   * rotation. We previously hashed a ±2.4° tilt per slug for variety —
   * dropping that brings the deck flush with the reference. */
  const rot = 0;
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

  /* Rotation: userYaw / userPitch take pointer-drag input; idleDrift
   * advances autonomously each RAF tick. Display Y rotation =
   * userYaw + idleDrift so user nudge ADDS to the drift (no fight).
   * No clamps — the sphere spins freely on both axes so the user can
   * inspect any face of it. */
  const userYaw = useMotionValue(0);
  const userPitch = useMotionValue(0);
  const idleDrift = useMotionValue(0);
  const displayRotY = useTransform([userYaw, idleDrift], ([u, d]) => u + d);
  const zoom = useMotionValue(1);
  const velY = useRef(0);
  const velX = useRef(0);
  const lastMove = useRef(0);
  const bgRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  const DPP = 0.32; // degrees per pixel of pointer travel

  /* These handlers live on the BACKGROUND-CAPTURE div, which is a
   * sibling of the card cluster (not an ancestor). Cards re-enable
   * pointer-events to receive their own clicks — they never bubble
   * through here. So we don't need any "skip if on a button" logic. */
  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: userYaw.get(),
      pitch: userPitch.get(),
    };
    velY.current = 0;
    velX.current = 0;
    lastMove.current = performance.now();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  }, [userYaw, userPitch]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    /* Yaw: unbounded — full horizontal rotation in either direction.
     * Pitch: clamped to ±USER_PITCH_LIMIT. */
    const newYaw = dragStart.current.yaw + dx * DPP;
    const newPitch = clamp(
      dragStart.current.pitch - dy * DPP,
      -USER_PITCH_LIMIT,
      USER_PITCH_LIMIT
    );
    const now = performance.now();
    const dt = Math.max(1, now - lastMove.current);
    velY.current = (e.movementX * DPP) / dt;
    velX.current = (-e.movementY * DPP) / dt;
    lastMove.current = now;
    userYaw.set(newYaw);
    userPitch.set(newPitch);
  }, [userYaw, userPitch]);

  const onPointerUp = useCallback((e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    const vY = velY.current * 1000;
    const vX = velX.current * 1000;
    /* Yaw inertia: no min/max — the spin keeps going until decay
     * brings it to rest. Pitch inertia: clamped to the ±45° lock. */
    animate(userYaw, userYaw.get() + vY * 0.3, {
      type: "decay",
      velocity: vY,
      power: 0.7,
      timeConstant: 700,
    });
    animate(userPitch, userPitch.get() + vX * 0.3, {
      type: "decay",
      velocity: vX,
      power: 0.7,
      timeConstant: 700,
      min: -USER_PITCH_LIMIT,
      max: USER_PITCH_LIMIT,
    });
  }, [userYaw, userPitch]);

  /* Autonomous idle drift. Continuously advances idleDrift by a small
   * amount each frame so the cluster gently floats rightward on its
   * own when the user isn't touching it. Drift keeps ticking during
   * drag too — the user's offset is additive, so the combination
   * still feels coherent. */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      idleDrift.set(idleDrift.get() + dt * IDLE_DRIFT_DEG_PER_SEC);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idleDrift]);

  // Wheel + pinch → zoom. Both gestures arrive as wheel events on
  // macOS trackpads (pinch sets ctrlKey, two-finger scroll does not).
  // We treat both as zoom so the cluster grows/shrinks smoothly with
  // any trackpad gesture. Rotation stays exclusively on drag.
  useEffect(() => {
    const el = bgRef.current;
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
      {/* BACKGROUND CAPTURE — sits BEHIND the cards in DOM order so
       *  it catches pointer-down on empty space. Cards have
       *  pointer-events: auto re-enabled per-card; the cluster
       *  container has pointer-events: none so empty space passes
       *  through to this background layer. This split is what makes
       *  clicks on cards reliable: cards receive their own click
       *  events natively, with no ancestor handler swallowing them. */}
      <div
        ref={bgRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          cursor: "grab",
          touchAction: "none",
        }}
      />

      {/* CLUSTER LAYER — sibling of background, pointer-events: none
       *  so empty space inside it falls through to the background.
       *  Each card opts back in to pointer-events. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            rotateX: userPitch,
            rotateY: displayRotY,
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
                  /* Cluster parent is pointer-events: none — opt this
                   * card back in so its motion.button receives clicks. */
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
                    /* backface-visibility intentionally NOT set —
                     * yaw is unbounded, so cards rotate past 90°
                     * regularly. With `hidden` they'd vanish from the
                     * cluster on every swing; allowing the back-facing
                     * side to render keeps the image visible (mirrored)
                     * from any angle. */
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
