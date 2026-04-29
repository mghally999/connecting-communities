"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { Container, H2 } from "@/components/primitives";
import SmartImage from "@/components/SmartImage";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 5rem 0 6rem;
  @media (max-width: 768px) { padding: 3.5rem 0 4rem; }
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 2rem;
`;

/* Track wraps in a positioned outer so we can put arrows ON the right edge */
const Outer = styled.div`
  position: relative;
`;

const Track = styled.div`
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-bottom: 0.6rem;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Slide = styled.div`
  flex: 0 0 calc((100% - 2.5rem) / 3);
  scroll-snap-align: start;
  position: relative;
  aspect-ratio: 16 / 11;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  @media (max-width: 1024px) { flex-basis: calc((100% - 1.25rem) / 2); }
  @media (max-width: 640px)  { flex-basis: 86%; }
`;

const Label = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: white;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  letter-spacing: -0.005em;
  pointer-events: none;
`;

/* Arrow placed *over* the right edge of the track, vertically centred */
const Arrow = styled.button`
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.greyBg};
  background: white;
  color: ${({ theme }) => theme.colors.navy};
  font-size: 1.1rem;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 4px 14px rgba(11, 16, 24, 0.08);
  transition:
    background ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast};
  &:hover { background: ${({ theme }) => theme.colors.cream}; transform: translateY(-50%) scale(1.06); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const ArrowLeft = styled(Arrow)`
  right: auto;
  left: -10px;
`;

export default function PartnerCarousel({ data }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ atStart: true, atEnd: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setPos({
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = useCallback((dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return (
    <Wrap>
      <Container>
        <Title>{data.partnersTitle}</Title>
        <Outer>
          <Track ref={ref} role="region" aria-label="Partners">
            {data.partnerSlides?.map((s, i) => (
              <Slide key={s.label + i}>
                <SmartImage
                  src={s.image}
                  alt={s.label}
                  fallbackLabel={s.label}
                  style={{ filter: "brightness(0.7)" }}
                />
                <Label>{s.label}</Label>
              </Slide>
            ))}
          </Track>
          {!pos.atStart && (
            <ArrowLeft type="button" onClick={() => scrollBy(-1)} aria-label="Previous">‹</ArrowLeft>
          )}
          {!pos.atEnd && (
            <Arrow type="button" onClick={() => scrollBy(1)} aria-label="Next">›</Arrow>
          )}
        </Outer>
      </Container>
    </Wrap>
  );
}
