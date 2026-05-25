"use client";

import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: none; }
`;

/**
 * Reveal
 *
 * Each wrapped block fades up 40 px as it enters the viewport.
 *
 * Default state matches the keyframe's `from` (opacity 0, translateY 40 px)
 * so React's `data-revealed=true` flip can't cause a flicker — the element
 * is already in the start position when the animation begins. JS does need
 * to run for content to ever appear; for users with JS disabled or a
 * `prefers-reduced-motion: reduce` setting, the override below forces
 * full visibility.
 *
 * Duration 900 ms with the standard "expo-out-ish" cubic-bezier makes the
 * entrance long enough to read as a deliberate animation but short enough
 * that scroll-heavy pages don't feel sluggish.
 */
const Wrap = styled.div`
  opacity: 0;
  transform: translateY(40px);
  will-change: opacity, transform;

  &[data-revealed="true"] {
    animation: ${fadeUp} 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: ${({ $delay }) => $delay || 0}ms;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    &[data-revealed="true"] { animation: none; }
  }
`;

export default function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== "function") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Wrap ref={ref} $delay={delay} data-revealed={revealed ? "true" : "false"}>
      {children}
    </Wrap>
  );
}
