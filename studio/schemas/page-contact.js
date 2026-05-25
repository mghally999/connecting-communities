import { defineType, defineField } from "sanity";

export default defineType({
  name: "page_contact",
  title: "Contact page",
  type: "document",
  groups: [
    { name: "hero",  title: "Hero" },
    { name: "intro", title: "Intro block" },
    { name: "hq",    title: "Headquarters" },
  ],
  fields: [
    defineField({ name: "heroTitle", type: "text",  rows: 3, group: "hero" }),
    defineField({ name: "heroBody",  type: "text",  rows: 3, group: "hero" }),
    defineField({ name: "heroImage", type: "image", group: "hero", options: { hotspot: true } }),

    defineField({ name: "introTitle", type: "string", group: "intro" }),
    defineField({ name: "introBody",  type: "text", rows: 6, group: "intro" }),

    defineField({ name: "hqTitle",   type: "string", group: "hq" }),
    defineField({ name: "hqAddress", type: "text", rows: 3, group: "hq" }),
    defineField({ name: "hqEmail",   type: "string", group: "hq" }),
    defineField({ name: "hqPhone",   type: "string", group: "hq" }),
    defineField({ name: "hqMapEmbed", type: "url", title: "Google Maps embed URL", group: "hq" }),
  ],
  preview: { prepare: () => ({ title: "Contact page" }) },
});
