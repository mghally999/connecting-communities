import { defineType, defineField } from "sanity";

/**
 * Artist (used for /ecosystem and /ecosystem/[slug] portfolios).
 *
 * Each artist owns a free-form `sections` array — image, prose, quote,
 * audio, video, etc. — that the Portfolio component renders into
 * collage spreads. Mirrors the existing shape in
 * src/lib/talent-artists.js so the migration is direct.
 */
export default defineType({
  name: "artist",
  title: "Artist",
  type: "document",
  groups: [
    { name: "meta",     title: "Identity" },
    { name: "visual",   title: "Visual + brand" },
    { name: "pos",      title: "3D position" },
    { name: "content",  title: "Sections" },
  ],
  fields: [
    // ---------- Identity ----------
    defineField({ name: "name",       type: "string", group: "meta", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "meta",
      options: { source: "name", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "exhibition", type: "string", group: "meta", title: "Exhibition title" }),
    defineField({ name: "isPrimary",  type: "boolean", group: "meta", title: "Primary artist (sits at sphere centre)" }),
    defineField({
      name: "descHtml",
      type: "text",
      rows: 8,
      group: "meta",
      title: "Description (HTML)",
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),

    // ---------- Visual + brand ----------
    defineField({
      name: "hero",
      type: "image",
      group: "visual",
      options: { hotspot: true },
      description: "Used for the gallery thumbnail + intro cycle",
    }),
    defineField({ name: "accent",     type: "string", group: "visual", title: "Accent (hex, e.g. #ffffff)" }),
    defineField({ name: "accentText", type: "string", group: "visual", title: "Accent text (hex)" }),

    // ---------- 3D position (legacy authored data) ----------
    defineField({
      name: "pos3",
      type: "object",
      group: "pos",
      fields: [
        { name: "x", type: "string" },
        { name: "y", type: "string" },
        { name: "z", type: "string" },
      ],
    }),

    // ---------- Sections (free-form content) ----------
    defineField({
      name: "sections",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          name: "imageSection",
          title: "Image",
          fields: [
            { name: "kind", type: "string", initialValue: "image", hidden: true },
            { name: "image", type: "image", options: { hotspot: true } },
            { name: "alt", type: "string" },
            { name: "caption", type: "string" },
            { name: "credits", type: "string" },
            { name: "free", type: "boolean", title: "Free-positioned overlay" },
            { name: "top",       type: "string" },
            { name: "left",      type: "string" },
            { name: "width",     type: "string" },
            { name: "height",    type: "string" },
            { name: "marginTop", type: "string" },
            { name: "shadow", type: "boolean" },
          ],
          preview: { select: { title: "alt", media: "image" } },
        },
        {
          type: "object",
          name: "imagesSection",
          title: "Image grid",
          fields: [
            { name: "kind", type: "string", initialValue: "images", hidden: true },
            {
              name: "items",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "image", type: "image", options: { hotspot: true } },
                    { name: "alt",   type: "string" },
                    { name: "caption", type: "string" },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "proseSection",
          title: "Prose",
          fields: [
            { name: "kind", type: "string", initialValue: "prose", hidden: true },
            { name: "title", type: "string" },
            { name: "html",  type: "text", rows: 8 },
          ],
          preview: { select: { title: "title" } },
        },
        {
          type: "object",
          name: "quoteSection",
          title: "Quote",
          fields: [
            { name: "kind", type: "string", initialValue: "quote", hidden: true },
            { name: "html", type: "text", rows: 4 },
          ],
        },
        {
          type: "object",
          name: "podcastSection",
          title: "Podcast / audio",
          fields: [
            { name: "kind",     type: "string", initialValue: "podcast", hidden: true },
            { name: "title",    type: "string" },
            { name: "duration", type: "string", description: "e.g. 12:21" },
            { name: "file",     type: "file", title: "Audio file" },
          ],
        },
        {
          type: "object",
          name: "videoSection",
          title: "Video",
          fields: [
            { name: "kind",    type: "string", initialValue: "video", hidden: true },
            { name: "title",   type: "string" },
            { name: "file",    type: "file", title: "MP4 / WebM" },
            { name: "poster",  type: "image" },
            { name: "height",  type: "string" },
          ],
        },
        {
          type: "object",
          name: "inlineVideoSection",
          title: "Inline video (autoplay loop)",
          fields: [
            { name: "kind",   type: "string", initialValue: "inline-video", hidden: true },
            { name: "file",   type: "file", title: "MP4 / WebM" },
            { name: "height", type: "string" },
          ],
        },
        {
          type: "object",
          name: "embedSection",
          title: "Embed (raw HTML)",
          fields: [
            { name: "kind", type: "string", initialValue: "embed", hidden: true },
            { name: "html", type: "text", rows: 6 },
          ],
        },
        {
          type: "object",
          name: "viewerSection",
          title: "360° / interactive viewer",
          fields: [
            { name: "kind", type: "string", initialValue: "viewer", hidden: true },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "exhibition", media: "hero" },
  },
});
