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
  align-items: stretch;
  gap: 1rem;
  text-align: center;
`;

const TagRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  /* Push the bottom edge so the pin can sit half on the image without
     adding gap to the layout — the pin is positioned in ImgWrap. */
  margin-bottom: 0;
`;

const Tag = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.92rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.navy};
`;

/**
 * The image wrapper is `position: relative`, and the pin is a tiny square
 * positioned at top: 0 with a -50% translate in Y. That places the dot
 * straddling the top edge — half on the background, half on the image.
 */
const ImgWrap = styled.div`
  width: 100%;
  aspect-ratio: 1.05 / 1;
  position: relative;
  overflow: visible; /* keep visible so the pin's overhang renders cleanly */
  background: transparent;

  /* Inner mask clips just the image so the pin is on top of the image
     but not clipped by it. */
  & .img-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.skyBlueLight};
    & > * { transition: transform 720ms cubic-bezier(.22,1,.36,1); }
  }
  &:hover .img-clip > * { transform: scale(1.05); }
`;

const Pin = styled.span`
  position: absolute;
  top: 0;
  left: 50%;
  width: 18px;
  height: 18px;
  background: ${({ theme }) => theme.colors.orange};
  /* Pull the pin up by half its height so it straddles the image edge */
  transform: translate(-50%, -50%);
  z-index: 2;
  /* Tiny shadow gives the pin lift, like an actual pushpin */
  box-shadow: 0 2px 6px rgba(253, 84, 43, 0.35);
`;

const Caption = styled(Body)`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.navy};
  max-width: 30ch;
  margin: 0 auto;
  margin-top: 0.75rem;
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
                  <TagRow>
                    <Tag>{item.label}</Tag>
                  </TagRow>
                  <ImgWrap>
                    <Pin aria-hidden="true" />
                    <div className="img-clip">
                      <SmartImage
                        src={item.image}
                        alt={item.label}
                        fallbackLabel={item.label}
                      />
                    </div>
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
