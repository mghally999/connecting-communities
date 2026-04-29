"use client";

import { ThemeProvider as SCThemeProvider } from "styled-components";
import { theme } from "./theme";
import { GlobalStyle } from "./GlobalStyle";

/**
 * Pairs the styled-components ThemeProvider with the GlobalStyle so theme tokens
 * are available throughout the tree. Kept tiny on purpose.
 */
export default function ThemeProvider({ children }) {
  return (
    <SCThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </SCThemeProvider>
  );
}
