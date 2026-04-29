"use client";

import styled from "styled-components";
import { Container, H2, Body } from "@/components/primitives";
import CTA from "@/components/CTA";
import StairGraphic from "@/components/StairGraphic";
import Reveal from "@/components/Reveal";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 8rem 0;
  @media (max-width: 768px) { padding: 4rem 0; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: 900px) { justify-content: center; }
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1.5rem;
`;

const Para = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
  letter-spacing: 0.01em;
  max-width: 62ch;
  margin-bottom: 2rem;
`;

export default function WhyWeExist({ data }) {
  return (
    <Wrap>
      <Container>
        <Grid>
          <Reveal>
            <Title>{data.whyTitle}</Title>
            <Para>{data.whyBody}</Para>
            <CTA href={data.whyCtaHref}>{data.whyCtaLabel}</CTA>
          </Reveal>
          <Reveal delay={120}>
            <Right><StairGraphic /></Right>
          </Reveal>
        </Grid>
      </Container>
    </Wrap>
  );
}
