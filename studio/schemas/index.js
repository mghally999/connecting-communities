import siteSettings from "./siteSettings";
import pageHome     from "./page-home";
import pageAbout    from "./page-about";
import pageContact  from "./page-contact";
import artist       from "./artist";

/**
 * Registered schema types. Order matters for the Studio's "New
 * document" menu — most-frequently-edited first.
 *
 * NOTE — the singletons (siteSettings, page_home, page_about,
 * page_contact) are intended to have exactly ONE document each. The
 * desk-tool structure (see sanity.config.js) restricts the New menu so
 * editors can't accidentally create duplicates.
 */
export const schemaTypes = [
  siteSettings,
  pageHome,
  pageAbout,
  pageContact,
  artist,
];
