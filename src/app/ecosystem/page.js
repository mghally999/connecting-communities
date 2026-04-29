import { ecosystemContent } from "@/lib/site-content";
import EcosystemHero from "@/components/ecosystem/EcosystemHero";
import EcosystemBoard from "@/components/ecosystem/EcosystemBoard";

export const metadata = { title: "Ecosystem in Action" };

export default function EcosystemPage() {
  return (
    <>
      <EcosystemHero data={ecosystemContent} />
      <EcosystemBoard data={ecosystemContent} />
    </>
  );
}
