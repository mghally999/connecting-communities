"use client";

/**
 * TALENT wordmark — op-art warped pattern.
 *
 * Visual oracle: foam-mega-run/foam-mega/site/screenshots/index_y0.png
 * (and reference.mov frame ~0:55). The foam.org intro renders TALENT
 * as a single continuous undulating field — horizontal stripes that
 * curve and bulge as if wrapped around invisible cylinders, with the
 * curves tightening toward letter edges. Bridget Riley fingerprint
 * look, no top/bottom split.
 *
 * Foam ships the equivalent effect via three.js in
 * foam-mega-run/foam-mega/site/shaders/index_01.glsl (grayscale +
 * displacement family) on image planes — same idea, different surface.
 * For the TALENT mark we don't need WebGL: SVG feTurbulence +
 * feDisplacementMap on a horizontal-stripe pattern reproduces it as
 * one filter primitive, no new deps.
 *
 * Tuning (dial these inline if it reads off in the browser):
 *   baseFrequency  0.008 0.014  — warp wavelength. Lower = larger waves
 *                                 (more cinematic). Upper bound ~0.030
 *                                 before it turns to mush.
 *   numOctaves     2            — stacked noise layers. 1 cleanest,
 *                                 2 matches foam, 3+ too busy.
 *   scale          38           — displacement magnitude. At fontSize
 *                                 220, scale 38 ≈ 13% of cap-height;
 *                                 matches foam by eye. 24-28 keeps
 *                                 letters readable; 48-56 cranks the
 *                                 warp if it reads too tame.
 *   seed           7            — RNG seed; any integer. Picked by eye.
 *
 * viewBox + preserveAspectRatio are kept identical to the previous
 * file so Intro.js's layout slot doesn't reflow.
 */

import React from "react";

const TalentMarkSVG = React.forwardRef(function TalentMarkSVG(
  { className = "" },
  ref
) {
  return (
    <svg
      ref={ref}
      className={className}
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="TALENT"
      focusable="false"
    >
      <title>TALENT</title>
      <defs>
        {/* Base stripe field — 6-px horizontal black/white bands. The
         *  displacement filter below turns these into the curved
         *  "fingerprint" pattern foam uses. */}
        <pattern
          id="talent-stripes-warp"
          x="0"
          y="0"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <rect width="12" height="6" fill="#000000" />
          <rect y="6" width="12" height="6" fill="#ffffff" />
        </pattern>

        {/* Warp filter — Bridget Riley undulation via turbulent
         *  displacement. Applied to the pattern-filled <text> below
         *  but NOT the stroke pass (we want the outline crisp). */}
        <filter
          id="talent-warp"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="38"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Pattern fill, warped */}
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-stolzl), Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="220"
        letterSpacing="-6"
        fill="url(#talent-stripes-warp)"
        filter="url(#talent-warp)"
      >
        TALENT
      </text>

      {/* Hairline outline — NOT warped, sits on top so the silhouette
       *  stays crisp even where the displacement nibbles the edges.
       *  Two passes (fill then stroke) rather than `stroke` on the
       *  warped element so the stripe bars don't thicken at the rim. */}
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-stolzl), Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="220"
        letterSpacing="-6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
      >
        TALENT
      </text>
    </svg>
  );
});

export default TalentMarkSVG;
