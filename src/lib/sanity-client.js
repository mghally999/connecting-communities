/**
 * Sanity client + image-URL builder.
 *
 * This is the only place the rest of the app touches `@sanity/client`
 * directly. Components import `getSettings`, `getHome`, etc. from
 * `./sanity-content`, which wraps these primitives with the static
 * fallback layer.
 */

import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

import {
  projectId,
  dataset,
  apiVersion,
  apiToken,
} from "../../studio/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  /* `useCdn: true` serves stale-but-fast reads from the Sanity CDN.
   * Drafts are NEVER served from the CDN, so previews of unpublished
   * content will need a separate authenticated client (TODO). */
  useCdn: true,
  perspective: "published",
});

/** Server-only client for write operations (seed scripts, webhooks). */
export const writeClient = apiToken
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token: apiToken,
      useCdn: false,
    })
  : null;

const builder = imageUrlBuilder(client);

/** Convenience: pass any Sanity image ref + chain transforms. */
export function urlFor(source) {
  return builder.image(source);
}
