/**
 * The Sanity Studio renders its own full-page chrome, so we override
 * the inherited root layout (which would otherwise wrap it in Header +
 * Footer + body padding). This layout is intentionally bare.
 */

export const metadata = { title: "Studio | Connecting Communities" };

export default function StudioLayout({ children }) {
  return children;
}
