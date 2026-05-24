"use client";

/**
 * TalentExperience — single mounted client tree for the entire /talent route.
 *
 * ARCHITECTURE: there is ONE React tree under /talent. The intro →
 * hero-zoom → gallery sequence runs inside it without any Next.js
 * route transitions: only phase state changes. Per spec we never call
 * router.push() between phases.
 *
 *   phase: 'intro' | 'hero-zoom' | 'gallery'
 *
 *     intro      t=0     : black bg + foam + TALENT + tagline fade in
 *     hero-zoom  t=1.6   : primary artist's hero enters centred at 85vw,
 *                          wrapped in a <motion.div layoutId="hero-card">
 *     gallery    t=2.4   : phase flips → framer-motion morphs the same
 *                          layoutId element from its 85vw hero state into
 *                          its gallery slot (scale 1.0 → 0.18, translates
 *                          simultaneously, ~1200 ms ease-in-out-cubic).
 *                          Other 19 cards fade+scale-in at 150 ms stagger.
 *                          Chips fade in at t=3.6.
 *
 * Portfolio (phase='portfolio') is wired up in a follow-up commit.
 */

import React, { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { ARTISTS, findArtist } from "@/lib/talent-artists";
import Intro from "./Intro";
import GalleryGrid from "./GalleryGrid";
import CategoryChipsHud from "./CategoryChipsHud";
import FoamSidebar from "./FoamSidebar";
import "@/styles/talent.css";

const PRIMARY = ARTISTS.find((a) => a.isPrimary) || ARTISTS[0];

export default function TalentExperience({ initialSlug = null }) {
  const [phase, setPhase] = useState("intro");
  const [hoveredSlug, setHovered] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    if (initialSlug) setPhase("gallery");
  }, [initialSlug]);

  useEffect(() => {
    if (phase !== "intro") return;
    const t1 = setTimeout(() => setPhase("hero-zoom"), 100);
    const t2 = setTimeout(() => setPhase("gallery"), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const visibleArtists = !activeFilter
    ? ARTISTS
    : ARTISTS.filter((a) =>
        (a.tags || []).map((t) => t.toLowerCase()).includes(activeFilter.toLowerCase())
      );

  return (
    <LayoutGroup id="talent">
      <div
        className="talent-root"
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          background: phase === "gallery" ? "#ffffff" : "#000000",
          color: "#000",
          transition: "background 480ms ease-out",
        }}
      >
        <FoamSidebar state={phase === "gallery" ? "gallery" : "intro"} />

        <Intro phase={phase} heroArtist={PRIMARY} />

        <AnimatePresence>
          {phase === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ position: "fixed", inset: 0 }}
            >
              <GalleryGrid
                artists={visibleArtists}
                hoveredSlug={hoveredSlug}
                onHover={(a) => setHovered(a.slug)}
                onLeave={() => setHovered(null)}
                onPick={() => { /* portfolio entry wired in follow-up */ }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CategoryChipsHud
          visible={phase === "gallery"}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      </div>
    </LayoutGroup>
  );
}
