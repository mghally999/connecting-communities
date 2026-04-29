"use client";

import styled from "styled-components";

export const Section = styled.section`
  width: 100%;
  padding: ${({ $py }) => $py || "5rem 0"};
  @media (max-width: 768px) {
    padding: ${({ $pyMobile }) => $pyMobile || "3.5rem 0"};
  }
`;

export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme, $size }) =>
    $size === "wide"
      ? theme.layout.maxWidth
      : $size === "narrow"
      ? "920px"
      : theme.layout.contentWidth};
  margin: 0 auto;
  padding: 0 2.5rem;
  @media (max-width: 768px) { padding: 0 1.5rem; }
`;

export const H1 = styled.h1`
  font-size: clamp(2.4rem, 4.6vw, 4rem);
  line-height: 1.05;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: -0.01em;
`;
export const H2 = styled.h2`
  font-size: clamp(2rem, 3.4vw, 3rem);
  line-height: 1.1;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: -0.005em;
`;
export const H3 = styled.h3`
  font-size: clamp(1.3rem, 2vw, 1.65rem);
  line-height: 1.25;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;
export const Body = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  letter-spacing: 0.01em;
  color: ${({ $muted, theme }) => ($muted ? theme.colors.navy : "inherit")};
  white-space: ${({ $preserveLines }) => ($preserveLines ? "pre-line" : "normal")};
`;
