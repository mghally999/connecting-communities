import StyledComponentsRegistry from "@/styles/StyledComponentsRegistry";
import ThemeProvider from "@/styles/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { siteSettings } from "@/lib/site-content";

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
    <html lang="en">
      <head>
        {/* Manrope is loaded from Google Fonts via CSS — no build-time fetch. */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" }}>
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
