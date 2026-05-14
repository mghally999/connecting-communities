"use client";

import styled, { keyframes } from "styled-components";
import { H1, Body } from "@/components/primitives";
import CTA from "@/components/CTA";
import SmartImage from "@/components/SmartImage";

/* Subtle entry animations for the hero. Title slides up + fades in,
 * body and CTA cascade behind it. Image starts very slightly zoomed
 * and settles. All animations respect prefers-reduced-motion. */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: none; }
`;

const settle = keyframes`
  from { transform: scale(1.045); }
  to   { transform: scale(1); }
`;

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.skyBlue};
  width: 100%;
  overflow: hidden;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  align-items: stretch;
  min-height: 640px;
  @media (max-width: 1024px) { min-height: 540px; }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const ImageBox = styled.div`
  position: relative;
  height: 100%;
  min-height: 640px;
  overflow: hidden;
  @media (max-width: 1024px) { min-height: 540px; }
  @media (max-width: 768px) {
    min-height: 380px;
    aspect-ratio: 16 / 11;
  }
  /* Apply the settle scale to the inner image wrapper so we don't fight
   * SmartImage's own object-fit positioning. */
  & > * {
    animation: ${settle} 1400ms cubic-bezier(.22,1,.36,1) both;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 4rem 5rem;
  @media (max-width: 1280px) { padding: 4rem 3rem; }
  @media (max-width: 768px) { padding: 3rem 1.5rem; }
`;

const Title = styled(H1)`
  color: ${({ theme }) => theme.colors.navy};
  white-space: pre-line;
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1.1;
  animation: ${fadeUp} 760ms cubic-bezier(.22,1,.36,1) both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Sub = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  font-size: 1.05rem;
  white-space: pre-line;
  max-width: 38ch;
  animation: ${fadeUp} 760ms cubic-bezier(.22,1,.36,1) 160ms both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const CtaWrap = styled.div`
  animation: ${fadeUp} 760ms cubic-bezier(.22,1,.36,1) 280ms both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export default function HomeHero({ data }) {
  return (
    <Wrap>
      <Grid>
        <ImageBox>
          <SmartImage
            src={data.heroImage}
            alt="Community member with laptop on a mountain bridge"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            fallbackLabel="Mountain bridge"
          />
        </ImageBox>
        <Content>
          <Title>{data.heroTitle}</Title>
          <Sub>{data.heroBody}</Sub>
          <CtaWrap>
            <CTA href={data.heroCtaHref} size="lg">{data.heroCtaLabel}</CTA>
          </CtaWrap>
        </Content>
      </Grid>
    </Wrap>
  );
}
