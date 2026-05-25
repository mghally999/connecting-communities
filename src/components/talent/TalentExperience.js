"use client";

/**
 * TalentExperience — single mounted client tree for the entire /ecosystem route.
 *
 * ARCHITECTURE: there is ONE React tree from /ecosystem through every
 * /ecosystem/<slug> portfolio. We do NOT use Next.js router transitions for
 * the intro → gallery → portfolio sequence. Instead a phase state machine
 * controls what's visible and the URL syncs via history.pushState /
 * popstate so direct deep-links still work and the browser back button
 * returns to the gallery without a hard page swap.
 *
 *   phase: 'intro' | 'gallery' | 'portfolio'
 *
 *     intro      : black bg. <Intro/> runs its own 6-photo cycle behind
 *                  TALENT + tagline. When the cycle finishes (after the
 *                  primary artist's photo has held alone full-bleed)
 *                  Intro calls onIntroComplete and we flip to 'gallery'.
 *                  No layoutId morph; the gallery primary just fades in
 *                  with the rest.
 *     gallery    : 20 cards scattered. Hover, drag-with-momentum, and
 *                  filter overlay all live here.
 *     portfolio  : url → /ecosystem/<slug> via pushState, <Portfolio/>
 *                  mounts on top of the gallery (which stays mounted at
 *                  opacity 0 for snappy popstate back). Back button or
 *                  Escape returns. */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { ARTISTS, findArtist } from "@/lib/talent-artists";
import Intro from "./Intro";
import GalleryGrid from "./GalleryGrid";
import CategoryChipsHud from "./CategoryChipsHud";
import Portfolio from "./Portfolio";
import "@/styles/talent.css";

// Primary artist sits at (0,0,0) in foam's authored layout.
const PRIMARY = ARTISTS.find((a) => a.isPrimary) || ARTISTS[0];

export default function TalentExperience({ initialSlug = null }) {
  // Derive initial phase from the URL: deep-linking to /ecosystem/<slug>
  // mounts straight into 'portfolio' so direct links work without an
  // intro replay.
  const [phase, setPhase] = useState(() =>
    initialSlug ? "portfolio" : "intro"
  );
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [hoveredSlug, setHovered] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  /* ---------- entry timeline (intro → gallery) ----------
   * The intro phase now owns its own timeline via the 6-photo cycle
   * inside <Intro/>. It calls onIntroComplete when the last photo has
   * held full-bleed (post TALENT fade-out) and we flip straight to
   * 'gallery'. The intermediate 'hero-zoom' phase is gone — there is
   * no longer a single hero card that morphs into the gallery via
   * layoutId; the gallery primary just fades in alongside the others. */

  const handleIntroComplete = useCallback(() => {
    setPhase((p) => (p === "intro" ? "gallery" : p));
  }, []);

  /* ---------- history.pushState / popstate ---------- */

  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/ecosystem\/([^/]+)\/?$/);
      if (m) {
        setActiveSlug(m[1]);
        setPhase("portfolio");
      } else {
        setActiveSlug(null);
        setPhase("gallery");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const enterPortfolio = useCallback((artist) => {
    setActiveSlug(artist.slug);
    setPhase("portfolio");
    if (window.location.pathname !== `/ecosystem/${artist.slug}`) {
      window.history.pushState(null, "", `/ecosystem/${artist.slug}`);
    }
  }, []);

  const exitPortfolio = useCallback(() => {
    setActiveSlug(null);
    setPhase("gallery");
    if (window.location.pathname !== "/ecosystem") {
      window.history.pushState(null, "", "/ecosystem");
    }
  }, []);

  /* ---------- derived ---------- */

  const heroArtist = PRIMARY;
  const hoveredArtist = hoveredSlug ? findArtist(hoveredSlug) : null;
  const activeArtist  = activeSlug  ? findArtist(activeSlug)  : null;

  // Filter applies in 'gallery' phase
  const visibleArtists = !activeFilter
    ? ARTISTS
    : ARTISTS.map((a) => ({
        ...a,
        _hiddenByFilter: !(a.tags || [])
          .map((t) => t.toLowerCase())
          .includes(activeFilter.toLowerCase()),
      }));

  /* ---------- bg colour (hover accent crossfade) ---------- */

  /* bg target precedence:
   *   intro              → black (the photo cycle layer sits on top)
   *   hover any card     → that artist's accent
   *   filter active (no hover) → BLACK (network-graph mode, per Phase 6)
   *   gallery default    → white */
  let bgTarget;
  if (phase === "intro") {
    bgTarget = "#000000";
  } else if (hoveredArtist) {
    bgTarget = hoveredArtist.accent;
  } else if (activeFilter) {
    bgTarget = "#000000";
  } else {
    bgTarget = "#ffffff";
  }

  return (
    <LayoutGroup id="talent">
      <motion.div
        className="talent-root"
        animate={{ backgroundColor: bgTarget }}
        /* 0.9 s so the black→white crossfade tracks the photo's 1.6 s
         * shrink, eliminating the brief black gap where TALENT was
         * fading on a black background before the gallery's white
         * canvas appeared. */
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          color: hoveredArtist?.accentText || "#000",
          /* Seed the bg on the inline style so the FIRST paint already
           * has the right colour. Without this, framer-motion sets
           * backgroundColor only after its first animation tick, so
           * for ~1 frame the body's cream bg (set by GlobalStyle.js)
           * shines through and reads as a white flash on initial mount
           * and on every hot-reload. */
          backgroundColor: bgTarget,
        }}
      >
        {/* Intro typography + 6-photo cycle (only during intro). Signals
         *  back via onIntroComplete when the cycle finishes; the parent
         *  flips phase → 'gallery' which crossfades the cycle photo out. */}
        <Intro phase={phase} heroArtist={heroArtist} onIntroComplete={handleIntroComplete} />

        {/* Gallery — mounted during 'gallery' and stays mounted during
         * 'portfolio' so popstate back is instant. We hide it visually
         * during 'portfolio' with opacity so the Portfolio cover takes
         * the screen. */}
        <AnimatePresence>
          {(phase === "gallery" || phase === "portfolio") && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "portfolio" ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ position: "fixed", inset: 0, pointerEvents: phase === "portfolio" ? "none" : "auto" }}
            >
              <GalleryGrid
                artists={visibleArtists.filter((a) => !a._hiddenByFilter)}
                hoveredSlug={hoveredSlug}
                activeFilter={activeFilter}
                onHover={(a) => setHovered(a.slug)}
                onLeave={() => setHovered(null)}
                onPick={(a) => enterPortfolio(a)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category chips — appear once the gallery has settled */}
        <CategoryChipsHud
          visible={phase === "gallery"}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {/* Phase 6: bottom-centre caption with the hovered artist's
         *  exhibition title + name. Replaces the per-card "enter
         *  portfolio →" pill that used to live inside GalleryGrid.
         *  Uses mix-blend-mode: difference so the white text inverts
         *  against any artist-accent background colour. */}
        {/* Phase 4 (video review): hover caption uses the artist's
         *  frameHighlightColor (accentText), centred at bottom of the
         *  viewport. zIndex 60 keeps it above the chip rail. */}
        <AnimatePresence>
          {phase === "gallery" && hoveredArtist && (
            <motion.div
              key="hover-caption"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                position: "fixed",
                bottom: 64,
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                pointerEvents: "none",
                color: hoveredArtist.accentText || "#fff",
                zIndex: 60,
              }}
            >
              <p style={{ fontStyle: "italic", fontSize: 22, margin: 0, lineHeight: 1.1 }}>
                {hoveredArtist.exhibition || hoveredArtist.name}
              </p>
              <p style={{ fontSize: 15, marginTop: 6, opacity: 0.9 }}>
                {hoveredArtist.name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: × close button on the right edge of the viewport,
         *  visible only when an artist is hovered. Clicking it clears
         *  the hover (and the bg crossfade reverts). Matches foam's
         *  mid-right dismiss button in the hover state frames. */}
        <AnimatePresence>
          {phase === "gallery" && hoveredArtist && (
            <motion.button
              key="hover-close"
              type="button"
              onClick={() => setHovered(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              aria-label="Clear hover"
              style={{
                position: "fixed",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 60,
                width: 36,
                height: 36,
                borderRadius: 4,
                border: "1px solid currentColor",
                background: "transparent",
                color: hoveredArtist.accentText || "#fff",
                fontSize: 18,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>

        {/* Portfolio — mounts on phase 'portfolio'. onNavigate is wired
         *  so the thank-you spread's "view next exhibition" pill routes
         *  via the same enterPortfolio flow (history.pushState + phase
         *  swap), not a hard router.push. */}
        <AnimatePresence>
          {phase === "portfolio" && activeArtist && (
            <Portfolio
              key={activeArtist.slug}
              artist={activeArtist}
              onClose={exitPortfolio}
              onNavigate={(next) => enterPortfolio(next)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
