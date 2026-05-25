/**
 * Sanity Studio configuration.
 *
 * Loaded by the embedded studio mounted at /studio (see
 * src/app/studio/[[...index]]/page.jsx). The same file would also be
 * used by `sanity deploy` / `sanity dev` if we ever break the studio
 * out into a standalone deployment.
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { projectId, dataset, apiVersion } from "./studio/env";
import { schemaTypes } from "./studio/schemas";
import { structure, SINGLETON_TYPES } from "./studio/structure";

export default defineConfig({
  name: "connecting-communities",
  title: "Connecting Communities",
  projectId,
  dataset,
  apiVersion,

  basePath: "/studio",

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
    /* Prevent the "New document" menu from offering singleton types
     * (Site Settings, Home page, etc.) so editors can't accidentally
     * spawn duplicates. The pinned items in the sidebar are the only
     * way to reach them. */
    templates: (prev) =>
      prev.filter((t) => !SINGLETON_TYPES.includes(t.schemaType)),
  },

  document: {
    /* Hide "Duplicate" + "Delete" actions on singleton documents — they
     * should always be exactly one row in the dataset. */
    actions: (input, context) => {
      if (SINGLETON_TYPES.includes(context.schemaType)) {
        return input.filter(
          ({ action }) => !["duplicate", "delete", "unpublish"].includes(action)
        );
      }
      return input;
    },
  },
});
