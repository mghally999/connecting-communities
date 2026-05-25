import HomeHero from "@/components/home/HomeHero";
import WhyWeExist from "@/components/home/WhyWeExist";
import OurApproach from "@/components/home/OurApproach";
import ImpactStats from "@/components/home/ImpactStats";
import PartnerCarousel from "@/components/home/PartnerCarousel";
import ContactBlock from "@/components/ContactBlock";
import Reveal from "@/components/Reveal";
import { homeContent } from "@/lib/site-content";

export const metadata = { title: "Home — Connecting Communities" };

/**
 * Home page. The cinematic /our-model walkthrough used to be embedded
 * below the static sections; it now lives exclusively on its own
 * route so the homepage stays light. Sections without their own
 * internal Reveal get wrapped at the page level so the whole site
 * shares the same subtle fade-up entrance vibe — without doubling up
 * on sections that already use Reveal internally.
 */
export default function HomePage() {
  return (
    <>
      <Reveal>
        <HomeHero data={homeContent} />
      </Reveal>
      <WhyWeExist data={homeContent} />
      <OurApproach data={homeContent} />
      <ImpactStats data={homeContent} />
      <Reveal>
        <PartnerCarousel data={homeContent} />
      </Reveal>
      <Reveal>
        <ContactBlock title={homeContent.contactTitle} ctaLabel={homeContent.contactCtaLabel} />
      </Reveal>
    </>
  );
}
