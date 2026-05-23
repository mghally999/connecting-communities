import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import bundleAnalyzer from "@next/bundle-analyzer";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* Wrap the config with the analyzer; activates only when ANALYZE=true so
 * normal builds aren't slowed down by HTML report generation. */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.CC_NEXT_DIST || ".next",
  // Allow building when the default .next is locked (root-owned in dev).
  // The CC_NEXT_DIST env var lets us redirect to a writable location.
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: true,
      pure: true,
      fileName: true,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  /* Heavy static assets (the 14 MB building GLB, fonts, textures)
   * never change after build, so we let any intermediate CDN/proxy
   * cache them aggressively. Saves the round-trip on repeat visits and
   * is essential for the walkthrough to start fast on the first paint. */
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Content-Type", value: "model/gltf-binary" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/logo/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
