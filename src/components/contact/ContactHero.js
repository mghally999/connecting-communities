"use client";

import styled from "styled-components";
import { H1, Body } from "@/components/primitives";
import SmartImage from "@/components/SmartImage";

const Wrap = styled.section`
  position: relative;
  height: 60vh;
  min-height: 480px;
  max-height: 700px;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.05) 60%,
      transparent 100%
    );
  }
`;

const Inner = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  width: 100%;
  padding: 0 5rem;
  display: flex;
  align-items: center;
  @media (max-width: 768px) { padding: 0 1.5rem; }
`;

const Title = styled(H1)`
  color: white;
  white-space: pre-line;
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  line-height: 1.05;
`;

const Sub = styled(Body)`
  color: rgba(255, 255, 255, 0.92);
  margin-top: 1rem;
  white-space: pre-line;
  max-width: 36ch;
`;

export default function ContactHero({ data }) {
  return (
    <Wrap>
      <SmartImage src={data.heroImage} alt="Welcome" priority sizes="100vw" fallbackLabel="Welcome" />
      <Inner>
        <div>
          <Title>{data.heroTitle}</Title>
          <Sub>{data.heroBody}</Sub>
        </div>
      </Inner>
    </Wrap>
  );
}
