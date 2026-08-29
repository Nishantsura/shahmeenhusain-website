import Image from "next/image";
import Link from "next/link";

import { DragStrip } from "@/components/motion/drag-strip";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import { ScrollScale } from "@/components/motion/scroll-scale";
import { ShowreelVideo } from "@/components/motion/showreel-video";
import { Arrow } from "@/components/ui/arrow";
import { Lozenge } from "@/components/ui/lozenge";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";

/* ============================================================
   Showreel — media that grows into the page
   ============================================================ */

export function Showreel() {
  return (
    <section className="gutter bg-paper pb-(--space-section)">
      <ScrollScale className="h-[clamp(300px,56vw,44rem)] w-full">
        <ShowreelVideo />

        {/* A wash from the foot so the caption reads over bright film,
            and the same gold hairline mount the product cards carry. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber/55 via-transparent to-umber/15"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-4 border border-gold/45 md:inset-6"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-9">
          <p className="label text-paper [text-shadow:0_1px_10px_rgb(var(--color-umber-rgb)_/_0.55)]">
            Zardozi, in progress
          </p>
          <p className="hidden label text-gold [text-shadow:0_1px_10px_rgb(var(--color-umber-rgb)_/_0.55)] sm:block">
            The atelier — Lucknow
          </p>
        </div>
      </ScrollScale>
    </section>
  );
}

/* ============================================================
   About — red label left, justified caps right
   ============================================================ */

export function About() {
  return (
    <section className="gutter flex flex-col justify-center bg-paper pt-(--space-section-sm) pb-(--space-section)">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
        <Reveal as="p" kind="fade" className="label shrink-0 text-brand">
          About
        </Reveal>

        <div className="w-full md:w-[66%]">
          <RevealWords
            as="p"
            className="lead text-justify text-ink"
            text="The women who wear these clothes care as much about how a piece is made as they do about how it looks."
          />
          <RevealWords
            as="p"
            delay={0.1}
            className="lead mt-[1.6em] text-justify text-ink"
            text="Every ensemble begins on paper and ends in a karkhana in Lucknow, where the same hands that laid the first stitch finish the last. Zardozi, dabka, aari and thread work — set by hand, over weeks, on cloth chosen to hold them."
          />
          <RevealWords
            as="p"
            delay={0.2}
            className="lead mt-[1.6em] text-justify text-ink"
            text="Speaking of the hands behind the work, here is what a decade of it looks like."
          />
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
   Feature — one collection, given its own billing
   ============================================================ */

/**
 * A single carousel with a centred, ornamented header — the same
 * lozenge-and-caps opening the hero uses, so the page keeps one voice as
 * you scroll out of the fold. The strips inside `Work` are stacked and
 * left-aligned by comparison; this one is meant to stand alone.
 */
export function Feature({
  title,
  blurb,
  href,
  cta,
  products,
}: {
  title: string;
  blurb: string;
  href: string;
  cta: string;
  products: Product[];
}) {
  if (!products.length) return null;

  return (
    <section className="flex flex-col items-center bg-paper pb-(--space-section-sm) pt-(--space-section-sm)">
      <Reveal kind="fade" className="gutter flex flex-col items-center text-center">
        <Lozenge className="text-brand" />
        <h2 className="statement statement-tight mt-[clamp(0.75rem,1.8vh,1.25rem)]">{title}</h2>
        <p className="lead mt-3 max-w-[46ch] text-body leading-[1.7] text-ink-soft">
          {blurb}
        </p>
      </Reveal>

      <Reveal kind="rise" delay={0.08} className="mt-[clamp(1.75rem,4vw,3rem)] w-full">
        <DragStrip>
          {products.map((product) => (
            <StripCard key={product.id} product={product} />
          ))}
          <EndCard href={href} label={cta} />
        </DragStrip>
      </Reveal>
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
};

export function Work({ items }: { items: WorkItem[] }) {
  return (
    <section className="flex flex-col items-center bg-paper pb-(--space-section-sm) pt-(--space-section-sm)">
      <div className="flex w-full flex-col gap-[clamp(2.75rem,5vw,4.5rem)]">
        {items.map((item) => (
          <WorkBlock key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}

function WorkBlock({ title, href, products }: WorkItem) {
  return (
    <article className="flex flex-col gap-[clamp(1.25rem,2.7vw,2.2rem)]">
      <header className="gutter flex flex-col gap-4">
        <Reveal as="h2" kind="fade" className="statement statement-tight">
          {title}
        </Reveal>
      </header>

      <DragStrip>
        {products.map((product) => (
          <StripCard key={product.id} product={product} />
        ))}

        <EndCard href={href} label="See collection" />
      </DragStrip>
    </article>
  );
}

/**
 * A product in a strip.
 *
 * The garment is never cropped. Cards used to run a varied-width rhythm
 * with `object-cover`, which read well as a contact sheet but sliced the
 * hem off half the pieces — the wrong trade for a couture house, where
 * the silhouette is the product. Every shot in the store is 2:3 give or
 * take, so a 2:3 box with `object-contain` seats almost all of them
 * edge to edge, and the few odd ratios get a sand mount instead of a
 * crop.
 *
 * Title and price sit under the image at rest. They were a hover-only
 * overlay, which meant the price was invisible to anyone on a phone.
 */
function StripCard({ product }: { product: Product }) {
  const image = product.featuredImage;
  if (!image) return null;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex w-[clamp(13.5rem,25vw,18rem)] shrink-0 flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
      draggable={false}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-paper-deep">
        <Image
          src={image.url}
          alt={image.altText ?? product.title}
          fill
          sizes="(max-width: 767px) 55vw, 20vw"
          className="pointer-events-none object-contain"
          draggable={false}
        />
        {/* No scale on hover: at `contain`, growing the image pushes it
            past the frame and reintroduces the crop we just removed. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 border border-gold/0 transition-colors duration-500 group-hover:border-gold/70"
        />
      </div>

      {/* Two lines reserved whatever the name, so a strip of long and
          short titles still lines up along the bottom. The reserve sits on
          this wrapper rather than the title itself, with the pair bottom-
          anchored inside it — a one-line name leaves its slack above the
          title instead of stranding the price below it. */}
      <div className="mt-5 flex min-h-[4.7rem] flex-col justify-end border-t border-rule pt-4">
        <p className="label line-clamp-2 leading-[1.35] tracking-caps text-ink transition-colors duration-300 group-hover:text-brand">
          {product.title}
        </p>
        <p className="mt-1.5 font-body text-fine tabular-nums tracking-caps text-brand">
          {formatMoney(product.price)}
        </p>
      </div>
    </Link>
  );
}

/**
 * Every strip ends on the accent card. It is the only call to action in
 * a block, and putting it last means the drag has somewhere to arrive
 * rather than just running out.
 */
function EndCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative flex w-[clamp(13.5rem,25vw,18rem)] shrink-0 flex-col justify-end gap-6 self-stretch overflow-hidden bg-brand p-6 text-paper"
    >
      {/* Espresso wipes up from the foot on hover — the card commits to
          the click instead of just dimming. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-umber transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
      />
      <span aria-hidden className="pointer-events-none absolute inset-[7px] border border-paper/25" />

      <Arrow className="relative h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
      <span className="label relative">{label}</span>
    </Link>
  );
}
