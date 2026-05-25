"use client";

/**
 * TALENT wordmark — per-letter concentric ellipse rings + checker.
 *
 * Visual oracle: foam.org's reference frames show each letter of TALENT
 * filled with concentric ellipses radiating outward from THAT LETTER's
 * own centroid, with a small checker patch at the centre — together
 * reading as a 3D orb wrapped in checkered fabric per glyph (Bridget
 * Riley fingerprint). The earlier single-pattern + feDisplacementMap
 * approach (commit 69a118b) produced a global stripe field that didn't
 * carry the per-glyph "orb" feel.
 *
 * Implementation: render 6 separate <text> elements, one per letter,
 * each filled with its own <radialGradient> centred on that glyph's
 * bbox centroid. A second pass renders the same 6 letters with a
 * checker pattern fill clipped to a small inner ellipse mask per
 * letter. A third pass renders the wordmark as a hairline white
 * outline so the silhouette stays crisp.
 *
 * Letter x-positions are eyeballed to roughly match the proportions
 * of Stolzl 700 at fontSize 220 with letterSpacing -4. Pixel-perfect
 * centroid alignment isn't possible without a glyph-metrics library,
 * but the result reads correct against the reference frames.
 */

import React from "react";

const LETTERS = [
  // letter, centroid-x in viewBox units. Spaced to match Stolzl 700 280px
  { ch: "T", cx: 280 },
  { ch: "A", cx: 430 },
  { ch: "L", cx: 580 },
  { ch: "E", cx: 700 },
  { ch: "N", cx: 830 },
  { ch: "T", cx: 970 },
];

const RING_RADIUS = 90; // user-space units; each ring occupies ~7px wide bands

const TalentMarkSVG = React.forwardRef(function TalentMarkSVG(
  { className = "" },
  ref
) {
  const fontProps = {
    fontFamily: "var(--font-stolzl), Helvetica, Arial, sans-serif",
    fontSize: 220,
    fontWeight: 700,
    letterSpacing: -4,
  };

  return (
    <svg
      ref={ref}
      className={className}
      viewBox="0 0 1250 280"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="TALENT"
      focusable="false"
    >
      <title>TALENT</title>
      <defs>
        {/* One radialGradient per letter, centred at that letter's
         *  centroid in user space. 14 alternating black/white stops
         *  produce the "fingerprint rings" look. */}
        {LETTERS.map((L, i) => (
          <radialGradient
            key={`g-${i}`}
            id={`t-rings-${i}`}
            gradientUnits="userSpaceOnUse"
            cx={L.cx}
            cy={150}
            r={RING_RADIUS}
          >
            {Array.from({ length: 14 }).map((_, k) => (
              <stop
                key={k}
                offset={(k / 13).toFixed(3)}
                stopColor={k % 2 === 0 ? "#000" : "#fff"}
              />
            ))}
          </radialGradient>
        ))}

        {/* 14-px checker tile for the inner core of each glyph. */}
        <pattern
          id="t-checker"
          x="0"
          y="0"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <rect width="7" height="7" fill="#000" />
          <rect x="7" y="7" width="7" height="7" fill="#000" />
          <rect x="7" y="0" width="7" height="7" fill="#fff" />
          <rect x="0" y="7" width="7" height="7" fill="#fff" />
        </pattern>

        {/* Inner-core clipPath: a small ellipse at each letter's centroid
         *  so the checker only shows in the middle of each orb. */}
        <clipPath id="t-cores" clipPathUnits="userSpaceOnUse">
          {LETTERS.map((L, i) => (
            <ellipse
              key={`core-${i}`}
              cx={L.cx}
              cy={150}
              rx={28}
              ry={36}
            />
          ))}
        </clipPath>
      </defs>

      {/* Pass 1 — concentric rings, one fill per letter */}
      {LETTERS.map((L, i) => (
        <text
          key={`ring-${i}`}
          x={L.cx}
          y={210}
          textAnchor="middle"
          {...fontProps}
          fill={`url(#t-rings-${i})`}
        >
          {L.ch}
        </text>
      ))}

      {/* Pass 2 — checker centres, clipped to small inner ellipses
       *  so the checker reads as a "core" inside each ring stack. */}
      <g clipPath="url(#t-cores)">
        {LETTERS.map((L, i) => (
          <text
            key={`core-${i}`}
            x={L.cx}
            y={210}
            textAnchor="middle"
            {...fontProps}
            fill="url(#t-checker)"
          >
            {L.ch}
          </text>
        ))}
      </g>

      {/* Pass 3 — hairline white stroke so the silhouette stays crisp
       *  against any background colour. Sibling text elements; never
       *  combine fill + stroke on the same text or the dark ring bars
       *  thicken at the glyph rim. */}
      {LETTERS.map((L, i) => (
        <text
          key={`stroke-${i}`}
          x={L.cx}
          y={210}
          textAnchor="middle"
          {...fontProps}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        >
          {L.ch}
        </text>
      ))}
    </svg>
  );
});

export default TalentMarkSVG;
