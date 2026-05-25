import { defineType, defineField } from "sanity";

/**
 * Home page — singleton. Holds every section the home page renders, so
 * one document = one editable page. Fields mirror the keys consumed by
 * the existing home components (HomeHero, WhyWeExist, OurApproach,
 * ImpactStats, PartnerCarousel, ContactBlock).
 */
export default defineType({
  name: "page_home",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero",     title: "Hero" },
    { name: "why",      title: "Why we exist" },
    { name: "approach", title: "Our approach" },
    { name: "impact",   title: "Impact stats" },
    { name: "partners", title: "Partner carousel" },
    { name: "cta",      title: "Contact CTA" },
  ],
  fields: [
    // ---------- Hero ----------
    defineField({ name: "heroTitle",    type: "text",  rows: 2, group: "hero" }),
    defineField({ name: "heroBody",     type: "text",  rows: 3, group: "hero" }),
    defineField({ name: "heroCtaLabel", type: "string",         group: "hero" }),
    defineField({ name: "heroCtaHref",  type: "string",         group: "hero" }),
    defineField({ name: "heroImage",    type: "image", group: "hero", options: { hotspot: true } }),

    // ---------- Why we exist ----------
    defineField({ name: "whyTitle", type: "string", group: "why" }),
    defineField({ name: "whyBody",  type: "text", rows: 5, group: "why" }),
    defineField({ name: "whyImage", type: "image", group: "why", options: { hotspot: true } }),

    // ---------- Our approach ----------
    defineField({ name: "approachTitle", type: "string", group: "approach" }),
    defineField({
      name: "approachItems",
      title: "Approach pillars",
      type: "array",
      group: "approach",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string" },
            { name: "body",  type: "text", rows: 3 },
            { name: "image", type: "image", options: { hotspot: true } },
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),

    // ---------- Impact stats ----------
    defineField({ name: "impactTitle", type: "string", group: "impact" }),
    defineField({
      name: "impactStats",
      title: "Stats",
      type: "array",
      group: "impact",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string" },
            { name: "label", type: "string" },
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),

    // ---------- Partner carousel ----------
    defineField({ name: "partnersTitle", type: "string", group: "partners" }),
    defineField({
      name: "partnerSlides",
      type: "array",
      group: "partners",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "image", type: "image", options: { hotspot: true } },
            { name: "href",  type: "url", description: "External partner site (opens in new tab)" },
          ],
          preview: { select: { title: "label", subtitle: "href", media: "image" } },
        },
      ],
    }),

    // ---------- Contact CTA ----------
    defineField({ name: "contactTitle",    type: "string", group: "cta" }),
    defineField({ name: "contactCtaLabel", type: "string", group: "cta" }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
