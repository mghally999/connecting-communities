"use client";

import styled from "styled-components";
import Image from "next/image";
import { Container, H2, Body } from "@/components/primitives";
import CTA from "@/components/CTA";

const Strip = styled.div`
  background: ${({ theme }) => theme.colors.creamGrey};
  padding: 3.5rem 0;
  text-align: center;
  & h2 {
    font-size: clamp(2rem, 3.4vw, 2.85rem);
  }
`;

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 4.5rem 0 5rem;
  @media (max-width: 768px) { padding: 3rem 0 3.5rem; }
`;

const Grid = styled.div`
  display: grid;
  gap: 4rem;
  align-items: center;
  grid-template-columns: 1.3fr 1fr;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const Logo = styled.div`
  display: grid;
  place-items: center;
  position: relative;
  width: 100%;
  height: 220px;
  @media (max-width: 900px) { height: 180px; }
`;

const Para = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
  letter-spacing: 0.01em;
  max-width: 60ch;
  & + & { margin-top: 1.4rem; }
`;

export default function AKABlock({ data }) {
  return (
    <>
      <Strip>
        <Container><H2>{data.akaTitle}</H2></Container>
      </Strip>
      <Wrap>
        <Container>
          <Grid>
            <div>
              {String(data.akaBody || "").split("\n\n").map((p, i) => (
                <Para key={i}>{p}</Para>
              ))}
              <div style={{ marginTop: "2rem" }}>
                <CTA href={data.akaCtaHref} external>{data.akaCtaLabel}</CTA>
              </div>
            </div>
            <Logo>
              <Image
                src={data.akaLogo}
                alt="AKA Partners"
                fill
                sizes="(max-width: 768px) 80vw, 320px"
                style={{ objectFit: "contain" }}
              />
            </Logo>
          </Grid>
        </Container>
      </Wrap>
    </>
  );
}
