"use client";

/**
 * The TALENT wordmark with an op-art fill clipped to the letterforms.
 *
 * Per FOAM_TALENT_SPEC.md §2.1 the fill is split:
 *   - Top half:    8-px checker
 *   - Bottom half: 8-px vertical stripes
 * Split point sits at the x-height of the letters. `patternTransform`
 * drifts horizontally over a 9 s loop, producing the subtle motion
 * visible in the reference capture. A faint blurred duplicate of the
 * letters lives behind, offset by (-3px, +4px), to mimic the paper
 * cut-out depth.
 *
 * The SVG is purely visual; the readable text for accessibility is
 * provided by the parent <h1 aria-label="TALENT">.
 */

import React from "react";

const TalentMarkSVG = React.forwardRef(function TalentMarkSVG(
  { className = "", patternClassName = "pattern-fill" },
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
      <defs>
        {/* Two-tile pattern: rendered into a 16x16 cell so the checker
         * reads at any zoom. The dark squares share the page background. */}
        <pattern
          id="talent-checker"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill="#ffffff" />
          <rect x="0" y="0" width="8" height="8" fill="#0b0b0b" />
          <rect x="8" y="8" width="8" height="8" fill="#0b0b0b" />
        </pattern>

        <pattern
          id="talent-stripes"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill="#ffffff" />
          <rect x="0" y="0" width="8" height="16" fill="#0b0b0b" />
        </pattern>

        {/* Compose the two patterns vertically inside another pattern so the
         * checker covers the top half of the letterforms, stripes the
         * bottom half. 220 tall matches the viewBox height. */}
        <pattern
          id="talent-fill"
          className={patternClassName}
          width="1200"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0"   width="1200" height="120" fill="url(#talent-checker)" />
          <rect x="0" y="120" width="1200" height="100" fill="url(#talent-stripes)" />
        </pattern>

        {/* Master text path used both as the clip and as the visible glyph */}
        <g id="talent-glyphs">
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="var(--font-stolzl), Helvetica, Arial, sans-serif"
            fontWeight="700"
            fontSize="220"
            letterSpacing="-6"
          >
            TALENT
          </text>
        </g>

        <clipPath id="talent-clip">
          <use href="#talent-glyphs" />
        </clipPath>
      </defs>

      {/* Soft drop shadow ghost behind the letters */}
      <g transform="translate(-3 4)" opacity="0.55" filter="url(#blur)">
        <use href="#talent-glyphs" fill="#1a1a1a" />
      </g>
      <filter id="blur">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>

      {/* The op-art fill, clipped to the letterforms */}
      <g clipPath="url(#talent-clip)">
        <rect width="1200" height="220" fill="url(#talent-fill)" />
      </g>

      {/* Crisp 1-px outline so the wordmark still reads on busy backgrounds */}
      <use href="#talent-glyphs" fill="none" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
});

export default TalentMarkSVG;
