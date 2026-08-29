import type { Metadata } from "next";

import { ContactForm } from "@/components/sections/contact-form";
import { PageHead } from "@/components/sections/page-head";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a bridal appointment, ask about customisation, or reach the Shahmeen Husain atelier.",
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        eyebrow="Contact"
        index="Atelier"
        title="Get in touch"
        text="Whether you have a question about our collections, need styling advice, or wish to book a private appointment — we're here to help."
      />

      <section className="pb-[clamp(90px,16vh,200px)]">
        <div className="container-edge grid gap-16 md:grid-cols-2 md:gap-24">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="flex flex-col gap-10">
              <div>
                <h2 className="eyebrow mb-4">Visit the atelier</h2>
                <p className="copy">
                  Shahmeen Husain Flagship Store
                  <br />
                  Road No. 12, Banjara Hills
                  <br />
                  Hyderabad, Telangana 500034
                  <br />
                  India
                </p>
              </div>

              <div>
                <h2 className="eyebrow mb-4">Contact</h2>
                <ul className="copy flex flex-col gap-2">
                  <li>
                    <a
                      href="https://wa.me/+919XXXXXXXXX"
                      target="_blank"
                      rel="noopener"
                      className="transition-colors hover:text-brand"
                    >
                      WhatsApp — chat with us
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@shahmeenhusain.com"
                      className="transition-colors hover:text-brand"
                    >
                      hello@shahmeenhusain.com
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="eyebrow mb-4">Appointments</h2>
                <p className="copy max-w-[42ch]">
                  Bridal consultations are by appointment so we can give you the
                  room and the time. Tell us your dates and we will build the
                  fitting schedule around them.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
