"use client";

/**
 * Intro — the opening typography stack and 6-photo cycle.
 *
 *   t=0.0   "foam" wordmark (owned by <FoamSidebar/>)
 *   t=0.4   TALENT wordmark fades in
 *   t=0.8   tagline fades in
 *   t=1.4   first cycle photo enters TRUE FULL-BLEED behind TALENT
 *   …       cycle photos 0..N-2 cross-fade every 200 ms (rapid montage)
 *   ~t=2.4  last photo (rehab) holds full-bleed 1000 ms with TALENT visible
 *   ~t=3.4  TALENT + tagline fade out; rehab photo SHRINKS at the centre
 *           toward its position in the gallery cluster (600 ms scale 1→0.08).
 *           At the start of the shrink we fire onIntroComplete so the
 *           gallery mounts and fades in WHILE the photo is shrinking —
 *           the photo appears to "become part of" the gallery without
 *           the previously-observed black gap.
 *   ~t=4.0  photo fully shrunk + faded; gallery fully visible.
 */

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TalentMarkSVG from "./TalentMarkSVG";
import { ARTISTS } from "@/lib/talent-artists";

const TAGLINE = ["artists", "shaping", "the", "future", "of", "photography"];

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
  const lastArtist = cycleArtists[N - 1];

  /* cycleIdx state machine:
   *   -1        not started — pure black, TALENT + tagline fade in
   *    0..N-2   mid-cycle photo at that index (fast 200ms flip)
   *    N-1      LAST photo (rehab) full-bleed, holding 1000ms
   *    N        TALENT hidden; last photo shrinking toward cluster position
   *              (600ms scale 1→0.08). onIntroComplete fires here so the
   *              gallery mounts WHILE the photo shrinks.
   *    N+1      shrink complete; photo fades out, gallery fully visible. */
  const [cycleIdx, setCycleIdx] = useState(-1);

  // Step 1: at t=1400 ms, start the rapid cycle.
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setCycleIdx(0), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  // Step 2: rapid montage — photos flip every 200 ms through 0..N-2 → N-1.
  useEffect(() => {
    if (cycleIdx < 0 || cycleIdx >= N - 1) return;
    const t = setTimeout(() => setCycleIdx((i) => i + 1), 200);
    return () => clearTimeout(t);
  }, [cycleIdx, N]);

  // Step 3: last photo (rehab) holds full-bleed for exactly 1 s WITH TALENT,
  // then we tip into the shrink phase.
  useEffect(() => {
    if (cycleIdx !== N - 1) return;
    const t = setTimeout(() => setCycleIdx(N), 1000);
    return () => clearTimeout(t);
  }, [cycleIdx, N]);

  // Step 4: shrink phase. Fire onIntroComplete IMMEDIATELY so the gallery
  // starts mounting in parallel — that overlap is what eliminates the
  // black gap between intro and gallery. After 600 ms of shrink, the
  // photo unmounts via AnimatePresence and the gallery has fully landed.
  useEffect(() => {
    if (cycleIdx !== N) return;
    onIntroComplete?.();
    const t = setTimeout(() => setCycleIdx(N + 1), 600);
    return () => clearTimeout(t);
  }, [cycleIdx, N, onIntroComplete]);

  // Reset on hot-reload back to 'intro'.
  useEffect(() => {
    if (phase === "intro") setCycleIdx(-1);
  }, [phase]);

  const showTypo = phase === "intro" && cycleIdx < N;

  // Mid-cycle photo index: only used while cycleIdx is in 0..N-2. The
  // last photo gets its own persistently-mounted div below so the
  // shrink animation runs on the SAME node instead of fighting an
  // AnimatePresence key change.
  const midPhotoIdx =
    cycleIdx >= 0 && cycleIdx < N - 1 ? cycleIdx : -1;
  const midPhotoArtist = midPhotoIdx >= 0 ? cycleArtists[midPhotoIdx] : null;

  return (
    <>
      {/* MID-CYCLE photos — rapid crossfade via AnimatePresence + key. */}
      <AnimatePresence>
        {phase === "intro" && midPhotoArtist && (
          <motion.div
            key={`cycle-${midPhotoIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 1,
              backgroundImage: `url(${midPhotoArtist.hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* LAST photo (rehab) — persistent across cycleIdx N-1, N, N+1 so
       *  the scale animation runs on a single stable node. animate target
       *  switches per cycleIdx:
       *    N-1  → opacity 1, scale 1     (full bleed hold)
       *    N    → opacity 1, scale 0.08  (shrinking to cluster card size)
       *    N+1  → opacity 0, scale 0.08  (fully gone, gallery has landed)
       *  The transform-origin defaults to center, so the shrink collapses
       *  the photo down to a card-sized region at the dead centre of the
       *  viewport — the same spot the gallery's primary card sits. */}
      <AnimatePresence>
        {phase === "intro" && cycleIdx >= N - 1 && lastArtist && (
          <motion.div
            key="last-photo"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={
              cycleIdx === N - 1
                ? { opacity: 1, scale: 1 }
                : cycleIdx === N
                ? { opacity: 1, scale: 0.08 }
                : { opacity: 0, scale: 0.08 }
            }
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: cycleIdx >= N + 1 ? 0.35 : 0.18, ease: "easeInOut" },
              scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 1,
              backgroundImage: `url(${lastArtist.hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* TALENT mark — fades out when cycleIdx >= N (start of shrink). */}
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
                hidden: { opacity: 0, transition: { duration: 0.3 } },
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
