"use client";

/**
 * useLenisHorizontal — wheel-Y → translate-X on a horizontal track.
 *
 * Lenis 1.x supports `orientation: 'horizontal'` natively, but it
 * expects the document or a `wrapper` to actually be horizontally
 * scrollable. For the portfolio template we'd rather keep the page
 * itself non-scrollable and translate an inner track by hand — that
 * way the foam sidebar / back arrow stay fixed without any sticky
 * gymnastics.
 *
 * This hook gives us a Lenis-like smoothing without using Lenis: it
 * accumulates wheel-Y into a target X, then lerps the rendered X
 * toward the target each rAF tick.
 */

import { useEffect, useRef } from "react";

export function useLenisHorizontal({
  wrapperRef,
  trackRef,
  lerp = 0.08,
  enabled = true,
}) {
  const targetX = useRef(0);
  const currentX = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const maxX = () => Math.max(0, track.scrollWidth - wrapper.clientWidth);

    const onWheel = (e) => {
      e.preventDefault();
      // Use whichever axis has the bigger delta — covers both mouse wheels
      // and trackpads.
      const dx = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetX.current = Math.max(0, Math.min(maxX(), targetX.current + dx));
    };

    // Touch: vertical swipe → horizontal pan
    let touchY = null;
    let touchX = null;
    const onTouchStart = (e) => {
      const t = e.touches[0];
      touchY = t.clientY;
      touchX = t.clientX;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const t = e.touches[0];
      const dy = touchY - t.clientY;
      const dx = touchX - t.clientX;
      const d = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      targetX.current = Math.max(0, Math.min(maxX(), targetX.current + d * 1.8));
      touchY = t.clientY;
      touchX = t.clientX;
    };
    const onTouchEnd = () => { touchY = null; touchX = null; };

    const onKey = (e) => {
      const step = wrapper.clientWidth * 0.6;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        targetX.current = Math.min(maxX(), targetX.current + step);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        targetX.current = Math.max(0, targetX.current - step);
      } else if (e.key === "Home") {
        targetX.current = 0;
      } else if (e.key === "End") {
        targetX.current = maxX();
      }
    };

    let raf = 0;
    const tick = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = reduced ? 1 : lerp;
      currentX.current += (targetX.current - currentX.current) * t;
      // Snap when close enough to avoid sub-pixel jitter
      if (Math.abs(targetX.current - currentX.current) < 0.05) {
        currentX.current = targetX.current;
      }
      track.style.transform = `translate3d(${-currentX.current}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", onTouchMove, { passive: true });
    wrapper.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      wrapper.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [enabled, wrapperRef, trackRef, lerp]);
}
