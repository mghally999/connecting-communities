"use client";

/**
 * ExhibitionSection — element-switching renderer for one portfolio block.
 *
 * Maps the Storyblok `OnlineExhibition*` component shapes captured by
 * scripts/build-talent-data.py into renderable React. The schema is
 * documented inline below; see src/lib/talent-artists.js for examples.
 *
 * IMPORTANT: This is a **vertical** flow component, not a horizontal
 * spread. That mirrors how foam.org actually lays out each artist's
 * portfolio: a long vertical scroll with mixed in-flow elements and
 * absolutely-positioned overlays ("free" images).
 *
 * Section kinds:
 *   image            Single image. If section.free → absolutely positioned
 *                    using top/left/height percentages relative to the
 *                    viewport. Otherwise flows inline.
 *   images           Image grid (1–3 cols) from `items`.
 *   images-with-text Grid + body text.
 *   prose            Rich-text paragraph(s).
 *   quote            Italic callout.
 *   inline-video     Auto-playing looped MP4.
 *   video            Click-to-play video with optional poster.
 *   podcast          Audio player (delegates to AudioRing primitive).
 *   embed            Raw HTML iframe.
 *   viewer           360° / interactive placeholder.
 */

import React from "react";
import AudioRing from "./AudioRing";

function pct(v) {
  if (v === null || v === undefined || v === "") return undefined;
  // Foam stores 'left: -150' meaning -150%, 'top: 10' meaning 10%, 'height: 80' meaning 80vh.
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return undefined;
  return `${n}%`;
}

function vh(v) {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return undefined;
  return `${n}vh`;
}

function ImageBlock({ s }) {
  if (s.free) {
    // Free-positioned overlay
    return (
      <div
        className="ex-image ex-image-free"
        style={{
          position: "absolute",
          top: pct(s.top),
          left: pct(s.left),
          width: s.width ? pct(s.width) : undefined,
          height: s.height ? vh(s.height) : undefined,
          marginTop: s.marginTop ? vh(s.marginTop) : undefined,
          zIndex: 1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.src} alt={s.alt || ""} draggable={false} />
        {s.caption && <figcaption>{s.caption}</figcaption>}
      </div>
    );
  }
  return (
    <figure
      className="ex-image"
      style={{
        margin: "0 auto",
        marginTop: s.marginTop ? vh(s.marginTop) : "10vh",
        marginBottom: "10vh",
        maxWidth: "min(86vw, 1100px)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.src}
        alt={s.alt || ""}
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height: s.height ? vh(s.height) : "auto",
          objectFit: "contain",
          boxShadow: s.shadow ? "0 30px 60px rgba(0,0,0,0.22)" : "none",
        }}
      />
      {(s.caption || s.credits) && (
        <figcaption style={{ marginTop: "0.8em", fontSize: 13, opacity: 0.7 }}>
          {s.caption}
          {s.credits && <span style={{ marginLeft: "0.6em" }}>· {s.credits}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function ImagesBlock({ s }) {
  const items = (s.items || []).filter((i) => i?.src);
  if (items.length === 0) return null;
  const cols = items.length === 1 ? 1 : items.length === 2 ? 2 : 3;
  return (
    <section
      className="ex-images"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "2vw",
        padding: "10vh 7vw",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {items.map((it, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={it.src}
          alt={it.alt || ""}
          loading="lazy"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      ))}
    </section>
  );
}

function ProseBlock({ s }) {
  if (!s.html || s.html === "<p></p>") return null;
  return (
    <section
      className="ex-prose"
      style={{
        maxWidth: 660,
        margin: "10vh auto",
        padding: "0 7vw",
        fontSize: 17,
        lineHeight: 1.6,
      }}
    >
      {s.title && (
        <h2 style={{ fontSize: 28, marginBottom: "0.6em", letterSpacing: "-0.01em" }}>
          {s.title}
        </h2>
      )}
      <div dangerouslySetInnerHTML={{ __html: s.html }} />
    </section>
  );
}

function QuoteBlock({ s }) {
  if (!s.html) return null;
  return (
    <blockquote
      className="ex-quote"
      style={{
        maxWidth: 880,
        margin: "16vh auto",
        padding: "0 7vw",
        fontSize: "clamp(28px, 3.4vw, 56px)",
        lineHeight: 1.2,
        fontStyle: "italic",
        textAlign: "center",
        letterSpacing: "-0.01em",
      }}
      dangerouslySetInnerHTML={{ __html: s.html }}
    />
  );
}

function InlineVideoBlock({ s }) {
  if (!s.src) return null;
  return (
    <section
      className="ex-inline-video"
      style={{
        margin: "12vh auto",
        maxWidth: "min(86vw, 1200px)",
      }}
    >
      <video
        src={s.src}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: s.height ? vh(s.height) : "auto",
          display: "block",
          objectFit: "cover",
        }}
      >
        {s.webm && <source src={s.webm} type="video/webm" />}
      </video>
    </section>
  );
}

function VideoBlock({ s }) {
  if (!s.src) return null;
  return (
    <section className="ex-video" style={{ margin: "12vh auto", maxWidth: "min(86vw, 1200px)" }}>
      <video
        src={s.src}
        controls
        poster={s.poster || undefined}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {s.webm && <source src={s.webm} type="video/webm" />}
      </video>
    </section>
  );
}

function PodcastBlock({ s }) {
  return (
    <section
      className="ex-podcast"
      style={{
        margin: "14vh auto",
        maxWidth: 540,
        padding: "0 7vw",
        textAlign: "center",
      }}
    >
      <AudioRing
        title={s.title}
        caption={`▷ ${s.duration || ""}`}
        src={s.src}
        duration={parseDuration(s.duration)}
      />
    </section>
  );
}

function parseDuration(str) {
  if (!str) return 0;
  // "12:21" → 741 seconds
  const parts = String(str).split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  let s = 0;
  for (const p of parts) s = s * 60 + p;
  return s;
}

function EmbedBlock({ s }) {
  if (!s.html) return null;
  return (
    <section
      className="ex-embed"
      style={{ margin: "12vh auto", maxWidth: "min(86vw, 1200px)" }}
      dangerouslySetInnerHTML={{ __html: s.html }}
    />
  );
}

function ViewerBlock() {
  return (
    <section
      className="ex-viewer"
      style={{
        margin: "12vh auto",
        maxWidth: 640,
        padding: "4vh 7vw",
        textAlign: "center",
        opacity: 0.55,
        fontSize: 14,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      360° interactive viewer
    </section>
  );
}

export default function ExhibitionSection({ section }) {
  switch (section.kind) {
    case "image":             return <ImageBlock s={section} />;
    case "images":            return <ImagesBlock s={section} />;
    case "images-with-text":  return (
      <>
        <ImagesBlock s={section} />
        <ProseBlock s={{ html: section.html }} />
      </>
    );
    case "prose":             return <ProseBlock s={section} />;
    case "quote":             return <QuoteBlock s={section} />;
    case "inline-video":      return <InlineVideoBlock s={section} />;
    case "video":             return <VideoBlock s={section} />;
    case "podcast":           return <PodcastBlock s={section} />;
    case "embed":             return <EmbedBlock s={section} />;
    case "viewer":            return <ViewerBlock />;
    default:                  return null;
  }
}
