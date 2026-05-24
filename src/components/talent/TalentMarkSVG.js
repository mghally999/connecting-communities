"use client";

/**
 * TALENT wordmark with op-art pattern fill.
 *
 * Visual oracle: foam-mega/site/screenshots/index_y0.png — letterforms
 * filled with a tight checker/stripe pattern (high-contrast black/white,
 * 8 px tiles) and outlined by a 1 px white stroke. Earlier revision
 * applied the pattern via a clipped rect; some browsers wouldn't resolve
 * the clip-path-via-use chain when the source <text> lived inside
 * <defs>, leaving us with the bare outline. Painting the pattern fill
 * directly on the visible <text> element fixes that.
 *
 * The split (checker top half + vertical stripes bottom half) is kept
 * for parity with the live foam.org mark, which reads as part-checker
 * part-stripe at intermediate zoom levels.
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
      <defs>
        {/* 16-px checker tile — high contrast for the op-art effect */}
        <pattern
          id="talent-checker"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill="#ffffff" />
          <rect x="0" y="0" width="8" height="8" fill="#000000" />
          <rect x="8" y="8" width="8" height="8" fill="#000000" />
        </pattern>

        {/* 16-px vertical-stripe tile */}
        <pattern
          id="talent-stripes"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill="#ffffff" />
          <rect x="0" y="0" width="8" height="16" fill="#000000" />
        </pattern>

        {/* Composite pattern: checker on top half of the viewBox, stripes
         * on the bottom half. The split sits roughly at the x-height of
         * the glyphs at this font size. */}
        <pattern
          id="talent-pattern"
          width="1200"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0"   width="1200" height="110" fill="url(#talent-checker)" />
          <rect x="0" y="110" width="1200" height="110" fill="url(#talent-stripes)" />
        </pattern>
      </defs>

      {/* The wordmark itself — pattern as fill, 1-px white outline.
       * Rendering twice (filled, then stroked) is required because most
       * browsers paint stroke OVER fill on a single element, which would
       * thicken the dark pattern bars at the glyph edges. Two separate
       * passes keep the outline as a crisp hairline. */}
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-stolzl), Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="220"
        letterSpacing="-6"
        fill="url(#talent-pattern)"
        style={{ paintOrder: "stroke fill" }}
      >
        TALENT
      </text>
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
