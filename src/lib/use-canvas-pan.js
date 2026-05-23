"use client";

/**
 * useCanvasPan — pointer + wheel panning for the gallery board.
 *
 * Per FOAM_TALENT_SPEC.md §2.3: drag the WHOLE canvas, not individual
 * cards. The drag is single-source-of-truth (a `useRef` of {x,y})
 * applied to the canvas via `style.transform` directly, so we never
 * trigger React renders during drag.
 *
 * Returns an object the consumer spreads onto the stage element plus
 * the canvas ref. `getOffset()` lets the consumer read the current
 * offset for hit-testing or click vs. drag detection.
 */

import { useEffect, useRef } from "react";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const DRAG_THRESHOLD = 6; // pixels — under this, treat pointerup as a click

export function useCanvasPan({ canvasW = 3000, canvasH = 2400, enabled = true }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  const offset = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const lastClickWasDrag = useRef(false);

  // Apply current offset to the canvas element.
  const apply = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.style.transform = `translate3d(${offset.current.x}px, ${offset.current.y}px, 0)`;
  };

  const bounds = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    return {
      x: Math.max(0, (canvasW - vw) / 2),
      y: Math.max(0, (canvasH - vh) / 2),
    };
  };

  useEffect(() => {
    apply();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerDown = (e) => {
      // Ignore drags that start on real interactive children — let the
      // card's own pointer events run. We still allow drag if the press
      // travels >6px (handled in onClick capture below).
      drag.current = {
        x: e.clientX, y: e.clientY,
        ox: offset.current.x, oy: offset.current.y,
        moved: 0,
      };
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch {}
    };

    const onPointerMove = (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.moved = Math.max(d.moved, Math.hypot(dx, dy));
      const b = bounds();
      offset.current.x = clamp(d.ox + dx, -b.x, b.x);
      offset.current.y = clamp(d.oy + dy, -b.y, b.y);
      apply();
    };

    const onPointerUp = (e) => {
      const d = drag.current;
      drag.current = null;
      stage.classList.remove("is-dragging");
      try { stage.releasePointerCapture(e.pointerId); } catch {}
      lastClickWasDrag.current = !!(d && d.moved > DRAG_THRESHOLD);
    };

    const onWheel = (e) => {
      // Translate vertical wheel into canvas Y, with horizontal wheel
      // into canvas X. Trackpads provide both.
      e.preventDefault();
      const b = bounds();
      offset.current.x = clamp(offset.current.x - e.deltaX, -b.x, b.x);
      offset.current.y = clamp(offset.current.y - e.deltaY, -b.y, b.y);
      apply();
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("wheel", onWheel);
    };
  }, [enabled, canvasW, canvasH]);

  /** When a card receives a click event, ask this before navigating: was
   *  the pointer travel above the drag threshold? If so, swallow it. */
  const wasDrag = () => lastClickWasDrag.current;

  return { stageRef, canvasRef, getOffset: () => ({ ...offset.current }), wasDrag };
}
