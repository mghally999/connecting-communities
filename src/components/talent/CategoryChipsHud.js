"use client";

/**
 * Category chips HUD — pinned bottom-right toolbar that fades in after the
 * gallery cards have settled. Mirrors the chip rail visible in
 * foam-mega/site/interactions/index_chip_*.png:
 *
 *   overview · landscape · plants · collage · archival ·
 *   collaborative · portrait · digital manipulation · i
 *
 * Clicking a chip sets it as the active filter; the parent dims cards
 * whose tags don't include it. The 'overview' chip clears the filter.
 */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CHIPS = [
  "overview",
  "landscape",
  "plants",
  "collage",
  "archival",
  "collaborative",
  "portrait",
  "digital manipulation",
];

// Spec lifted verbatim from TALENT_PARITY_AUDIT.md § CategoryChipsHud.js
// delta 3 (sourced from talent-2024 page chunk @29990
// FilterCloseButton_templateObject):
//   transition: { duration: 1, ease: [0.43, 0.19, 0.02, 1] }
//   35x35, fixed top:16px left:50% transform:translateX(-50%)
//   border: 1px solid #d9d9d9; hover → border #fff, svg #fff
const FILTER_CLOSE_EASE = [0.43, 0.19, 0.02, 1];

function FilterCloseButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      aria-label="Clear filter"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 1, ease: FILTER_CLOSE_EASE }}
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        width: 35,
        height: 35,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        background: "transparent",
        border: `1px solid ${hover ? "#fff" : "#d9d9d9"}`,
        borderRadius: "50%",
        cursor: "pointer",
        transition: "border-color 220ms ease",
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        aria-hidden="true"
        style={{
          color: hover ? "#fff" : "#d9d9d9",
          transition: "color 220ms ease",
        }}
      >
        <path d="M1 1 L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 1 L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}

export default function CategoryChipsHud({ active, onChange, visible }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
        transition={{ delay: visible ? 3.6 : 0, duration: 0.45, ease: "easeOut" }}
        role="toolbar"
        aria-label="Filter exhibition by category"
        style={{
          position: "fixed",
          right: 28,
          bottom: 22,
          zIndex: 40,
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          maxWidth: "60vw",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {CHIPS.map((c) => {
          const on = (c === "overview" && !active) || c === active;
          return (
            <button
              key={c}
              onClick={() => onChange?.(c === "overview" ? null : c)}
              aria-pressed={on}
              style={{
                background: "transparent",
                border: 0,
                padding: "4px 2px",
                fontSize: 11,
                letterSpacing: "0.02em",
                cursor: "pointer",
                color: on ? "#000" : "#999",
                borderBottom: on ? "1px solid #000" : "1px solid transparent",
              }}
            >
              {c}
            </button>
          );
        })}
        <span
          style={{
            marginLeft: 10,
            fontStyle: "italic",
            fontSize: 13,
            color: "#888",
            cursor: "default",
          }}
          aria-hidden="true"
        >
          i
        </span>
      </motion.div>

      {/* Active-filter dismiss button — top-centre, 35x35 pill with X.
       *  Matches foam.org's FilterCloseButton (talent-2024 page chunk
       *  @29990). */}
      <AnimatePresence>
        {visible && active && (
          <FilterCloseButton onClick={() => onChange?.(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
