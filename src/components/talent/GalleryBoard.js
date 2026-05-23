"use client";

/**
 * GalleryBoard — the draggable canvas of artist cards.
 *
 * Implements FOAM_TALENT_SPEC.md §2.3 and §2.4.
 *
 *  - Whole-canvas pan via `useCanvasPan` (pointer + wheel).
 *  - On card hover: GSAP tweens `--talent-bg` and `--talent-accent-text`
 *    on the stage to the artist's accent colours; other cards dim.
 *  - On card click (when pointer didn't drag): kick off the dive
 *    transition via the supplied `onDive(artist, rect)` callback. The
 *    parent owns DiveTransition + the router push.
 *  - Filter mode: when a chip is active, non-matching cards are removed
 *    and matching cards are re-laid 1.6× larger in a 3-column flow with
 *    small rotation variance, tweened with a 25 ms stagger.
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CANVAS_W, CANVAS_H, CATEGORIES } from "@/lib/talent-artists";
import { useCanvasPan } from "@/lib/use-canvas-pan";
import GalleryCard from "./GalleryCard";
import CategoryChips from "./CategoryChips";

gsap.registerPlugin(useGSAP);

const DEFAULT_BG = "#0b0b0b";
const DEFAULT_FG = "#ffffff";

/**
 * Pack matching cards into a 3-column flow at 1.6× the authored size.
 * Returns {x, y, w, h, rot} per artist id.
 */
function buildFilterLayout(artists) {
  const cols = 3;
  const padX = 80;
  const padY = 80;
  const cellW = (CANVAS_W - padX * (cols + 1)) / cols;
  // Each card aspect-ratio is preserved from its authored pos.
  const layout = {};
  const colHeights = new Array(cols).fill(padY);

  artists.forEach((a, i) => {
    const aspect = a.pos.h / a.pos.w;
    const w = cellW;
    const h = w * aspect;
    // Choose the shortest column
    let col = 0;
    for (let k = 1; k < cols; k++) {
      if (colHeights[k] < colHeights[col]) col = k;
    }
    const x = padX + col * (cellW + padX);
    const y = colHeights[col];
    colHeights[col] = y + h + padY;
    layout[a.id] = {
      x, y, w, h,
      rot: ((i % 5) - 2) * 0.8, // small per-card rotation variance ±1.6°
    };
  });
  return layout;
}

export default function GalleryBoard({ artists = [], onDive = () => {} }) {
  const { stageRef, canvasRef, wasDrag } = useCanvasPan({
    canvasW: CANVAS_W,
    canvasH: CANVAS_H,
  });
  const cardRefs = useRef({});
  const [hovered, setHovered] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const filterLayout = useRef(null);

  const visibleArtists = useMemo(() => {
    if (!activeTag) return artists;
    return artists.filter((a) => a.tags && a.tags.includes(activeTag));
  }, [artists, activeTag]);

  /* ---------- mount entrance ---------- */
  useGSAP(
    () => {
      gsap.from(".tcard", {
        opacity: 0,
        y: 16,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.03,
      });
    },
    { scope: stageRef, dependencies: [] }
  );

  /* ---------- hover → background colour tween ---------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (hovered) {
      gsap.to(stage, {
        "--talent-bg": hovered.accent,
        "--talent-accent": hovered.accent,
        "--talent-accent-text": hovered.accentText,
        duration: 0.55,
        ease: "power2.out",
      });
    } else {
      gsap.to(stage, {
        "--talent-bg": DEFAULT_BG,
        "--talent-accent": "#f26da9",
        "--talent-accent-text": DEFAULT_FG,
        duration: 0.45,
        ease: "power2.out",
      });
    }
  }, [hovered]);

  /* ---------- filter mode: re-layout ---------- */
  useEffect(() => {
    if (!activeTag) {
      // Restore authored positions
      visibleArtists.forEach((a) => {
        const el = cardRefs.current[a.id];
        if (!el) return;
        gsap.to(el, {
          left: a.pos.x,
          top: a.pos.y,
          width: a.pos.w,
          height: a.pos.h,
          rotation: a.pos.rot,
          duration: 0.72,
          ease: "power3.inOut",
        });
      });
      filterLayout.current = null;
      return;
    }

    const layout = buildFilterLayout(visibleArtists);
    filterLayout.current = layout;

    gsap.to(
      visibleArtists.map((a) => cardRefs.current[a.id]).filter(Boolean),
      {
        // GSAP can tween left/top/width/height on absolutely positioned
        // elements; we set them one-by-one for clarity.
        duration: 0.72,
        ease: "power3.inOut",
        stagger: 0.025,
        left: (i) => layout[visibleArtists[i].id].x,
        top: (i) => layout[visibleArtists[i].id].y,
        width: (i) => layout[visibleArtists[i].id].w,
        height: (i) => layout[visibleArtists[i].id].h,
        rotation: (i) => layout[visibleArtists[i].id].rot,
      }
    );
  }, [activeTag, visibleArtists]);

  /* ---------- handlers ---------- */
  const onHover = useCallback((artist) => setHovered(artist), []);
  const onLeave = useCallback(() => setHovered(null), []);

  const onActivate = useCallback(
    (artist, e) => {
      if (wasDrag()) return; // pointer dragged the canvas, swallow click
      const el = cardRefs.current[artist.id];
      const rect = el ? el.getBoundingClientRect() : null;
      onDive(artist, rect);
    },
    [onDive, wasDrag]
  );

  const registerRef = (id) => (el) => {
    if (el) cardRefs.current[id] = el;
    else delete cardRefs.current[id];
  };

  return (
    <section
      ref={stageRef}
      className="gallery-stage talent-root"
      aria-label="Foam Talent 2024 — exhibition gallery"
    >
      <div
        ref={canvasRef}
        className="gallery-canvas"
        style={{ width: CANVAS_W, height: CANVAS_H }}
      >
        {visibleArtists.map((a) => (
          <GalleryCard
            key={a.id}
            artist={a}
            isHovered={hovered?.id === a.id}
            isDimmed={!!hovered && hovered.id !== a.id}
            onHover={onHover}
            onLeave={onLeave}
            onActivate={onActivate}
            registerRef={registerRef(a.id)}
          />
        ))}
      </div>

      <div
        className={`gallery-caption${hovered ? " is-on" : ""}`}
        aria-live="polite"
      >
        {hovered && (
          <>
            <span className="gc-title">{hovered.title}</span>
            <span className="gc-artist">{hovered.name}</span>
          </>
        )}
      </div>

      <CategoryChips
        categories={CATEGORIES}
        active={activeTag}
        onChange={setActiveTag}
      />
    </section>
  );
}
