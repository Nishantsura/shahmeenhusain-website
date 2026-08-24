import type { Metadata } from "next";
import Image from "next/image";

import { PageHead } from "@/components/sections/page-head";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { getProducts } from "@/lib/shopify";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Inside the Shahmeen Husain atelier — hand embroidery, made-to-order couture, and the artisans behind every piece.",
};

export default async function DiscoverPage() {
  const products = await getProducts({ first: 6 });
  const hero = products[1]?.featuredImage?.url;
  const detail = products[3]?.featuredImage?.url;

  return (
    <>
      <PageHead
        eyebrow="Discover"
        index="The House"
        title="Our Story"
        text="Shahmeen Husain is a couture house built on hand embroidery. Every piece is drawn, cut and finished in our atelier — made to order, never mass produced."
      />

      {hero ? (
        <Reveal kind="mask" className="h-[clamp(340px,70vh,760px)] w-full">
          <Parallax speed={0.1} className="h-full w-full">
            <Image
              src={hero}
              alt="Inside the atelier"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Parallax>
        </Reveal>
      ) : null}

      <section className="py-[clamp(90px,14vh,180px)]">
        <div className="container-edge">
          <RevealWords
            as="p"
            className="statement mb-[clamp(48px,8vh,96px)] max-w-[20ch]"
            text="Our design philosophy begins with the hand, not the sketch"
          />
          <div className="ml-auto grid max-w-4xl gap-[clamp(32px,6vw,90px)] md:grid-cols-2">
            <Reveal>
              <p className="text-[0.9375rem] leading-[1.85] text-ink-soft">
                We create a distinct aesthetic that draws on the rich heritage of
                Indian craftsmanship. Our designs are inspired by the beauty of
                the natural world — the geometry of a garden, the fall of light
                through a jaali, the weight of silk in motion.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-[0.9375rem] leading-[1.85] text-ink-soft">
                Chikankari, zardozi, dabka and thread work are laid entirely by
                hand. A single lehenga can take months. That time is the point:
                it is what separates a garment from an heirloom.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {detail ? (
        <section className="pb-[clamp(90px,16vh,200px)]">
          <div className="container-edge grid items-center gap-12 md:grid-cols-2 md:gap-20">
            <Reveal kind="mask" className="aspect-[3/4] w-full">
              <Image
                src={detail}
                alt="Hand embroidery detail"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </Reveal>
            <div>
              <RevealWords
                as="h2"
                className="statement statement-tight mb-8"
                text="The Shahmeen Husain woman"
              />
              <Reveal delay={0.1}>
                <p className="max-w-[46ch] text-[0.9375rem] leading-[1.85] text-ink-soft">
                  She is not dressing for the room. She is dressing for the
                  photograph her family will keep, and for the daughter who will
                  ask for the piece twenty years from now.
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
