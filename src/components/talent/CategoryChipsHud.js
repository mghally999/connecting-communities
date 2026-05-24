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

import React from "react";
import { motion } from "framer-motion";

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

export default function CategoryChipsHud({ active, onChange, visible }) {
  return (
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
  );
}
