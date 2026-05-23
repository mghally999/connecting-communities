import { notFound } from "next/navigation";
import { ARTISTS, findArtist, nextArtist } from "@/lib/talent-artists";
import ArtistPortfolio from "./ArtistPortfolio";

export async function generateStaticParams() {
  return ARTISTS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artist = findArtist(slug);
  if (!artist) return { title: "Not found — Foam Talent" };
  return {
    title: `${artist.name} — Foam Talent 2024`,
    description: artist.title,
  };
}

export default async function ArtistPage({ params }) {
  const { slug } = await params;
  const artist = findArtist(slug);
  if (!artist) notFound();
  const next = nextArtist(slug);
  return <ArtistPortfolio artist={artist} next={next} />;
}
