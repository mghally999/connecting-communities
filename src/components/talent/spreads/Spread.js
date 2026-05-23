"use client";

/**
 * Spread — element-switching renderer for one portfolio "page".
 *
 * Per FOAM_TALENT_SPEC.md §2.5 each spread is a full-viewport stage
 * containing absolutely-positioned elements declared in the artist's
 * `spreads[]` data. `kind` selects the primitive:
 *
 *   image      → <div.spread-image background-image>
 *   title      → <h2.spread-title>
 *   body       → <div.spread-body> (with optional Arabic)
 *   audio      → <AudioRing/>
 *   botanical  → <BotanicalImage/>
 *   quote      → <blockquote.spread-quote>
 */

import React from "react";
import AudioRing from "./AudioRing";
import BotanicalImage from "./BotanicalImage";

function ElementRenderer({ el }) {
  const style = {
    left: el.x, top: el.y, width: el.w, height: el.h,
  };

  switch (el.kind) {
    case "image":
      return (
        <div
          className="spread-element spread-image"
          style={{ ...style, backgroundImage: `url(${el.src})` }}
          role="img"
          aria-label={el.alt || ""}
        />
      );

    case "title":
      return (
        <h2 className="spread-element spread-title" style={style}>
          {el.text?.en}
          {el.text?.subtitle && <small>{el.text.subtitle}</small>}
        </h2>
      );

    case "body":
      return (
        <div className="spread-element spread-body" style={style}>
          {el.text?.en && <p className="en">{el.text.en}</p>}
          {el.text?.ar && <p className="ar">{el.text.ar}</p>}
        </div>
      );

    case "audio":
      return (
        <div className="spread-element" style={style}>
          <AudioRing
            title={el.title}
            caption={el.caption}
            src={el.src}
            duration={el.duration}
          />
        </div>
      );

    case "botanical":
      return (
        <div className="spread-element" style={style}>
          <BotanicalImage src={el.src} alt={el.alt || ""} />
        </div>
      );

    case "quote":
      return (
        <blockquote className="spread-element spread-quote" style={style}>
          {el.text}
        </blockquote>
      );

    default:
      return null;
  }
}

export default function Spread({ data }) {
  if (data.type === "cover") {
    return (
      <section
        className="spread"
        style={{ background: data.bg }}
        aria-label={`Cover — ${data.title}`}
      >
        <div className="spread-element" style={{ left: "8%", top: "10%", width: "84%", height: "80%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.hero}
            alt={data.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="spread-element" style={{ left: "8%", bottom: "8%", width: "60%" }}>
          <h1 className="spread-title" style={{ color: "var(--talent-accent-text)" }}>
            {data.title}
            {data.titleSecondary && (
              <small style={{ direction: "rtl" }}>{data.titleSecondary}</small>
            )}
          </h1>
          <p style={{ marginTop: 18, letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 13 }}>
            {data.artist}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="spread" style={{ background: data.bg }}>
      {data.elements?.map((el, i) => (
        <ElementRenderer key={i} el={el} />
      ))}
    </section>
  );
}
