"use client";

/**
 * Intro — the opening typography stack for phases 'intro' and 'hero-zoom'.
 *
 * Renders, in time, on top of a black background:
 *   t=0.0   "foam" wordmark top-centre + black bg
 *   t=0.4   TALENT wordmark (op-art pattern) fades in
 *   t=0.8   "artists shaping the future of photography" tagline
 *   t=1.6   one centred hero photo at 85vw enters (the layoutId card)
 *
 * After t=2.4 the parent TalentExperience flips phase to 'gallery'.
 * The hero card stops being rendered here and re-mounts inside the
 * gallery grid at the artist's slot — framer-motion's layout/layoutId
 * morphs the 1.0 → 0.18 scale + translate across the phase boundary.
 */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import TalentMarkSVG from "./TalentMarkSVG";

const TAGLINE = ["artists", "shaping", "the", "future", "of", "photography"];

export default function Intro({ phase, heroArtist }) {
  const showHero = phase === "intro" || phase === "hero-zoom";
  return (
    <>
      {/* foam wordmark */}
      <motion.div
        className="intro-foam"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        foam
      </motion.div>

      {/* TALENT mark — pattern fill */}
      <AnimatePresence>
        {showHero && (
          <motion.div
            key="talent-mark"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ delay: 0.4, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -55%)",
              width: "min(64vw, 1100px)",
              zIndex: 25,
              pointerEvents: "none",
            }}
          >
            <TalentMarkSVG />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tagline — word-stagger */}
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
            style={{
              position: "fixed",
              top: "calc(50% + 110px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 25,
              color: "#fff",
              fontSize: "clamp(13px, 1.05vw, 17px)",
              lineHeight: 1.5,
              maxWidth: "24ch",
              textAlign: "center",
              pointerEvents: "none",
            }}
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
