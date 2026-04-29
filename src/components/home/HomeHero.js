"use client";

import styled from "styled-components";
import { H1, Body } from "@/components/primitives";
import CTA from "@/components/CTA";
import SmartImage from "@/components/SmartImage";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.skyBlue};
  width: 100%;
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
  @media (max-width: 1024px) { min-height: 540px; }
  @media (max-width: 768px) {
    min-height: 380px;
    aspect-ratio: 16 / 11;
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
`;

const Sub = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  font-size: 1.05rem;
  white-space: pre-line;
  max-width: 38ch;
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
          <div>
            <CTA href={data.heroCtaHref} size="lg">{data.heroCtaLabel}</CTA>
          </div>
        </Content>
      </Grid>
    </Wrap>
  );
}
