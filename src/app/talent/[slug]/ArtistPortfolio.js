"use client";

/**
 * ArtistPortfolio — client shell for /talent/[slug].
 *
 * Owns the per-artist accent (so it can tween between artists via the
 * --talent-accent CSS variable) and renders the VerticalPortfolio plus
 * the back-to-gallery affordance and FoamSidebar.
 */

import React, { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import FoamSidebar from "@/components/talent/FoamSidebar";
import VerticalPortfolio from "@/components/talent/VerticalPortfolio";
import "@/styles/talent.css";

export default function ArtistPortfolio({ artist, next }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    gsap.to(document.documentElement, {
      "--talent-accent": artist.accent,
      "--talent-accent-text": artist.accentText,
      duration: 0.7,
      ease: "power3.inOut",
    });
  }, [artist.accent, artist.accentText]);

  return (
    <div
      className="talent-root"
      style={{
        "--talent-accent": artist.accent,
        "--talent-accent-text": artist.accentText,
        background: artist.accent,
        color: artist.accentText,
      }}
    >
      <FoamSidebar state="portfolio" />

      <Link
        href="/talent"
        aria-label="Back to gallery"
        style={{
          position: "fixed",
          top: 32,
          left: 96,
          zIndex: 60,
          fontSize: 13,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: artist.accentText,
          opacity: 0.75,
        }}
      >
        ← gallery
      </Link>

      <VerticalPortfolio artist={artist} />

      {next && (
        <section
          className="next-artist"
          style={{
            background: "#fff",
            color: "#0b0b0b",
            padding: "16vh 8vw",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            next exhibition
          </p>
          <h2
            style={{
              marginTop: "0.5em",
              fontSize: "clamp(36px, 6vw, 88px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 500,
            }}
          >
            {next.exhibition || next.name}
          </h2>
          <p style={{ marginTop: "0.6em", fontSize: 16, opacity: 0.75 }}>{next.name}</p>
          <Link
            href={`/talent/${next.slug}`}
            style={{
              display: "inline-block",
              marginTop: "2.2em",
              padding: "12px 22px",
              borderRadius: 999,
              border: "1px solid currentColor",
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            view exhibition →
          </Link>
        </section>
      )}
    </div>
  );
}
