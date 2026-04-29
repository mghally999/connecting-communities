import { contactContent } from "@/lib/site-content";
import ContactHero from "@/components/contact/ContactHero";
import ContactIntro from "@/components/contact/ContactIntro";
import ContactHQ from "@/components/contact/ContactHQ";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <ContactHero data={contactContent} />
      <ContactIntro data={contactContent} />
      <ContactHQ data={contactContent} />
    </>
  );
}
