"use client";

import styled from "styled-components";
import Image from "next/image";
import { Container, H2, Body } from "@/components/primitives";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 5rem 0 4rem;
  @media (max-width: 768px) { padding: 3.5rem 0; }
`;

const Grid = styled.div`
  display: grid;
  gap: 4rem;
  align-items: center;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const Pic = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  border-radius: 8px;
  overflow: hidden;
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1rem;
`;

export default function ContactIntro({ data }) {
  return (
    <Wrap>
      <Container>
        <Grid>
          <div>
            <Title>{data.blockTitle}</Title>
            <Body $muted style={{ maxWidth: "55ch", whiteSpace: "pre-line", lineHeight: "1.7" }}>
              {data.blockBody}
            </Body>
          </div>
          <Pic>
            <Image
              src={data.blockImage}
              alt="Community"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </Pic>
        </Grid>
      </Container>
    </Wrap>
  );
}
