"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styled, { css, createGlobalStyle, keyframes } from "styled-components";
import SafeBoundary from "@/components/SafeBoundary";
import useChapterSnap from "@/hooks/useChapterSnap";
import { CHAPTERS, BIRDSEYE_HOTSPOTS, ROOM_RECTS_LIST, activeRoomIdAt, activeRoomRectAt } from "@/lib/journey-chapters";

/**
 * OurModelJourney
 *
 * Scroll-pinned, step-snap walkthrough of the hubsite. Eleven
 * chapters, one wheel-tick or swipe per step (see useChapterSnap for
 * the Meroë-style snap controller).
 *
 * Layout:
 *   <Host height: chapters * 55vh>
 *     <Stage position:sticky; top:0; height:100vh>
 *       <Canvas /> + <Captions /> + <Rail /> + <RoomHotspots />
 *     </Stage>
 *   </Host>
 *
 * Active-chapter captions render with a soft "Pyramids of Hero" glow
 * that pulses up as the chapter becomes active, then settles. The
 * bird's-eye chapter (chapter index 1) exposes clickable room hot-spots
 * positioned in world XZ and projected back to screen pixels each
 * frame so they ride the top-down view exactly.
 */

const JourneyScene = dynamic(() => import("./JourneyScene"), {
  ssr: false,
  loading: () => null,
});

const EngagedGlobals = createGlobalStyle`
  header[role="banner"] { opacity: 0 !important; pointer-events: none !important; }
  /* Prevent the browser's scroll anchoring from fighting our snaps. */
  html { overscroll-behavior-y: none; }
`;

/* Host height: `chapterCount * stepVh` (vh). The snap controller's
 * STEP_VH is the source of truth — we read it back here. */
const Host = styled.section`
  position: relative;
  width: 100%;
  height: ${({ $chapters, $stepVh }) => $chapters * $stepVh}vh;
  background: #fff6eb;
`;

const Stage = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fff6eb;
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

/* Pyramids-of-Hero text-glow.
 * When the caption becomes active we run a one-shot ignite animation
 * that drives a soft glow up from 0 to full intensity over ~600ms, then
 * holds. The glow fades out together with the caption opacity. */
const ignite = keyframes`
  0%   { text-shadow: 0 0 0 rgba(253, 192, 120, 0); }
  60%  { text-shadow:
           0 0 8px rgba(255, 220, 160, 0.95),
           0 0 22px rgba(253, 173, 96, 0.85),
           0 0 48px rgba(253, 84, 43, 0.55); }
  100% { text-shadow:
           0 0 4px rgba(255, 220, 160, 0.80),
           0 0 14px rgba(253, 173, 96, 0.55),
           0 0 32px rgba(253, 84, 43, 0.35); }
`;

const captionBase = css`
  position: absolute;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  will-change: opacity, transform;
  transition:
    opacity 460ms cubic-bezier(.22,1,.36,1),
    transform 620ms cubic-bezier(.22,1,.36,1);
  max-width: min(440px, 42vw);
  @media (max-width: 900px) { max-width: 88vw; }
`;

const SideLeft = styled.div`
  ${captionBase};
  top: 50%;
  left: clamp(1.5rem, 5vw, 4.5rem);
  transform: translate(${({ $active }) => ($active ? "0" : "-12px")}, -50%);
  text-align: left;
`;
const SideRight = styled.div`
  ${captionBase};
  top: 50%;
  right: clamp(1.5rem, 5vw, 4.5rem);
  transform: translate(${({ $active }) => ($active ? "0" : "12px")}, -50%);
  text-align: left;
`;
const BottomLeft = styled.div`
  ${captionBase};
  bottom: clamp(2.5rem, 8vw, 6rem);
  left: clamp(1.5rem, 5vw, 4.5rem);
  text-align: left;
  transform: translateY(${({ $active }) => ($active ? "0" : "12px")});
`;
const BottomRight = styled.div`
  ${captionBase};
  bottom: clamp(2.5rem, 8vw, 6rem);
  right: clamp(1.5rem, 5vw, 4.5rem);
  text-align: left;
  transform: translateY(${({ $active }) => ($active ? "0" : "12px")});
`;
const CenterDark = styled.div`
  ${captionBase};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${({ $active }) => ($active ? 1 : 0.98)});
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
  max-width: 22ch;
  ${({ $glowActive }) =>
    $glowActive
      ? css`animation: ${ignite} 760ms cubic-bezier(.22,1,.36,1) forwards;`
      : css`text-shadow:
          0 1px 14px rgba(255,255,255,0.7),
          0 0 4px rgba(255,255,255,0.45);`}
`;

const Body = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 1.05vw, 1.05rem);
  line-height: 1.65;
  max-width: 36ch;
  color: ${({ $dark }) => ($dark ? "rgba(255,255,255,0.9)" : "#1a1a1a")};
  text-shadow: 0 1px 12px rgba(255,255,255,0.7), 0 0 3px rgba(255,255,255,0.4);
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
    transition: transform 220ms cubic-bezier(.22,1,.36,1),
                opacity 220ms cubic-bezier(.22,1,.36,1),
                background 320ms;
  }
  & .ring {
    position: absolute;
    width: 14px; height: 14px;
    border-radius: 999px;
    border: 1px solid ${({ $dark }) => ($dark ? "#fff" : "#1a1a1a")};
    opacity: ${({ $active }) => ($active ? 0.9 : 0)};
    transition: opacity 220ms cubic-bezier(.22,1,.36,1);
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
  transition: opacity 380ms cubic-bezier(.22,1,.36,1);
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

/* Mode toggle that shows only during the bird's-eye chapter.
 * "Scroll" = continue scrolling for the camera to walk through the
 * hub in sequence. "Click" = the hot-spot dots become the primary
 * way to jump to a room. */
const ModeWrap = styled.div`
  position: absolute;
  top: clamp(1.5rem, 4vw, 2.5rem);
  left: 50%;
  transform: translate(-50%, ${({ $show }) => ($show ? "0" : "-12px")});
  z-index: 6;
  display: inline-flex;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  padding: 4px;
  pointer-events: ${({ $show }) => ($show ? "auto" : "none")};
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 380ms cubic-bezier(.22,1,.36,1),
              transform 380ms cubic-bezier(.22,1,.36,1);
  box-shadow: 0 6px 24px rgba(11,16,24,0.10);
`;

const ModeBtn = styled.button`
  border: 0;
  cursor: pointer;
  padding: 0.55rem 1.2rem;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 999px;
  background: ${({ $active, theme }) => ($active ? theme.colors.orange : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "#1a1a1a")};
  transition: background 220ms, color 220ms;
  font-family: inherit;
`;

/* Bird's-eye hot-spot dots. Each dot is positioned in screen pixels
 * via a rAF projection of its world-space XZ onto the canvas. The
 * dots animate in with a ripple when bird's-eye becomes active. */
const ripple = keyframes`
  0%   { transform: scale(0.6); opacity: 0.0; }
  40%  { opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0.0; }
`;

const HotspotsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: ${({ $on }) => ($on ? "auto" : "none")};
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transition: opacity 380ms cubic-bezier(.22,1,.36,1);
`;

const HotspotBtn = styled.button`
  position: absolute;
  transform: translate(-50%, -50%);
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  pointer-events: auto;
  & .core {
    position: relative;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.orange};
    box-shadow: 0 0 0 4px rgba(253, 84, 43, 0.18);
    transition: transform 220ms cubic-bezier(.22,1,.36,1);
  }
  & .core::after {
    content: "";
    position: absolute;
    inset: -14px;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.orange};
    animation: ${ripple} 1.6s ease-out infinite;
  }
  & .lbl {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 6px);
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 700;
    background: rgba(255,255,255,0.95);
    padding: 4px 9px;
    border-radius: 4px;
    color: #1a1a1a;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 220ms;
  }
  &:hover .core { transform: scale(1.18); }
  &:hover .lbl { opacity: 1; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.orange};
    outline-offset: 6px;
    border-radius: 999px;
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
    <Component
      $active={active}
      style={{ opacity: active ? 1 : 0 }}
      aria-hidden={!active}
    >
      <Eyebrow>
        <span className="num">{chapter.eyebrow}</span>
        <span className="bar" />
        {chapter.label}
      </Eyebrow>
      <Title $dark={dark} $glowActive={active && chapter.glow}>
        {chapter.title}
      </Title>
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
    stepVh,
  } = useChapterSnap({ chapterCount: CHAPTERS.length });

  const fallbackRef = useRef(null);
  const stageRef = useRef(null);
  const hotspotsRef = useRef(null);
  const projectionRef = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [mode, setMode] = useState("scroll"); // 'scroll' | 'click'

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

  /* Background tint follows the chapter sample. Uses the same
   * smooth interpolation as the Three.js scene so the fall-back
   * surface (visible during the GLB fetch) matches. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = chapterRef.current ?? 0;
      const i = Math.floor(c);
      const f = c - i;
      const a = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i))];
      const b = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i + 1))];
      const t = f * f * (3 - 2 * f);
      const blend = (ah, bh) => {
        const A = parseInt(ah.replace("#", ""), 16);
        const B = parseInt(bh.replace("#", ""), 16);
        const ar = (A >> 16) & 0xff, ag = (A >> 8) & 0xff, ab = A & 0xff;
        const br = (B >> 16) & 0xff, bg = (B >> 8) & 0xff, bb = B & 0xff;
        return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
      };
      if (fallbackRef.current) {
        fallbackRef.current.style.background = blend(a.bg, b.bg);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chapterRef]);

  /* Per-frame projection of world-space hot-spots → screen pixels.
   * JourneyScene publishes a projection function on the ref each
   * frame; we read it here and pin each dot to the current pixel.
   * This keeps the dots glued to the building even though the scene
   * rotates / scales with chapter progress. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const proj = projectionRef.current;
      const layer = hotspotsRef.current;
      if (proj && layer) {
        const children = layer.children;
        for (let i = 0; i < BIRDSEYE_HOTSPOTS.length; i++) {
          const h = BIRDSEYE_HOTSPOTS[i];
          const node = children[i];
          if (!node) continue;
          const p = proj(h.x, 0, h.z);
          if (p) {
            node.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
            node.style.opacity = p.inFront ? "1" : "0";
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const current = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
  const dark = false;
  const isBird = chapterIndex === 1;

  return (
    <Host
      ref={sectionRef}
      $chapters={CHAPTERS.length}
      $stepVh={stepVh ?? 60}
      aria-label="Hubsite walkthrough"
    >
      {engaged && <EngagedGlobals />}
      <Stage ref={stageRef}>
        <FallbackBg ref={fallbackRef} />

        {shouldMount && webglOk && (
          <CanvasLayer>
            <SafeBoundary fallback={null}>
              <JourneyScene
                chapterRef={chapterRef}
                mouseRef={mouseRef}
                projectionRef={projectionRef}
                rooms={ROOM_RECTS_LIST}
                getActiveRoomId={activeRoomIdAt}
                getActiveRoomRect={activeRoomRectAt}
              />
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
            Scroll to explore
            <span className="arrow" />
          </ScrollHint>
        </Overlay>

        {/* Mode toggle — only meaningful during the bird's-eye chapter. */}
        <ModeWrap $show={isBird} aria-hidden={!isBird}>
          <ModeBtn
            type="button"
            $active={mode === "scroll"}
            onClick={() => setMode("scroll")}
          >
            Scrollytelling
          </ModeBtn>
          <ModeBtn
            type="button"
            $active={mode === "click"}
            onClick={() => setMode("click")}
          >
            Click rooms
          </ModeBtn>
        </ModeWrap>

        {/* Click-mode hot-spots. Visible while bird's-eye is active and
         * the user has switched to click-mode. */}
        <HotspotsLayer
          ref={hotspotsRef}
          $on={isBird && mode === "click"}
          aria-hidden={!(isBird && mode === "click")}
        >
          {BIRDSEYE_HOTSPOTS.map((h) => (
            <HotspotBtn
              key={h.id}
              type="button"
              onClick={() => jumpTo(h.chapter)}
              aria-label={`Jump to ${h.label}`}
            >
              <span className="core" />
              <span className="lbl">{h.label}</span>
            </HotspotBtn>
          ))}
        </HotspotsLayer>
        <TestPanel chapterIndex={chapterIndex} />
      </Stage>
    </Host>
  );
}

/* -------------------------------------------------------------------------- */
/* TestPanel — visible only when ?test=1 is in the URL                         */
/* -------------------------------------------------------------------------- */
/**
 * A tiny fixed-position overlay that shows the active chapter's
 * camera values so you can dial them in without recompiling.
 *
 *   - Arrow Up / Down already jump chapters (via useChapterSnap)
 *   - "Copy snippet" puts a paste-ready block of the chapter on
 *     the clipboard so you can drop the new values straight into
 *     `journey-chapters.js`.
 *
 * Activate by visiting `/our-model?test=1`. The panel itself uses
 * very small inline styles so it never collides with the cinematic
 * styling above.
 */
function TestPanel({ chapterIndex }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setEnabled(sp.get("test") === "1");
  }, []);
  if (!enabled) return null;
  const ch = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
  const snippet = [
    `/* ${ch.eyebrow} — ${ch.label} */`,
    `cam:    { x: ${ch.cam.x.toFixed(2)}, y: ${ch.cam.y.toFixed(2)}, z: ${ch.cam.z.toFixed(2)} },`,
    `target: { x: ${ch.target.x.toFixed(2)}, y: ${ch.target.y.toFixed(2)}, z: ${ch.target.z.toFixed(2)} },`,
    `fov:    ${ch.fov ?? 50},`,
  ].join("\n");
  const onCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(snippet).catch(() => {});
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(13, 18, 24, 0.92)",
        color: "#fff",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.55,
        maxWidth: 360,
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ marginBottom: 6, fontWeight: 700, letterSpacing: "0.05em" }}>
        ch {chapterIndex} · {ch.id}
      </div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11 }}>
{snippet}
      </pre>
      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={onCopy}
          style={{
            background: "#FD8C3B",
            color: "#fff",
            border: 0,
            padding: "5px 9px",
            borderRadius: 6,
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          COPY SNIPPET
        </button>
        <span style={{ opacity: 0.5, fontSize: 10, alignSelf: "center" }}>
          arrow keys to step · ?rot=0/1/2/3 to spin building
        </span>
      </div>
    </div>
  );
}
