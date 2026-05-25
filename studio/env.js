/**
 * Centralised Sanity env-var access. Imported by both the Studio config
 * (server context) and the client (browser context). Throws loud if a
 * required variable is missing so misconfiguration is caught at boot.
 */

export const projectId = assert(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
);

export const dataset = assert(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET"
);

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

/** Optional — only present when a write-capable token is configured. */
export const apiToken = process.env.SANITY_API_TOKEN;

function assert(v, name) {
  if (!v) {
    throw new Error(
      `[sanity] Missing required env var: ${name}. Set it in .env.local.`
    );
  }
  return v;
}
