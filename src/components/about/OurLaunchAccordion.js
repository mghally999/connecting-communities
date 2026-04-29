"use client";

import { useState } from "react";
import styled from "styled-components";
import { Container, Body } from "@/components/primitives";

const Wrap = styled.section`
  background: transparent;
  padding: 0;
`;

const Bar = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({ theme }) => theme.colors.skyBlue};
  border: 0;
  color: ${({ theme }) => theme.colors.navy};
  padding: 2rem 2.25rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.6rem, 2.8vw, 2.4rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: -0.005em;
  cursor: pointer;
  text-align: left;
`;

const Plus = styled.span`
  position: relative;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  &::before, &::after {
    content: "";
    position: absolute;
    background: ${({ theme }) => theme.colors.orange};
    border-radius: 1px;
    transition: transform ${({ theme }) => theme.transitions.base};
  }
  &::before { left: 0; right: 0; top: 50%; height: 2.5px; margin-top: -1.25px; }
  &::after  { top: 0; bottom: 0; left: 50%; width: 2.5px; margin-left: -1.25px; transform: scaleY(${({ $open }) => ($open ? 0 : 1)}); }
`;

const Reveal = styled.div`
  background: ${({ theme }) => theme.colors.skyBlueLight};
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "560px" : "0")};
  transition: max-height ${({ theme }) => theme.transitions.slow};
`;

const Pad = styled.div`
  padding: 2rem 2.25rem 2.5rem;
`;

export default function OurLaunchAccordion({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <Wrap>
      <Bar
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{data.launchTitle}</span>
        <Plus $open={open} aria-hidden="true" />
      </Bar>
      <Reveal $open={open} aria-hidden={!open}>
        <Pad>
          <Container>
            <Body $muted style={{ lineHeight: "1.7" }}>
              {data.launchBody}
            </Body>
          </Container>
        </Pad>
      </Reveal>
    </Wrap>
  );
}
