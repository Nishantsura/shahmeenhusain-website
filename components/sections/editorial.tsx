import Image from "next/image";
import Link from "next/link";

import { DragStrip } from "@/components/motion/drag-strip";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import { ScrollScale } from "@/components/motion/scroll-scale";
import type { Product } from "@/lib/shopify/types";

/* ============================================================
   Showreel — media that grows into the page
   ============================================================ */

export function Showreel({ image }: { image?: string }) {
  if (!image) return null;
  return (
    <section className="gutter bg-paper pb-[clamp(4rem,9vw,8.75rem)]">
      <ScrollScale className="h-[clamp(280px,53vw,42rem)] w-full">
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </ScrollScale>
    </section>
  );
}

/* ============================================================
   About — red label left, justified caps right
   ============================================================ */

export function About() {
  return (
    <section className="gutter flex flex-col justify-center bg-paper py-[clamp(4.5rem,11vw,8.75rem)]">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
        <Reveal as="p" kind="fade" className="grotesk-sm shrink-0 text-brand">
          About
        </Reveal>

        <div className="w-full md:w-[66%]">
          <RevealWords
            as="p"
            className="grotesk text-justify text-ink"
            text="The women who wear these clothes care as much about how a piece is made as they do about how it looks."
          />
          <RevealWords
            as="p"
            delay={0.1}
            className="grotesk mt-[1.6em] text-justify text-ink"
            text="Every ensemble begins on paper and ends in a karkhana in Lucknow, where the same hands that laid the first stitch finish the last. Zardozi, dabka, aari and thread work — set by hand, over weeks, on cloth chosen to hold them."
          />
          <RevealWords
            as="p"
            delay={0.2}
            className="grotesk mt-[1.6em] text-justify text-ink"
            text="Speaking of the hands behind the work, here is what a decade of it looks like."
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Stats — portrait left, three red figures right
   ============================================================ */

const STATS = [
  {
    figure: "20,000+",
    label: "Hours of hand embroidery laid across a single bridal season",
  },
  {
    figure: "40+",
    label: "Karigars in the atelier, several with us since the first collection",
  },
  {
    figure: "30+",
    label: "Countries we have shipped made-to-order couture to",
  },
];

export function Stats({ image }: { image?: string }) {
  return (
    <section className="gutter bg-paper pb-[clamp(4.5rem,11vw,8.75rem)]">
      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-[65px]">
        {image ? (
          <Reveal kind="fade" className="w-full shrink-0 md:w-[33%]">
            <div className="relative aspect-[402/585] w-full overflow-hidden">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}

        <div className="flex w-full flex-col justify-center gap-[clamp(3rem,7vw,5.6rem)]">
          {STATS.map((stat, i) => (
            <div key={stat.figure} className="flex flex-col gap-[clamp(1rem,2.5vw,2.2rem)]">
              <Reveal as="p" kind="rise" delay={i * 0.06}>
                <span className="statement block text-brand">{stat.figure}</span>
              </Reveal>
              <RevealWords
                as="p"
                delay={i * 0.06 + 0.08}
                className="grotesk-sm max-w-[25rem] text-justify text-ink"
                text={stat.label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Full-bleed parallax plate
   ============================================================ */

export function FullBleed({ image }: { image?: string }) {
  if (!image) return null;
  return (
    <section className="relative h-svh w-full overflow-hidden">
      <Parallax speed={0.28} className="h-full w-full">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      </Parallax>
    </section>
  );
}

/* ============================================================
   Work — a collection per block, dragged sideways
   ============================================================ */

export type WorkItem = {
  title: string;
  blurb: string;
  href: string;
  products: Product[];
  attributes: string[];
};

export function Work({ items }: { items: WorkItem[] }) {
  return (
    <section className="flex flex-col items-center bg-paper pb-16 pt-[clamp(4rem,9vw,7.5rem)]">
      <div className="gutter flex w-full items-center">
        <Link
          href="/collections"
          className="grotesk-sm inline-flex items-center gap-2.5 text-ink transition-colors hover:text-brand"
        >
          View all collections
          <Arrow className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-[clamp(1.5rem,3vw,2.2rem)] flex w-full flex-col gap-[clamp(4.5rem,9vw,7.5rem)]">
        {items.map((item) => (
          <WorkBlock key={item.href} {...item} />
        ))}
      </div>
    </section>
  );
}

function WorkBlock({ title, blurb, href, products, attributes }: WorkItem) {
  return (
    <article className="flex flex-col gap-[clamp(1.25rem,2.7vw,2.2rem)]">
      <header className="gutter flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Reveal as="h2" kind="fade" className="statement statement-tight md:w-[62%]">
          {title}
        </Reveal>
        <Reveal
          as="p"
          kind="rise"
          delay={0.08}
          className="font-body text-[1.13rem] font-light uppercase leading-[1.2] tracking-[-0.02em] text-ink md:w-[33%] md:text-justify"
        >
          {blurb}
        </Reveal>
      </header>

      <DragStrip className="h-80 md:h-[clamp(17rem,58vh,26.75rem)]">
        {products.map((product, i) => (
          <StripCard key={product.id} product={product} index={i} />
        ))}

        {/* The strip always ends on the accent card — it is the only
            call to action in the block, and putting it last means the
            drag has somewhere to arrive. */}
        <Link
          href={href}
          className="flex h-full w-[21rem] max-w-[78vw] shrink-0 flex-col justify-end gap-6 bg-brand p-6 text-paper transition-opacity hover:opacity-90 md:max-w-none"
        >
          <Arrow className="h-5 w-5" />
          <span className="grotesk-sm">See collection</span>
        </Link>
      </DragStrip>

      <Reveal kind="rise" className="gutter flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {attributes.map((attr, i) => (
          <span key={attr} className="flex items-center gap-1.5">
            <span className="font-body text-tag font-light uppercase leading-5 text-brand">
              {attr}
            </span>
            {i < attributes.length - 1 ? (
              <span className="font-body text-tag font-light leading-5 text-brand">/</span>
            ) : null}
          </span>
        ))}
      </Reveal>
    </article>
  );
}

/* Cards share a height and vary in width, so the strip reads as a contact
   sheet rather than a grid of equal tiles. Every product shot the store
   holds is the same portrait crop, so the rhythm has to be imposed here —
   these are the proportions the reference runs, repeated down the strip.
   `object-cover` does the cropping. */
const RHYTHM = [1.79, 0.75, 0.82, 0.8, 1.78];

function StripCard({ product, index }: { product: Product; index: number }) {
  const image = product.featuredImage;
  if (!image) return null;

  return (
    <Link
      href={`/products/${product.handle}`}
      /* The wide steps in the rhythm are two screens across on a phone.
         Capping the width keeps the card on screen; the aspect still
         drives it everywhere it fits, and object-cover takes up the
         slack. */
      className="relative h-full max-w-[78vw] shrink-0 overflow-hidden md:max-w-none"
      style={{ aspectRatio: RHYTHM[index % RHYTHM.length] }}
      draggable={false}
    >
      <Image
        src={image.url}
        alt={image.altText ?? product.title}
        fill
        sizes="(max-width: 767px) 70vw, 40vw"
        className="pointer-events-none object-cover"
        draggable={false}
      />
    </Link>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} className={className}>
      <line x1="2" y1="14" x2="14" y2="2" />
      <polyline points="5 2 14 2 14 11" />
    </svg>
  );
}
