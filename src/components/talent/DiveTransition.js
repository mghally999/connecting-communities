"use client";

/**
 * DiveTransition — the ~700 ms page-dive overlay.
 *
 * Per FOAM_TALENT_SPEC.md §2.3 the click-into-portfolio transition has
 * two simultaneous layers:
 *
 *   1. Cover wipe: an overlay sized to the source card's screen rect
 *      grows to fill the viewport while a copy of the artist's hero
 *      image enlarges with it (~3× zoom).
 *   2. Skin/noise dissolve: a granular high-contrast noise overlay
 *      fades up over the duration to mimic the worn-paper / chromatic
 *      dissolve from the reference capture.
 *
 * Implementation uses GSAP + CSS rather than a full R3F pipeline so
 * the bundle stays under control. The dissolve is achieved with a
 * tiled radial-gradient overlay (set in talent.css as `.dive-noise`)
 * that crossfades and slightly translates over the dive.
 *
 * Exposes an imperative API via ref so the parent can trigger the
 * dive when a card is clicked: `dive({ artist, rect })`.
 */

import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { gsap } from "gsap";

const DURATION = 0.72; // seconds — spec §6 calls for ~700 ms

const DiveTransition = forwardRef(function DiveTransition(props, ref) {
  const overlayRef = useRef(null);
  const bgRef = useRef(null);
  const cardRef = useRef(null);
  const noiseRef = useRef(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    /**
     * Run the dive animation and call `onArrive` when the overlay
     * fully covers the viewport. The parent is expected to push the
     * new route in `onArrive` so the navigation feels instant beneath
     * the cover.
     */
    dive({ artist, rect, onArrive }) {
      const overlay = overlayRef.current;
      const bg = bgRef.current;
      const card = cardRef.current;
      const noise = noiseRef.current;
      if (!overlay || !bg || !card) return;

      // Position the card overlay exactly over the clicked source card
      const r = rect || { left: 0, top: 0, width: 0, height: 0 };
      gsap.set(overlay, { autoAlpha: 1, "--dive-bg": artist.accent || "#0b0b0b" });
      gsap.set(bg, { autoAlpha: 0 });
      gsap.set(card, {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        autoAlpha: 1,
        scale: 1,
        transformOrigin: "center center",
        backgroundImage: `url(${artist.hero || artist.thumb})`,
        filter: "contrast(1) saturate(1)",
      });
      gsap.set(noise, { autoAlpha: 0 });

      if (reducedRef.current) {
        // Reduced motion: fast crossfade instead of zoom + noise
        gsap.to(bg, { autoAlpha: 1, duration: 0.18, onComplete: () => {
          onArrive?.();
          gsap.to(overlay, { autoAlpha: 0, duration: 0.18, delay: 0.05 });
        }});
        return;
      }

      const tl = gsap.timeline();

      // Card grows from source rect to viewport-spanning at ~3× scale
      tl.to(card, {
        left: -window.innerWidth,
        top: -window.innerHeight,
        width: window.innerWidth * 3,
        height: window.innerHeight * 3,
        duration: DURATION,
        ease: "expo.in",
      }, 0)
        // Background flood matches the artist accent
        .to(bg, { autoAlpha: 1, duration: DURATION * 0.65, ease: "power2.out" }, 0.05)
        // Noise dissolves up then out
        .to(noise, { autoAlpha: 0.9, duration: DURATION * 0.55, ease: "power2.out" }, 0.05)
        .to(card,  { filter: "contrast(1.4) saturate(1.2)", duration: DURATION * 0.6 }, 0.05)
        // Hand off mid-animation: push the route now so the destination
        // page renders behind the overlay
        .add(() => onArrive?.(), DURATION * 0.75)
        // Then fade everything out, revealing the destination
        .to([card, noise, bg, overlay],
            { autoAlpha: 0, duration: 0.32, ease: "power2.out" },
            DURATION + 0.05);
    },
  }), []);

  return (
    <div ref={overlayRef} className="dive-overlay" aria-hidden="true">
      <div ref={bgRef} className="dive-bg" />
      <div ref={cardRef} className="dive-card" />
      <div ref={noiseRef} className="dive-noise" />
    </div>
  );
});

export default DiveTransition;
