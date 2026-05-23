"use client";

/**
 * GalleryCard — single artist card on the gallery board.
 *
 * Per FOAM_TALENT_SPEC.md §2.3:
 *  - Absolutely positioned inside the canvas via authored {x, y, w, h, rot}
 *  - On hover, the parent stage's --bg crossfades to the artist's accent
 *    (handled in GalleryBoard, this component just signals the hover)
 *  - The card scales 1.06 and a pill button overlays its centre
 *  - Click → dive transition into /talent/[slug]
 *
 * The pill button is purely decorative; the whole card is the click
 * target (a real <button>) so it stays keyboard-accessible.
 */

import React from "react";

export default function GalleryCard({
  artist,
  isHovered,
  isDimmed,
  onHover,
  onLeave,
  onActivate,
  registerRef,
}) {
  const { pos, thumb, title } = artist;

  return (
    <button
      ref={registerRef}
      data-slug={artist.slug}
      className={`tcard${isHovered ? " is-hover" : ""}${isDimmed ? " is-dimmed" : ""}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: pos.w,
        height: pos.h,
        transform: `rotate(${pos.rot}deg)`,
      }}
      onPointerEnter={() => onHover(artist)}
      onPointerLeave={() => onLeave(artist)}
      onClick={(e) => onActivate(artist, e)}
      aria-label={`${title} by ${artist.name} — enter portfolio`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="tcard-img" src={thumb} alt="" draggable={false} />
      <span className="tcard-pill">enter portfolio</span>
    </button>
  );
}
