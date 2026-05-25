import { notFound } from "next/navigation";
import { ARTISTS, findArtist } from "@/lib/talent-artists";
import TalentExperience from "@/components/talent/TalentExperience";

/**
 * /ecosystem/[slug] is rendered by the SAME client component as
 * /ecosystem. The route exists to provide SEO + direct deep-links +
 * SSG; once the client tree hydrates, all phase transitions stay
 * inside that tree and the URL is updated by history.pushState rather
 * than the Next router.
 */

function isValidSlugShape(s) {
  return typeof s === "string" && /^[a-z0-9][a-z0-9-]{0,80}$/i.test(s);
}

export async function generateStaticParams() {
  return ARTISTS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!isValidSlugShape(slug)) return { title: "Not found — Ecosystem" };
  const artist = findArtist(slug);
  if (!artist) return { title: "Not found — Ecosystem" };
  return {
    title: `${artist.name} — Ecosystem in Action`,
    description: artist.exhibition || artist.title,
  };
}

export default async function ArtistPage({ params }) {
  const { slug } = await params;
  if (!isValidSlugShape(slug)) notFound();
  const artist = findArtist(slug);
  if (!artist) notFound();
  return <TalentExperience initialSlug={slug} />;
}
