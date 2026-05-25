"use client";

/**
 * Embedded Sanity Studio at /studio.
 *
 * Why embedded vs sanity.studio hosting:
 *   - One URL: editors go to /studio on whatever environment they're
 *     on (local, staging, prod) and edit the same dataset.
 *   - No separate deploy pipeline.
 *   - Drafts + live preview can share the Next.js bundle's auth.
 *
 * The route is a catch-all ([[...index]]) because Studio uses
 * client-side routing internally for its document panes, settings,
 * etc. All those paths must hit this same page.
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
