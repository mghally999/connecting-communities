import { aboutContent } from "@/lib/site-content";
import AboutHero from "@/components/about/AboutHero";
import Accordion from "@/components/about/Accordion";
import PartnersAndCollab from "@/components/about/PartnersAndCollab";
import AKABlock from "@/components/about/AKABlock";
import LeadersGrid from "@/components/about/LeadersGrid";
import Reveal from "@/components/Reveal";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Reveal>
        <AboutHero data={aboutContent} />
      </Reveal>

      {/* Both Our Story and Our Launch are accordions per the client.
          Story defaults open as the first content block; Launch
          defaults closed. Each shows image + text on expand. */}
      <Reveal>
        <Accordion
          title={aboutContent.storyTitle}
          body={aboutContent.storyBody}
          image={aboutContent.storyImage}
          imageAlt="Founders' fieldwork"
          defaultOpen
        />
      </Reveal>
      <Reveal>
        <Accordion
          title={aboutContent.launchTitle}
          body={aboutContent.launchBody}
          image={aboutContent.launchImage}
          imageAlt="Rwanda landscape"
        />
      </Reveal>

      <Reveal>
        <PartnersAndCollab data={aboutContent} />
      </Reveal>
      <Reveal>
        <AKABlock data={aboutContent} />
      </Reveal>
      <Reveal>
        <LeadersGrid data={aboutContent} />
      </Reveal>
    </>
  );
}
