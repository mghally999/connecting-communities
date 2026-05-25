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
import { placeholderImage } from "@/lib/talent-placeholder";

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

function ImageBlock({ s, slug, idx }) {
  // Per user mandate: behaviour > content. When the asset extraction
  // couldn't resolve a local file, fall back to a deterministic
  // picsum.photos placeholder seeded by `${slug}-${idx}` so each
  // section gets a stable image across reloads. The previous version
  // (commit e7761e0) returned null here, which hid the slot entirely
  // and broke the editorial layout.
  const resolvedSrc =
    s.src ||
    placeholderImage(slug, idx, s.free ? 1000 : 1600, s.free ? 1400 : 1200);

  if (s.free) {
    // Free-positioned overlay. Pin width to whatever fraction of the
    // viewport was authored — fall back to a sane default so the image
    // always has a non-zero bounding box (otherwise <img> with no parent
    // width collapses to intrinsic size, which on a position:absolute
    // overlay often ends up zero).
    return (
      <div
        className="ex-image ex-image-free"
        style={{
          position: "absolute",
          top: pct(s.top),
          left: pct(s.left),
          width: s.width ? pct(s.width) : "40%",
          height: s.height ? vh(s.height) : "auto",
          marginTop: s.marginTop ? vh(s.marginTop) : undefined,
          zIndex: 1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedSrc}
          alt={s.alt || ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
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
        src={resolvedSrc}
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

/** Black placeholder rectangle with a ▶ glyph, used in place of an
 *  actual <video> when the source file is missing. Keeps the layout
 *  intact (same aspect ratio) so behaviour parity work isn't blocked. */
function VideoPlaceholder({ heightAttr }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: heightAttr || "56vh",
        background: "#0b0b0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.75)",
        fontSize: 48,
        letterSpacing: "0.05em",
      }}
      aria-label="Video placeholder"
    >
      ▶
    </div>
  );
}

function InlineVideoBlock({ s }) {
  return (
    <section
      className="ex-inline-video"
      style={{
        margin: "12vh auto",
        maxWidth: "min(86vw, 1200px)",
      }}
    >
      {s.src ? (
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
      ) : (
        <VideoPlaceholder heightAttr={s.height ? vh(s.height) : "56vh"} />
      )}
    </section>
  );
}

function VideoBlock({ s }) {
  return (
    <section className="ex-video" style={{ margin: "12vh auto", maxWidth: "min(86vw, 1200px)" }}>
      {s.src ? (
        <video
          src={s.src}
          controls
          poster={s.poster || undefined}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {s.webm && <source src={s.webm} type="video/webm" />}
        </video>
      ) : (
        <VideoPlaceholder heightAttr="56vh" />
      )}
    </section>
  );
}

function PodcastBlock({ s }) {
  // When src is missing we still render the AudioRing ellipse shell so
  // the layout reads. AudioRing's own missing-asset handling (HEAD
  // probe → missing state) keeps clicks as no-ops without console
  // noise. Title + duration come from the Storyblok data even when the
  // audio file itself wasn't captured.
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
        caption={`▷ ${s.duration || "00:00"}`}
        src={s.src || null}
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

export default function ExhibitionSection({ section, slug, idx }) {
  switch (section.kind) {
    case "image":             return <ImageBlock s={section} slug={slug} idx={idx} />;
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
