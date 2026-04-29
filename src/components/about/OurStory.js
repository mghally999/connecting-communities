"use client";

import styled from "styled-components";
import { Container, H2, Body } from "@/components/primitives";
import SmartImage from "@/components/SmartImage";
import Reveal from "@/components/Reveal";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.creamGrey};
  padding: 6rem 0;
  @media (max-width: 768px) { padding: 4rem 0; }
`;

const Grid = styled.div`
  display: grid;
  gap: 4rem;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const Pic = styled.div`
  position: relative;
  aspect-ratio: 16 / 11;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  border-radius: 8px;
  overflow: hidden;
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1.25rem;
`;

export default function OurStory({ data }) {
  return (
    <Wrap>
      <Container>
        <Grid>
          <Reveal>
            <Title>{data.storyTitle}</Title>
            <Body $muted style={{ maxWidth: "60ch", lineHeight: "1.7" }}>
              {data.storyBody}
            </Body>
          </Reveal>
          <Reveal delay={120}>
            <Pic>
              <SmartImage src={data.storyImage} alt="Founders' fieldwork" fallbackLabel="Founders' fieldwork" />
            </Pic>
          </Reveal>
        </Grid>
      </Container>
    </Wrap>
  );
}
