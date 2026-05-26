import localFont from "next/font/local";
import StyledComponentsRegistry from "@/styles/StyledComponentsRegistry";
import ThemeProvider from "@/styles/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { siteSettings } from "@/lib/site-content";

/**
 * Stolzl is the brand typeface (per client). We ship the two weights they
 * licensed locally — Book (used for body) and Regular (used for headings
 * and buttons). next/font/local generates an optimized self-hosted CSS
 * @font-face plus a CSS variable we expose globally.
 */
const stolzl = localFont({
  src: [
    {
      path: "../../public/fonts/Stolzl-Book.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Stolzl-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Stolzl-Regular.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Stolzl-Regular.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Stolzl-Regular.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-stolzl",
  preload: true,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Connecting Communities — Connection is only the beginning",
    template: "%s | Connecting Communities",
  },
  description:
    "Together, we build access, opportunity, and futures that thrive — through Community Smart Hubs across East Africa and beyond.",
  icons: {
    icon: "/logo/cc-mark.svg",
    apple: "/logo/cc-mark.svg",
  },
  openGraph: {
    title: "Connecting Communities",
    description:
      "Together, we build access, opportunity, and futures that thrive.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    /* suppressHydrationWarning: a class browser extensions commonly
     * inject (Dark Reader adds `dark`, ColorZilla touches `style`, etc.)
     * mutate the <html> tag BEFORE React hydrates. Without this flag,
     * Next throws a hydration mismatch on every page load for users
     * with those extensions installed. The warning is purely cosmetic —
     * the extension's class is reapplied immediately after hydration. */
    <html lang="en" className={stolzl.variable} suppressHydrationWarning>
      <head>
        {/* Hint the browser to start fetching the heavy hubsite GLB
         * during initial parse so it lands by the time the user
         * scrolls into the walkthrough section. */}
        <link
          rel="preload"
          as="fetch"
          href="/models/building.glb"
          type="model/gltf-binary"
          crossOrigin="anonymous"
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "var(--font-stolzl), -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <StyledComponentsRegistry>
          <ThemeProvider>
            <Header navLinks={siteSettings.navLinks} />
            <main>{children}</main>
            <Footer settings={siteSettings} />
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
