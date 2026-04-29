import { ourModelContent, trACScenes } from "@/lib/site-content";
import OurModelHero from "@/components/our-model/OurModelHero";
import OurModelMain from "@/components/our-model/OurModelMain";
import OurModelJourney from "@/components/our-model/OurModelJourney";

export const metadata = { title: "Our Model" };

export default function OurModelPage() {
  return (
    <>
      <OurModelHero data={ourModelContent} />
      <OurModelMain data={ourModelContent} />
      <OurModelJourney data={ourModelContent} scenes={trACScenes} />
    </>
  );
}
