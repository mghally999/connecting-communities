"use client";

import styled from "styled-components";
import Image from "next/image";
import { Container, H2, Body } from "@/components/primitives";
import Reveal from "@/components/Reveal";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 4.5rem 0 4rem;
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1rem;
`;

const Sub = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
  letter-spacing: 0.01em;
  max-width: 78ch;
  margin-bottom: 3rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 3rem;
  align-items: stretch;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Map = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  max-height: 560px;
  background: ${({ theme }) => theme.colors.skyBlue};
  border-radius: 4px;
  overflow: hidden;
`;

const MapPin = styled.div`
  position: absolute;
  top: 56%;
  left: 32%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.orange};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.85rem;
  &::before {
    content: "";
    display: block;
    width: 14px;
    height: 14px;
    background: ${({ theme }) => theme.colors.orange};
    border-radius: 999px;
    box-shadow: 0 0 0 4px rgba(253, 84, 43, 0.18);
  }
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.5rem;
`;

const CountryName = styled.h3`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1.4rem, 2.4vw, 1.85rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: 0.04em;
`;

const CountryPhoto = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 11;
  border-radius: 4px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
`;

const Wide = styled.section`
  position: relative;
  width: 100%;
  height: clamp(320px, 38vw, 500px);
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.35) 0%,
      rgba(0, 0, 0, 0.0) 60%
    );
  }
`;

const WideInner = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  z-index: 2;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 5rem 3rem;
  color: white;
  & h3 {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: clamp(2rem, 3.6vw, 3rem);
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    line-height: 1.1;
    white-space: pre-line;
    margin: 0;
    color: white;
  }
  & p {
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
  }
  @media (max-width: 768px) { padding: 0 1.5rem 2rem; }
`;

export default function OurModelLaunch({ data }) {
  return (
    <>
      <Wrap>
        <Container>
          <Title>{data.launchTitle}</Title>
          <Sub>{data.launchBody}</Sub>
          <Grid>
            <Reveal>
              <Map>
                {data.mapImage && (
                  <Image
                    src={data.mapImage}
                    alt="East Africa map showing Rwanda"
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                )}
                <MapPin>RWANDA</MapPin>
              </Map>
            </Reveal>
            <Reveal delay={120}>
              <Right>
                <CountryName>{data.countryName}</CountryName>
                <Body $muted style={{ lineHeight: "1.7", maxWidth: "48ch" }}>{data.countryBody}</Body>
                <CountryPhoto>
                  <Image
                    src={data.countryImage}
                    alt={data.countryName}
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                    style={{ objectFit: "cover" }}
                  />
                </CountryPhoto>
              </Right>
            </Reveal>
          </Grid>
        </Container>
      </Wrap>

      <Wide>
        <Image
          src={data.bottomBandImage}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <WideInner>
          <h3>{data.bottomBandTitle}</h3>
          <p>{data.bottomBandSub}</p>
        </WideInner>
      </Wide>
    </>
  );
}
