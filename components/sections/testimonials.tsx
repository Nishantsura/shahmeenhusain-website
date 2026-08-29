"use client";

import Image from "next/image";
import { useRef } from "react";

import { DragStrip } from "@/components/motion/drag-strip";
import { Reveal } from "@/components/motion/reveal";
import { Lozenge } from "@/components/ui/lozenge";

/* ============================================================
   Testimonials — client voices, alternating with atelier plates
   ------------------------------------------------------------
   A dragged strip of quote cards cut to the same 4:5 box as the
   product strips, alternating with existing atelier photography so
   the row reads as one rhythm rather than text-then-images.

   The quotes below are placeholders — no client has supplied real
   testimonial copy yet. Swap in verified quotes (and, ideally, real
   client names) before this section goes live; see "Not wired up"
   in AGENTS.md.
   ============================================================ */

type Testimonial = {
  quote: string;
  name: string;
  attribute: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Placeholder copy — replace with a verified client quote before this section goes live.",
    name: "Client name",
    attribute: "Bridal Lehenga",
  },
  {
    quote:
      "Placeholder copy — replace with a verified client quote before this section goes live.",
    name: "Client name",
    attribute: "Chikankari Anarkali",
  },
  {
    quote:
      "Placeholder copy — replace with a verified client quote before this section goes live.",
    name: "Client name",
    attribute: "Luxury Pret",
  },
];

/** Existing atelier photography, reused rather than stock or fabricated
 *  client photos. */
const PLATES = ["/hero-arch-left.jpg", "/hero-jharokha.jpg", "/hero-arch-right.jpg"];

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 340) + 28;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  const cards = TESTIMONIALS.flatMap((testimonial, i) => [
    { type: "quote" as const, key: `quote-${i}`, ...testimonial },
    { type: "image" as const, key: `image-${i}`, src: PLATES[i % PLATES.length] },
  ]);

  return (
    <section className="bg-paper section-y">
      <div className="gutter flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <Reveal kind="fade" className="flex flex-col">
          <Lozenge className="text-gold" />
          <p className="label mt-[clamp(0.6rem,1.4vh,1rem)] text-brand">
            In Their Words
          </p>
          <h2 className="statement statement-tight mt-3 max-w-[18ch]">
            Something for every occasion
          </h2>
        </Reveal>

        <div className="flex gap-3">
          <NavButton label="Previous" onClick={() => nudge(-1)}>
            <polyline points="15 18 9 12 15 6" />
          </NavButton>
          <NavButton label="Next" onClick={() => nudge(1)}>
            <polyline points="9 6 15 12 9 18" />
          </NavButton>
        </div>
      </div>

      <DragStrip ref={trackRef} className="mt-[clamp(2rem,5vw,3.5rem)]">
        {cards.map((card) => {
          const { key, ...rest } = card;
          return rest.type === "quote" ? (
            <QuoteCard key={key} {...rest} />
          ) : (
            <PlateCard key={key} src={rest.src} />
          );
        })}
      </DragStrip>
    </section>
  );
}

function QuoteCard({ quote, name, attribute }: Testimonial) {
  return (
    <article
      data-card
      className="flex aspect-[4/5] w-[78vw] shrink-0 flex-col justify-between border border-rule bg-paper-deep p-[clamp(1.5rem,3vw,2.25rem)] sm:w-[320px] md:w-[360px]"
    >
      <span aria-hidden className="font-display text-[3rem] leading-none text-gold">
        &ldquo;
      </span>
      <p className="copy flex-1 pt-2 text-fine md:text-body">{quote}</p>
      <footer className="mt-6 flex flex-col gap-1">
        <span className="label text-ink">{name}</span>
        <span className="eyebrow">{attribute}</span>
      </footer>
    </article>
  );
}

function PlateCard({ src }: { src: string }) {
  return (
    <div
      data-card
      className="relative aspect-[4/5] w-[78vw] shrink-0 overflow-hidden border border-rule bg-paper-deep sm:w-[320px] md:w-[360px]"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 78vw, 360px"
        className="object-cover"
      />
      <span aria-hidden className="pointer-events-none absolute inset-4 border border-gold/45" />
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center border border-rule text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4"
      >
        {children}
      </svg>
    </button>
  );
}
