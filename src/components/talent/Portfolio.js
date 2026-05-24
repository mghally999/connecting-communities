"use client";

/**
 * Portfolio — horizontal pager spread for the 'portfolio' phase.
 *
 * Wheel-Y → translate-X mapping (per spec):
 *
 *   body { overflow: hidden } while mounted (handled by parent shell)
 *   one flex strip, each spread is 100vw × 100vh
 *   transform: translate3d(-currentX, 0, 0)
 *   wheel:  event.preventDefault(); targetX += event.deltaY   (NOT deltaX)
 *   touch:  delta = lastY - currentY; targetX += delta
 *   RAF lerp at 0.1 per frame:  currentX += (targetX - currentX) * 0.1
 *   clamped to [0, (N-1) * innerWidth]
 *
 * The first spread carries layoutId="hero-card" so the gallery card
 * morphs into it on enter and back into the gallery slot on exit.
 */

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ExhibitionSection from "./spreads/ExhibitionSection";

export default function Portfolio({ artist, onClose }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const targetX = useRef(0);
  const currentX = useRef(0);
  const lastTouchY = useRef(null);

  // sections excluding empty prose blocks
  const sections = (artist.sections || []).filter((s) => {
    if (s.kind === "prose" && (!s.html || s.html === "<p></p>")) return false;
    return true;
  });
  // Spread count: 1 cover + N sections
  const spreadCount = 1 + sections.length;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const maxX = () => Math.max(0, (spreadCount - 1) * window.innerWidth);

    const onWheel = (e) => {
      e.preventDefault();
      // NOTE: deltaY (vertical wheel intent) drives horizontal travel.
      // Lenis's built-in horizontal mode would read deltaX instead; we
      // deliberately ignore deltaX here so a trackpad's vertical swipe
      // moves the pager.
      targetX.current = Math.max(0, Math.min(maxX(), targetX.current + e.deltaY));
    };

    const onTouchStart = (e) => {
      lastTouchY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (lastTouchY.current == null) return;
      const y = e.touches[0].clientY;
      const dy = lastTouchY.current - y;
      lastTouchY.current = y;
      targetX.current = Math.max(0, Math.min(maxX(), targetX.current + dy * 1.6));
    };
    const onTouchEnd = () => { lastTouchY.current = null; };

    const onKey = (e) => {
      const step = window.innerWidth * 0.6;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        targetX.current = Math.min(maxX(), targetX.current + step);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        targetX.current = Math.max(0, targetX.current - step);
      } else if (e.key === "Home") {
        targetX.current = 0;
      } else if (e.key === "End") {
        targetX.current = maxX();
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };

    let raf = 0;
    const tick = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lerp = reduced ? 1 : 0.1;
      currentX.current += (targetX.current - currentX.current) * lerp;
      if (Math.abs(targetX.current - currentX.current) < 0.05) {
        currentX.current = targetX.current;
      }
      track.style.transform = `translate3d(${-currentX.current}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", onTouchMove, { passive: true });
    wrapper.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      wrapper.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [spreadCount, onClose]);

  return (
    <motion.div
      ref={wrapperRef}
      className="portfolio-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        overflow: "hidden",
        background: artist.accent,
        color: artist.accentText,
        "--talent-accent": artist.accent,
        "--talent-accent-text": artist.accentText,
      }}
    >
      <div
        ref={trackRef}
        className="portfolio-track"
        style={{
          display: "flex",
          height: "100vh",
          width: `${spreadCount * 100}vw`,
          willChange: "transform",
        }}
      >
        {/* Cover spread — carries the layoutId so the gallery card morphs
            INTO the full-bleed hero on enter, and back out on exit. */}
        <section
          style={{ flex: "0 0 100vw", height: "100vh", position: "relative", overflow: "hidden" }}
        >
          <motion.div
            layoutId="hero-card"
            transition={{ duration: 0.7, ease: [0.5, 0, 0.75, 0] }}
            style={{ position: "absolute", inset: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artist.hero}
              alt={artist.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "6vw",
              bottom: "8vh",
              zIndex: 2,
              color: "#fff",
              maxWidth: "60vw",
            }}
          >
            <p
              style={{
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.85,
                marginBottom: "0.6em",
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
              }}
            >
              {artist.exhibition || artist.name}
            </h1>
          </div>
        </section>

        {sections.map((s, i) => (
          <section
            key={i}
            style={{
              flex: "0 0 100vw",
              height: "100vh",
              position: "relative",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "8vh 0",
            }}
          >
            <ExhibitionSection section={s} />
          </section>
        ))}
      </div>

      {/* Close affordance — top-left */}
      <button
        onClick={onClose}
        aria-label="Back to gallery"
        style={{
          position: "fixed",
          top: 24,
          left: 28,
          zIndex: 100,
          background: "transparent",
          border: 0,
          color: artist.accentText,
          fontSize: 13,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        ← gallery
      </button>

      {/* Spread index indicator */}
      <div
        style={{
          position: "fixed",
          right: 28,
          bottom: 24,
          zIndex: 100,
          fontSize: 12,
          letterSpacing: "0.08em",
          color: artist.accentText,
          opacity: 0.7,
          fontVariantNumeric: "tabular-nums",
          pointerEvents: "none",
        }}
      >
        scroll →
      </div>
    </motion.div>
  );
}
