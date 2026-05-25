"use client";

/**
 * Portfolio — vertical-scrolling artist page for the 'portfolio' phase.
 *
 * REVERSED ARCHITECTURE: this component used to be a horizontal pager
 * (wheel-Y → translate-X) per the spec I followed in commit 3fa55de.
 * Phase C audit (TALENT_PARITY_AUDIT.md § Portfolio.js, delta 1) showed
 * foam.org's artist pages actually scroll VERTICALLY:
 *   - chunk 8222 uses `useScrollProgress` 3× + `onWheel` 2× to drive
 *     scroll-progress-based section reveal, not horizontal translate
 *   - artist HTML has 28× `overflow-hidden` rules but all on children;
 *     the body itself scrolls
 *
 * What this component is now:
 *   - A normal vertical document. Hero cover at the top, sections stack
 *     below in document order, body scrolls.
 *   - `<motion.div layoutId="hero-card">` wraps the cover image so the
 *     gallery→portfolio dive morph still runs through it as the topmost
 *     element.
 *   - No wheel hijacking, no RAF lerp, no body-overflow lock, no
 *     touch handler.
 *   - Escape still closes the portfolio back to the gallery.
 */

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ExhibitionSection from "./spreads/ExhibitionSection";

export default function Portfolio({ artist, onClose }) {
  const sections = (artist.sections || []).filter((s) => {
    if (s.kind === "prose" && (!s.html || s.html === "<p></p>")) return false;
    return true;
  });

  // Escape-to-close only — no wheel/touch handlers.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="portfolio-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        overflowY: "auto",
        overflowX: "hidden",
        background: artist.accent,
        color: artist.accentText,
        "--talent-accent": artist.accent,
        "--talent-accent-text": artist.accentText,
      }}
    >
      {/* Cover — full-bleed hero photo. Carries the layoutId so the
       *  gallery card morphs into it on enter and back out on exit.
       *  This sits at the top of the normal vertical flow now; sections
       *  below scroll up under the user's wheel. */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <motion.div
          layoutId="hero-card"
          transition={{ duration: 0.7, ease: [0.5, 0, 0.75, 0] }}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.hero}
            alt={artist.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "6vw",
            bottom: "8vh",
            zIndex: 2,
            color: "#fff",
            maxWidth: "60vw",
          }}
        >
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: "0.6em",
            }}
          >
            {artist.name}
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              fontWeight: 500,
            }}
          >
            {artist.exhibition || artist.name}
          </h1>
        </div>
      </section>

      {/* Sections — normal vertical document flow.
       *  slug + idx are threaded so ImageBlock can seed a deterministic
       *  picsum.photos placeholder when the original Storyblok asset
       *  wasn't captured by the scrape. */}
      <div style={{ position: "relative", paddingBottom: "12vh" }}>
        {sections.map((s, i) => (
          <ExhibitionSection key={i} section={s} slug={artist.slug} idx={i} />
        ))}
      </div>

      {/* Close affordance — top-left, fixed across the scroll */}
      <button
        onClick={onClose}
        aria-label="Back to gallery"
        style={{
          position: "fixed",
          top: 24,
          left: 28,
          zIndex: 100,
          background: "transparent",
          border: 0,
          color: artist.accentText,
          fontSize: 13,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        ← gallery
      </button>
    </motion.div>
  );
}
