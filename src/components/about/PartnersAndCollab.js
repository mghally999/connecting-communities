"use client";

import styled from "styled-components";
import Image from "next/image";
import { Container, H2, Body } from "@/components/primitives";

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

/*
 * 2 columns × 3 rows. The "borders" in the figma are thin cross lines
 * through the grid — implemented as 1px gaps between cards on a darker
 * background so the gaps read as lines.
 */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: ${({ theme }) => theme.colors.greyBg};
  border: 1px solid ${({ theme }) => theme.colors.greyBg};
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  position: relative;
  aspect-ratio: 16 / 10.5;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  cursor: pointer;
  & img {
    transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  &:hover img { transform: scale(1.06); }
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    z-index: 1;
    transition: background ${({ theme }) => theme.transitions.base};
  }
  &:hover::before { background: rgba(0, 0, 0, 0.18); }
`;

const Label = styled.span`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  color: white;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  text-align: center;
  pointer-events: none;
  white-space: pre-line;
  padding: 0 1rem;
`;

export default function PartnersAndCollab({ data }) {
  return (
    <Wrap id="partners">
      <Container>
        <Title>{data.partnersTitle}</Title>
        <Intro>{data.partnersBody}</Intro>
        <Grid>
          {data.sectorCards?.map((c) => (
            <Card key={c.label}>
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
              <Label>{String(c.label).replace("-", "-\n")}</Label>
            </Card>
          ))}
        </Grid>
      </Container>
    </Wrap>
  );
}
