"use client";

/**
 * ThankYou — the closing spread of each artist portfolio.
 *
 * Per FOAM_TALENT_SPEC.md §2.5: massive italic "thank you for visiting",
 * a `next: <name>` line below, then a chip-button that routes to the
 * next artist. The button's hover-fill colour is the next artist's
 * accent (exposed via the `--next-accent` CSS variable).
 */

import React from "react";
import Link from "next/link";

export default function ThankYou({ next }) {
  if (!next) {
    return (
      <section className="spread thanks" aria-label="Thank you">
        <h1>thank you for visiting</h1>
      </section>
    );
  }

  return (
    <section
      className="spread thanks"
      style={{
        "--next-accent": next.accent,
        "--next-accent-text": next.accentText,
      }}
      aria-label="Thank you for visiting"
    >
      <h1>thank you for visiting</h1>
      <p className="thanks-next">next: {next.name}</p>
      <Link href={`/talent/${next.slug}`} className="thanks-cta">
        view next exhibition →
      </Link>
    </section>
  );
}
