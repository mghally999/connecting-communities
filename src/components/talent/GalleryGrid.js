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

/* Layout — scattered plane (foam.org's actual layout) with subtle 3D depth.
 *
 * We use each artist's authored pos3 (x, y, z) — the data file was
 * built straight from foam.org's gallery, so this scatter mirrors the
 * reference exactly. The cluster gets a small amount of perspective
 * depth from z so a slow autonomous yaw drift reads as 3D parallax,
 * not a flat 2D pan. */
const SCALE_X = 54;          // px per authored x-unit (horizontal scatter)
const SCALE_Y = 52;          // px per authored y-unit (vertical scatter)
const SCALE_Z = 16;          // px per authored z-unit (subtle depth)
const PERSPECTIVE = 2200;    // CSS perspective on the parent
const CARD_W_VW = 9;         // base card width in vw

/* Rotation locks. The cluster is NOT a full-360 planet — the user can
 * nudge it by ±USER_YAW_LIMIT / ±USER_PITCH_LIMIT degrees off the
 * baseline yaw, and the autonomous drift advances the baseline slowly
 * over time so the cluster appears to gently float rightward. */
const USER_YAW_LIMIT = 28;   // deg — max left/right tilt from baseline
const USER_PITCH_LIMIT = 16; // deg — max up/down tilt
const IDLE_DRIFT_DEG_PER_SEC = 1.6; // slow continuous rightward yaw

const ZOOM_MIN = 0.55;
const ZOOM_MAX = 2.2;

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
  const px = (x - centroid.cx) * SCALE_X;
  const py = (y - centroid.cy) * SCALE_Y;
  const pz = z * SCALE_Z; // negative for "behind", 0 for "front"
  const t = Math.max(0, Math.min(1, (z + 20) / 20));
  const sizeScale = 0.75 + t * 0.55;
  const slug = artist.slug || "";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const rot = ((h % 100) / 100 - 0.5) * 4.8;
  return { px, py, pz, sizeScale, rot };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
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

  /* Rotation motion values are SPLIT into two pieces:
   *   userYaw / userPitch  — clamped user input, decays via inertia
   *   idleDrift             — autonomous continuous yaw, advances by
   *                            IDLE_DRIFT_DEG_PER_SEC in a RAF loop
   * Display rotation = userYaw + idleDrift on Y, userPitch on X. This
   * splits "where the user has nudged it" from "the cluster's gentle
   * autonomous float", so the user can't ever spin the cluster a full
   * 360° (the userYaw stays within ±USER_YAW_LIMIT) but the cluster
   * still appears to drift slowly to the right on its own. */
  const userYaw = useMotionValue(0);
  const userPitch = useMotionValue(0);
  const idleDrift = useMotionValue(0);
  const displayRotY = useTransform(
    [userYaw, idleDrift],
    ([u, d]) => u + d
  );
  const zoom = useMotionValue(1);
  const velY = useRef(0);
  const velX = useRef(0);
  const lastMove = useRef(0);
  const wrapperRef = useRef(null);
  // pending: pointerdown happened but we haven't moved past DRAG_THRESHOLD
  //          yet — clicks on cards must pass through during this state.
  // active:  past threshold; we own the pointer capture and rotate.
  const dragState = useRef("idle");
  const dragStart = useRef({ x: 0, y: 0, yaw: 0, pitch: 0, pointerId: 0 });

  const DPP = 0.32;          // degrees per pixel of pointer travel
  const DRAG_THRESHOLD = 5;  // px — below this, the gesture is a click

  const onPointerDown = useCallback((e) => {
    // Don't capture pointer yet. We want clicks on cards to bubble up
    // naturally — pointer capture would re-target pointerup at the
    // wrapper and suppress the click on the card underneath.
    dragState.current = "pending";
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: userYaw.get(),
      pitch: userPitch.get(),
      pointerId: e.pointerId,
    };
    velY.current = 0;
    velX.current = 0;
    lastMove.current = performance.now();
  }, [userYaw, userPitch]);

  const onPointerMove = useCallback((e) => {
    if (dragState.current === "idle") return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    // Promote pending → active once the cursor moves past threshold.
    // At that moment we capture the pointer so the rest of the gesture
    // belongs to us even if the cursor leaves the cluster element.
    if (dragState.current === "pending") {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragState.current = "active";
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    const newYaw = clamp(
      dragStart.current.yaw + dx * DPP,
      -USER_YAW_LIMIT,
      USER_YAW_LIMIT
    );
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
    const wasActive = dragState.current === "active";
    dragState.current = "idle";
    if (wasActive) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      // Inertia release. min/max keep the decay clamped inside the
      // user-rotation range — the cluster glides toward its target
      // but bounces off the limits softly.
      const vY = velY.current * 1000;
      const vX = velX.current * 1000;
      animate(userYaw, userYaw.get() + vY * 0.3, {
        type: "decay",
        velocity: vY,
        power: 0.7,
        timeConstant: 650,
        min: -USER_YAW_LIMIT,
        max: USER_YAW_LIMIT,
      });
      animate(userPitch, userPitch.get() + vX * 0.3, {
        type: "decay",
        velocity: vX,
        power: 0.7,
        timeConstant: 650,
        min: -USER_PITCH_LIMIT,
        max: USER_PITCH_LIMIT,
      });
    }
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
          cursor: "grab",
          touchAction: "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* The rotating cluster. transformStyle: preserve-3d lets the
         *  child cards keep their 3D depth as the cluster spins.
         *  Display rotation = userYaw + idleDrift on Y, userPitch on X.
         *  rotateX / rotateY are passed as native framer-motion style
         *  props (not via a composed `transform` string) so framer's
         *  matrix writer doesn't clobber the children's translate3d. */}
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
