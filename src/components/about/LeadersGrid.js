"use client";

import styled from "styled-components";
import Image from "next/image";
import { Container, H2 } from "@/components/primitives";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  padding: 5rem 0 5.5rem;
  @media (max-width: 768px) { padding: 3.5rem 0 4rem; }
`;

const Title = styled(H2)`
  color: white;
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 2.5rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.75rem;
  grid-template-columns: repeat(4, 1fr);
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 540px)  { grid-template-columns: 1fr; }
`;

const Person = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Photo = styled.div`
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  & img {
    transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  &:hover img { transform: scale(1.05); }
`;

const Name = styled.figcaption`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.04em;
  font-size: 0.95rem;
  color: white;
  margin-top: 0.25rem;
`;

const Role = styled.div`
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  line-height: 1.45;
  white-space: pre-line;
`;

export default function LeadersGrid({ data }) {
  return (
    <Wrap>
      <Container>
        <Title>{data.leadersTitle}</Title>
        <Grid>
          {data.leaders?.map((p) => (
            <Person key={p.name}>
              <Photo>
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 280px"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              </Photo>
              <Name>{p.name}</Name>
              <Role>{p.role}</Role>
            </Person>
          ))}
        </Grid>
      </Container>
    </Wrap>
  );
}
