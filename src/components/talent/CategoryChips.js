"use client";

/**
 * CategoryChips — bottom-right tag filter row.
 *
 * Per FOAM_TALENT_SPEC.md §2.3, §2.4: clicking a chip filters the
 * gallery to matching cards, which re-layout 1.6× larger using the
 * `<GalleryBoard/>` filter logic.
 *
 * The trailing `i` chip is a no-op (opens an info panel) for now;
 * it's wired but doesn't render the panel until copy is provided.
 */

import React from "react";

export default function CategoryChips({
  categories = [],
  active = null,
  onChange = () => {},
  onInfo = () => {},
}) {
  return (
    <div className="chips" role="toolbar" aria-label="Filter exhibition by category">
      {categories.map((cat) => {
        const on = cat === active;
        return (
          <button
            key={cat}
            className={`chip${on ? " is-on" : ""}`}
            aria-pressed={on}
            onClick={() => onChange(on ? null : cat)}
          >
            {cat}
          </button>
        );
      })}
      <button
        className="chip i-chip"
        aria-label="About this exhibition"
        onClick={onInfo}
      >
        i
      </button>
    </div>
  );
}
