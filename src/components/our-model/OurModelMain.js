"use client";

import styled from "styled-components";
import Image from "next/image";
import { Container, H2, Body } from "@/components/primitives";
import StairGraphic from "@/components/StairGraphic";
import Reveal from "@/components/Reveal";

const ModelWrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 5.5rem 0 6rem;
  @media (max-width: 768px) { padding: 4rem 0; }
`;

const ModelGrid = styled.div`
  display: grid;
  gap: 4rem;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1.5rem;
`;

const Bullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Bullet = styled.li`
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 1.25rem;
  align-items: start;
  color: ${({ theme }) => theme.colors.navy};
  &::before {
    content: "";
    display: block;
    width: 14px;
    height: 14px;
    margin-top: 0.45rem;
    background: ${({ $active, theme }) => ($active ? theme.colors.orange : "rgba(253, 84, 43, 0.25)")};
  }
  & p { line-height: 1.7; }
`;

const VerticalPic = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  max-width: 520px;
  justify-self: end;
  border-radius: 4px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  @media (max-width: 900px) {
    justify-self: center;
    aspect-ratio: 4 / 4;
  }
`;

const EcoWrap = styled.section`
  background: ${({ theme }) => theme.colors.skyBlue};
  padding: 4rem 0;
  @media (max-width: 768px) { padding: 3rem 0; }
`;

const EcoGrid = styled.div`
  display: grid;
  gap: 4rem;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const EcoText = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
  letter-spacing: 0.01em;
  max-width: 64ch;
`;

const StairWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: 900px) { justify-content: center; }
`;

export default function OurModelMain({ data }) {
  return (
    <>
      <ModelWrap>
        <Container>
          <ModelGrid>
            <Reveal>
              <Title>{data.modelTitle}</Title>
              <Bullets>
                {data.modelBullets?.map((b, i) => (
                  <Bullet key={i} $active={i === 0}>
                    <p>{b}</p>
                  </Bullet>
                ))}
              </Bullets>
            </Reveal>
            <Reveal delay={120}>
              <VerticalPic>
                <Image
                  src={data.modelImage}
                  alt="Woman crossing a wooden bridge at sunrise"
                  fill
                  sizes="(max-width: 900px) 90vw, 520px"
                  style={{ objectFit: "cover" }}
                />
              </VerticalPic>
            </Reveal>
          </ModelGrid>
        </Container>
      </ModelWrap>

      <EcoWrap>
        <Container>
          <EcoGrid>
            <EcoText>{data.ecosystemBody}</EcoText>
            <StairWrap><StairGraphic /></StairWrap>
          </EcoGrid>
        </Container>
      </EcoWrap>
    </>
  );
}
