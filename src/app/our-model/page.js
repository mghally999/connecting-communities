import { ourModelContent } from "@/lib/site-content";
import OurModelHero from "@/components/our-model/OurModelHero";
import OurModelMain from "@/components/our-model/OurModelMain";
import OurModelLaunch from "@/components/our-model/OurModelLaunch";

export const metadata = { title: "Our Model" };

export default function OurModelPage() {
  return (
    <>
      <OurModelHero data={ourModelContent} />
      <OurModelMain data={ourModelContent} />
      <OurModelLaunch data={ourModelContent} />
    </>
  );
}
