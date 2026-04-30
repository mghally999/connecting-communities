"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Image from "next/image";

/**
 * FloatingCards — DRAGGABLE foam-style gallery
 *
 * Per client brief: "Note that it's 3D-like — I can move my mouse and
 * drag and move them along the X axis and Y axis like the seven-seven
 * marine experience."
 *
 * Implementation: each card has a starting (x%, y%) position and a
 * `dragOffset` (in px) that the user can drive by clicking + dragging.
 * The dragOffset is applied via CSS transform translate, so dragging
 * updates the visual position but doesn't trigger React re-renders or
 * relayout — it stays buttery smooth.
 *
 * Click-without-drag opens the story modal (handled by parent via
 * onSelect). We distinguish "drag" from "click" using a movement
 * threshold: if the pointer moved < 6 px between down and up, it counts
 * as a click.
 */

const STAGE_HEIGHT_VH = 150; // bigger gallery

const Stage = styled.div`
  position: relative;
  width: 100%;
  height: ${STAGE_HEIGHT_VH}vh;
  min-height: 1100px;
  background: ${({ theme }) => theme.colors.cream};
  overflow: hidden;
  cursor: grab;
  &:active { cursor: grabbing; }
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
    overflow: visible;
    cursor: default;
    & .stage-inner {
      position: static;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
      padding: 1rem 1rem 4rem;
    }
  }
`;

const StageInner = styled.div`
  position: relative;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  height: 100%;
`;

const HintBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 50;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  opacity: 0.5;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  & .icon {
    display: inline-block;
    width: 18px; height: 12px;
    border: 1.5px solid currentColor;
    border-radius: 3px;
    position: relative;
  }
  & .icon::after {
    content: ""; position: absolute;
    width: 4px; height: 4px;
    background: currentColor;
    border-radius: 50%;
    left: 6px; top: 3px;
  }
  @media (max-width: 768px) { display: none; }
`;

const Card = styled.div`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $w }) => $w}%;
  height: ${({ $h }) => $h}%;
  transform: translate3d(${({ $tx }) => $tx}px, ${({ $ty }) => $ty}px, 0)
             rotate(${({ $rot }) => $rot}deg);
  transform-origin: center center;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  box-shadow: ${({ $dragging }) =>
    $dragging
      ? "0 30px 60px rgba(11, 16, 24, 0.28)"
      : "0 12px 32px rgba(11, 16, 24, 0.10)"};
  transition:
    box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
  opacity: ${({ $dim }) => ($dim ? 0.32 : 1)};
  filter: ${({ $dim }) => ($dim ? "saturate(0.55)" : "none")};
  z-index: ${({ $dragging }) => ($dragging ? 100 : 1)};
  cursor: grab;
  &:active { cursor: grabbing; }

  @media (max-width: 768px) {
    position: static;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    transform: none;
  }
`;

const Caption = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 0.7rem 0.9rem;
  background: linear-gradient(0deg, rgba(11,16,24,0.78) 0%, rgba(11,16,24,0) 100%);
  color: white;
  pointer-events: none;
`;
const Eyebrow = styled.div`
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.orange};
  margin-bottom: 0.15rem;
`;
const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(0.85rem, 1vw, 1rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: -0.005em;
  line-height: 1.2;
`;

/* -------------------------------------------------------------------------- */

function DraggableCard({ card, dim, onSelect }) {
  const ref = useRef(null);
  // Drag offsets are kept in REFS so the card can move at 60fps without
  // re-rendering React on every pointer move. We only setState when the
  // drag ends so styled-components can read the final value.
  const offsetRef = useRef({ x: 0, y: 0 });
  const startRef = useRef(null);
  const movedRef = useRef(0);
  const [, force] = useState(0);
  const [dragging, setDragging] = useState(false);

  /* Apply transform directly to DOM — fast, no React thrash. */
  const apply = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `translate3d(${offsetRef.current.x}px, ${offsetRef.current.y}px, 0) rotate(${card.rotate || 0}deg)`;
  };

  useEffect(() => {
    apply(); // initial application
  }, []);

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
    };
    movedRef.current = 0;
    setDragging(true);

    const onMove = (ev) => {
      if (!startRef.current) return;
      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;
      movedRef.current = Math.max(movedRef.current, Math.hypot(dx, dy));
      offsetRef.current.x = startRef.current.ox + dx;
      offsetRef.current.y = startRef.current.oy + dy;
      apply();
    };
    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setDragging(false);
      // Click-vs-drag distinction: short movement = click → open story.
      if (movedRef.current < 6) {
        onSelect?.(card);
      }
      startRef.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
  };

  return (
    <Card
      ref={ref}
      $x={card.x ?? 0}
      $y={card.y ?? 0}
      $w={card.w ?? 18}
      $h={card.h ?? 24}
      $rot={card.rotate ?? 0}
      $tx={offsetRef.current.x}
      $ty={offsetRef.current.y}
      $dragging={dragging}
      $dim={dim}
      onPointerDown={onPointerDown}
      role="button"
      tabIndex={0}
      aria-label={`Open story: ${card.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(card);
        }
      }}
    >
      <Image
        src={card.image}
        alt={card.title}
        fill
        sizes="(max-width: 768px) 50vw, 22vw"
        style={{ objectFit: "cover", pointerEvents: "none" }}
        draggable={false}
      />
      <Caption>
        <Eyebrow>{card.eyebrow || card.category}</Eyebrow>
        <Title>{card.title}</Title>
      </Caption>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export default function FloatingCards({ cards, activeCategory, onSelect }) {
  const items = useMemo(() => cards || [], [cards]);
  return (
    <Stage>
      <HintBadge>
        <span className="icon" /> drag the cards
      </HintBadge>
      <StageInner className="stage-inner">
        {items.map((c) => {
          const dim = activeCategory && activeCategory !== "all"
            ? c.category !== activeCategory
            : false;
          return (
            <DraggableCard
              key={c.id || c.title}
              card={c}
              dim={dim}
              onSelect={onSelect}
            />
          );
        })}
      </StageInner>
    </Stage>
  );
}
