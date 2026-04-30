import { ourModelContent } from "@/lib/site-content";
import OurModelJourney from "@/components/our-model/OurModelJourney";
import ModelAfterText from "@/components/our-model/ModelAfterText";

export const metadata = { title: "Our Model" };

/**
 * Per the client brief: the Our Model page is now a focused
 * cinematic walkthrough of the hubsite design. The two earlier
 * Canva-style sections and the X/Y community-smarthubs closing band
 * have been removed; any supporting explanatory text appears after
 * the walkthrough.
 */
export default function OurModelPage() {
  return (
    <>
      <OurModelJourney data={ourModelContent} />
      <ModelAfterText data={ourModelContent} />
    </>
  );
}
