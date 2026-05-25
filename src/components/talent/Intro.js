"use client";

/**
 * Intro — the opening typography stack for phases 'intro' and 'hero-zoom'.
 *
 * Renders, in time, on top of a black background:
 *   t=0.0   "foam" wordmark top-centre (owned by <FoamSidebar/> — NOT here)
 *   t=0.4   TALENT wordmark (op-art pattern) fades in
 *   t=0.8   "artists shaping the future of photography" tagline
 *   t=1.6   one centred hero photo at 85vw enters (the layoutId card)
 *
 * After t=2.4 the parent TalentExperience flips phase to 'gallery'.
 * The hero card stops being rendered here and re-mounts inside the
 * gallery grid at the artist's slot — framer-motion's layout/layoutId
 * morphs the 1.0 → 0.18 scale + translate across the phase boundary.
 *
 * NOTE on centering: framer-motion writes its own `transform: matrix(...)`
 * for animated x/y, which clobbers any inline `transform: translate(...)`
 * we'd set on the same element. So we centre with a static parent <div>
 * and let the inner <motion.div> animate opacity/y in isolation.
 */

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TalentMarkSVG from "./TalentMarkSVG";
import { ARTISTS } from "@/lib/talent-artists";

const TAGLINE = ["artists", "shaping", "the", "future", "of", "photography"];

export default function Intro({ phase, heroArtist }) {
  const showHero = phase === "intro" || phase === "hero-zoom";

  /* Phase 2: cycle 6 artist hero photos behind TALENT during the intro,
   * matching foam.org's "flipping pictures" segment. Each photo crossfades
   * to the next every 1.5 s starting at t=1.8 s (after TALENT + tagline
   * have landed). The last photo holds until the parent flips phase to
   * 'gallery', at which point this whole stack unmounts. */
  const cycleArtists = useMemo(
    () => ARTISTS.filter((a) => a.hero).slice(0, 6),
    []
  );
  const [cycleIdx, setCycleIdx] = useState(-1); // -1 = pure black

  useEffect(() => {
    if (phase !== "intro" && phase !== "hero-zoom") return;
    const start = setTimeout(() => setCycleIdx(0), 1800);
    return () => clearTimeout(start);
  }, [phase]);

  useEffect(() => {
    if (cycleIdx < 0) return;
    if (cycleIdx >= cycleArtists.length - 1) return; // hold last
    const next = setTimeout(() => setCycleIdx((i) => i + 1), 1500);
    return () => clearTimeout(next);
  }, [cycleIdx, cycleArtists.length]);

  return (
    <>
      {/* Phase 2 cycling photo backdrop — z=1, behind TALENT (z=25).
       *  AnimatePresence + the changing `key` forces unmount/remount of
       *  each photo so they cross-fade rather than swap-in-place. */}
      <AnimatePresence>
        {showHero && cycleIdx >= 0 && cycleArtists[cycleIdx]?.hero && (
          <motion.div
            key={`cycle-${cycleIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              backgroundImage: `url(${cycleArtists[cycleIdx].hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* TALENT mark — pattern fill.
       *  Outer div owns the centering transform; inner motion.div owns
       *  the entrance animation. Don't merge the two — framer-motion
       *  would overwrite the centering transform.
       *  mixBlendMode: difference inverts the mark against whatever
       *  artist photo is cycling behind it (Phase 2) so the wordmark
       *  stays legible without a dark overlay. */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(64vw, 1100px)",
          zIndex: 25,
          pointerEvents: "none",
          mixBlendMode: "difference",
        }}
      >
        <AnimatePresence>
          {showHero && (
            <motion.div
              key="talent-mark"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ delay: 0.4, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <TalentMarkSVG />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tagline — word-stagger. Same centering pattern as the mark above. */}
      <div
        style={{
          position: "fixed",
          top: "calc(50% + 110px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 25,
          color: "#fff",
          fontSize: 13,
          lineHeight: 1.5,
          maxWidth: "26ch",
          textAlign: "center",
          pointerEvents: "none",
          mixBlendMode: "difference",
        }}
      >
        <AnimatePresence>
          {showHero && (
            <motion.p
              key="talent-tag"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { delay: 0.8, staggerChildren: 0.04 } },
              }}
              style={{ margin: 0 }}
            >
              {TAGLINE.map((w) => (
                <motion.span
                  key={w}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.42 } },
                  }}
                  style={{ display: "inline-block", marginRight: "0.32em" }}
                >
                  {w}
                </motion.span>
              ))}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Hero card — the shared layoutId element that morphs into the
       * gallery slot when phase flips to 'gallery'. Rendered ONLY while
       * the intro/hero-zoom phases are active; the gallery then renders
       * a matching layoutId="hero-card" element at the artist's slot
       * and framer-motion automatically interpolates between them. */}
      <AnimatePresence>
        {showHero && heroArtist?.hero && (
          <motion.div
            key="hero-card"
            layoutId="hero-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              width: "85vw",
              height: "85vh",
              zIndex: 10,
              overflow: "hidden",
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroArtist.hero}
              alt={heroArtist.name}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
