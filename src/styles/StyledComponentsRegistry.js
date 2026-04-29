"use client";

/**
 * StyledComponentsRegistry — required for SSR with the App Router.
 * It collects styles on the server and flushes them into the HTML stream
 * so the first paint is fully styled (no FOUC).
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/styling/css-in-js
 */

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({ children }) {
  // Lazy-initialise once per request so the sheet is preserved through Suspense.
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // On the client we just render children directly.
  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
