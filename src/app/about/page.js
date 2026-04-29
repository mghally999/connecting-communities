import { aboutContent } from "@/lib/site-content";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import OurLaunchAccordion from "@/components/about/OurLaunchAccordion";
import PartnersAndCollab from "@/components/about/PartnersAndCollab";
import AKABlock from "@/components/about/AKABlock";
import LeadersGrid from "@/components/about/LeadersGrid";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <AboutHero data={aboutContent} />
      <OurStory data={aboutContent} />
      <OurLaunchAccordion data={aboutContent} />
      <PartnersAndCollab data={aboutContent} />
      <AKABlock data={aboutContent} />
      <LeadersGrid data={aboutContent} />
    </>
  );
}
