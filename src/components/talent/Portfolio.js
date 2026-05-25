"use client";

/**
 * Portfolio — HORIZONTAL pager for the 'portfolio' phase.
 *
 * Reverts commit 953424e's vertical-scroll experiment, per direct user
 * spec override. Each spread is 100vw × 100vh; the strip slides left
 * under the user's wheel/touch input.
 *
 * Wheel-Y → translate-X mapping:
 *   body { overflow: hidden } while mounted
 *   transform: translate3d(-currentX, 0, 0)
 *   wheel:  e.preventDefault(); targetX += e.deltaY    (NOT deltaX)
 *   touch:  delta = lastY - currentY; targetX += delta * 1.6
 *   RAF lerp at 0.1 per frame
 *   clamp:  [0, (spreadCount - 1) * window.innerWidth]
 *
 * Keyboard: ←/→ + PageUp/Down shift one half-viewport; Home/End jump
 * to ends; Escape closes the portfolio.
 *
 * Each spread is height: 100vh strictly with `overflow: hidden` so
 * content can't overflow the viewport — closes the user-reported
 * "inside doesn't fit" bug from the earlier vertical-scroll version.
 */

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ExhibitionSection from "./spreads/ExhibitionSection";
import { nextArtist } from "@/lib/talent-artists";

export default function Portfolio({ artist, onClose, onNavigate }) {
  const next = nextArtist(artist.slug);
  const sections = (artist.sections || []).filter((s) => {
    if (s.kind === "prose" && (!s.html || s.html === "<p></p>")) return false;
    return true;
  });
  // Cover + N sections + thank-you = total spread count
  const spreadCount = 2 + sections.length;

  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const targetX = useRef(0);
  const currentX = useRef(0);
  const lastTouchY = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const maxX = () => Math.max(0, (spreadCount - 1) * window.innerWidth);

    const onWheel = (e) => {
      e.preventDefault();
      targetX.current = Math.max(0, Math.min(maxX(), targetX.current + e.deltaY));
    };

    const onTouchStart = (e) => { lastTouchY.current = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (lastTouchY.current == null) return;
      const y = e.touches[0].clientY;
      const dy = lastTouchY.current - y;
      lastTouchY.current = y;
      targetX.current = Math.max(0, Math.min(maxX(), targetX.current + dy * 1.6));
    };
    const onTouchEnd = () => { lastTouchY.current = null; };

    const onKey = (e) => {
      const step = window.innerWidth * 0.5;
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
        {/* Cover spread (100vw × 100vh exactly) */}
        <section
          style={{
            flex: "0 0 100vw",
            height: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.hero}
            alt={artist.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
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

        {/* One section per 100vw spread. Inner content is height 100%
         *  with overflow hidden so the spread never grows past viewport. */}
        {sections.map((s, i) => (
          <section
            key={i}
            style={{
              flex: "0 0 100vw",
              height: "100vh",
              position: "relative",
              overflow: "hidden",
              padding: "8vh 0",
            }}
          >
            <div style={{ height: "100%", overflow: "hidden" }}>
              <ExhibitionSection section={s} slug={artist.slug} idx={i} />
            </div>
          </section>
        ))}

        {/* Thank-you spread (final 100vw slot) */}
        <section
          style={{
            flex: "0 0 100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "#ffffff",
            color: "#000",
            padding: "0 6vw",
          }}
        >
          <h2
            style={{
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(40px, 7vw, 96px)",
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            thank you<br />for visiting
          </h2>
          {next && (
            <>
              <p style={{ marginTop: 48, fontSize: 16, opacity: 0.8 }}>
                next: {next.name}
              </p>
              {/* Phase 7 styling: white pill with 1px black border;
               *  small black square LEFT decoration + black eye icon RIGHT. */}
              <button
                type="button"
                onClick={() => onNavigate?.(next)}
                style={{
                  marginTop: 24,
                  height: 48,
                  padding: "0 20px 0 0",
                  borderRadius: 9999,
                  background: "#fff",
                  color: "#000",
                  border: "1px solid #000",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  fontSize: 14,
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#000",
                    borderRadius: "9999px 0 0 9999px",
                    margin: 0,
                  }}
                />
                <span style={{ flex: 1 }}>view next exhibition</span>
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                  <path d="M1 7 C 3.5 1.5, 14.5 1.5, 17 7 C 14.5 12.5, 3.5 12.5, 1 7 Z"
                    stroke="#000" strokeWidth="1.4" />
                  <circle cx="9" cy="7" r="2.2" fill="#000" />
                </svg>
              </button>
            </>
          )}
        </section>
      </div>

      {/* Phase 7 back button — rectangular pill, ~80×40, 4px radius */}
      <button
        onClick={onClose}
        aria-label="Back to gallery"
        style={{
          position: "fixed",
          top: 24,
          left: 28,
          zIndex: 100,
          width: 80,
          height: 40,
          padding: "0 12px",
          borderRadius: 4,
          background: "transparent",
          border: "1px solid currentColor",
          color: artist.accentText,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
          <path d="M5 1 L1 5 L5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 5 L13 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>back</span>
      </button>

      {/* About the project pill, bottom-centre */}
      <button
        type="button"
        aria-label="About the project"
        onClick={() => { /* modal placeholder */ }}
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          height: 44,
          padding: "0 20px 0 8px",
          borderRadius: 9999,
          background: "#000",
          color: "#fff",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          fontSize: 14,
          letterSpacing: "0.02em",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5 C 3 1, 11 1, 13 5 C 11 9, 3 9, 1 5 Z" stroke="#000" strokeWidth="1.2" />
            <circle cx="7" cy="5" r="1.6" fill="#000" />
          </svg>
        </span>
        About the project
      </button>
    </motion.div>
  );
}
