"use client";

import styled from "styled-components";

/**
 * Logo
 *
 * Renders the official Connecting Communities wordmark using the
 * brand-kit SVG files in /public/logo (cc-logo-blue.svg, ...orange,
 * ...white, ...black). These came directly from the brand team and
 * replace the previously hand-coded SVG so the artwork stays in sync
 * with whatever the brand kit ships.
 *
 * variant:
 *   "default" | "blue" — navy wordmark (default; navigation, light bgs)
 *   "orange"           — orange brand variant
 *   "light" | "white"  — white wordmark (dark bgs, hero overlays)
 *   "black"            — solid black (print / mono contexts)
 */

const Wrap = styled.span`
  display: inline-flex;
  align-items: center;
  user-select: none;
`;

const Mark = styled.img`
  display: block;
  height: 36px;
  width: auto;
  transition: transform ${({ theme }) => theme.transitions.base};
  ${Wrap}:hover & { transform: translateY(-1px); }
  @media (max-width: 640px) { height: 30px; }
`;

const VARIANT_SRC = {
  default: "/logo/cc-logo-blue.svg",
  blue:    "/logo/cc-logo-blue.svg",
  orange:  "/logo/cc-logo-orange.svg",
  light:   "/logo/cc-logo-white.svg",
  white:   "/logo/cc-logo-white.svg",
  black:   "/logo/cc-logo-black.svg",
};

export default function Logo({ variant = "default" }) {
  const src = VARIANT_SRC[variant] || VARIANT_SRC.default;
  return (
    <Wrap aria-label="Connecting Communities">
      <Mark src={src} alt="Connecting Communities" />
    </Wrap>
  );
}
