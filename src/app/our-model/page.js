import OurModelJourney from "@/components/our-model/OurModelJourney";

export const metadata = { title: "Our Model" };

/**
 * Our Model is now the cinematic walkthrough only. The bullet list
 * that used to sit beneath it was removed per the client brief —
 * the explanatory copy lives inside the walkthrough captions.
 */
export default function OurModelPage() {
  return <OurModelJourney />;
}
