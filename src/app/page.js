import HomeHero from "@/components/home/HomeHero";
import WhyWeExist from "@/components/home/WhyWeExist";
import OurApproach from "@/components/home/OurApproach";
import ImpactStats from "@/components/home/ImpactStats";
import PartnerCarousel from "@/components/home/PartnerCarousel";
import ContactBlock from "@/components/ContactBlock";
import OurModelJourney from "@/components/our-model/OurModelJourney";
import { homeContent } from "@/lib/site-content";

export const metadata = { title: "Home — Connecting Communities" };

/**
 * Home page. The /our-model walkthrough is mounted below the static
 * sections so the user lands on the standard hero, scrolls through
 * the brand narrative, and is then handed straight into the cinematic
 * scroll-driven hubsite tour — same component, same behaviour as on
 * the /our-model route.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero data={homeContent} />
      <WhyWeExist data={homeContent} />
      <OurApproach data={homeContent} />
      <ImpactStats data={homeContent} />
      <PartnerCarousel data={homeContent} />
      <OurModelJourney />
      <ContactBlock title={homeContent.contactTitle} ctaLabel={homeContent.contactCtaLabel} />
    </>
  );
}
