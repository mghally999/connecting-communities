"use client";

/**
 * AudioRing — the ellipse-shaped player used inside artist portfolios.
 *
 * Per FOAM_TALENT_SPEC.md §2.5:
 *  - 480×320 ellipse (3:2), 1-px stroke in currentColor.
 *  - Inside: 24-px headphone glyph, caption text, and "▷ MM:SS" at the
 *    bottom.
 *  - Click → start playback. The ellipse stroke becomes a progress arc
 *    drawn anti-clockwise from the bottom centre using stroke-dasharray.
 *    The play triangle swaps to a pause bar.
 *  - When the track ends the arc retracts and the triangle returns.
 *
 * Implementation uses an HTMLAudioElement with a rAF loop to update the
 * dasharray. No external library — keeps the bundle lean.
 */

import React, { useEffect, useRef, useState } from "react";

const W = 480;
const H = 320;
const CX = W / 2;
const CY = H / 2;
const RX = (W - 4) / 2;
const RY = (H - 4) / 2;

// Approximate the ellipse perimeter with Ramanujan's formula
function ellipsePerimeter(rx, ry) {
  const h = ((rx - ry) ** 2) / ((rx + ry) ** 2);
  return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

export default function AudioRing({ title, caption, src, duration = 0 }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [knownDuration, setKnownDuration] = useState(duration);
  /* When the underlying file 404s (or any other media error fires) we
   * flip into "missing" mode: clicks become no-ops, no play indicator
   * appears, the ring stays static. Nothing is logged to the console —
   * by design, since the spec author plans to drop real assets in and
   * a noisy console during that process is just annoying. */
  const [missing, setMissing] = useState(false);

  const perimeter = ellipsePerimeter(RX, RY);
  const dashOffset = perimeter * (1 - progress);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => setKnownDuration(a.duration || duration);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    const onError = (e) => {
      /* Swallow the error event without touching the console. The
       * HTMLMediaElement spec fires 'error' for 404, decode failures,
       * format mismatches, etc. — we treat them all the same: degrade. */
      e?.stopImmediatePropagation?.();
      setMissing(true);
      setPlaying(false);
    };
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [duration]);

  /* Probe the source with a HEAD request the first time it's referenced
   * so a 404 short-circuits us before the user even clicks. We deliberately
   * suppress fetch errors — a CORS or network blip just means we'll fall
   * back to the media element's own error handler later. */
  useEffect(() => {
    if (!src) { setMissing(true); return; }
    let alive = true;
    fetch(src, { method: "HEAD" })
      .then((r) => { if (alive && !r.ok) setMissing(true); })
      .catch(() => {});
    return () => { alive = false; };
  }, [src]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const a = audioRef.current;
      if (!a) return;
      const d = a.duration || knownDuration;
      if (d > 0) setProgress(Math.max(0, Math.min(1, a.currentTime / d)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, knownDuration]);

  const onClick = async () => {
    if (missing) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      if (playing) { a.pause(); setPlaying(false); }
      else         { await a.play(); setPlaying(true); }
    } catch {
      /* Most commonly thrown when autoplay policy blocks playback or
       * the file isn't decodable — either way, behave as if absent. */
      setMissing(true);
      setPlaying(false);
    }
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return "--:--";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  return (
    <button
      type="button"
      className="audio-ring"
      onClick={onClick}
      aria-label={`${playing ? "Pause" : "Play"} ${title || "audio"}`}
      aria-pressed={playing}
    >
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <ellipse className="ring-track" cx={CX} cy={CY} rx={RX} ry={RY} strokeWidth="1" />
        <ellipse
          className="ring-progress"
          cx={CX} cy={CY} rx={RX} ry={RY}
          strokeWidth="1.4"
          strokeDasharray={perimeter}
          strokeDashoffset={dashOffset}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* Headphone glyph */}
        <g transform={`translate(${CX - 12} ${CY - 70})`}>
          <path
            d="M2 16a10 10 0 1 1 20 0v6a2 2 0 0 1-2 2h-2v-8h4M2 16v6a2 2 0 0 0 2 2h2v-8H2"
            fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
          />
        </g>

        {/* Caption / subline */}
        <text
          x={CX} y={CY - 12}
          textAnchor="middle"
          className="ring-cap"
          fill="currentColor"
        >
          {title || ""}
        </text>
        <foreignObject x={CX - 140} y={CY} width={280} height={64}>
          <div
            style={{
              font: "13px/1.4 var(--font-stolzl), sans-serif",
              textAlign: "center",
              color: "currentColor",
              opacity: 0.85,
            }}
          >
            {caption || ""}
          </div>
        </foreignObject>

        {/* Play indicator bottom-centre — hidden when audio is missing */}
        {!missing && (
          <g transform={`translate(${CX} ${CY + 86})`}>
            {playing ? (
              <g>
                <rect x="-7" y="-7" width="4"  height="14" fill="currentColor" />
                <rect x="3"  y="-7" width="4"  height="14" fill="currentColor" />
              </g>
            ) : (
              <polygon points="-6,-7 6,0 -6,7" fill="currentColor" />
            )}
            <text x="20" y="5" fill="currentColor" fontSize="13" letterSpacing="0.06em">
              {fmt(knownDuration)}
            </text>
          </g>
        )}
      </svg>

      {/* Only mount the <audio> element when we have a candidate src that
       * hasn't already been ruled out — keeps the network panel quiet. */}
      {!missing && src && (
        <audio ref={audioRef} src={src} preload="none" />
      )}
    </button>
  );
}
