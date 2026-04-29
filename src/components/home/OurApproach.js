"use client";

import styled from "styled-components";
import { Container, H2, Body } from "@/components/primitives";
import SmartImage from "@/components/SmartImage";
import Reveal from "@/components/Reveal";

const Strip = styled.div`
  background: ${({ theme }) => theme.colors.creamGrey};
  padding: 4rem 1.5rem;
  text-align: center;
  @media (max-width: 768px) { padding: 3rem 1.5rem; }
`;

const Below = styled.div`
  background: ${({ theme }) => theme.colors.cream};
  padding: 5rem 0 6rem;
  @media (max-width: 768px) { padding: 3.5rem 0 4rem; }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
`;

const Tag = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.navy};
`;

const Notch = styled.span`
  width: 16px;
  height: 16px;
  background: ${({ theme }) => theme.colors.orange};
  display: block;
`;

const ImgWrap = styled.div`
  width: 100%;
  aspect-ratio: 1.05 / 1;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
`;

const Caption = styled(Body)`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.navy};
  max-width: 30ch;
  margin: 0 auto;
  margin-top: 0.5rem;
`;

const StripTitle = styled(H2)`
  font-size: clamp(2rem, 3.6vw, 2.85rem);
`;

export default function OurApproach({ data }) {
  return (
    <>
      <Strip>
        <Container>
          <StripTitle>{data.approachTitle}</StripTitle>
        </Container>
      </Strip>

      <Below>
        <Container>
          <Cards>
            {data.approachItems?.map((item, i) => (
              <Reveal key={item.label} delay={i * 100}>
                <Card>
                  <Tag>{item.label}</Tag>
                  <Notch aria-hidden="true" />
                  <ImgWrap>
                    <SmartImage src={item.image} alt={item.label} fallbackLabel={item.label} />
                  </ImgWrap>
                  <Caption>{item.caption}</Caption>
                </Card>
              </Reveal>
            ))}
          </Cards>
        </Container>
      </Below>
    </>
  );
}
