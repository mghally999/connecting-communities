"use client";

import { useEffect, useRef, useState, memo } from "react";
import styled, { keyframes } from "styled-components";
import { Container, H2, Body } from "@/components/primitives";
import CTA from "@/components/CTA";
import Reveal from "@/components/Reveal";

const Dark = styled.section`
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  padding: 5.5rem 0 6rem;
  @media (max-width: 768px) { padding: 4rem 0; }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const TitleBlock = styled.div`
  & h2 {
    color: white;
    font-size: clamp(2rem, 3.4vw, 2.85rem);
  }
  & p {
    color: rgba(255, 255, 255, 0.92);
    margin-top: 0.6rem;
    font-size: 1.05rem;
  }
`;

const Stats = styled.div`
  display: grid;
  gap: 3rem 2.5rem;
  grid-template-columns: 1fr 1fr;
  @media (min-width: 900px) { grid-template-columns: repeat(4, 1fr); }
`;

const statRise = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  animation: ${statRise} 680ms cubic-bezier(.22,1,.36,1) both;
  animation-delay: ${({ $i }) => ($i || 0) * 110}ms;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Big = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(3rem, 5.4vw, 4.6rem);
  line-height: 1;
  color: ${({ theme }) => theme.colors.orange};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  letter-spacing: -0.01em;
`;

const Sub = styled(Body)`
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.55;
`;

const parseTarget = (raw) => {
  const m = String(raw || "").match(/^(\d+(?:\.\d+)?)([A-Za-z+%]*)$/);
  if (!m) return { num: null, suffix: raw };
  return { num: parseFloat(m[1]), suffix: m[2] };
};

const CountUp = memo(function CountUp({ value, durationMs = 1500 }) {
  const { num, suffix } = parseTarget(value);
  const ref = useRef(null);
  const [display, setDisplay] = useState(num != null ? "0" : value);

  useEffect(() => {
    if (num == null) return;
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(String(Math.round(num * eased)));
          if (t < 1) raf = requestAnimationFrame(tick);
          else setDisplay(String(num));
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [num, durationMs]);

  return (
    <Big ref={ref}>
      {display}
      {suffix}
    </Big>
  );
});

export default function ImpactStats({ data }) {
  return (
    <Dark>
      <Container>
        <Reveal>
          <TopRow>
            <TitleBlock>
              <H2>{data.impactTitle}</H2>
              <Body>{data.impactSubtitle}</Body>
            </TitleBlock>
            <CTA href={data.impactCtaHref}>{data.impactCtaLabel}</CTA>
          </TopRow>
        </Reveal>
        <Stats>
          {data.impactStats?.map((s, i) => (
            <Stat key={s.value + i} $i={i}>
              <CountUp value={s.value} />
              <Sub>{s.label}</Sub>
            </Stat>
          ))}
        </Stats>
      </Container>
    </Dark>
  );
}
