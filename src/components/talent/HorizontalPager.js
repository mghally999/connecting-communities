"use client";

/**
 * HorizontalPager — wheel-Y → translate-X exhibition catalogue.
 *
 * Per FOAM_TALENT_SPEC.md §2.5 the artist portfolio is a horizontal
 * sequence of full-viewport spreads. Wheel and touch get translated
 * via `useLenisHorizontal` into a smoothed transform on the inner
 * track.
 *
 * Children should be `<Spread />` elements (one per 100vw page).
 */

import React, { useRef } from "react";
import { useLenisHorizontal } from "@/lib/use-lenis-horizontal";

export default function HorizontalPager({ children, accent, accentText }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);

  useLenisHorizontal({ wrapperRef, trackRef });

  return (
    <div
      ref={wrapperRef}
      className="portfolio-shell"
      style={{
        "--talent-accent": accent,
        "--talent-accent-text": accentText,
        background: accent,
        color: accentText,
      }}
    >
      <div ref={trackRef} className="portfolio-track">
        {children}
      </div>
    </div>
  );
}
