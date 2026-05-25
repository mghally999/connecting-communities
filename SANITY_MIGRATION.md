# Sanity CMS migration — handoff

This document captures the **state of the migration as of 2026-05-26**,
how to use what's already wired, and the punch list for getting the
remaining surfaces under Sanity's control.

## What's in place (this commit)

### Backups
- **Git tag** `pre-sanity-frontend-2026-05-26` points at the last
  commit before any Sanity code landed. Restore with
  `git checkout pre-sanity-frontend-2026-05-26`.
- **Tarball** `archives/pre-sanity-frontend-2026-05-26.tar.gz` (85 MB)
  contains `src/`, `public/`, and key configs. `archives/` is git-
  ignored — store the tarball wherever you keep cold backups.

### Sanity project
- **Project ID:** `m3p0sdrn`
- **Org:** `o67JegwBs`
- **Dataset:** `production` (default)
- Env vars live in `.env.local` (not committed; values shown in the
  file header). Add `SANITY_API_TOKEN` (Editor scope) before running
  the seed script.

### Files added
```
.env.local                                  env vars
sanity.config.js                            studio config (root, per Sanity convention)
studio/env.js                               centralised env-var access
studio/structure.js                         desk-tool sidebar layout (pins singletons)
studio/schemas/index.js                     schema barrel
studio/schemas/siteSettings.js              site-wide singleton (nav, footer)
studio/schemas/page-home.js                 home-page singleton
studio/schemas/page-about.js                about-page singleton
studio/schemas/page-contact.js              contact-page singleton
studio/schemas/artist.js                    /ecosystem artist collection
src/app/studio/[[...index]]/page.jsx        embedded Studio at /studio
src/app/studio/[[...index]]/layout.jsx      bare layout for the studio route
src/lib/sanity-client.js                    Sanity client + image URL builder
src/lib/sanity-content.js                   façade: Sanity → static fallback
scripts/seed-sanity.mjs                     pushes site-content.js into Sanity
```

### What's already migrated (end-to-end)

- **Site settings** (Header nav links, footer columns, copyright).
  `src/app/layout.js` now `await`s `getSettings()`. Edit in Studio at
  `/studio` → "Site Settings" and the change shows up on the next
  page load. If Sanity is unreachable or the document hasn't been
  published yet, the layout silently falls back to
  `src/lib/site-content.js`'s `siteSettings` export.

## How to bring up Studio for the first time

1. Make sure the project's `production` dataset exists (Sanity usually
   auto-creates it). If not, run `npx sanity dataset create production`.
2. Issue an API token at
   `https://www.sanity.io/manage/project/m3p0sdrn/api`. Editor scope.
3. Paste the token into `.env.local`:
   ```
   SANITY_API_TOKEN=sk...
   ```
4. Run the seed:
   ```
   node scripts/seed-sanity.mjs
   ```
   This creates `siteSettings`, `page_home`, `page_about`,
   `page_contact` documents from the current static content.
5. Start the dev server (`npm run dev`) and visit `/studio`. Log in
   with your Sanity account. The four singletons appear in the
   sidebar; everything else is empty until the next migration step.

## Punch list — remaining surfaces

Each item below is a self-contained piece of work. Pick them off in any
order; they all follow the same three-step pattern:

1. **Schema** — add fields to the relevant `studio/schemas/*.js` file
   if any are missing.
2. **Query** — extend the corresponding GROQ projection in
   `src/lib/sanity-content.js` (the structure is already there for the
   four singletons; add new getters for collections).
3. **Component swap** — replace the `import { foo } from "@/lib/site-content"`
   in the consuming page or component with `const foo = await getFoo()`
   (and make the component `async` if it isn't already).

### 1. Home-page sections beyond hero
`HomeHero` already reads from `homeContent` props passed down by
`src/app/page.js`. To complete the home migration:
- [ ] `src/app/page.js`: replace `import { homeContent } from
      "@/lib/site-content"` with `const homeContent = await getHome()`.
      (The component already destructures the same shape.)
- [ ] Verify each home section component renders with Sanity data:
      `HomeHero`, `WhyWeExist`, `OurApproach`, `ImpactStats`,
      `PartnerCarousel`, `ContactBlock`. They all already take a
      `data` prop with the same keys.

### 2. About page
- [ ] `src/app/about/page.js`: `const aboutContent = await getAbout()`.
- [ ] No component changes needed — the page already passes a `data`
      prop.

### 3. Contact page
- [ ] `src/app/contact/page.js`: `const contactContent = await getContact()`.

### 4. Image migration (the heavy bit)
The seed script writes the static `/images/...` paths into Sanity as
strings, NOT as real Sanity image assets. To get the benefits of
Sanity's CDN + image transforms, each image needs to be uploaded as an
asset and the field's type changed from `string` to `image`.

Two ways:
- **Editorial:** open each document in Studio and re-upload the image.
  Slow but fine for a 50-image site.
- **Scripted:** extend `scripts/seed-sanity.mjs` to call
  `client.assets.upload("image", fs.readFileSync(path))` for each
  image, then patch the document with the returned `_id`.

The schema fields are already declared as `type: "image"`, so the only
work is populating them.

### 5. Artists (Ecosystem)
The `artist` schema exists but no documents yet. To migrate the 20
artists in `src/lib/talent-artists.js`:

- [ ] Extend `scripts/seed-sanity.mjs` (or add `scripts/seed-artists.mjs`)
      to iterate `ARTISTS` and `createOrReplace` an artist document per
      entry. Sections need to map to the right Sanity object types
      (`imageSection`, `proseSection`, etc. — names match the kind
      field).
- [ ] Add `getArtists()` and `getArtist(slug)` to
      `src/lib/sanity-content.js` with GROQ queries that hydrate all
      section variants.
- [ ] Update `src/components/talent/TalentExperience.js` to receive
      `artists` as a prop (or fetch it server-side in the page) instead
      of importing from `@/lib/talent-artists`.
- [ ] Same for `src/components/talent/Portfolio.js` — pass a hydrated
      artist object.

### 6. /our-model walkthrough chapters
The cinematic walkthrough reads `src/lib/journey-chapters.js`. Each
chapter has a camera target, body copy, image, and timing. Add a
`journeyChapter` schema (mirroring its shape), expose
`getJourneyChapters()` in `sanity-content.js`, and update
`src/components/our-model/OurModelJourney.js` to receive them as a prop.

### 7. GLB / 3D assets
The `building.glb` model lives at `/public/models/building.glb`. Sanity
supports file uploads up to 250 MB. Two approaches:
- Upload the GLB as a Sanity `file` asset and reference it from a new
  `meta` singleton (`modelUrl`). Cleanest.
- Or keep it in `/public/models/` and just store a `string` reference
  in Sanity. Lower lift; works fine because it's a static asset.

### 8. Tighten — remove `site-content.js` exports as they're replaced
Once every consumer of a given field has switched to `sanity-content`,
delete the field from `site-content.js`. The static archive remains
useful as a development seed and disaster fallback, so leave it on
disk — just trim entries you've moved.

## Studio conventions

- **Singletons** (Site Settings, Home, About, Contact) have fixed
  document IDs equal to their type name (e.g. `siteSettings`,
  `page_home`). The Studio's "New document" menu is configured to
  hide singleton types so editors can't create duplicates.
- **Slugs** for artists are auto-generated from `name` via the
  built-in slug input.
- **Field groups** (tabs across the top of singleton documents) match
  the visual sections of each page — `Hero`, `Why we exist`,
  `Our approach`, etc. — so editors see one tab per page region.

## Caveats / known issues

- **Drafts** are NOT served by `useCdn: true`. Editors must publish to
  see changes on the live frontend. To support draft preview, add a
  preview-mode route that swaps in an authenticated client.
- **Hot reload**: Next.js Fast Refresh sometimes misses changes to
  schema files. Restart `npm run dev` if a new field doesn't show up
  in Studio.
- **Peer-deps**: the project relies on `--legacy-peer-deps` because of
  a `@react-three/drei` (peer `fiber@^8`) vs installed `fiber@^9`
  conflict that predates this work. Install with
  `npm install ... --legacy-peer-deps` or set an
  `npmrc legacy-peer-deps=true`.
