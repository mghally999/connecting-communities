"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styled, { css, createGlobalStyle } from "styled-components";
import SafeBoundary from "@/components/SafeBoundary";
import useChapterSnap from "@/hooks/useChapterSnap";
import { CHAPTERS } from "@/lib/journey-chapters";

/**
 * OurModelJourney
 *
 * Pinned cinematic walkthrough — engagement-locked snap navigation.
 * Globe intro → architectural building walkthrough.
 *
 * Behaviour:
 *   - Section is `position: relative; height: 100vh` in document flow.
 *   - When the section reaches viewport top, useChapterSnap engages:
 *     locks page scroll, switches stage to position:fixed.
 *   - One wheel/touch gesture = one chapter step. ~850ms eased
 *     transition. Mouse parallax tilts the camera subtly.
 *   - Boundary release at first/last chapter resumes natural page scroll.
 */

const JourneyScene = dynamic(() => import("./JourneyScene"), {
  ssr: false,
  loading: () => null,
});

const EngagedGlobals = createGlobalStyle`
  body { overflow: hidden !important; }
  header[role="banner"] { opacity: 0 !important; pointer-events: none !important; }
`;

const Host = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  background: #04060a;
`;

const Stage = styled.div`
  position: ${({ $engaged }) => ($engaged ? "fixed" : "absolute")};
  inset: 0;
  z-index: ${({ $engaged }) => ($engaged ? 999 : 1)};
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #04060a;
`;

const CanvasLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  & canvas { width: 100% !important; height: 100% !important; display: block; }
`;

const FallbackBg = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
`;

const captionBase = css`
  position: absolute;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  will-change: opacity;
  transition: opacity 540ms cubic-bezier(.22,1,.36,1);
  max-width: min(440px, 42vw);
  @media (max-width: 900px) { max-width: 88vw; }
`;

const SideLeft = styled.div`
  ${captionBase};
  top: 50%;
  left: clamp(1.5rem, 5vw, 4.5rem);
  transform: translateY(-50%);
  text-align: left;
`;
const SideRight = styled.div`
  ${captionBase};
  top: 50%;
  right: clamp(1.5rem, 5vw, 4.5rem);
  transform: translateY(-50%);
  text-align: left;
`;
const BottomLeft = styled.div`
  ${captionBase};
  bottom: clamp(2.5rem, 8vw, 6rem);
  left: clamp(1.5rem, 5vw, 4.5rem);
  text-align: left;
`;
const BottomRight = styled.div`
  ${captionBase};
  bottom: clamp(2.5rem, 8vw, 6rem);
  right: clamp(1.5rem, 5vw, 4.5rem);
  text-align: left;
`;
const CenterDark = styled.div`
  ${captionBase};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  align-items: center;
  max-width: min(720px, 80vw);
`;

const Eyebrow = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.orange};
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  & .num { opacity: 0.7; }
  & .bar {
    display: inline-block;
    width: 36px; height: 1px;
    background: ${({ theme }) => theme.colors.orange};
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.7rem, 3.2vw, 2.6rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin: 0 0 1rem 0;
  color: ${({ $dark }) => ($dark ? "#fff" : "#1a1a1a")};
  text-shadow: ${({ $dark }) =>
    $dark
      ? "0 2px 24px rgba(0,0,0,0.5)"
      : "0 1px 14px rgba(255,255,255,0.7), 0 0 4px rgba(255,255,255,0.45)"};
  max-width: 22ch;
`;

const Body = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 1.05vw, 1.05rem);
  line-height: 1.65;
  max-width: 36ch;
  color: ${({ $dark }) => ($dark ? "rgba(255,255,255,0.9)" : "#1a1a1a")};
  text-shadow: ${({ $dark }) =>
    $dark
      ? "0 2px 24px rgba(0,0,0,0.5)"
      : "0 1px 12px rgba(255,255,255,0.7), 0 0 3px rgba(255,255,255,0.4)"};
  font-weight: 500;
`;

const Rail = styled.div`
  position: absolute;
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  pointer-events: auto;
  @media (max-width: 768px) { display: none; }
`;
const RailLabel = styled.div`
  position: absolute;
  right: 22px;
  top: -36px;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $dark }) => ($dark ? "#fff" : "#1a1a1a")};
  opacity: 0.85;
  transition: color 320ms;
`;
const RailLine = styled.div`
  position: absolute;
  right: 6px;
  top: 8px; bottom: 8px;
  width: 1px;
  background: ${({ $dark }) =>
    $dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)"};
  z-index: -1;
`;
const Dot = styled.button`
  position: relative;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  width: 14px; height: 14px;
  display: flex; align-items: center; justify-content: center;
  & .inner {
    width: 8px; height: 8px;
    border-radius: 999px;
    background: ${({ $dark }) => ($dark ? "#fff" : "#1a1a1a")};
    transform: scale(${({ $active }) => ($active ? 1.5 : 1)});
    opacity: ${({ $active }) => ($active ? 1 : 0.4)};
    transition: transform 280ms cubic-bezier(.22,1,.36,1),
                opacity 280ms cubic-bezier(.22,1,.36,1),
                background 320ms;
  }
  & .ring {
    position: absolute;
    width: 14px; height: 14px;
    border-radius: 999px;
    border: 1px solid ${({ $dark }) => ($dark ? "#fff" : "#1a1a1a")};
    opacity: ${({ $active }) => ($active ? 0.9 : 0)};
    transition: opacity 280ms cubic-bezier(.22,1,.36,1);
  }
`;

const ScrollHint = styled.div`
  position: absolute;
  left: 50%;
  bottom: 2.2rem;
  transform: translateX(-50%);
  z-index: 4;
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ $dark }) => ($dark ? "#fff" : "#1a1a1a")};
  display: flex; flex-direction: column; align-items: center;
  gap: 0.6rem;
  pointer-events: none;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 480ms cubic-bezier(.22,1,.36,1);
  & .arrow {
    width: 1px; height: 28px;
    background: currentColor;
    position: relative;
    animation: nudge 1.8s ease-in-out infinite;
  }
  & .arrow::after {
    content: "";
    position: absolute;
    bottom: 0; left: 50%;
    width: 8px; height: 8px;
    border-right: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: translate(-50%, 4px) rotate(45deg);
  }
  @keyframes nudge {
    0%, 100% { transform: translateY(0);   opacity: 0.6; }
    50%      { transform: translateY(6px); opacity: 1;   }
  }
`;

function detectWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

function CaptionFor({ chapter, dark, active }) {
  const Component =
    chapter.layout === "side-right"     ? SideRight :
    chapter.layout === "bottom-left"    ? BottomLeft :
    chapter.layout === "bottom-right"   ? BottomRight :
    chapter.layout === "text-only-dark" ? CenterDark :
    SideLeft;

  return (
    <Component style={{ opacity: active ? 1 : 0 }} aria-hidden={!active}>
      <Eyebrow>
        <span className="num">{chapter.eyebrow}</span>
        <span className="bar" />
        {chapter.label}
      </Eyebrow>
      <Title $dark={dark}>{chapter.title}</Title>
      <Body $dark={dark}>{chapter.body}</Body>
    </Component>
  );
}

export default function OurModelJourney() {
  const {
    sectionRef,
    chapterRef,
    chapterIndex,
    mouseRef,
    jumpTo,
    engaged,
  } = useChapterSnap({
    chapterCount: CHAPTERS.length,
    transitionMs: 850,
    pauseAfterMs: 120,
    wheelThresholdPx: 18,
    reengageCooldownMs: 600,
  });

  const fallbackRef = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => { setWebglOk(detectWebGL()); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.5) setShouldMount(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [sectionRef]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = chapterRef.current ?? 0;
      const i = Math.floor(c);
      const f = c - i;
      const a = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i))];
      const b = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i + 1))];
      const blend = (ah, bh, t) => {
        const A = parseInt(ah.replace("#", ""), 16);
        const B = parseInt(bh.replace("#", ""), 16);
        const ar = (A >> 16) & 0xff, ag = (A >> 8) & 0xff, ab = A & 0xff;
        const br = (B >> 16) & 0xff, bg = (B >> 8) & 0xff, bb = B & 0xff;
        return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
      };
      if (fallbackRef.current) {
        fallbackRef.current.style.background = blend(a.bg, b.bg, f);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chapterRef]);

  const current = CHAPTERS[chapterIndex];
  const dark = current.bg === "#0a0d12" || current.bg === "#04060a" || current.bg === "#080d18";

  return (
    <Host ref={sectionRef} aria-label="Hubsite walkthrough">
      {engaged && <EngagedGlobals />}
      <Stage $engaged={engaged}>
        <FallbackBg ref={fallbackRef} />

        {shouldMount && webglOk && (
          <CanvasLayer>
            <SafeBoundary fallback={null}>
              <JourneyScene chapterRef={chapterRef} mouseRef={mouseRef} />
            </SafeBoundary>
          </CanvasLayer>
        )}

        <Overlay>
          {CHAPTERS.map((ch, i) => (
            <CaptionFor
              key={ch.id}
              chapter={ch}
              dark={dark}
              active={i === chapterIndex}
            />
          ))}

          <Rail>
            <RailLabel $dark={dark}>{current.label}</RailLabel>
            <RailLine $dark={dark} />
            {CHAPTERS.map((ch, i) => (
              <Dot
                key={ch.id}
                $active={i === chapterIndex}
                $dark={dark}
                onClick={() => jumpTo(i)}
                aria-label={`Jump to ${ch.label}`}
              >
                <span className="ring" />
                <span className="inner" />
              </Dot>
            ))}
          </Rail>

          <ScrollHint $show={engaged && chapterIndex === 0} $dark={dark}>
            Scroll to step
            <span className="arrow" />
          </ScrollHint>
        </Overlay>
      </Stage>
    </Host>
  );
}
