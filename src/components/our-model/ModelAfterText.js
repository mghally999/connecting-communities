"use client";

import styled from "styled-components";
import { Container, H2, Body } from "@/components/primitives";
import Reveal from "@/components/Reveal";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 6rem 0;
  @media (max-width: 768px) { padding: 4rem 0; }
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 2rem;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.6rem;
  max-width: 80ch;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 1.2rem;
  align-items: start;
  &::before {
    content: "";
    display: inline-block;
    width: 14px; height: 14px;
    margin-top: 0.45rem;
    background: ${({ theme }) => theme.colors.orange};
  }
`;

const Para = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
`;

export default function ModelAfterText({ data }) {
  if (!data?.afterBullets?.length) return null;
  return (
    <Wrap>
      <Container>
        <Reveal>
          <Title>{data.afterTitle || "Our model"}</Title>
        </Reveal>
        <Reveal delay={120}>
          <List>
            {data.afterBullets.map((b, i) => (
              <Item key={i}>
                <span aria-hidden="true" />
                <Para>{b}</Para>
              </Item>
            ))}
          </List>
        </Reveal>
      </Container>
    </Wrap>
  );
}
