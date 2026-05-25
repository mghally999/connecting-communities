"use client";

/**
 * Intro — the opening typography stack and 6-photo cycle.
 *
 * Per Phase 1 of the May 2026 parity sweep:
 *
 *   t=0.0     "foam" wordmark top-centre (owned by <FoamSidebar/>)
 *   t=0.4     TALENT wordmark (op-art pattern) fades in
 *   t=0.8     "artists shaping the future of photography" tagline
 *   t=1.8     cycle photo 0 fades in TRUE FULL-BLEED behind TALENT
 *   …         photos 1..N-2 cross-fade every 1500 ms
 *   ~t=9.3    photo N-1 (the primary artist, rehab) shows for 1200 ms
 *             with TALENT still visible
 *   ~t=10.5   TALENT + tagline fade out (400 ms); last photo holds
 *             alone full-bleed for 900 ms
 *   ~t=11.4   onIntroComplete fires → parent flips phase to 'gallery'
 *             which crossfades the last photo out via AnimatePresence.
 *
 * The hero card we used to morph into the gallery via layoutId is gone:
 * the gallery primary now simply fades in along with the other cards,
 * matching foam.org's actual handoff (verified in the v2 video).
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

/* Six visually distinct artist heros, rehab-eldalil LAST so the final
 * photo of the cycle is the primary artist that the gallery is built
 * around. If any slug isn't found or lacks a hero, it's silently
 * filtered out — useMemo keeps the list stable. */
const CYCLE_SLUGS = [
  "cansu-yildiran",
  "florian-braakman",
  "jaclyn-wright",
  "andre-ramos-woodard",
  "amin-yousefi",
  "rehab-eldalil",
];

export default function Intro({ phase, heroArtist, onIntroComplete }) {
  const cycleArtists = useMemo(
    () =>
      CYCLE_SLUGS
        .map((slug) => ARTISTS.find((a) => a.slug === slug))
        .filter((a) => a && a.hero),
    []
  );
  const N = cycleArtists.length;

  /* cycleIdx state machine (be explicit; do not collapse these branches):
   *   -1        not started — pure black, TALENT + tagline fade in
   *    0..N-2   showing cycle photo at that index, TALENT visible
   *    N-1      LAST cycle photo (rehab) visible WITH TALENT
   *    N        TALENT + tagline faded out, last photo full-bleed alone
   *    N+1      onIntroComplete already fired; parent will unmount us */
  const [cycleIdx, setCycleIdx] = useState(-1);

  // Step 1: at t=1800ms, start the cycle.
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setCycleIdx(0), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  // Step 2: advance through the middle of the cycle (0 → N-2 → N-1).
  // Excludes the last photo, which gets its own longer hold below.
  useEffect(() => {
    if (cycleIdx < 0 || cycleIdx >= N - 1) return;
    const t = setTimeout(() => setCycleIdx((i) => i + 1), 1500);
    return () => clearTimeout(t);
  }, [cycleIdx, N]);

  // Step 3: on the LAST photo (rehab), hold 1200 ms, then hide TALENT.
  useEffect(() => {
    if (cycleIdx !== N - 1) return;
    const t = setTimeout(() => setCycleIdx(N), 1200);
    return () => clearTimeout(t);
  }, [cycleIdx, N]);

  // Step 4: TALENT hidden, last photo holds alone full-bleed for 900 ms,
  // then signal the parent to advance phase → 'gallery'.
  useEffect(() => {
    if (cycleIdx !== N) return;
    const t = setTimeout(() => {
      setCycleIdx(N + 1);
      onIntroComplete?.();
    }, 900);
    return () => clearTimeout(t);
  }, [cycleIdx, N, onIntroComplete]);

  // Reset internal state if the parent ever flips us back to 'intro'
  // (e.g. dev hot-reload). Without this, hot updates leave cycleIdx
  // stuck at N+1 and the cycle never replays.
  useEffect(() => {
    if (phase === "intro") setCycleIdx(-1);
  }, [phase]);

  // Visibility of the intro typography. Anything past N hides the
  // TALENT wordmark + tagline so the last photo gets the full screen.
  const showTypo = phase === "intro" && cycleIdx < N;

  // The cycle photo to actually render. Clamp at the last so cycleIdx==N
  // (TALENT-hidden hold) and N+1 (post-fire idle) both keep rendering it.
  const photoIdx =
    cycleIdx < 0 ? -1 : cycleIdx >= N ? N - 1 : cycleIdx;
  const photoArtist = photoIdx >= 0 ? cycleArtists[photoIdx] : null;

  return (
    <>
      {/* TRUE FULL-BLEED cycle photo — z=1 sits behind TALENT (z=25).
       *  position: fixed, top:0 left:0, explicit 100vw/100vh, NO padding,
       *  NO border, NO border-radius, NO maxWidth/maxHeight, NO inset+margin.
       *  AnimatePresence + the changing key gives cross-fade between photos. */}
      <AnimatePresence>
        {phase === "intro" && photoArtist && (
          <motion.div
            key={`cycle-${photoIdx}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.6, ease: "easeInOut" },
              scale: { duration: 1.8, ease: [0.165, 0.84, 0.44, 1] },
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 1,
              backgroundImage: `url(${photoArtist.hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* TALENT mark — pattern fill, on top of the cycling photo.
       *  mixBlendMode: difference inverts the wordmark against whatever
       *  photo is showing behind it. */}
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
          {showTypo && (
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

      {/* Tagline — word-stagger. */}
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
          {showTypo && (
            <motion.p
              key="talent-tag"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, transition: { duration: 0.4 } },
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
    </>
  );
}
