import { notFound } from "next/navigation";
import { ARTISTS, findArtist } from "@/lib/talent-artists";
import TalentExperience from "@/components/talent/TalentExperience";

/**
 * /talent/[slug] is rendered by the SAME client component as /talent.
 * The route exists to provide SEO + direct deep-links + SSG; once the
 * client tree hydrates, all phase transitions stay inside that tree and
 * the URL is updated by history.pushState rather than the Next router.
 */

export async function generateStaticParams() {
  return ARTISTS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artist = findArtist(slug);
  if (!artist) return { title: "Not found — Foam Talent" };
  return {
    title: `${artist.name} — Foam Talent 2024`,
    description: artist.exhibition || artist.title,
  };
}

export default async function ArtistPage({ params }) {
  const { slug } = await params;
  const artist = findArtist(slug);
  if (!artist) notFound();
  return <TalentExperience initialSlug={slug} />;
}
