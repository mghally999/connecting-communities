import { aboutContent } from "@/lib/site-content";
import AboutHero from "@/components/about/AboutHero";
import Accordion from "@/components/about/Accordion";
import PartnersAndCollab from "@/components/about/PartnersAndCollab";
import AKABlock from "@/components/about/AKABlock";
import LeadersGrid from "@/components/about/LeadersGrid";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <AboutHero data={aboutContent} />

      {/* Both Our Story and Our Launch are accordions per the client.
          Story defaults open as the first content block; Launch
          defaults closed. Each shows image + text on expand. */}
      <Accordion
        title={aboutContent.storyTitle}
        body={aboutContent.storyBody}
        image={aboutContent.storyImage}
        imageAlt="Founders' fieldwork"
        defaultOpen
      />
      <Accordion
        title={aboutContent.launchTitle}
        body={aboutContent.launchBody}
        image={aboutContent.launchImage}
        imageAlt="Rwanda landscape"
      />

      <PartnersAndCollab data={aboutContent} />
      <AKABlock data={aboutContent} />
      <LeadersGrid data={aboutContent} />
    </>
  );
}
