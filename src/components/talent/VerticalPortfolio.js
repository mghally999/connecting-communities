"use client";

/**
 * VerticalPortfolio — replaces HorizontalPager.
 *
 * Foam's artist portfolios scroll vertically (not horizontally — that was
 * a misread of the reference recording). Each portfolio opens with a
 * full-bleed hero spread (artist name, exhibition title, primary image),
 * then a long vertical column of mixed ExhibitionSection blocks:
 * absolutely-positioned "free" images overlay the flow alongside
 * normal-flow images, prose, podcasts, and inline videos.
 *
 * This component owns the shell (background, accent colour, the
 * sticky header with back arrow + audio toggle) and renders one
 * <ExhibitionSection/> per artist section.
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ExhibitionSection from "./spreads/ExhibitionSection";

export default function VerticalPortfolio({ artist }) {
  const wrapRef = useRef(null);

  return (
    <article
      ref={wrapRef}
      className="portfolio-vertical"
      style={{
        position: "relative",
        background: artist.accent,
        color: artist.accentText,
        minHeight: "100vh",
        // Page-level accent variables for child components (AudioRing etc.)
        "--talent-accent": artist.accent,
        "--talent-accent-text": artist.accentText,
      }}
    >
      {/* Cover */}
      <section
        className="portfolio-cover"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 6vw 8vh",
          overflow: "hidden",
        }}
      >
        {artist.hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.hero}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.92,
              zIndex: 0,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)",
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2, color: "#fff" }}>
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "0.6em",
              opacity: 0.85,
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
              maxWidth: "16ch",
            }}
          >
            {artist.exhibition || artist.name}
          </h1>
        </div>
      </section>

      {/* Sections (rendered below the cover, in document order) */}
      <div
        className="portfolio-flow"
        style={{ position: "relative", paddingBottom: "12vh" }}
      >
        {(artist.sections || []).map((s, i) => (
          <ExhibitionSection key={i} section={s} />
        ))}
      </div>
    </article>
  );
}
