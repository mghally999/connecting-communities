"use client";

/**
 * The "foam" wordmark that lives top-left and rotates -90° once the
 * visitor crosses from the intro into the gallery.
 *
 * Per FOAM_TALENT_SPEC.md §2.6 we never unmount this between routes —
 * we tween its transform so it appears continuous.
 *
 * `state` accepts: 'intro' | 'gallery' | 'portfolio' | 'hidden'.
 */

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

/* Per-state target values. `fontSize` matters for the gallery state
 * specifically — foam.org's vertical wordmark is large and bold, not
 * the 22-px header treatment it has in intro. */
const STATES = {
  intro:     { x: "50vw", y: "7vh",  rotate:   0, opacity: 1, fontSize: 22, translateX: "-50%" },
  gallery:   { x: "32px", y: "24px", rotate: -90, opacity: 1, fontSize: 56, translateX: "0%"  },
  portfolio: { x: "32px", y: "24px", rotate: -90, opacity: 1, fontSize: 56, translateX: "0%"  },
  hidden:    { x: "32px", y: "24px", rotate: -90, opacity: 0, fontSize: 56, translateX: "0%"  },
};

export default function FoamSidebar({ state = "intro" }) {
  const ref = useRef(null);
  const prevState = useRef(state);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = STATES[state] || STATES.intro;
    gsap.to(el, {
      left: target.x,
      top: target.y,
      rotation: target.rotate,
      opacity: target.opacity,
      fontSize: target.fontSize,
      xPercent: parseFloat(target.translateX),
      duration: prevState.current === state ? 0 : 0.62,
      ease: "expo.inOut",
    });
    prevState.current = state;
  }, [state]);

  return (
    <div
      ref={ref}
      className="foam-sidebar"
      style={{
        left: STATES[state].x,
        top: STATES[state].y,
        fontSize: STATES[state].fontSize,
      }}
    >
      <Link href="/talent" aria-label="foam — return to Talent gallery">
        foam
      </Link>
    </div>
  );
}
