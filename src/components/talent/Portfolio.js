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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import ExhibitionSection from "./spreads/ExhibitionSection";
import { nextArtist } from "@/lib/talent-artists";

/* Phase 4 — collage layout templates. Each layout consumes `count`
 * consecutive image sections and arranges them as absolutely-positioned
 * <img> elements inside a 100vw × 100vh spread. Slot dimensions are
 * percentages of the spread so they scale with viewport. Mix is rotated
 * across spreads via (spreadIdx % LAYOUTS.length) so a portfolio with
 * many images doesn't repeat the same arrangement back-to-back. */
const SPREAD_LAYOUTS = [
  { count: 2, slots: [
    { left: "4%",  top: "8%",  width: "42%", height: "84%" },
    { left: "58%", top: "18%", width: "34%", height: "62%" },
  ]},
  { count: 3, slots: [
    { left: "3%",  top: "12%", width: "28%", height: "58%" },
    { left: "36%", top: "30%", width: "28%", height: "56%" },
    { left: "70%", top: "10%", width: "26%", height: "76%" },
  ]},
  { count: 2, slots: [
    { left: "10%", top: "10%", width: "56%", height: "80%" },
    { left: "72%", top: "12%", width: "22%", height: "30%" },
  ]},
  { count: 4, slots: [
    { left: "5%",  top: "10%", width: "30%", height: "42%" },
    { left: "40%", top: "12%", width: "24%", height: "40%" },
    { left: "68%", top: "18%", width: "27%", height: "38%" },
    { left: "18%", top: "56%", width: "38%", height: "38%" },
  ]},
];

/* Group consecutive image sections into collage spreads; non-image
 * sections (prose, quote, audio, video, embed, viewer) become their
 * own single-section spread that defers to ExhibitionSection's existing
 * renderer. Empty prose sections are dropped — same filter as before. */
function buildSpreads(rawSections) {
  const spreads = [];
  let imageBuffer = [];
  let pickIdx = 0;

  const flushImages = () => {
    while (imageBuffer.length > 0) {
      if (imageBuffer.length === 1) {
        // One stray image: render it large and centered.
        spreads.push({
          kind: "collage",
          layout: { count: 1, slots: [
            { left: "15%", top: "10%", width: "70%", height: "80%" },
          ]},
          images: imageBuffer.splice(0, 1),
        });
        continue;
      }
      // Pick a layout whose count is ≤ what's left. Cycle through to vary.
      let candidates = SPREAD_LAYOUTS.filter((l) => l.count <= imageBuffer.length);
      if (candidates.length === 0) candidates = [SPREAD_LAYOUTS[0]];
      const layout = candidates[pickIdx % candidates.length];
      pickIdx++;
      const consumed = imageBuffer.splice(0, layout.count);
      spreads.push({ kind: "collage", layout, images: consumed });
    }
  };

  rawSections.forEach((s) => {
    if (s.kind === "image" && s.src) {
      imageBuffer.push({ src: s.src, alt: s.alt || "", caption: s.caption });
      return;
    }
    if (s.kind === "images") {
      (s.items || [])
        .filter((it) => it && it.src)
        .forEach((it) =>
          imageBuffer.push({ src: it.src, alt: it.alt || "", caption: it.caption })
        );
      return;
    }
    // Skip empty prose sections so they don't add a blank spread.
    if (s.kind === "prose" && (!s.html || s.html === "<p></p>")) return;
    flushImages();
    spreads.push({ kind: "other", section: s });
  });
  flushImages();
  return spreads;
}

function CollageSpread({ spread, background, backgroundImage }) {
  return (
    <section
      style={{
        flex: "0 0 100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {spread.images.map((img, i) => {
        const slot = spread.layout.slots[i];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.src}
            alt={img.alt || ""}
            draggable={false}
            loading="lazy"
            style={{
              position: "absolute",
              left: slot.left,
              top: slot.top,
              width: slot.width,
              height: slot.height,
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        );
      })}
    </section>
  );
}

export default function Portfolio({ artist, onClose, onNavigate }) {
  const next = nextArtist(artist.slug);
  const spreads = useMemo(
    () => buildSpreads(artist.sections || []),
    [artist.sections]
  );
  // Cover + N spreads + thank-you = total slot count
  const spreadCount = 2 + spreads.length;

  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const targetX = useRef(0);
  const currentX = useRef(0);
  const lastTouchY = useRef(null);

  /* When the user reaches the last (thank-you) spread the auto-advance
   * timer starts. The progress motion value animates 0 → 1 over 3 s
   * and is used to drive the fill width inside the view-next pill.
   * If the user scrolls back, we cancel the animation and reset. */
  const [onThankYou, setOnThankYou] = useState(false);
  const prevAtEnd = useRef(false);
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Auto-advance: when the thank-you spread is on-screen and there's
   * a next artist, kick off a 3 s linear progress. On completion we
   * navigate to the next artist. If the user scrolls back BEFORE the
   * 3 s are up, the cleanup stops the animation and resets to 0. */
  useEffect(() => {
    progress.set(0);
    if (!onThankYou || !next) return;
    const controls = animate(progress, 1, {
      duration: 3,
      ease: "linear",
      onComplete: () => onNavigate?.(next),
    });
    return () => {
      controls.stop();
      progress.set(0);
    };
  }, [onThankYou, next, progress, onNavigate]);

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
      /* React state update is gated by a ref so we only setState on
       * transition boundaries, not every frame. The threshold is half
       * a spread width so we react before the user is fully settled. */
      const reachedEnd = currentX.current > maxX() - window.innerWidth * 0.5;
      if (reachedEnd !== prevAtEnd.current) {
        prevAtEnd.current = reachedEnd;
        setOnThankYou(reachedEnd);
      }
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

        {/* Phase 4 — spreads are either collage layouts (multiple images
         *  arranged absolutely within the 100vw × 100vh slot) or "other"
         *  spreads that defer to ExhibitionSection for prose/quote/audio/
         *  video/embed/viewer. Each spread is height: 100vh strictly with
         *  overflow: hidden so the spread never grows past viewport. */}
        {spreads.map((sp, i) => {
          if (sp.kind === "collage") {
            return (
              <CollageSpread
                key={`spread-${i}`}
                spread={sp}
                background={artist.accent}
                backgroundImage={artist.backgroundTexture}
              />
            );
          }
          return (
            <section
              key={`spread-${i}`}
              style={{
                flex: "0 0 100vw",
                height: "100vh",
                position: "relative",
                overflow: "hidden",
                padding: "8vh 0",
                background: artist.accent,
              }}
            >
              <div style={{ height: "100%", overflow: "hidden" }}>
                <ExhibitionSection section={sp.section} slug={artist.slug} idx={i} />
              </div>
            </section>
          );
        })}

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
              {/* View-next pill with auto-advance progress fill.
               *  Layout: black left square + label + eye icon, all
               *  inside a relative container. A motion.div behind the
               *  content fills horizontally over the 3 s timer so the
               *  pill literally shows "loading to the next portfolio".
               *  Clicking the button at any point bypasses the timer
               *  and navigates immediately. */}
              <button
                type="button"
                onClick={() => onNavigate?.(next)}
                style={{
                  marginTop: 24,
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "stretch",
                  background: "#fff",
                  border: "1.5px solid #111",
                  borderRadius: 9999,
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minWidth: 320,
                }}
              >
                {/* Progress fill — animates 0 → 100% over 3 s. Sits
                 *  underneath the label so the text reads inverted
                 *  (mixBlendMode: difference) where the fill has
                 *  passed and normal black where it hasn't. */}
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: progressWidth,
                    background: "#111",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: 44,
                    background: "#111",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                <span
                  style={{
                    padding: "12px 20px",
                    color: "#111",
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    mixBlendMode: "difference",
                  }}
                >
                  view next exhibition
                </span>
                <span
                  style={{
                    padding: "12px 18px 12px 0",
                    color: "#111",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    mixBlendMode: "difference",
                  }}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M1 8 C 3 3, 13 3, 15 8 C 13 13, 3 13, 1 8 Z"
                      stroke="#111"
                      strokeWidth="1.3"
                    />
                    <circle cx="8" cy="8" r="2.4" fill="#111" />
                  </svg>
                </span>
              </button>
            </>
          )}
        </section>
      </div>

      {/* Phase 5 back button — rectangular pill, 80×40, 6px radius.
       *  mixBlendMode: 'difference' makes it always readable against
       *  whatever (dark hero photo, cream spread, accent fill) is behind
       *  it. Color is forced to white so the blend inverts to the dark
       *  silhouette on light backgrounds, and stays white on dark. */}
      <button
        onClick={onClose}
        aria-label="Back to gallery"
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 100,
          width: 80,
          height: 40,
          padding: "0 12px",
          borderRadius: 6,
          background: "transparent",
          border: "1.5px solid #fff",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          mixBlendMode: "difference",
          fontFamily: "inherit",
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
