"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Container, Body } from "@/components/primitives";
import SmartImage from "@/components/SmartImage";

/**
 * Accordion
 *
 * Generic, controlled-or-uncontrolled accordion section used by both
 * "Our Story" and "Our Launch" on the About page. Each accordion has:
 *   - a clickable Bar with Title + animated +/− indicator
 *   - a Panel that opens to reveal a 2-column layout: text on the left,
 *     image on the right (responsive: stacks on mobile)
 *
 * The panel height animates smoothly using `max-height` driven by the
 * actual content height (measured at runtime) so it works for any
 * content length without hard-coded values.
 */

const Wrap = styled.section`
  background: ${({ $theme: t, theme }) =>
    t === "light" ? theme.colors.cream : theme.colors.creamGrey};
  border-bottom: 1px solid ${({ theme }) => theme.colors.greyBg};
`;

const Bar = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({ $open, $accentColor, theme }) =>
    $open ? $accentColor || theme.colors.skyBlue : "transparent"};
  border: 0;
  color: ${({ theme }) => theme.colors.navy};
  padding: 1.6rem 2.25rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.6rem, 2.8vw, 2.4rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: -0.005em;
  cursor: pointer;
  text-align: left;
  transition: background ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ $accentColor, theme }) =>
      $accentColor || theme.colors.skyBlue};
  }
  @media (max-width: 768px) { padding: 1.2rem 1.5rem; }
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
  &::before {
    left: 0; right: 0; top: 50%;
    height: 2.5px; margin-top: -1.25px;
  }
  &::after {
    top: 0; bottom: 0; left: 50%;
    width: 2.5px; margin-left: -1.25px;
    transform: scaleY(${({ $open }) => ($open ? 0 : 1)});
  }
`;

const Panel = styled.div`
  background: ${({ $accentSoft, theme }) =>
    $accentSoft || theme.colors.skyBlueLight};
  overflow: hidden;
  max-height: ${({ $open, $h }) => ($open ? `${$h}px` : "0")};
  transition: max-height ${({ theme }) => theme.transitions.slow};
`;

const Inner = styled.div`
  padding: 2rem 2.25rem 2.5rem;
  @media (max-width: 768px) { padding: 1.5rem 1.5rem 2rem; }
`;

const Grid = styled.div`
  display: grid;
  gap: 3rem;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Pic = styled.div`
  position: relative;
  aspect-ratio: 16 / 11;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skyBlueLight};
`;

export default function Accordion({
  title,
  body,
  image,
  imageAlt,
  defaultOpen = false,
  accentColor,
  accentSoft,
  themeMode = "light",
}) {
  const [open, setOpen] = useState(defaultOpen);
  const innerRef = useRef(null);
  const [height, setHeight] = useState(720);

  // Measure the panel content so the max-height animation can target
  // the actual height instead of a guessed magic number.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const measure = () => {
      if (innerRef.current) {
        setHeight(innerRef.current.offsetHeight + 16);
      }
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [body, image]);

  return (
    <Wrap $theme={themeMode}>
      <Bar
        type="button"
        aria-expanded={open}
        $open={open}
        $accentColor={accentColor}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <Plus $open={open} aria-hidden="true" />
      </Bar>
      <Panel $open={open} $h={height} $accentSoft={accentSoft} aria-hidden={!open}>
        <Inner ref={innerRef}>
          <Container>
            <Grid>
              <Body
                $muted
                style={{ lineHeight: "1.75", maxWidth: "60ch" }}
              >
                {body}
              </Body>
              {image && (
                <Pic>
                  <SmartImage
                    src={image}
                    alt={imageAlt || title}
                    fallbackLabel={title}
                  />
                </Pic>
              )}
            </Grid>
          </Container>
        </Inner>
      </Panel>
    </Wrap>
  );
}
