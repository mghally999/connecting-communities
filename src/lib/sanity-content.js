/**
 * sanity-content.js — façade over Sanity that transparently falls back
 * to the static `site-content.js` archive when Sanity is unreachable
 * or a document hasn't been published yet.
 *
 * USAGE
 *   import { getSettings, getHome } from "@/lib/sanity-content";
 *   const settings = await getSettings();
 *   const home     = await getHome();
 *
 * Each getter returns a plain object with the SAME SHAPE the existing
 * components consume from `site-content.js`. That means a component
 * can be migrated without changing its prop interface — just switch
 * its data source from `import { homeContent }` to `await getHome()`.
 *
 * FALLBACK BEHAVIOUR
 *   - Sanity returns a document → use it.
 *   - Sanity returns null (singleton unpublished) → return static.
 *   - Sanity throws (network down, bad token, etc.) → log + return
 *     static. Errors never propagate, so the site never goes blank
 *     because the CMS hiccupped.
 *
 * This file is the migration seam. To bring any new field "under
 * Sanity's control": (1) add the field to the appropriate schema in
 * sanity/schemas/, (2) update the GROQ projection here, (3) replace
 * the corresponding static import in the page component.
 */

import { client } from "./sanity-client";
import {
  siteSettings as staticSettings,
  homeContent,
  aboutContent,
  contactContent,
} from "./site-content";

/* ------------------------------------------------------------------ *
 * Helpers                                                            *
 * ------------------------------------------------------------------ */

/** Run a GROQ query; swallow errors so a CMS outage never blanks the
 *  site. Logs to stderr so problems are visible during dev. */
async function safeFetch(query, params = {}) {
  try {
    return await client.fetch(query, params);
  } catch (err) {
    if (typeof console !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn("[sanity] fetch failed, falling back to static:", err?.message || err);
    }
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Site Settings                                                      *
 * ------------------------------------------------------------------ */

const SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    title,
    tagline,
    navLinks[]{ label, href },
    footerColumns[]{
      links[]{ label, href }
    },
    copyright
  }
`;

export async function getSettings() {
  const doc = await safeFetch(SETTINGS_QUERY);
  if (!doc) return staticSettings;
  return {
    ...staticSettings,
    ...doc,
    navLinks: doc.navLinks?.length ? doc.navLinks : staticSettings.navLinks,
    footerColumns: doc.footerColumns?.length
      ? doc.footerColumns
      : staticSettings.footerColumns,
  };
}

/* ------------------------------------------------------------------ *
 * Page: Home                                                         *
 * ------------------------------------------------------------------ */

const HOME_QUERY = /* groq */ `
  *[_type == "page_home" && _id == "page_home"][0] {
    heroTitle, heroBody, heroCtaLabel, heroCtaHref,
    "heroImage": heroImage.asset->url,
    whyTitle, whyBody,
    "whyImage": whyImage.asset->url,
    approachTitle,
    approachItems[]{ title, body, "image": image.asset->url },
    impactTitle,
    impactStats[]{ value, label },
    partnersTitle,
    partnerSlides[]{ label, href, "image": image.asset->url },
    contactTitle, contactCtaLabel
  }
`;

export async function getHome() {
  const doc = await safeFetch(HOME_QUERY);
  if (!doc) return homeContent;
  return mergeSparse(homeContent, doc);
}

/* ------------------------------------------------------------------ *
 * Page: About                                                        *
 * ------------------------------------------------------------------ */

const ABOUT_QUERY = /* groq */ `
  *[_type == "page_about" && _id == "page_about"][0] {
    heroTitle, heroBody,
    "heroImage": heroImage.asset->url,
    storyTitle, storyBody,
    "storyImage": storyImage.asset->url,
    launchTitle, launchBody,
    "launchImage": launchImage.asset->url,
    partnersTitle, partnersBody,
    sectorCards[]{
      label, back, ctaLabel, ctaHref,
      "image": image.asset->url
    },
    akaTitle, akaBody, akaCtaLabel, akaCtaHref,
    "akaImage": akaImage.asset->url,
    leadersTitle,
    leaders[]{
      name, title, bio,
      "image": image.asset->url
    }
  }
`;

export async function getAbout() {
  const doc = await safeFetch(ABOUT_QUERY);
  if (!doc) return aboutContent;
  return mergeSparse(aboutContent, doc);
}

/* ------------------------------------------------------------------ *
 * Page: Contact                                                      *
 * ------------------------------------------------------------------ */

const CONTACT_QUERY = /* groq */ `
  *[_type == "page_contact" && _id == "page_contact"][0] {
    heroTitle, heroBody,
    "heroImage": heroImage.asset->url,
    introTitle, introBody,
    hqTitle, hqAddress, hqEmail, hqPhone, hqMapEmbed
  }
`;

export async function getContact() {
  const doc = await safeFetch(CONTACT_QUERY);
  if (!doc) return contactContent;
  return mergeSparse(contactContent, doc);
}

/* ------------------------------------------------------------------ *
 * Merge utility — Sanity values override static defaults, but ONLY
 * when the Sanity value is non-empty. Lets editors fill in fields
 * incrementally without blanking out the rest of the page.            *
 * ------------------------------------------------------------------ */

function mergeSparse(fallback, override) {
  const out = { ...fallback };
  for (const [k, v] of Object.entries(override)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
}
