"use client";

import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: none; }
`;

/**
 * Visibility-safe reveal: content is ALWAYS rendered visible (so SSR,
 * crawlers, JS-disabled and screenshot tools all see it), and we
 * additionally play a one-shot CSS fadeUp animation. Honours
 * prefers-reduced-motion automatically through the browser.
 */
const Wrap = styled.div`
  animation: ${fadeUp} 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $delay }) => $delay || 0}ms;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default function Reveal({ children, delay = 0 }) {
  return <Wrap $delay={delay}>{children}</Wrap>;
}
