"use client";

/**
 * TalentExperience — single mounted client tree for the entire /talent route.
 *
 * ARCHITECTURE: there is ONE React tree from /talent through every
 * /talent/<slug> portfolio. We do NOT use Next.js router transitions for
 * the intro → gallery → portfolio sequence. Instead a phase state machine
 * controls what's visible and the URL syncs via history.pushState /
 * popstate so direct deep-links still work and the browser back button
 * returns to the gallery without a hard page swap.
 *
 *   phase: 'intro' | 'hero-zoom' | 'gallery' | 'portfolio'
 *
 *     intro       (t=0)     : black bg + foam + TALENT + tagline fading in
 *     hero-zoom   (t=1.6)   : the primary artist's hero photo enters
 *                              centred at 85vw. Same DOM lives here as
 *                              in 'gallery', wrapped in <LayoutGroup>.
 *     gallery     (t=2.4)   : phase flips → framer-motion morphs the
 *                              layoutId="hero-card" element from its
 *                              85vw hero state into its gallery slot
 *                              (scale 1.0 → 0.18, translates simultaneously,
 *                              ~1200ms ease-in-out-cubic).
 *                              Other 19 cards fade+scale in at 150ms stagger.
 *                              Chips fade in at t=3.6.
 *     portfolio  (on click) : url → /talent/<slug> via pushState,
 *                              <Portfolio/> mounts. Its cover spread
 *                              carries layoutId="hero-card" so the
 *                              gallery card morphs INTO the cover hero,
 *                              giving a continuous in-and-out motion.
 *                              Back button (popstate) reverses it.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { ARTISTS, findArtist } from "@/lib/talent-artists";
import Intro from "./Intro";
import GalleryGrid from "./GalleryGrid";
import CategoryChipsHud from "./CategoryChipsHud";
import Portfolio from "./Portfolio";
import FoamSidebar from "./FoamSidebar";
import "@/styles/talent.css";

// Primary artist sits at (0,0,0) in foam's authored layout.
const PRIMARY = ARTISTS.find((a) => a.isPrimary) || ARTISTS[0];

export default function TalentExperience({ initialSlug = null }) {
  // Derive initial phase from the URL: deep-linking to /talent/<slug>
  // mounts straight into 'portfolio' so direct links work without an
  // intro replay.
  const [phase, setPhase] = useState(() =>
    initialSlug ? "portfolio" : "intro"
  );
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [hoveredSlug, setHovered] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  /* ---------- entry timeline (intro → hero-zoom → gallery) ----------
   * Per-phase scheduling. The previous version queued both timers in a
   * single effect with [phase] as a dep: when t1 fired and flipped to
   * 'hero-zoom', the effect re-ran and the cleanup cancelled t2, so we
   * never advanced to 'gallery'. Splitting one timer per phase lets the
   * effect re-run cleanly: 'intro' schedules → 'hero-zoom', then
   * 'hero-zoom' schedules → 'gallery'. */

  useEffect(() => {
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("hero-zoom"), 100);
      return () => clearTimeout(t);
    }
    if (phase === "hero-zoom") {
      const t = setTimeout(() => setPhase("gallery"), 2300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /* ---------- history.pushState / popstate ---------- */

  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/talent\/([^/]+)\/?$/);
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
    if (window.location.pathname !== `/talent/${artist.slug}`) {
      window.history.pushState(null, "", `/talent/${artist.slug}`);
    }
  }, []);

  const exitPortfolio = useCallback(() => {
    setActiveSlug(null);
    setPhase("gallery");
    if (window.location.pathname !== "/talent") {
      window.history.pushState(null, "", "/talent");
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

  const bgTarget =
    phase === "intro" || phase === "hero-zoom"
      ? "#000000"
      : hoveredArtist?.accent || "#ffffff";

  return (
    <LayoutGroup id="talent">
      <motion.div
        className="talent-root"
        animate={{ backgroundColor: bgTarget }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
        <FoamSidebar state={phase === "intro" || phase === "hero-zoom" ? "intro" : phase === "portfolio" ? "portfolio" : "gallery"} />

        {/* Intro typography (only during intro/hero-zoom) */}
        <Intro phase={phase} heroArtist={heroArtist} />

        {/* Gallery — mounted during 'gallery' and stays mounted during
         * 'portfolio' so the layoutId source/destination both exist when
         * the dive transition runs. We hide it visually during 'portfolio'
         * with opacity so the Portfolio cover can take the screen. */}
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
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                pointerEvents: "none",
                mixBlendMode: "difference",
                color: "#fff",
                zIndex: 50,
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

        {/* Portfolio — mounts on phase 'portfolio', morphs in via layoutId.
         *  onNavigate is wired so the thank-you spread's "view next
         *  exhibition" pill routes via the same enterPortfolio flow
         *  (history.pushState + phase swap), not a hard router.push. */}
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
