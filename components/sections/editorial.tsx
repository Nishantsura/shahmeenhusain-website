import Image from "next/image";
import Link from "next/link";

import { Carousel } from "@/components/sections/carousel";
import { ProductCard } from "@/components/sections/product-card";
import { CountUp } from "@/components/motion/count-up";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import type { Product } from "@/lib/shopify/types";

/* ---------- sticky campaign scene ---------- */
export function CampaignScene({ image }: { image?: string }) {
  return (
    <section id="campaign" className="relative bg-paper">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden max-md:relative max-md:h-auto max-md:min-h-[60vh] max-md:py-16">
        <Parallax speed={0.12} className="h-[76vh] w-[min(88vw,1200px)] max-md:h-[60vh]">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#6E6046] via-[#4B4133] to-[#2A241C]" />
          )}
        </Parallax>
      </div>

      <div className="container-edge relative z-[2] py-[clamp(80px,16vh,200px)]">
        <RevealWords
          as="p"
          className="statement statement-tight max-w-[18ch]"
          text="Every thread carries the memory of the hand that placed it"
        />
      </div>
    </section>
  );
}

/* ---------- philosophy ---------- */
export function Philosophy() {
  return (
    <section className="py-[clamp(90px,14vh,180px)]">
      <div className="container-edge">
        <div className="mb-[clamp(48px,8vh,96px)] flex items-baseline justify-between border-t border-rule pt-5">
          <Reveal kind="fade" as="span" className="eyebrow">
            The House
          </Reveal>
          <Reveal kind="fade" as="span" className="eyebrow tabular-nums">
            01
          </Reveal>
        </div>

        <RevealWords
          as="p"
          className="statement mb-[clamp(48px,8vh,96px)] max-w-[20ch]"
          text="For us, craftsmanship is part of our heritage, identity and expression."
        />

        <div className="ml-auto grid max-w-4xl gap-[clamp(32px,6vw,90px)] md:grid-cols-2">
          <Reveal delay={0.08}>
            <p className="text-[0.9375rem] leading-[1.85] text-ink-soft">
              We convey grace and beauty through textiles, embroidery and
              embellishment on fabric. With each stitch, our artisans create
              depth and texture — transforming cloth into something that
              outlives the occasion it was made for.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="text-[0.9375rem] leading-[1.85] text-ink-soft">
              Every piece is drawn, cut and finished in our atelier. Nothing is
              rushed. The result is a wardrobe of heirlooms, built to be worn,
              kept and passed on.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- craft stats ---------- */
const STATS = [
  { to: 20, suffix: "+", label: "Years shaping bridal and occasion couture" },
  { to: 50, suffix: "+", label: "Artisans practising hand embroidery in our atelier" },
  { to: 100, suffix: "%", label: "Hand-finished, made to order, never mass produced" },
];

export function Stats() {
  return (
    <section className="border-y border-rule py-[clamp(60px,10vh,120px)]">
      <div className="container-edge grid gap-[clamp(32px,5vw,72px)] md:grid-cols-3">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.12}>
            <p className="mb-5 font-display text-[clamp(3rem,7vw,6rem)] font-light leading-none tracking-[-0.03em] tabular-nums text-ink">
              <CountUp to={stat.to} />
              {stat.suffix}
            </p>
            <p className="max-w-[28ch] text-[0.8125rem] leading-[1.7] text-ink-soft">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- collection block ---------- */
export function CollectionBlock({
  index,
  title,
  blurb,
  href,
  image,
  attributes,
  products,
  alt = false,
}: {
  index: string;
  title: string;
  blurb: string;
  href: string;
  image?: string;
  attributes: string[];
  products: Product[];
  alt?: boolean;
}) {
  return (
    <section
      className={`py-[clamp(60px,10vh,130px)] pb-[clamp(70px,12vh,150px)] ${
        alt ? "bg-paper-deep" : ""
      }`}
    >
      <div className="container-edge">
        <div className="mb-[clamp(32px,6vh,64px)] flex items-baseline justify-between border-t border-rule pt-5">
          <Reveal kind="fade" as="span" className="eyebrow tabular-nums">
            {index}
          </Reveal>
          <Reveal kind="fade" as="span" className="eyebrow">
            Collection
          </Reveal>
        </div>
      </div>

      <Reveal kind="mask" className="mb-[clamp(32px,6vh,64px)] h-[clamp(340px,68vh,720px)] w-full">
        <Link href={href} className="group block h-full w-full">
          <Parallax speed={0.1} className="h-full w-full">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#7A6B55] via-[#5C4F40] to-[#3E352C]" />
            )}
          </Parallax>
        </Link>
      </Reveal>

      <div className="container-edge">
        <div className="mb-[clamp(40px,7vh,80px)] grid items-end gap-[clamp(24px,5vw,80px)] md:grid-cols-2">
          <RevealWords as="h2" className="statement statement-tight" text={title} />
          <div>
            <Reveal>
              <p className="mb-7 max-w-[44ch] text-[0.9375rem] leading-[1.85] text-ink-soft">
                {blurb}
              </p>
              <Link
                href={href}
                className="group inline-flex items-center gap-2.5 border-b border-rule pb-1.5 text-label uppercase tracking-[0.18em] text-ink transition-all hover:gap-4 hover:border-ink"
              >
                Discover This Collection
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="flex overflow-hidden border-y border-rule py-3.5" aria-hidden>
        {[0, 1].map((dup) => (
          <div key={dup} className="attr-track flex shrink-0 gap-7 pr-7">
            {attributes.map((attr) => (
              <span
                key={attr}
                className="flex items-center gap-7 whitespace-nowrap text-label uppercase tracking-[0.18em] text-ink-soft"
              >
                {attr}
                <span className="text-ink-mute">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-[clamp(32px,6vh,64px)]">
          <Carousel>
            {products.map((p) => (
              <div key={p.id} data-card className="w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[23vw]">
                <ProductCard product={p} />
              </div>
            ))}
          </Carousel>
        </div>
      ) : null}
    </section>
  );
}

/* ---------- big statement ---------- */
export function BigStatement() {
  return (
    <section className="py-[clamp(110px,20vh,260px)]">
      <div className="container-edge">
        <RevealWords
          as="p"
          className="statement max-w-[16ch]"
          text="A lehenga is more than a garment"
        />
        <Reveal delay={0.2}>
          <p className="ml-auto mt-[clamp(32px,6vh,64px)] max-w-[46ch] text-[0.9375rem] leading-[1.85] text-ink-soft">
            It is the photograph your family keeps on the wall. It is the piece
            your daughter asks for twenty years from now. We make it accordingly.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- experience ---------- */
const EXPERIENCE = [
  {
    num: "01",
    title: "Bridal Appointments",
    text: "A private consultation in the atelier. We take you through fabric, silhouette and embroidery, and build the ensemble around your dates.",
    cta: "Book Now",
    href: "https://wa.me/+919XXXXXXXXX",
  },
  {
    num: "02",
    title: "Customisation",
    text: "Every piece can be remade to your measurements, your palette and your occasion. Made to order is the default here, not an upgrade.",
    cta: "Enquire",
    href: "https://wa.me/+919XXXXXXXXX",
  },
  {
    num: "03",
    title: "Client Assistance",
    text: "Sizing, styling, timelines, alterations. One person stays with your order from the first message to the final fitting.",
    cta: "Connect With Us",
    href: "https://wa.me/+919XXXXXXXXX",
  },
  {
    num: "04",
    title: "Worldwide Delivery",
    text: "Insured shipping to every major market, with customs handled and delivery dates confirmed against your wedding calendar.",
    cta: "Shipping Details",
    href: "/contact",
  },
];

export function Experience() {
  return (
    <section className="py-[clamp(80px,14vh,180px)] pb-[clamp(120px,20vh,240px)]">
      <div className="container-edge">
        <div className="mb-[clamp(48px,9vh,110px)] flex flex-col gap-6 border-t border-rule pt-5">
          <Reveal kind="fade" as="span" className="eyebrow tabular-nums">
            04
          </Reveal>
          <RevealWords
            as="p"
            className="statement statement-tight max-w-[16ch]"
            text="Here is how we work with you"
          />
        </div>

        <div>
          {EXPERIENCE.map((item) => (
            <article
              key={item.num}
              className="sticky top-[12vh] grid grid-cols-[80px_minmax(0,1fr)] gap-[clamp(16px,4vw,48px)] border-t border-rule bg-paper py-[clamp(32px,6vh,64px)] max-md:static max-md:grid-cols-1 max-md:gap-3"
            >
              <span className="pt-2 text-label tabular-nums tracking-[0.1em] text-ink-mute max-md:pt-0">
                {item.num}
              </span>
              <Reveal>
                <h3 className="mb-5 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink">
                  {item.title}
                </h3>
                <p className="mb-7 max-w-[48ch] text-[0.9375rem] leading-[1.85] text-ink-soft">
                  {item.text}
                </p>
                <Link
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener" : undefined}
                  className="inline-flex items-center gap-2.5 border-b border-rule pb-1.5 text-label uppercase tracking-[0.18em] text-ink transition-all hover:gap-4 hover:border-ink"
                >
                  {item.cta}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- closing ---------- */
export function Closing() {
  return (
    <section className="border-t border-rule py-[clamp(90px,16vh,200px)]">
      <div className="container-edge">
        <RevealWords
          as="p"
          className="statement max-w-[18ch]"
          text="Bring us your occasion, your inspiration, or just a date"
        />
        <Reveal delay={0.15}>
          <p className="mt-[clamp(28px,5vh,56px)] max-w-[48ch] text-[0.9375rem] leading-[1.85] text-ink-soft">
            Most of our best work starts with a client who has a feeling and a
            deadline. Our strength is turning that into a fitting, and then a
            piece.
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-[clamp(48px,9vh,100px)] flex flex-col gap-6">
            <span className="eyebrow">How would you like to reach us?</span>
            <div className="flex flex-wrap gap-3 max-sm:flex-col">
              {[
                { label: "WhatsApp", href: "https://wa.me/+919XXXXXXXXX" },
                { label: "Email", href: "/contact" },
                { label: "Book A Visit", href: "/contact" },
              ].map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  target={cta.href.startsWith("http") ? "_blank" : undefined}
                  rel={cta.href.startsWith("http") ? "noopener" : undefined}
                  className="rounded-full border border-rule px-8 py-4 text-center text-label uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
