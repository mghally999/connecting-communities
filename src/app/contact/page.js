import { contactContent } from "@/lib/site-content";
import ContactHero from "@/components/contact/ContactHero";
import ContactIntro from "@/components/contact/ContactIntro";
import ContactHQ from "@/components/contact/ContactHQ";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <Reveal>
        <ContactHero data={contactContent} />
      </Reveal>
      <Reveal>
        <ContactIntro data={contactContent} />
      </Reveal>
      <Reveal>
        <ContactHQ data={contactContent} />
      </Reveal>
    </>
  );
}
