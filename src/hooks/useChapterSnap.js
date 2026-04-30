"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useChapterSnap — discrete chapter navigation
 *
 * Locks page scroll while inside the section; one wheel/touch gesture
 * advances exactly one chapter; ~850ms eased camera transition.
 *
 * Glitch fix in this iteration:
 *   When the user scrolled up past chapter 0, disengage() set
 *   `scrollTo(offsetTop - 1)`. The IntersectionObserver-style scroll
 *   listener then immediately re-engaged us because the section was
 *   still right at the viewport top. We now keep a 600ms re-engage
 *   cooldown timer; engage() is suppressed until the cooldown clears,
 *   which gives the user time to scroll fully out of the section.
 */

const EASE_OUT = (t) => 1 - Math.pow(1 - t, 3);

export default function useChapterSnap({
  chapterCount,
  transitionMs = 850,
  pauseAfterMs = 120,
  wheelThresholdPx = 18,
  touchThresholdPx = 60,
  reengageCooldownMs = 600,
}) {
  const sectionRef = useRef(null);

  const chapterRef = useRef(0);
  const targetRef = useRef(0);
  const startVal = useRef(0);
  const tStart = useRef(0);
  const transitioning = useRef(false);
  const lastSettleAt = useRef(0);
  const rafRef = useRef(0);

  const mouseRef = useRef({ x: 0, y: 0 });

  const [chapterIndex, setChapterIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);

  // Cooldown to prevent immediate re-engage after disengaging
  const lastDisengagedAt = useRef(0);

  const startTransition = useCallback((toIndex) => {
    const clamped = Math.max(0, Math.min(chapterCount - 1, toIndex));
    if (clamped === targetRef.current && !transitioning.current) return false;
    targetRef.current = clamped;
    startVal.current = chapterRef.current;
    tStart.current = performance.now();
    transitioning.current = true;
    setChapterIndex(clamped);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const now = performance.now();
      const elapsed = now - tStart.current;
      const k = Math.min(1, elapsed / transitionMs);
      const eased = EASE_OUT(k);
      chapterRef.current =
        startVal.current + (targetRef.current - startVal.current) * eased;
      if (k < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        chapterRef.current = targetRef.current;
        transitioning.current = false;
        lastSettleAt.current = now;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return true;
  }, [chapterCount, transitionMs]);

  const jumpTo = useCallback((i) => startTransition(i), [startTransition]);

  const step = useCallback((dir) => {
    const now = performance.now();
    if (transitioning.current) return true;
    if (now - lastSettleAt.current < pauseAfterMs) return true;
    const next = targetRef.current + dir;
    if (next < 0 || next > chapterCount - 1) return false;
    startTransition(next);
    return true;
  }, [chapterCount, pauseAfterMs, startTransition]);

  /* ------------------------------------------------------------------ */
  /* Engagement: lock page scroll                                        */
  /* ------------------------------------------------------------------ */

  const lockedScrollY = useRef(0);

  const engage = useCallback(() => {
    if (typeof window === "undefined") return;
    // Cooldown guard — prevents re-engage immediately after disengage
    if (performance.now() - lastDisengagedAt.current < reengageCooldownMs) return;
    lockedScrollY.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    setEngaged(true);
  }, [reengageCooldownMs]);

  const disengage = useCallback((scrollDir) => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    setEngaged(false);
    lastDisengagedAt.current = performance.now();

    // Restore scroll position outside the section so the user clearly
    // exits.  Up boundary: place page right above the section. Down
    // boundary: place page right after the section.
    if (el) {
      if (scrollDir > 0) {
        // Going down — exit just past the section
        const exitY = el.offsetTop + el.offsetHeight + 2;
        window.scrollTo({ top: exitY, behavior: "auto" });
      } else if (scrollDir < 0) {
        // Going up — exit one viewport above the section start so the
        // user doesn't bounce back in immediately.
        const exitY = Math.max(0, el.offsetTop - window.innerHeight + 1);
        window.scrollTo({ top: exitY, behavior: "auto" });
      } else {
        window.scrollTo({ top: lockedScrollY.current, behavior: "auto" });
      }
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Engage when section reaches viewport top                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      if (engaged) return;
      // Skip during cooldown
      if (performance.now() - lastDisengagedAt.current < reengageCooldownMs) return;
      const r = el.getBoundingClientRect();
      // Engage only when section top is exactly at / very near the
      // viewport top, AND the section is currently the most prominent
      // thing on screen.
      if (r.top <= 4 && r.top >= -window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.5) {
        window.scrollTo({ top: el.offsetTop, behavior: "auto" });
        engage();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [engaged, engage, reengageCooldownMs]);

  /* ------------------------------------------------------------------ */
  /* While engaged: capture wheel / key / touch / mouse                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!engaged) return;
    if (typeof window === "undefined") return;

    let wheelAccum = 0;
    let lastWheelAt = 0;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const now = performance.now();
      if (now - lastWheelAt > 220) wheelAccum = 0;
      lastWheelAt = now;
      if (transitioning.current) return;
      if (now - lastSettleAt.current < pauseAfterMs) return;
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) < wheelThresholdPx) return;
      const dir = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      const stepped = step(dir);
      if (!stepped) disengage(dir);
    };

    const onKey = (e) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        if (!step(1)) disengage(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (!step(-1)) disengage(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        startTransition(0);
      } else if (e.key === "End") {
        e.preventDefault();
        startTransition(chapterCount - 1);
      }
    };

    let touchStartY = 0;
    let touchAccum = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchAccum = 0;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const dy = touchStartY - e.touches[0].clientY;
      touchAccum = dy;
      touchStartY = e.touches[0].clientY;
      if (transitioning.current) return;
      if (Math.abs(touchAccum) < touchThresholdPx) return;
      const dir = touchAccum > 0 ? 1 : -1;
      touchAccum = 0;
      const stepped = step(dir);
      if (!stepped) disengage(dir);
    };

    const onMouseMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current.x = (e.clientX / w) * 2 - 1;
      mouseRef.current.y = (e.clientY / h) * 2 - 1;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [engaged, step, disengage, startTransition, chapterCount, pauseAfterMs, wheelThresholdPx, touchThresholdPx]);

  /* Cleanup */
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
      }
    };
  }, []);

  return {
    sectionRef,
    chapterRef,
    chapterIndex,
    mouseRef,
    jumpTo,
    engaged,
  };
}
