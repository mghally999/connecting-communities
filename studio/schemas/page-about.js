import { defineType, defineField } from "sanity";

export default defineType({
  name: "page_about",
  title: "About page",
  type: "document",
  groups: [
    { name: "hero",     title: "Hero" },
    { name: "story",    title: "Our story" },
    { name: "launch",   title: "Our launch" },
    { name: "partners", title: "Partners & sectors" },
    { name: "aka",      title: "AKA block" },
    { name: "leaders",  title: "Leaders grid" },
  ],
  fields: [
    // Hero
    defineField({ name: "heroTitle", type: "text",  rows: 3, group: "hero" }),
    defineField({ name: "heroBody",  type: "text",  rows: 3, group: "hero" }),
    defineField({ name: "heroImage", type: "image", group: "hero", options: { hotspot: true } }),

    // Our story (accordion)
    defineField({ name: "storyTitle", type: "string", group: "story" }),
    defineField({ name: "storyBody",  type: "text", rows: 6, group: "story" }),
    defineField({ name: "storyImage", type: "image", group: "story", options: { hotspot: true } }),

    // Our launch (accordion)
    defineField({ name: "launchTitle", type: "string", group: "launch" }),
    defineField({ name: "launchBody",  type: "text", rows: 6, group: "launch" }),
    defineField({ name: "launchImage", type: "image", group: "launch", options: { hotspot: true } }),

    // Partners & sectors
    defineField({ name: "partnersTitle", type: "string", group: "partners" }),
    defineField({ name: "partnersBody",  type: "text", rows: 5, group: "partners" }),
    defineField({
      name: "sectorCards",
      title: "Sector flip cards",
      type: "array",
      group: "partners",
      of: [
        {
          type: "object",
          fields: [
            { name: "label",    type: "string", validation: (r) => r.required() },
            { name: "image",    type: "image", options: { hotspot: true } },
            { name: "back",     type: "text", rows: 4, title: "Back-face description" },
            { name: "ctaLabel", type: "string", title: "CTA label (e.g. \"Learn more\")" },
            { name: "ctaHref",  type: "url",    title: "External URL (leave empty to disable the link)" },
          ],
          preview: { select: { title: "label", subtitle: "ctaHref", media: "image" } },
        },
      ],
    }),

    // AKA block
    defineField({ name: "akaTitle",    type: "string", group: "aka" }),
    defineField({ name: "akaBody",     type: "text", rows: 10, group: "aka" }),
    defineField({ name: "akaCtaLabel", type: "string", group: "aka" }),
    defineField({ name: "akaCtaHref",  type: "string", group: "aka" }),
    defineField({ name: "akaImage",    type: "image", group: "aka", options: { hotspot: true } }),

    // Leaders grid
    defineField({ name: "leadersTitle", type: "string", group: "leaders" }),
    defineField({
      name: "leaders",
      type: "array",
      group: "leaders",
      of: [
        {
          type: "object",
          fields: [
            { name: "name",  type: "string" },
            { name: "title", type: "string" },
            { name: "bio",   type: "text", rows: 4 },
            { name: "image", type: "image", options: { hotspot: true } },
          ],
          preview: { select: { title: "name", subtitle: "title", media: "image" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "About page" }) },
});
