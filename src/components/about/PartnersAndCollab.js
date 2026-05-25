"use client";

import { useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { Container, H2, Body } from "@/components/primitives";

/**
 * Partners & collaboration grid.
 *
 * Per the client's revised brief: each card is a 3D-flip card.
 *   - Front: image + sector name
 *   - Back: short description + link out
 *
 * Hover (or focus / tap on touch) flips the card around its Y axis.
 * On touch devices we honour a tap as the trigger so the back side is
 * still reachable.
 *
 * The 2×3 grid borders read as thin cross lines (achieved with a 1px
 * gap on a dark grid background, like the Figma).
 */

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 5rem 0 5.5rem;
  @media (max-width: 768px) { padding: 3.5rem 0 4rem; }
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1.25rem;
`;

const Intro = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
  letter-spacing: 0.01em;
  max-width: 86ch;
  margin-bottom: 2.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: ${({ theme }) => theme.colors.greyBg};
  border: 1px solid ${({ theme }) => theme.colors.greyBg};
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

/* The card is the 3D scene. perspective sits on the parent.
 *
 * When the sector has an external URL we render the outer element as
 * an <a> so the whole card is a single click target (anywhere on the
 * card navigates). The flip animation is still pure CSS on :hover so
 * the back face shows correctly, and on touch devices the first tap
 * flips (via JS preventDefault) and the second tap navigates. When
 * there's no URL (tele-conferencing today) we render a plain <div>
 * with no cursor pointer and no navigation target. */
const cardOuterStyle = `
  position: relative;
  aspect-ratio: 16 / 10.5;
  perspective: 1400px;
  background: var(--theme-skyBlueLight, #cfe1f5);
  text-decoration: none;
  color: inherit;
  display: block;
`;
const CardOuterLink = styled.a`
  ${cardOuterStyle}
  cursor: pointer;
`;
const CardOuterStatic = styled.div`
  ${cardOuterStyle}
`;

const Inner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
  /* The card's outer wrapper carries class="flip-card"; hover/focus
   * on it flips the inner. Same class on both <a> and <div> variants
   * so the selector chain works regardless of which one is rendered. */
  .flip-card:hover &,
  .flip-card:focus-within &,
  &[data-flipped="true"] {
    transform: rotateY(180deg);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Face = styled.div`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
`;

const Front = styled(Face)`
  /* When flipped, the front faces away from the user. We disable its
   * pointer events so clicks pass through to the parent <a> anchor
   * (some browsers still hit-test the back-facing face otherwise). */
  .flip-card:hover &,
  .flip-card:focus-within &,
  &[data-flipped-sibling="true"] {
    pointer-events: none;
  }
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    z-index: 1;
    transition: background 240ms ease;
  }
  .flip-card:hover &::before { background: rgba(0, 0, 0, 0.18); }
`;

const Back = styled(Face)`
  transform: rotateY(180deg);
  background: ${({ theme }) => theme.colors.navy};
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(1.4rem, 3vw, 2.5rem);
  gap: 1rem;
`;

const FrontLabel = styled.span`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  color: white;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  text-align: center;
  pointer-events: none;
  white-space: pre-line;
  padding: 0 1rem;
`;

const BackTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.1rem, 1.6vw, 1.4rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.orange};
`;

const BackBody = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(0.9rem, 1.05vw, 1rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 36ch;
`;

/* The "Learn more" pill on the back face is now purely decorative —
 * the whole outer <a> is the click target. Rendering this as a <span>
 * inside an <a> also avoids the invalid <a> inside <a> nesting. */
const BackCta = styled.span`
  margin-top: auto;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  background: ${({ theme }) => theme.colors.orange};
  padding: 0.7rem 1.3rem;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  transition: background ${({ theme }) => theme.transitions.fast};
  .flip-card:hover & { background: ${({ theme }) => theme.colors.rust}; }
`;

function FlipCard({ data: c }) {
  const [tapped, setTapped] = useState(false);
  const onClick = (e) => {
    // On touch devices: first tap flips (preventDefault on the
    // outer <a> stops navigation), second tap follows the link.
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) {
      if (!tapped) {
        e.preventDefault();
        setTapped(true);
      }
    }
  };
  const flipped = tapped;
  const inner = (
    <Inner data-flipped={flipped ? "true" : "false"}>
      <Front data-flipped-sibling={flipped ? "true" : "false"}>
        <Image
          src={c.image}
          alt={c.label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
        <FrontLabel>{String(c.label).replace("-", "-\n")}</FrontLabel>
      </Front>
      <Back>
        <BackTitle>{c.label}</BackTitle>
        <BackBody>{c.back}</BackBody>
        {c.ctaHref && <BackCta>{c.ctaLabel || "Learn more"}</BackCta>}
      </Back>
    </Inner>
  );
  if (c.ctaHref) {
    return (
      <CardOuterLink
        className="flip-card"
        href={c.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        aria-label={`${c.label} — learn more (opens in a new tab)`}
      >
        {inner}
      </CardOuterLink>
    );
  }
  return <CardOuterStatic className="flip-card">{inner}</CardOuterStatic>;
}

export default function PartnersAndCollab({ data }) {
  return (
    <Wrap id="partners">
      <Container>
        <Title>{data.partnersTitle}</Title>
        <Intro>{data.partnersBody}</Intro>
        <Grid>
          {data.sectorCards?.map((c) => (
            <FlipCard key={c.label} data={c} />
          ))}
        </Grid>
      </Container>
    </Wrap>
  );
}
