import { defineType, defineField } from "sanity";

/**
 * Site-wide settings — singleton (only one document of this type ever).
 * Controls the header navigation, footer, and brand copy that shows on
 * every page.
 */
export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "navLinks",
      title: "Header navigation",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", validation: (r) => r.required() },
            { name: "href",  type: "string", validation: (r) => r.required() },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
    }),
    defineField({
      name: "footerColumns",
      title: "Footer columns",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", type: "string" },
                    { name: "href",  type: "string" },
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                },
              ],
            },
          ],
          preview: {
            select: { count: "links.length" },
            prepare: ({ count }) => ({ title: `Column (${count || 0} links)` }),
          },
        },
      ],
    }),
    defineField({
      name: "copyright",
      title: "Copyright line",
      type: "string",
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
