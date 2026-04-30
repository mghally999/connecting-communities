"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useChapterScroll
 *
 * Pyramids-of-Meroë style chapter walkthrough — implemented as a
 * sticky-pinned scroll proxy. NEVER locks the page scroll, NEVER
 * prevents wheel events. The browser's native scroll handles
 * everything. The chapter system is purely DERIVED from scroll position.
 *
 * MENTAL MODEL
 *
 *   Host element: position: relative; height: (N + 0.5) × 100vh
 *   Inner stage:  position: sticky;   top: 0; height: 100vh
 *
 * As the user scrolls past the host, the inner stage stays glued to the
 * top of the viewport. We measure how far the user has scrolled INTO
 * the host, divide by viewport height, and that integer is the "target
 * chapter index". A short 0.5×vh tail at the bottom lets the user
 * cleanly exit the last chapter into the supplementary content below.
 *
 * The camera doesn't track the raw scroll position — it eases toward
 * the target index over `transitionMs`. So:
 *
 *   - Slow scroll (one wheel tick at a time): each tick shifts target +1
 *     and the camera animates to it over ~850ms. Feels "snappy & cinematic".
 *   - Fast scroll (touchpad fling): target jumps multiple chapters
 *     ahead. Camera still takes ~850ms × distance to settle (capped),
 *     so the user sees the camera glide through chapters even when the
 *     scroll position is already past them. Critically, the user is
 *     NEVER stuck — they can always keep scrolling and naturally exit
 *     the section.
 *
 * Returns:
 *   - sectionRef       : ref for the tall host
 *   - chapterRef       : continuous fractional 0..N-1 for useFrame
 *   - chapterIndex     : settled integer chapter (for React UI)
 *   - jumpTo(i)        : scrolls page to chapter i smoothly
 */

const EASE = (t) => 1 - Math.pow(1 - t, 3);

export default function useChapterScroll({
  chapterCount,
  transitionMs = 850,
  /* Each chapter occupies BAND_VH viewport-percent of scroll distance.
   * 60vh feels right: one mouse-wheel tick (~100px) advances ~17% of a
   * band, a normal touchpad swipe (~300-400px) advances about 60% of a
   * band, so a typical scroll gesture moves one chapter — the same
   * "snappy" feel as the Pyramids of Meroë reference. */
  bandVh = 60,
  exitTailVh = 50,
}) {
  const sectionRef = useRef(null);
  const chapterRef = useRef(0);

  // Animation state
  const targetRef = useRef(0);
  const startVal = useRef(0);
  const tStart = useRef(0);
  const animatingRef = useRef(false);
  const rafRef = useRef(0);

  const [chapterIndex, setChapterIndex] = useState(0);

  /* Animate chapterRef.current → targetRef.current over `transitionMs`. */
  const ensureAnimating = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - tStart.current;
      const k = Math.min(1, elapsed / transitionMs);
      const eased = EASE(k);
      chapterRef.current =
        startVal.current + (targetRef.current - startVal.current) * eased;
      if (Math.abs(chapterRef.current - targetRef.current) > 0.001) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        chapterRef.current = targetRef.current;
        animatingRef.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [transitionMs]);

  /* Set a new target. If we're already animating to it, do nothing. */
  const setTarget = useCallback((next) => {
    const clamped = Math.max(0, Math.min(chapterCount - 1, next));
    if (clamped === targetRef.current) return;
    // Re-baseline the animation: start from the CURRENT value so the
    // ease is smooth even if we were mid-transition.
    startVal.current = chapterRef.current;
    targetRef.current = clamped;
    tStart.current = performance.now();
    setChapterIndex(clamped);
    ensureAnimating();
  }, [chapterCount, ensureAnimating]);

  /* On scroll: compute which chapter the user is in. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el) return;

    let scheduled = 0;
    const compute = () => {
      scheduled = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // If section hasn't reached the top yet, target chapter 0
      if (rect.top > 0) {
        setTarget(0);
        return;
      }
      // If section is fully scrolled past, target last chapter
      if (rect.bottom < vh) {
        setTarget(chapterCount - 1);
        return;
      }

      // Distance scrolled past the top of the section, expressed in
      // bands instead of viewports.
      const passed = -rect.top;
      const bandPx = (vh * bandVh) / 100;
      // Each chapter occupies one band. Small bias (~15% of a band) so
      // the next chapter triggers as soon as the user crosses into it.
      const i = Math.floor((passed + bandPx * 0.15) / bandPx);
      setTarget(i);
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(compute);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [chapterCount, setTarget]);

  /* Scroll programmatically to a chapter. */
  const jumpTo = useCallback((i) => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el) return;
    const vh = window.innerHeight || 1;
    const bandPx = (vh * bandVh) / 100;
    const targetTop = el.offsetTop + i * bandPx;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [bandVh]);

  /* Total host height: chapterCount × bandVh + exit tail */
  const hostHeightVh = chapterCount * bandVh + exitTailVh;

  return {
    sectionRef,
    chapterRef,
    chapterIndex,
    jumpTo,
    hostHeightVh,
  };
}
