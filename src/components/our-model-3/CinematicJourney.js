"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import SafeBoundary from "@/components/SafeBoundary";
import { CINEMATIC_CHAPTERS } from "@/lib/cinematic-chapters";

/**
 * CinematicJourney — host UI for /our-model-3
 *
 * The page deliberately avoids the "scroll-pin-trap" of /our-model.
 * Instead, the entire viewport is a fixed-position stage and a small
 * overlay panel handles chapter advancement:
 *
 *   - Scroll wheel / vertical swipe / arrow keys advance/retreat one
 *     chapter at a time.
 *   - Right-rail dots jump to a specific chapter.
 *   - The Three.js scene smoothly tweens the camera between chapters.
 *
 * This decouples the cinematic playback from the page's normal scroll,
 * which means: no fight with browser scroll restoration, no jankiness
 * on iOS, and the page below the cinematic (just a quiet "Continue"
 * footer link) is reachable without ever needing to trap input.
 *
 * Caption flow:
 *   Each chapter has its own caption block. Only the active chapter's
 *   text is visible — others have opacity 0 and pointer-events: none.
 *   The active caption rides a Pyramids-of-Hero "ignite" animation
 *   that ramps a warm bloom over the title for ~700 ms, then settles.
 */

const CinematicScene = dynamic(() => import("./CinematicScene"), {
  ssr: false,
  loading: () => null,
});

/* ---------------------------------------------------------------------- */
/* Globals — hide the page header while the cinematic is on screen.
   The cinematic owns the full viewport.                                   */
/* ---------------------------------------------------------------------- */

const StageGlobals = createGlobalStyle`
  header[role="banner"] {
    opacity: ${({ $engaged }) => ($engaged ? 0 : 1)} !important;
    pointer-events: ${({ $engaged }) => ($engaged ? "none" : "auto")} !important;
    transition: opacity 320ms ease;
  }
  body { overscroll-behavior-y: none; }
`;

/* ---------------------------------------------------------------------- */
/* Layout                                                                  */
/* ---------------------------------------------------------------------- */

/* The whole cinematic occupies one viewport, fixed. Below it a normal
 * "footer panel" gives the page a way to scroll out into the rest of
 * the site. */
const Page = styled.section`
  position: relative;
  width: 100%;
`;

const Stage = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  background: #0c0d18;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transition: opacity 600ms ease;
`;

/* Spacer so the document still has scrollable height. Once the user
 * has stepped through every chapter, scrolling continues to scroll
 * the page normally (revealing the post-cinematic footer). */
const Spacer = styled.div`
  width: 100%;
  height: 100vh;
  pointer-events: none;
`;

const CanvasLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  & canvas { width: 100% !important; height: 100% !important; display: block; }
`;

/* Top status bar: project mark + chapter counter. */
const TopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 6;
  padding: 1.8rem 2.4rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: rgba(255,255,255,0.85);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  pointer-events: none;
  & .mark {
    font-weight: 700;
  }
  & .ctr {
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
  }
  @media (max-width: 720px) {
    padding: 1.1rem 1.2rem;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
  }
`;

/* Caption — the chapter's title + body block. Visibility is fully
 * driven by `$active` so each chapter has its own complete block. */
const captionBase = css`
  position: absolute;
  pointer-events: none;
  color: #fff;
  max-width: min(540px, 46vw);
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transform: translateY(${({ $active }) => ($active ? "0" : "16px")});
  transition:
    opacity 700ms cubic-bezier(.16,1,.3,1),
    transform 900ms cubic-bezier(.16,1,.3,1);
  z-index: 5;
  @media (max-width: 720px) {
    max-width: 86vw;
  }
`;

const SideLeft = styled.div`
  ${captionBase};
  top: 50%;
  left: 4.5vw;
  transform: translate(${({ $active }) => ($active ? "0" : "-12px")}, -50%);
  @media (max-width: 720px) {
    top: auto;
    bottom: 14vh;
    left: 6vw;
    transform: translateY(${({ $active }) => ($active ? "0" : "16px")});
  }
`;
const SideRight = styled.div`
  ${captionBase};
  top: 50%;
  right: 4.5vw;
  transform: translate(${({ $active }) => ($active ? "0" : "12px")}, -50%);
  @media (max-width: 720px) {
    top: auto;
    bottom: 14vh;
    right: 6vw;
    left: 6vw;
    transform: translateY(${({ $active }) => ($active ? "0" : "16px")});
  }
`;
const CenterBottom = styled.div`
  ${captionBase};
  bottom: 13vh;
  left: 50%;
  transform: translate(-50%, ${({ $active }) => ($active ? "0" : "16px")});
  text-align: center;
  max-width: min(680px, 80vw);
  @media (max-width: 720px) {
    bottom: 16vh;
  }
`;

const Eyebrow = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: #ffba78;
  font-weight: 600;
  margin-bottom: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  & .bar {
    width: 32px;
    height: 1px;
    background: #ffba78;
    display: inline-block;
  }
`;

const ignite = keyframes`
  0%   {
    text-shadow:
      0 0 0 rgba(255, 188, 120, 0);
    color: rgba(255,255,255,0.62);
  }
  55%  {
    text-shadow:
      0 0 14px rgba(255, 220, 170, 0.95),
      0 0 32px rgba(255, 168, 92, 0.85),
      0 0 68px rgba(255, 120, 60, 0.55);
    color: #fff;
  }
  100% {
    text-shadow:
      0 0 6px rgba(255, 220, 170, 0.75),
      0 0 20px rgba(255, 168, 92, 0.5),
      0 0 44px rgba(255, 120, 60, 0.32);
    color: #fff;
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.85rem, 3.4vw, 2.85rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1.08;
  letter-spacing: -0.012em;
  margin: 0 0 1.1rem 0;
  color: #fff;
  ${({ $active }) =>
    $active &&
    css`animation: ${ignite} 950ms cubic-bezier(.16,1,.3,1) forwards;`}
`;

const Body = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(0.95rem, 1.05vw, 1.07rem);
  line-height: 1.62;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  max-width: 38ch;
  text-shadow:
    0 2px 14px rgba(0,0,0,0.45),
    0 0 24px rgba(0,0,0,0.25);
`;

/* Right-side rail of dots, plus a continuous progress line. */
const Rail = styled.div`
  position: absolute;
  top: 50%;
  right: 1.4rem;
  transform: translateY(-50%);
  z-index: 7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  pointer-events: auto;
  @media (max-width: 720px) { display: none; }
`;

const RailLine = styled.div`
  position: absolute;
  right: 5px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: rgba(255, 255, 255, 0.18);
  z-index: -1;
`;

const RailFill = styled.div`
  position: absolute;
  right: 4px;
  top: 6px;
  width: 3px;
  background: linear-gradient(180deg, rgba(255,186,120,0.0) 0%, #ffba78 35%, #ffba78 80%, rgba(255,186,120,0.0) 100%);
  border-radius: 2px;
  height: ${({ $pct }) => `${$pct * 100}%`};
  max-height: 100%;
  transition: height 1100ms cubic-bezier(.16,1,.3,1);
  pointer-events: none;
`;

const Dot = styled.button`
  position: relative;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  & .inner {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#ffba78" : "rgba(255,255,255,0.55)")};
    transform: scale(${({ $active }) => ($active ? 1.65 : 1)});
    transition:
      background 360ms cubic-bezier(.16,1,.3,1),
      transform 360ms cubic-bezier(.16,1,.3,1);
    box-shadow: ${({ $active }) => ($active ? "0 0 12px rgba(255,186,120,0.7)" : "none")};
  }
  & .label {
    position: absolute;
    right: 22px;
    white-space: nowrap;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.66rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    color: rgba(255,255,255,0.92);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: translateX(${({ $active }) => ($active ? 0 : "6px")});
    transition: opacity 320ms ease, transform 320ms ease;
    pointer-events: none;
  }
`;

/* Bottom-centre cue + controls. */
const Cue = styled.div`
  position: absolute;
  left: 50%;
  bottom: 2.2rem;
  transform: translateX(-50%);
  z-index: 7;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  pointer-events: auto;
  @media (max-width: 720px) {
    bottom: 1.4rem;
    gap: 0.7rem;
  }
`;

const cueBtnFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(4px); }
`;

const CueBtn = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 220ms ease, border-color 220ms ease;
  &:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255,255,255,0.4); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  & svg { width: 18px; height: 18px; }
`;

const CueHint = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  white-space: nowrap;
  & .arrow {
    display: inline-block;
    margin-left: 0.6rem;
    animation: ${cueBtnFloat} 1.8s ease-in-out infinite;
  }
`;

/* Mute toggle for ambient audio. */
const Mute = styled.button`
  position: absolute;
  top: 1.8rem;
  right: 2rem;
  z-index: 8;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  & svg { width: 14px; height: 14px; }
  &:hover { background: rgba(255,255,255,0.12); }
  @media (max-width: 720px) {
    top: 1.1rem; right: 1.1rem;
    width: 32px; height: 32px;
  }
`;

/* Post-cinematic footer panel — appears after the last chapter when
 * the user keeps scrolling. Just a quiet exit from the experience. */
const Footer = styled.div`
  position: relative;
  z-index: 2;
  background: #0c0d18;
  color: #fff;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 4rem 2rem;
  text-align: center;
  & .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #ffba78;
    font-weight: 600;
    margin-bottom: 1.4rem;
  }
  & h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin: 0 0 1rem 0;
    line-height: 1.15;
  }
  & p {
    max-width: 56ch;
    margin: 0 0 2rem 0;
    line-height: 1.65;
    color: rgba(255,255,255,0.78);
  }
  & a {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1.5rem;
    border: 1px solid #ffba78;
    border-radius: 999px;
    color: #ffba78;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.72rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    font-weight: 700;
    transition: background 240ms ease, color 240ms ease;
  }
  & a:hover { background: #ffba78; color: #0c0d18; }
`;

/* ---------------------------------------------------------------------- */
/* Component                                                                */
/* ---------------------------------------------------------------------- */

function CaptionFor({ chapter, active }) {
  const inner = (
    <>
      <Eyebrow>
        <span className="bar" />
        {chapter.eyebrow}
      </Eyebrow>
      <Title $active={active}>{chapter.title}</Title>
      <Body>{chapter.body}</Body>
    </>
  );
  if (chapter.layout === "center-bottom") return <CenterBottom $active={active}>{inner}</CenterBottom>;
  if (chapter.layout === "side-right") return <SideRight $active={active}>{inner}</SideRight>;
  return <SideLeft $active={active}>{inner}</SideLeft>;
}

export default function CinematicJourney() {
  const targetRef = useRef(0);
  const progressRef = useRef(0);
  const stateRef = useRef({});

  const [chapter, setChapter] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);

  /* Track previous chapter to know which way the title igniter should
   * fire. The ignite animation only runs when chapter actually changes. */
  const [igniteKey, setIgniteKey] = useState(0);

  /* Gesture/scroll-driven chapter advancement.
   * We bind a wheel/touch/key listener at the document level. */
  const lastInputAtRef = useRef(0);
  const inputBusyRef = useRef(false);
  const touchYRef = useRef(null);

  const N = CINEMATIC_CHAPTERS.length;

  const advance = useCallback(
    (delta) => {
      const now = performance.now();
      if (inputBusyRef.current) return;
      if (now - lastInputAtRef.current < 360) return;
      lastInputAtRef.current = now;
      inputBusyRef.current = true;
      setChapter((c) => {
        const next = Math.max(0, Math.min(N - 1, c + delta));
        if (next !== c) {
          targetRef.current = next;
          setIgniteKey((k) => k + 1);
        }
        return next;
      });
      window.setTimeout(() => { inputBusyRef.current = false; }, 580);
    },
    [N]
  );

  const jumpTo = useCallback(
    (i) => {
      const next = Math.max(0, Math.min(N - 1, i));
      setChapter(next);
      targetRef.current = next;
      setIgniteKey((k) => k + 1);
    },
    [N]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Input handling — wheel, keys, touch. We deliberately don't trap
   * the scroll. Once the user has reached the last chapter and keeps
   * scrolling down, regular page scroll takes over. */
  useEffect(() => {
    if (!mounted) return;
    let touching = false;
    let gestureGap = 0;

    const onWheel = (e) => {
      /* Inside the cinematic stage, prevent the page from scrolling
       * past the fixed stage until the user has reached the final
       * chapter. After that, let scroll fall through. */
      const reachedEnd = targetRef.current >= N - 1;
      const goingDown = e.deltaY > 0;
      if (!(reachedEnd && goingDown) && !(!goingDown && targetRef.current <= 0)) {
        e.preventDefault();
      }
      /* Gesture-end detection — same approach as Model 1. */
      const now = performance.now();
      if (now - gestureGap > 280) {
        if (Math.abs(e.deltaY) > 4) {
          advance(e.deltaY > 0 ? 1 : -1);
        }
      }
      gestureGap = now;
    };

    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        advance(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        advance(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        jumpTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        jumpTo(N - 1);
      }
    };

    const onTouchStart = (e) => {
      touching = true;
      touchYRef.current = e.touches?.[0]?.clientY ?? null;
    };
    const onTouchMove = (e) => {
      if (!touching || touchYRef.current == null) return;
      const y = e.touches?.[0]?.clientY ?? null;
      if (y == null) return;
      const dy = touchYRef.current - y;
      if (Math.abs(dy) > 26) {
        e.preventDefault();
        advance(dy > 0 ? 1 : -1);
        touchYRef.current = y;
      }
    };
    const onTouchEnd = () => {
      touching = false;
      touchYRef.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [advance, jumpTo, mounted, N]);

  /* Ambient audio. We build a tiny WebAudio loop — a slow filtered
   * noise + soft sine drones — so we don't have to ship an audio
   * asset. Mute by default; the user toggles. */
  const audioRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (muted) {
      if (audioRef.current) {
        try { audioRef.current.ctx.suspend(); } catch (e) {}
      }
      return;
    }
    if (!audioRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const out = ctx.createGain();
        out.gain.value = 0.0;
        out.connect(ctx.destination);
        out.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.6);
        /* Slow drone — a couple of detuned sines. */
        const o1 = ctx.createOscillator();
        o1.type = "sine"; o1.frequency.value = 110;
        const o2 = ctx.createOscillator();
        o2.type = "sine"; o2.frequency.value = 164.81;
        const g1 = ctx.createGain(); g1.gain.value = 0.45;
        const g2 = ctx.createGain(); g2.gain.value = 0.32;
        o1.connect(g1).connect(out);
        o2.connect(g2).connect(out);
        o1.start(); o2.start();
        /* Noise wash through a low-pass — wind-like ambience. */
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
        const src = ctx.createBufferSource();
        src.buffer = buffer; src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass"; filter.frequency.value = 480;
        const gN = ctx.createGain(); gN.gain.value = 0.5;
        src.connect(filter).connect(gN).connect(out);
        src.start();
        audioRef.current = { ctx, out };
      } catch (e) {
        /* Audio init can fail (autoplay policy, etc) — silently skip. */
      }
    } else {
      try { audioRef.current.ctx.resume(); } catch (e) {}
    }
  }, [muted]);

  const ch = CINEMATIC_CHAPTERS[chapter];
  const railFillPct = N <= 1 ? 0 : chapter / (N - 1);

  return (
    <Page>
      <StageGlobals $engaged={mounted} />
      <Stage $on={mounted}>
        <CanvasLayer>
          <SafeBoundary fallback={null}>
            <CinematicScene
              targetRef={targetRef}
              progressRef={progressRef}
              stateRef={stateRef}
            />
          </SafeBoundary>
        </CanvasLayer>

        <TopBar>
          <div className="mark">Connecting Communities — Cinematic</div>
          <div className="ctr">
            {String(chapter + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </div>
        </TopBar>

        <Mute
          type="button"
          aria-label={muted ? "Unmute ambient" : "Mute ambient"}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4z"/>
              <path d="M23 9l-6 6M17 9l6 6"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4z"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          )}
        </Mute>

        {CINEMATIC_CHAPTERS.map((c, i) => (
          <CaptionFor
            key={c.id + "-" + (i === chapter ? igniteKey : "off")}
            chapter={c}
            active={i === chapter}
          />
        ))}

        <Rail>
          <RailLine />
          <RailFill $pct={railFillPct} />
          {CINEMATIC_CHAPTERS.map((c, i) => (
            <Dot
              key={c.id}
              $active={i === chapter}
              onClick={() => jumpTo(i)}
              aria-label={`Jump to chapter ${i + 1}: ${c.label}`}
            >
              <span className="label">{c.label}</span>
              <span className="inner" />
            </Dot>
          ))}
        </Rail>

        <Cue>
          <CueBtn
            type="button"
            onClick={() => advance(-1)}
            disabled={chapter === 0}
            aria-label="Previous chapter"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </CueBtn>
          <CueHint>
            {chapter === N - 1 ? "Scroll to continue" : "Scroll · Arrow · Swipe"}
            {chapter !== N - 1 && <span className="arrow">↓</span>}
          </CueHint>
          <CueBtn
            type="button"
            onClick={() => advance(1)}
            disabled={chapter === N - 1}
            aria-label="Next chapter"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </CueBtn>
        </Cue>
      </Stage>

      <Spacer />

      {/* After the cinematic, an exit panel. The user scrolls past
       * the last chapter and lands here. */}
      <Footer>
        <div className="eyebrow">Want to explore the model differently?</div>
        <h3>Three windows into the same building</h3>
        <p>
          The cinematic above is one way in. Our scroll-driven walkthrough
          frames each room with text captions; our click-to-walk explorer
          lets you step between spaces at your own pace.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/our-model">Walkthrough</a>
          <a href="/our-model-2">Explorer</a>
        </div>
      </Footer>
    </Page>
  );
}
