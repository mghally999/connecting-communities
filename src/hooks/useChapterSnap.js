"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { binarySearch } from "@/utils/data-structures";

/**
 * useChapterSnap — step-snap scroll with gesture detection
 *
 * Why this exists (not the obvious "1 wheel tick = 1 step"):
 *   A Mac trackpad inertia stream keeps emitting `wheel` events for
 *   roughly 1.5 s after the user has physically stopped scrolling.
 *   The previous implementation only had a 1 s cooldown; once it
 *   elapsed, the next trailing inertia event was treated as a brand-
 *   new gesture and triggered another step. So one physical fling
 *   commonly stepped 2–3 chapters in a row.
 *
 *   We fix that by tracking gesture boundaries: a NEW gesture only
 *   begins after ≥ GESTURE_GAP_MS of silence since the last wheel
 *   event. Inside an active gesture we still call preventDefault so
 *   the section stays pinned, but we only step once.
 *
 *   This matches a user's intuition: a single physical scroll motion,
 *   however vigorous, advances the timeline by exactly one chapter.
 */

const STEP_VH = 60;
const SCROLL_TWEEN_MS = 1100;
const SNAP_IDLE_MS = 180;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const GESTURE_GAP_MS = 280;
const TOUCH_THRESHOLD_PX = 24;

export default function useChapterSnap({ chapterCount }) {
  const sectionRef = useRef(null);
  const chapterRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [chapterIndex, setChapterIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);

  const isSnappingRef = useRef(false);
  const inZoneRef = useRef(false);
  const snapOffsetsRef = useRef([]);

  const lastWheelAtRef = useRef(0);
  const gestureSteppedRef = useRef(false);

  const recomputeOffsets = useCallback(() => {
    const el = sectionRef.current;
    if (!el || typeof window === "undefined") return;
    const vh = window.innerHeight || 1;
    const totalScroll = Math.max(1, el.offsetHeight - vh);
    const offsets = new Array(chapterCount);
    for (let i = 0; i < chapterCount; i++) {
      offsets[i] = Math.round(
        el.offsetTop + (i / Math.max(1, chapterCount - 1)) * totalScroll
      );
    }
    snapOffsetsRef.current = offsets;
  }, [chapterCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    recomputeOffsets();
    const onResize = () => recomputeOffsets();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [recomputeOffsets]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (chapterCount < 2) return;
    let raf = 0;
    let lastIndex = -1;
    const tick = () => {
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const totalScroll = Math.max(1, el.offsetHeight - vh);
        const scrolled = -rect.top;
        const clampedScrolled =
          scrolled < 0 ? 0 : scrolled > totalScroll ? totalScroll : scrolled;
        const progress = clampedScrolled / totalScroll;
        const c = progress * (chapterCount - 1);
        chapterRef.current = c;
        const idx = Math.round(c);
        if (idx !== lastIndex) {
          lastIndex = idx;
          setChapterIndex(idx);
        }
        const inZone = rect.top <= 0 && rect.bottom >= vh;
        inZoneRef.current = inZone;
        const inView = rect.top <= vh * 0.05 && rect.bottom >= vh * 0.95;
        setEngaged((prev) => (prev === inView ? prev : inView));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onMouseMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current.x = (e.clientX / w) * 2 - 1;
      mouseRef.current.y = (e.clientY / h) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [chapterCount]);

  const tweenRafRef = useRef(0);
  const snapTo = useCallback((i) => {
    if (typeof window === "undefined") return;
    const offsets = snapOffsetsRef.current;
    if (!offsets.length) recomputeOffsets();
    const arr = snapOffsetsRef.current;
    if (!arr.length) return;
    const clamped = i < 0 ? 0 : i > chapterCount - 1 ? chapterCount - 1 : i;
    isSnappingRef.current = true;
    if (tweenRafRef.current) cancelAnimationFrame(tweenRafRef.current);
    const startY = window.scrollY || window.pageYOffset || 0;
    const endY = arr[clamped];
    const dist = endY - startY;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / SCROLL_TWEEN_MS);
      const eased = easeOutQuart(t);
      window.scrollTo(0, startY + dist * eased);
      if (t < 1) {
        tweenRafRef.current = requestAnimationFrame(step);
      } else {
        tweenRafRef.current = 0;
        setTimeout(() => { isSnappingRef.current = false; }, SNAP_IDLE_MS);
      }
    };
    tweenRafRef.current = requestAnimationFrame(step);
  }, [chapterCount, recomputeOffsets]);

  useEffect(() => () => {
    if (tweenRafRef.current) cancelAnimationFrame(tweenRafRef.current);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onWheel = (e) => {
      if (!inZoneRef.current) return;
      const now = performance.now();
      /* New gesture iff ≥ GESTURE_GAP_MS of silence since last event. */
      if (now - lastWheelAtRef.current >= GESTURE_GAP_MS) {
        gestureSteppedRef.current = false;
      }
      lastWheelAtRef.current = now;
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir) return;
      const cur = Math.round(chapterRef.current);
      const next = cur + dir;
      /* At an edge moving outward — fall through to the browser. */
      if (next < 0 || next > chapterCount - 1) return;
      e.preventDefault();
      if (gestureSteppedRef.current) return;
      if (isSnappingRef.current) return;
      gestureSteppedRef.current = true;
      snapTo(next);
    };

    let touchStartY = 0;
    let touchStartedInZone = false;
    let touchHandled = false;
    let touchAccum = 0;
    const onTouchStart = (e) => {
      touchStartedInZone = inZoneRef.current;
      touchHandled = false;
      touchStartY = e.touches[0].clientY;
      touchAccum = 0;
    };
    const onTouchMove = (e) => {
      if (!touchStartedInZone || touchHandled) return;
      const y = e.touches[0].clientY;
      touchAccum += touchStartY - y;
      touchStartY = y;
      if (Math.abs(touchAccum) < TOUCH_THRESHOLD_PX) {
        if (touchStartedInZone) e.preventDefault();
        return;
      }
      const dir = touchAccum > 0 ? 1 : -1;
      touchAccum = 0;
      const cur = Math.round(chapterRef.current);
      const next = cur + dir;
      if (next < 0 || next > chapterCount - 1) {
        touchStartedInZone = false;
        return;
      }
      e.preventDefault();
      touchHandled = true;
      if (!isSnappingRef.current) snapTo(next);
    };
    const onKey = (e) => {
      if (!inZoneRef.current) return;
      let dir = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      else return;
      const cur = Math.round(chapterRef.current);
      const next = cur + dir;
      if (next < 0 || next > chapterCount - 1) return;
      e.preventDefault();
      if (!isSnappingRef.current) snapTo(next);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [chapterCount, snapTo]);

  const jumpTo = useCallback((i) => {
    const offsets = snapOffsetsRef.current;
    if (!offsets.length) recomputeOffsets();
    const arr = snapOffsetsRef.current;
    if (!arr.length) return;
    const targetY = arr[clamp(i, 0, chapterCount - 1)];
    const idx = binarySearch(arr, targetY);
    snapTo(idx);
  }, [chapterCount, recomputeOffsets, snapTo]);

  return {
    sectionRef,
    chapterRef,
    chapterIndex,
    mouseRef,
    jumpTo,
    engaged,
    stepVh: STEP_VH,
  };
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
