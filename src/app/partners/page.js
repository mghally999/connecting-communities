import { partnersContent } from "@/lib/site-content";
import PartnersHero from "@/components/partners/PartnersHero";
import PartnersGrid from "@/components/partners/PartnersGrid";

export const metadata = { title: "Partners" };

export default function PartnersPage() {
  return (
    <>
      <PartnersHero data={partnersContent} />
      <PartnersGrid data={partnersContent} />
    </>
  );
}
