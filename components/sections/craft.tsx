import Link from "next/link";
import Image from "next/image";

import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import { Arrow } from "@/components/ui/arrow";
import { Lozenge } from "@/components/ui/lozenge";
import { cn } from "@/lib/utils";

/* ============================================================
   The Craft — four pillars every piece passes through
   ------------------------------------------------------------
   Replaces the old sticky-panel run. Each pillar is a contained,
   framed plate beside its copy, alternating side to side, so the
   images never bleed and the headlines never clip. Content is the
   traditional couture-house story: design, hand embroidery, fit,
   and lifetime care.
   ============================================================ */

type Pillar = { index: string; kicker: string; title: string; copy: string };

const PILLARS: Pillar[] = [
  {
    index: "01",
    kicker: "Bespoke Design",
    title: "It begins on paper",
    copy: "Every ensemble is drawn before it is cut — designed around one person, one palette and one occasion, and made only once.",
  },
  {
    index: "02",
    kicker: "Hand Embroidery",
    title: "Worked in the karkhana",
    copy: "Zardozi, dabka, aari and mukaish, laid entirely by hand over weeks by the same artisans in our Lucknow atelier.",
  },
  {
    index: "03",
    kicker: "Made to Measure",
    title: "Cut to your body",
    copy: "Taken to your measurements and refined across fittings, until the fall, the fit and the finish sit exactly right.",
  },
  {
    index: "04",
    kicker: "Lifetime Care",
    title: "Made to be kept",
    copy: "Every piece can be let out, taken in and restored by the atelier — an heirloom built to outlast the occasion it was made for.",
  },
];

export function Craft({ images = [] }: { images?: string[] }) {
  return (
    <section className="gutter section-y bg-paper">
      <Reveal kind="fade" className="flex flex-col items-center text-center">
        <Lozenge className="text-gold" />
        <p className="label mt-[clamp(0.6rem,1.4vh,1rem)] text-brand">
          The Atelier
        </p>
        <h2 className="statement statement-tight mt-3 max-w-[16ch]">Made entirely by hand</h2>
        <p className="lead mt-4 max-w-[48ch] text-body text-ink-soft">
          Four things every piece passes through before it reaches you.
        </p>
      </Reveal>

      <div className="mt-[clamp(3rem,7vw,6.5rem)] flex flex-col gap-[clamp(3.5rem,8vw,7rem)]">
        {PILLARS.map((pillar, i) => (
          <Pillar key={pillar.index} {...pillar} image={images[i]} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function Pillar({
  index,
  kicker,
  title,
  copy,
  image,
  flip,
}: Pillar & { image?: string; flip: boolean }) {
  return (
    <article className="grid items-center gap-[clamp(1.75rem,4vw,3.5rem)] md:grid-cols-2">
      <Reveal kind="rise" className={cn("w-full", flip && "md:order-2")}>
        {/* Framed plate. overflow-hidden keeps the parallax and the image
            inside the block; the gold hairline is the mount the product
            cards and showreel already use. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep">
          {image ? (
            <Parallax speed={0.16} className="h-full w-full">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 45vw"
                className="object-cover"
              />
            </Parallax>
          ) : null}
          <span aria-hidden className="pointer-events-none absolute inset-4 border border-gold/45 md:inset-5" />
        </div>
      </Reveal>

      <div className={cn("flex flex-col", flip && "md:order-1")}>
        <span className="label text-brand">
          {index} — {kicker}
        </span>
        <Reveal as="h3" kind="fade" className="statement statement-tight mt-4 max-w-[14ch]">
          {title}
        </Reveal>
        <RevealWords
          as="p"
          delay={0.06}
          className="lead mt-5 max-w-[40ch] text-body text-ink-soft"
          text={copy}
        />
      </div>
    </article>
  );
}

/* ============================================================
   Ways to Begin — the atelier's services, made actionable
   ============================================================ */

type Service = {
  index: string;
  label: string;
  copy: string;
  cta: string;
  href: string;
};

const SERVICES: Service[] = [
  {
    index: "I",
    label: "Bespoke for the Occasion",
    copy: "Custom designs for the wedding, the sangeet, the reception — your palette, your motifs, drawn and made to order.",
    cta: "Commission a piece",
    href: "/contact",
  },
  {
    index: "II",
    label: "Made to Measure",
    copy: "Your measurements, your fittings. Every ensemble is cut to one body and finished to sit exactly as it should.",
    cta: "Book a fitting",
    href: "/contact",
  },
  {
    index: "III",
    label: "Appointments & Trunk Shows",
    copy: "Visit the studio by appointment, or meet the atelier at a trunk show near you. Write to us for cities and dates.",
    cta: "Enquire on locations",
    href: "/contact",
  },
];

export function Services() {
  return (
    <section className="gutter bg-paper pb-(--space-section) pt-(--space-section-sm)">
      <Reveal kind="fade" className="flex flex-col items-center text-center">
        <p className="label text-brand">
          Ways to Begin
        </p>
        <h2 className="statement statement-tight mt-3 max-w-[20ch]">Commission with the atelier</h2>
      </Reveal>

      {/* gap-px over a rule-coloured ground draws the hairlines between
          cards without a border on each — the cleaner way to a grid. */}
      <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-px overflow-hidden border border-rule bg-rule md:grid-cols-3">
        {SERVICES.map((service) => (
          <ServiceCard key={service.label} {...service} />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ index, label, copy, cta, href }: Service) {
  return (
    <Reveal
      kind="rise"
      className="group flex h-full flex-col bg-paper p-[clamp(1.75rem,3vw,2.6rem)]"
    >
      <span className="font-display text-title leading-none text-gold">{index}</span>
      <h3 className="statement mt-4 text-lead">
        {label}
      </h3>
      <p className="copy mt-4 flex-1 text-fine">
        {copy}
      </p>
      <Link
        href={href}
        className="label mt-7 inline-flex items-center gap-2.5 text-ink transition-colors hover:text-brand"
      >
        {cta}
        <Arrow className="h-3.5 w-3.5 transition-transform duration-500 ease-out group-hover:translate-x-1" />
      </Link>
    </Reveal>
  );
}
