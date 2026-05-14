"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import styled, { keyframes, css } from "styled-components";
import SafeBoundary from "@/components/SafeBoundary";
import { ROOMS, ROOM_ORDER } from "./rooms";

/**
 * RoomExperience
 *
 * "Step inside the building" — adapted from the drake-related.com
 * pattern. Instead of scrolling a cinematic, the user clicks beacons
 * floating in 3D over the building, and the camera "walks" to the
 * new room (1.1 s easeInOutCubic tween). URL fragment carries the
 * active room so links are shareable.
 */

const RoomScene = dynamic(() => import("./RoomScene"), {
  ssr: false,
  loading: () => null,
});

const Host = styled.section`
  position: relative;
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

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
`;

const TopBar = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: clamp(1rem, 2vw, 1.5rem) clamp(1.5rem, 4vw, 3rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
  pointer-events: auto;
  color: #fff;
  & .brand {
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.9;
  }
  & .now {
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 0.6rem 1rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  20%  { opacity: 0.85; }
  100% { transform: scale(2.0); opacity: 0; }
`;
const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(0.6); }
`;

const BeaconLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
`;

const beaconBase = css`
  position: absolute;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  padding: 0;
  width: 56px;
  height: 56px;
  cursor: pointer;
  color: #fff;
  font-family: inherit;
  pointer-events: auto;
  transform: translate(-50%, -50%);
  transition: opacity 240ms cubic-bezier(.22,1,.36,1);
`;

const ArrowBeacon = styled.button`
  ${beaconBase};
  & .pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.95);
    background: rgba(0,0,0,0.18);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    color: #fff;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    text-shadow: 0 0 10px rgba(0,0,0,0.35);
    overflow: hidden;
  }
  & .arrow { display: inline-block; }
  & .label {
    display: inline-block;
    max-width: 0;
    margin-left: 0;
    opacity: 0;
    white-space: nowrap;
    overflow: hidden;
    transition:
      max-width 380ms cubic-bezier(.22,1,.36,1),
      margin-left 380ms cubic-bezier(.22,1,.36,1),
      opacity 380ms cubic-bezier(.22,1,.36,1);
  }
  &:hover .label, &:focus-visible .label {
    max-width: 200px;
    margin-left: 8px;
    opacity: 1;
  }
`;

const CircleBeacon = styled.button`
  ${beaconBase};
  & .dot {
    width: 12px; height: 12px; border-radius: 999px;
    background: ${({ theme }) => theme.colors.orange};
    box-shadow: 0 0 12px 4px rgba(0,0,0,0.25);
    animation: ${breathe} 3.6s cubic-bezier(.22,1,.36,1) infinite;
    position: relative;
    z-index: 1;
  }
  & .ring {
    position: absolute;
    width: 12px; height: 12px;
    border-radius: 999px;
    background: rgba(253,84,43,0.18);
    border: 1px solid ${({ theme }) => theme.colors.orange};
    animation: ${pulseRing} 3.6s cubic-bezier(.5,1,.89,1) infinite;
  }
  & .tooltip {
    position: absolute;
    top: calc(50% + 22px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.78);
    color: #fff;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 220ms;
    pointer-events: none;
  }
  &:hover .tooltip, &:focus-visible .tooltip { opacity: 1; }
`;

const Card = styled.div`
  position: absolute;
  left: clamp(1.5rem, 4vw, 3rem);
  bottom: clamp(2rem, 6vw, 4rem);
  width: min(380px, 80vw);
  background: rgba(13, 18, 24, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 14px;
  padding: 1.4rem 1.5rem;
  color: #fff;
  pointer-events: auto;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: translateY(${({ $show }) => ($show ? "0" : "10px")});
  transition:
    opacity 360ms cubic-bezier(.22,1,.36,1),
    transform 420ms cubic-bezier(.22,1,.36,1);
  & .eye {
    font-size: 0.7rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.orange};
    margin-bottom: 0.6rem;
  }
  & h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.4rem;
    margin: 0 0 0.6rem 0;
    line-height: 1.15;
    color: #fff;
  }
  & p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.55;
    color: rgba(255,255,255,0.85);
  }
`;

const SwitcherWrap = styled.nav`
  position: absolute;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1.5rem, 4vw, 2.5rem);
  z-index: 5;
  pointer-events: auto;
  display: flex;
  gap: 0.4rem;
  padding: 0.4rem;
  border-radius: 999px;
  background: rgba(13,18,24,0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  max-width: 95vw;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const SwitcherBtn = styled.button`
  border: 0;
  background: ${({ $active, theme }) => ($active ? theme.colors.orange : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "rgba(255,255,255,0.78)")};
  padding: 0.55rem 1.0rem;
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: background 240ms, color 240ms;
  &:hover { color: #fff; }
`;

const Hint = styled.div`
  position: absolute;
  top: 50%;
  right: clamp(1rem, 3vw, 2.5rem);
  transform: translateY(-50%);
  z-index: 3;
  pointer-events: none;
  color: #fff;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.65;
  writing-mode: vertical-rl;
  text-orientation: mixed;
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

export default function RoomExperience() {
  const [roomId, setRoomId] = useState("front");
  const [webglOk, setWebglOk] = useState(true);
  const beaconsLayerRef = useRef(null);
  const projectionRef = useRef(null);

  const cameraStateRef = useRef({
    camX: -2.0, camY: 2.6, camZ: 11.0,
    tgtX: 0.5, tgtY: 1.4, tgtZ: 0,
    fov: 55,
  });

  useEffect(() => { setWebglOk(detectWebGL()); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const h = (window.location.hash || "").replace("#", "");
      setRoomId(ROOMS[h] ? h : "front");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const r = ROOMS[roomId] || ROOMS.front;
    const TWEEN_MS = 1100;
    const start = { ...cameraStateRef.current };
    const end = {
      camX: r.cam.x, camY: r.cam.y, camZ: r.cam.z,
      tgtX: r.target.x, tgtY: r.target.y, tgtZ: r.target.z,
      fov: r.fov ?? 50,
    };
    const t0 = performance.now();
    let raf = 0;
    const ease = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - t0) / TWEEN_MS);
      const k = ease(t);
      cameraStateRef.current.camX = start.camX + (end.camX - start.camX) * k;
      cameraStateRef.current.camY = start.camY + (end.camY - start.camY) * k;
      cameraStateRef.current.camZ = start.camZ + (end.camZ - start.camZ) * k;
      cameraStateRef.current.tgtX = start.tgtX + (end.tgtX - start.tgtX) * k;
      cameraStateRef.current.tgtY = start.tgtY + (end.tgtY - start.tgtY) * k;
      cameraStateRef.current.tgtZ = start.tgtZ + (end.tgtZ - start.tgtZ) * k;
      const startFov = start.fov ?? 50;
      cameraStateRef.current.fov = startFov + (end.fov - startFov) * k;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [roomId]);

  /* Beacon projection rAF — pin HTML beacons to their world coords. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const proj = projectionRef.current;
      const layer = beaconsLayerRef.current;
      if (proj && layer) {
        const r = ROOMS[roomId] || ROOMS.front;
        const children = layer.children;
        const beacons = r.beacons || [];
        for (let i = 0; i < beacons.length; i++) {
          const b = beacons[i];
          const node = children[i];
          if (!node) continue;
          const p = proj(b.x, b.y, b.z);
          if (p) {
            node.style.left = `${p.x}px`;
            node.style.top = `${p.y}px`;
            node.style.opacity = p.inFront ? "1" : "0";
            node.style.pointerEvents = p.inFront ? "auto" : "none";
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [roomId]);

  const room = ROOMS[roomId] || ROOMS.front;

  const go = useCallback((target) => {
    if (target && ROOMS[target]) {
      window.location.hash = target;
    }
  }, []);

  return (
    <Host aria-label="Hubsite room explorer">
      {webglOk && (
        <CanvasLayer>
          <SafeBoundary fallback={null}>
            <RoomScene
              cameraStateRef={cameraStateRef}
              projectionRef={projectionRef}
            />
          </SafeBoundary>
        </CanvasLayer>
      )}

      <TopBar>
        <span className="brand">Connecting Communities · Hubsite</span>
        <span className="now">{room.title}</span>
      </TopBar>

      <Overlay>
        <Hint>Click the markers to walk between rooms</Hint>

        <Card $show={!!room.copy}>
          <div className="eye">Inside this room</div>
          <h2>{room.copy?.heading}</h2>
          <p>{room.copy?.body}</p>
        </Card>

        <BeaconLayer ref={beaconsLayerRef}>
          {(room.beacons || []).map((b, i) => {
            if (b.type === "arrow") {
              return (
                <ArrowBeacon
                  key={i}
                  onClick={() => go(b.to)}
                  aria-label={`Walk to ${b.label}`}
                  type="button"
                >
                  <span className="pill">
                    <span className="arrow">{
                      b.dir === "left" ? "←" :
                      b.dir === "up"   ? "↑" :
                      b.dir === "down" ? "↓" :
                      "→"
                    }</span>
                    <span className="label">{b.label}</span>
                  </span>
                </ArrowBeacon>
              );
            }
            return (
              <CircleBeacon
                key={i}
                onClick={() => b.to && go(b.to)}
                aria-label={b.label}
                type="button"
              >
                <span className="ring" />
                <span className="dot" />
                <span className="tooltip">{b.label}</span>
              </CircleBeacon>
            );
          })}
        </BeaconLayer>
      </Overlay>

      <SwitcherWrap aria-label="Switch room">
        {ROOM_ORDER.map((id) => (
          <SwitcherBtn
            key={id}
            $active={id === roomId}
            onClick={() => go(id)}
            type="button"
          >
            {ROOMS[id].title}
          </SwitcherBtn>
        ))}
      </SwitcherWrap>
    </Host>
  );
}
