"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { ShowreelVideo } from "@/components/motion/showreel-video";
import { Arrow } from "@/components/ui/arrow";

/* ============================================================
   CollectionsStage — the wall that folds away
   ------------------------------------------------------------
   At rest: the atelier-film panel stands on the left with the house
   heading, and the collection cards stand beside it at 70vh — a calm,
   contained block, not a full-bleed slab.

   On scroll the stage pins and vertical scroll becomes horizontal
   travel. As it does, the left panel *compresses in width* into a slim
   espresso strip in the corner: the film crossfades out, the heading
   scales down and turns to read vertically, so "The Collections" is
   still there holding the left edge while the whole catalogue slides
   past it.

   Everything is spring-damped off one scroll progress, so the panel
   folding and the rail travelling are the same gesture rather than two
   animations that happen to overlap.

   Below 1024px, or for a reduced-motion viewer, nothing pins: the panel
   stacks over an ordinary swipeable rail.
   ============================================================ */

export interface StageCard {
  title: string;
  href: string;
  image: string;
}

export interface StagePanel {
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
  cta: string;
  /**
   * The film wall behind the panel copy. With no image the atelier
   * showreel plays (the default, as on the house Collections); pass a
   * still and it stands in for the video, so two stages on one page read
   * as distinct walls rather than the same clip twice.
   */
  image?: string;
  /** Hide the open-face CTA button (the strip's arrow link still stands). */
  hideCta?: boolean;
}

/** Width of the panel once it has folded into the corner. */
const STRIP_W = 88;
/** Gap between the panel (or strip) and the rail. */
const GAP = 34;

type Metrics = {
  /** Panel width at rest, in px. */
  openW: number;
  /** How far the track must travel once the panel has folded. */
  pan: number;
};

/**
 * Scroll length per collection, in vh, on top of the one pinned screen.
 *
 * Deliberately derived from the card count rather than from the measured
 * pan distance: the container's height must be identical on the server,
 * on first paint and forever after, because `useScroll` measures the
 * element once and a height that changes underneath it leaves every
 * progress value stale — the panel then folds late and the rail crawls.
 */
const SCROLL_PER_CARD = 55;

export function CollectionsStage({
  panel,
  cards,
}: {
  panel: StagePanel;
  cards: StageCard[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [pinned, setPinned] = useState(false);
  const [m, setM] = useState<Metrics>({ openW: 0, pan: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const read = () => {
      const vw = window.innerWidth;
      const animate = vw >= 1024 && !mq.matches;
      setPinned(animate);
      if (!animate) return;

      const track = trackRef.current;
      if (!track) return;

      const openW = Math.round(vw * 0.38);
      // Once folded, the rail owns everything right of the strip.
      const railW = vw - STRIP_W - GAP * 2;
      const pan = Math.max(0, track.scrollWidth - railW);

      setM({ openW, pan });
    };

    read();
    // The first pass can run while the fallback DOM is still mounted
    // (pinned only flips true after this effect), so the track ref is not
    // yet attached and pan would measure 0. Re-read once it is in place.
    const raf = requestAnimationFrame(read);
    window.addEventListener("resize", read);
    mq.addEventListener?.("change", read);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", read);
      mq.removeEventListener?.("change", read);
    };
  }, [cards.length, pinned]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Eased, not laggy. Damping well above critical for this stiffness
  // means it never overshoots, while the stiffness keeps it close enough
  // to the wheel that the travel feels driven rather than delayed.
  const p = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 34,
    mass: 0.32,
    restDelta: 0.0002,
  });

  /* Beats:
     0.00–0.22  the panel folds to the strip; film and copy give way
     0.10–0.94  the rail travels the full catalogue                  */

  const panelW = useTransform(p, [0, 0.22], [m.openW, STRIP_W]);
  const railLeft = useTransform(panelW, (w) => w + GAP);

  // The open face (film, blurb, button) clears early; the strip face
  // arrives just behind it, so the two never overlap as a double image.
  const openFade = useTransform(p, [0, 0.13], [1, 0]);
  const filmFade = useTransform(p, [0, 0.18], [1, 0]);
  const stripFade = useTransform(p, [0.15, 0.26], [0, 1]);

  // The heading shrinks into the strip rather than cutting to a new size.
  const headScale = useTransform(p, [0, 0.2], [1, 0.42]);

  const trackX = useTransform(p, [0.1, 0.94], [0, -m.pan]);
  const progress = useTransform(p, [0.1, 0.94], ["0%", "100%"]);
  // The cue only has a job before you have worked out that this scrolls
  // sideways, so it leaves as soon as it does.
  const cueFade = useTransform(p, [0, 0.06], [1, 0]);

  // ---- Static fallback: stacked panel over a swipeable rail ----
  if (!pinned) {
    return (
      <div ref={containerRef} className="flex flex-col">
        <div className="relative min-h-[68svh] overflow-hidden bg-umber">
          <div className="absolute inset-0">
            <PanelMedia image={panel.image} />
          </div>
          <PanelScrim />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-10">
            <OpenFace panel={panel} />
          </div>
        </div>

        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto overscroll-x-contain px-6 py-8 md:gap-6 md:px-8">
          {cards.map((c, i) => (
            <div
              key={c.href}
              className="h-[58svh] w-[clamp(14rem,68vw,20rem)] shrink-0 snap-start"
            >
              <CardFace card={c} index={i} />
            </div>
          ))}
        </div>
        {/* Measured even in fallback, so a resize to desktop has numbers. */}
        <div ref={trackRef} className="hidden" />
      </div>
    );
  }

  // ---- Pinned stage ----
  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `calc(100svh + ${cards.length * SCROLL_PER_CARD}vh)` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-paper">
        {/* ---- The panel: film wall that folds to a strip ---- */}
        <motion.div
          style={{ width: panelW }}
          className="absolute inset-y-0 left-0 z-20 overflow-hidden bg-umber will-change-[width]"
        >
          {/* Film, only while the wall is open. */}
          <motion.div style={{ opacity: filmFade }} className="absolute inset-0">
            <PanelMedia image={panel.image} />
            <PanelScrim />
          </motion.div>

          {/* Gold hairline mount, open state only. */}
          <motion.span
            aria-hidden
            style={{ opacity: openFade }}
            className="pointer-events-none absolute inset-6 border border-gold/40"
          />

          {/* Open face — eyebrow, heading, blurb, button, in one flow.
              The heading is a live element here rather than an absolutely
              positioned twin: a hardcoded offset drifted off the flow it
              was meant to overlay and dropped the title onto the blurb.
              In flow it can never collide, and `headingScale` still gives
              it the shrink-into-the-strip gesture (transform only — it
              scales in place without nudging the copy beneath it). */}
          <motion.div
            style={{ opacity: openFade }}
            className="absolute inset-x-0 bottom-0 p-[clamp(2rem,3.2vw,3.25rem)]"
          >
            <OpenFace panel={panel} headingScale={headScale} />
          </motion.div>

          {/* Strip face — the heading, set vertical, holding the edge. */}
          <motion.div
            style={{ opacity: stripFade }}
            className="absolute inset-0 flex flex-col items-center justify-between py-8"
          >
            <span aria-hidden className="h-10 w-px bg-gold/50" />
            <p
              className="label whitespace-nowrap text-paper"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {panel.title}
            </p>
            <Link
              href={panel.href}
              aria-label={panel.cta}
              className="text-gold transition-colors duration-300 hover:text-paper"
            >
              <Arrow className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ---- The rail ---- */}
        <motion.div
          style={{ left: railLeft }}
          className="absolute inset-y-0 right-0 z-10 flex items-center overflow-hidden"
        >
          <motion.div
            ref={trackRef}
            style={{ x: trackX }}
            className="flex items-center gap-[clamp(1.25rem,2vw,2rem)] pr-[clamp(2rem,4vw,5rem)] will-change-transform"
          >
            {cards.map((c, i) => (
              <div
                key={c.href}
                className="h-[70vh] w-[calc(70vh*0.72)] shrink-0"
              >
                <CardFace card={c} index={i} />
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---- Scroll cue ---- */}
        <motion.div
          style={{ opacity: cueFade }}
          className="pointer-events-none absolute bottom-8 right-[clamp(2rem,4vw,5rem)] z-30 flex items-center gap-3"
        >
          <span className="label text-ink-mute">Scroll to explore</span>
          <span aria-hidden className="h-px w-12 bg-ink-mute/50" />
        </motion.div>

        {/* ---- Travel rule: how far through the catalogue you are ---- */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-px bg-ink/10">
          <motion.div style={{ width: progress }} className="h-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

function PanelScrim() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber/90 via-umber/35 to-umber/10"
    />
  );
}

/** The film wall: the atelier showreel by default, a still when given one. */
function PanelMedia({ image }: { image?: string }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover"
      />
    );
  }
  return <ShowreelVideo />;
}

/** Eyebrow, heading, blurb and button — the panel at rest. */
function OpenFace({
  panel,
  headingScale,
}: {
  panel: StagePanel;
  /** On the pinned stage, the fold's shrink applied to the heading. */
  headingScale?: MotionValue<number>;
}) {
  return (
    <>
      <p className="label text-gold [text-shadow:0_1px_10px_rgb(var(--color-umber-rgb)_/_0.5)]">
        {panel.eyebrow}
      </p>

      {/* origin-bottom-left so the shrink pulls the title toward the
          corner it will fold into, not toward its own centre. */}
      <motion.h2
        style={headingScale ? { scale: headingScale } : undefined}
        className="statement statement-tight mt-3 origin-bottom-left text-paper [text-shadow:0_1px_18px_rgb(var(--color-umber-rgb)_/_0.4)]"
      >
        {panel.title}
      </motion.h2>

      <p className="lead mt-4 max-w-[32ch] text-body leading-[1.7] text-paper/80">
        {panel.blurb}
      </p>

      {panel.hideCta ? null : (
        <Link
          href={panel.href}
          className="label group mt-7 inline-flex items-center gap-3 border border-paper/40 px-7 py-4 text-paper transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-umber"
        >
          {panel.cta}
          <Arrow className="h-3.5 w-3.5 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      )}
    </>
  );
}

/** One collection: photograph, index numeral, name. */
function CardFace({ card, index }: { card: StageCard; index: number }) {
  return (
    <Link
      href={card.href}
      className="group relative block h-full w-full overflow-hidden bg-paper-deep"
      draggable={false}
    >
      <Image
        src={card.image}
        alt={card.title}
        fill
        sizes="(max-width: 1024px) 68vw, 40vh"
        // Eager: the rail travels by transform, so a card's layout box
        // never enters the viewport and native lazy-loading would leave
        // it blank as it slides past.
        loading="eager"
        className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        draggable={false}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber/88 via-umber/12 to-umber/5"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-500 group-hover:border-gold/50"
      />

      <p className="absolute right-5 top-5 font-body text-fine tabular-nums tracking-caps text-paper/60">
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <span
          aria-hidden
          className="mb-4 block h-px w-10 origin-left bg-gold/70 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-[2.4]"
        />
        <p className="font-display text-[clamp(1.6rem,2.1vw,2.5rem)] font-medium uppercase leading-[1.05] tracking-caps text-paper [text-shadow:0_2px_18px_rgb(var(--color-umber-rgb)_/_0.5)]">
          {card.title}
        </p>
        <span className="label mt-3 inline-flex items-center gap-2 text-paper/70 transition-colors duration-300 group-hover:text-gold">
          Explore
          <Arrow className="h-3 w-3 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  );
}

export default CollectionsStage;
// (film wall media is configurable per stage — see PanelMedia)
