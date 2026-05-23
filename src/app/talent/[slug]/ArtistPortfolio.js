"use client";

/**
 * ArtistPortfolio — client shell for /talent/[slug].
 *
 * Owns the per-artist accent (so it can tween between artists via the
 * `--talent-accent` CSS variable) and renders the HorizontalPager full
 * of Spread elements plus the closing ThankYou.
 */

import React, { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import FoamSidebar from "@/components/talent/FoamSidebar";
import HorizontalPager from "@/components/talent/HorizontalPager";
import Spread from "@/components/talent/spreads/Spread";
import ThankYou from "@/components/talent/spreads/ThankYou";
import "@/styles/talent.css";

export default function ArtistPortfolio({ artist, next }) {
  // Tween the document-level accent CSS variable when the artist changes,
  // so navigating from one portfolio to another feels like a single
  // continuous experience rather than a hard page swap.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    gsap.to(root, {
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

      {/* Back affordance — top-left under the foam mark */}
      <Link
        href="/talent"
        aria-label="Back to gallery"
        style={{
          position: "fixed",
          top: 32,
          left: 96,
          zIndex: 60,
          fontSize: 14,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: artist.accentText,
          opacity: 0.7,
        }}
      >
        ← gallery
      </Link>

      <HorizontalPager accent={artist.accent} accentText={artist.accentText}>
        {(artist.spreads || []).map((sp, i) => (
          <Spread key={i} data={sp} />
        ))}
        <ThankYou next={next} />
      </HorizontalPager>
    </div>
  );
}
