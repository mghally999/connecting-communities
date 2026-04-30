"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.navy};
    background: ${({ theme }) => theme.colors.cream};
    /* IMPORTANT: overflow-x: hidden on html/body would compute overflow-y
     * to 'auto' per the CSS spec, which breaks position: sticky on every
     * descendant — including the Our Model walkthrough's pinned stage.
     * We rely on individual sections / containers to keep their content
     * within the viewport instead. */
    scroll-behavior: smooth;
  }

  body {
    min-height: 100vh;
    line-height: 1.55;
    font-size: ${({ theme }) => theme.fontSizes.base};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    color: ${({ theme }) => theme.colors.navy};
    line-height: 1.1;
    letter-spacing: -0.005em;
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin: 0;
  }

  p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }
  img, video, canvas { max-width: 100%; display: block; }

  ::selection {
    background: ${({ theme }) => theme.colors.orange};
    color: ${({ theme }) => theme.colors.white};
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.cream}; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.navy};
    border-radius: 999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.orange};
  }
`;
