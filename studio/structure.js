/**
 * Studio desk structure — pins the singletons to the top of the
 * sidebar and exposes the artist collection underneath. Editors hit
 * `Site Settings`, `Home page`, `About page`, `Contact page` directly
 * (no "New document" button); artists are a normal list.
 */

const SINGLETONS = [
  { id: "siteSettings", type: "siteSettings", title: "Site Settings" },
  { id: "page_home",    type: "page_home",    title: "Home page" },
  { id: "page_about",   type: "page_about",   title: "About page" },
  { id: "page_contact", type: "page_contact", title: "Contact page" },
];

export const structure = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map((s) =>
        S.listItem()
          .title(s.title)
          .id(s.id)
          .child(
            S.document()
              .schemaType(s.type)
              .documentId(s.id)
          )
      ),
      S.divider(),
      S.listItem()
        .title("Artists (Ecosystem)")
        .child(S.documentTypeList("artist").title("Artists")),
    ]);

/** IDs that should never be duplicated or created from "New document". */
export const SINGLETON_IDS = SINGLETONS.map((s) => s.id);
export const SINGLETON_TYPES = SINGLETONS.map((s) => s.type);
