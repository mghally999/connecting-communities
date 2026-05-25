#!/usr/bin/env node
/**
 * Seed migration — push the current static content (siteSettings,
 * homeContent, aboutContent, contactContent) into Sanity as the
 * singleton documents the Studio + the frontend façade expect.
 *
 *   SANITY_API_TOKEN=skXXXX node scripts/seed-sanity.mjs
 *
 * Idempotent: re-running overwrites the same singleton IDs, so this
 * can be used to "reset to canonical" after experimentation.
 *
 * Images: this first pass writes the static /public/images/... paths
 * as plain strings into a `legacyImagePath` field (NOT a real Sanity
 * image asset). A second pass / future script will upload those files
 * to Sanity's CDN and convert the references — but that's a
 * heavier-touch migration and is left out of this initial seed so the
 * editor can start working immediately.
 */

import { createClient } from "@sanity/client";
import "dotenv/config"; // optional — works without if env is exported

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_API_TOKEN. Generate one at\n" +
    "  https://www.sanity.io/manage/project/" + projectId + "/api\n" +
    "with Editor permissions and export it before running this script."
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// Dynamic import so this script runs even when the static archive
// is restructured later — we just take whatever it exports.
const {
  siteSettings,
  homeContent,
  aboutContent,
  contactContent,
} = await import("../src/lib/site-content.js");

async function upsert(id, doc) {
  await client.createOrReplace({ _id: id, ...doc });
  console.log(`  ✓ ${doc._type} / ${id}`);
}

console.log(`Seeding project ${projectId} / dataset ${dataset}\n`);

await upsert("siteSettings", {
  _type: "siteSettings",
  title: siteSettings.title,
  tagline: siteSettings.tagline,
  navLinks: (siteSettings.navLinks || []).map(({ label, href }) => ({
    _key: slug(label + href),
    label, href,
  })),
  footerColumns: (siteSettings.footerColumns || []).map((col, i) => ({
    _key: `col-${i}`,
    links: (col.links || []).map((l) => ({
      _key: slug(l.label + l.href),
      label: l.label,
      href: l.href,
    })),
  })),
  copyright: siteSettings.copyright,
});

await upsert("page_home", {
  _type: "page_home",
  heroTitle:    homeContent.heroTitle,
  heroBody:     homeContent.heroBody,
  heroCtaLabel: homeContent.heroCtaLabel,
  heroCtaHref:  homeContent.heroCtaHref,
  whyTitle:     homeContent.whyTitle,
  whyBody:      homeContent.whyBody,
  approachTitle: homeContent.approachTitle,
  impactTitle:  homeContent.impactTitle,
  impactStats:  (homeContent.impactStats || []).map((s, i) => ({
    _key: `s-${i}`, value: s.value, label: s.label,
  })),
  partnersTitle: homeContent.partnersTitle,
  partnerSlides: (homeContent.partnerSlides || []).map((s, i) => ({
    _key: `p-${i}`, label: s.label, href: s.href || undefined,
  })),
  contactTitle:    homeContent.contactTitle,
  contactCtaLabel: homeContent.contactCtaLabel,
});

await upsert("page_about", {
  _type: "page_about",
  heroTitle:   aboutContent.heroTitle,
  heroBody:    aboutContent.heroBody,
  storyTitle:  aboutContent.storyTitle,
  storyBody:   aboutContent.storyBody,
  launchTitle: aboutContent.launchTitle,
  launchBody:  aboutContent.launchBody,
  partnersTitle: aboutContent.partnersTitle,
  partnersBody:  aboutContent.partnersBody,
  sectorCards: (aboutContent.sectorCards || []).map((c, i) => ({
    _key: `s-${i}`,
    label: c.label,
    back: c.back,
    ctaLabel: c.ctaLabel || undefined,
    ctaHref: c.ctaHref || undefined,
  })),
  akaTitle: aboutContent.akaTitle,
  akaBody:  aboutContent.akaBody,
  akaCtaLabel: aboutContent.akaCtaLabel,
  leadersTitle: aboutContent.leadersTitle,
});

await upsert("page_contact", {
  _type: "page_contact",
  heroTitle: contactContent.heroTitle,
  heroBody:  contactContent.heroBody,
  introTitle: contactContent.introTitle,
  introBody:  contactContent.introBody,
  hqTitle:   contactContent.hqTitle,
  hqAddress: contactContent.hqAddress,
  hqEmail:   contactContent.hqEmail,
  hqPhone:   contactContent.hqPhone,
});

console.log("\nDone. Visit /studio to start editing.\n");

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}
