"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

/**
 * Flag-shaped CTA button from the Figma. The right edge has a notch
 * cut into it to make a "banner" silhouette — a slim sloped right side
 * cut into a triangle pointing right-down.
 *
 *  ┌───────────────╲
 *  │   LEARN MORE   ╲
 *  └────────────────╱
 *
 * Implemented with clip-path so it stays sharp at any size.
 */
const base = css`
  --bg: ${({ theme }) => theme.colors.orange};
  --bg-hover: ${({ theme }) => theme.colors.rust};
  --fg: ${({ theme }) => theme.colors.white};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  background: var(--bg);
  color: var(--fg);
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.95rem 2.4rem 0.95rem 1.65rem;
  text-align: left;
  /* Right-side flag tab — clipped into the rectangle */
  clip-path: polygon(
    0 0,
    100% 0,
    calc(100% - 18px) 50%,
    100% 100%,
    0 100%
  );
  transition:
    background ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};
  &:hover {
    background: var(--bg-hover);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.navy};
    outline-offset: 4px;
  }

  ${({ $variant, theme }) =>
    $variant === "ghost" &&
    css`
      background: transparent;
      color: ${theme.colors.orange};
      border: 1.5px solid ${theme.colors.orange};
      clip-path: none;
      padding: 0.85rem 1.6rem;
      &:hover { background: ${theme.colors.orange}; color: ${theme.colors.white}; }
    `}

  ${({ $size }) =>
    $size === "lg" &&
    css`
      font-size: 0.85rem;
      padding: 1.05rem 2.7rem 1.05rem 1.85rem;
    `}
`;

const SLink = styled(Link)`${base}`;
const SButton = styled.button`${base}`;
const SAnchor = styled.a`${base}`;

export default function CTA({ href, external, children, variant, size, ...rest }) {
  if (href) {
    if (external)
      return (
        <SAnchor href={href} target="_blank" rel="noopener noreferrer" $variant={variant} $size={size} {...rest}>
          {children}
        </SAnchor>
      );
    return (
      <SLink href={href} $variant={variant} $size={size} {...rest}>
        {children}
      </SLink>
    );
  }
  return (
    <SButton type="button" $variant={variant} $size={size} {...rest}>
      {children}
    </SButton>
  );
}
