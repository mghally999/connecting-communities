"use client";

import styled from "styled-components";

const Wrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.95rem;
  user-select: none;
`;

const Mark = styled.svg`
  flex-shrink: 0;
  width: 56px;
  height: auto;
  display: block;
  transition: transform ${({ theme }) => theme.transitions.base};
  ${Wrap}:hover & { transform: translateY(-1px); }
  & path { fill: ${({ theme }) => theme.colors.navy}; }
  ${({ $variant, theme }) =>
    $variant === "light" &&
    `& path { fill: ${theme.colors.white}; }`}
  @media (max-width: 640px) { width: 46px; }
`;

const Word = styled.span`
  display: inline-flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.navy};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: 1.15;
  letter-spacing: 0;
  white-space: nowrap;
  ${({ $variant, theme }) =>
    $variant === "light" && `color: ${theme.colors.white};`}
  @media (max-width: 640px) { font-size: 0.92rem; }
`;

/**
 * Connecting Communities mark — two interlocking bracket-shaped C's.
 * Pure SVG so it stays sharp at any size and recolours via theme.
 */
export default function Logo({ variant, showWordmark = true }) {
  return (
    <Wrap aria-label="Connecting Communities">
      <Mark $variant={variant} viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M 110,8 L 38,8 Q 8,8 8,38 L 8,82 Q 8,112 38,112 L 110,112 L 110,86 L 44,86 Q 34,86 34,76 L 34,44 Q 34,34 44,34 L 110,34 Z" />
        <path d="M 232,8 L 160,8 Q 130,8 130,38 L 130,82 Q 130,112 160,112 L 232,112 L 232,86 L 166,86 Q 156,86 156,76 L 156,44 Q 156,34 166,34 L 232,34 Z" />
      </Mark>
      {showWordmark && (
        <Word $variant={variant}>
          <span>Connecting</span>
          <span>Communities</span>
        </Word>
      )}
    </Wrap>
  );
}
