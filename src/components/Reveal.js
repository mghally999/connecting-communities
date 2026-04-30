"use client";

import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: none; }
`;

/**
 * Reveal
 *
 * Content is rendered immediately and is FULLY VISIBLE by default
 * (opacity: 1, no transform). Once the element scrolls into view we add
 * a `data-revealed` attribute and the optional fade-up animation runs.
 *
 * This approach is bulletproof: even if styled-components stylesheets
 * are slow, the page is unhydrated, JavaScript fails, or the user has
 * `prefers-reduced-motion: reduce` — the content is always visible.
 */
const Wrap = styled.div`
  /* Content visible by default. The animation is purely cosmetic. */
  &[data-revealed="true"] {
    animation: ${fadeUp} 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: ${({ $delay }) => $delay || 0}ms;
  }
  @media (prefers-reduced-motion: reduce) {
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
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
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
