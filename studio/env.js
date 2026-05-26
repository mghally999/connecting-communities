/**
 * Centralised Sanity env-var access. Imported by both the Studio config
 * (server context) and the client (browser context).
 *
 * The projectId and dataset are public values (NEXT_PUBLIC_* — already
 * shipped in the client bundle), so we fall back to the known project
 * defaults when env vars are not set. This lets Vercel builds succeed
 * without per-environment configuration. The write token has no default.
 */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "m3p0sdrn";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const apiToken = process.env.SANITY_API_TOKEN;
