"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { Lozenge } from "@/components/ui/lozenge";
import { ARCH_D, ARCH_H, ARCH_W } from "@/lib/arch";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* The SVG frames and the two scrims are painted in the ground colour, and
   SVG attributes and inline gradients cannot read a Tailwind class. These
   mirror --color-paper / --color-ink from globals.css and are the only
   place on the site where a palette value is repeated — keep them in step
   with the design-system block there. */
const PAPER = "#FAF8F4";
const INK = "#211D19";
const PAPER_A = (a: number) => `rgba(250, 248, 244, ${a})`;

/**
 * Jharokha hero.
 *
 * Three cusped Mughal arches, each with a photograph clipped inside,
 * standing on a Mughal miniature floral ground — the arcade of
 * overhanging windows on a haveli facade. Two decisions carry it:
 *
 *  - It is symmetrical. Asymmetric editorial layout reads modern and
 *    Western however you dress it; an axial composition reads
 *    traditional before a single word is legible, and a centre flanked
 *    by two shorter bays is the oldest way there is to say "this is the
 *    important one".
 *  - The frames are drawn, not photographed, so they scale cleanly and
 *    the ornament costs a few hundred bytes rather than an image
 *    request.
 *
 * The arch outline (ARCH_D) is generated, not hand-drawn — see lib/arch.
 */

/**
 * Each photograph is framed against the arch by hand. They are different
 * crops — one three-quarter, two full-length — so a shared fit leaves
 * heads in the cusps on some and empty floor under others.
 */
type Frame = { x: number; y: number; w: number; h: number };

const BAYS: { src: string; frame: Frame }[] = [
  { src: "/hero-arch-left.jpg", frame: { x: -34, y: -6, w: 368, h: 552 } },
  { src: "/hero-jharokha.jpg", frame: { x: -117, y: 26, w: 460, h: 690 } },
  { src: "/hero-arch-right.jpg", frame: { x: -96, y: 4, w: 430, h: 645 } },
];

/** Two slides, and how long each holds before the carousel advances. */
const SLIDE_COUNT = 2;
const AUTO_MS = 7000;
/** A horizontal drag past this many px counts as a swipe, not a tap. */
const SWIPE_PX = 60;

/**
 * Hero carousel.
 *
 * Slide one is the jharokha arcade — the LCP, so it is what paints first
 * and always the slide the page opens on. Slide two is a full-bleed film
 * of the atelier with the luxury-pret billing laid over it. The two are
 * stacked and crossfaded rather than translated, because the arcade runs
 * its own staged entrance and sliding it in and out would fight that.
 *
 * The film's src is not attached until its slide is first reached, so the
 * 5.7MB clip never touches a first paint that shows the arcade anyway; a
 * reduced-motion viewer gets the poster and no autoplay, on either the
 * film or the carousel itself.
 */
export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  // Hold the reel back when the tab is hidden: no reason to burn the
  // autoplay timer — or play video — no one is watching.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = (to: number) =>
    setIndex(((to % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);

  // Timer keyed on index, so a manual jump resets the dwell rather than
  // advancing early off the previous slide's clock.
  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setTimeout(() => go(index + 1), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, reduced]);

  return (
    <section
      className="relative h-svh min-h-[600px] overflow-hidden bg-paper"
      aria-roledescription="carousel"
      aria-label="Featured"
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        const from = startX.current;
        startX.current = null;
        if (from == null) return;
        const dx = e.clientX - from;
        if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <Slide active={index === 0}>
        <JharokhaSlide />
      </Slide>
      <Slide active={index === 1}>
        <VideoSlide active={index === 1} />
      </Slide>

      <Dots index={index} count={SLIDE_COUNT} onDark={index === 1} onGo={go} />
    </section>
  );
}

/**
 * One crossfaded layer. Both stay mounted; only opacity and hit-testing
 * move. A plain CSS opacity transition rather than a Motion `animate`
 * prop: the crossfade fires on a re-render (the active flag flipping),
 * not on mount, and CSS drives that far more reliably than an animate
 * target that has to be diffed each render.
 */
function Slide({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        "absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

/** Slide 1 — the jharokha arcade. */
function JharokhaSlide() {
  return (
    /* The bottom padding is clearance for the fixed WhatsApp button,
       which otherwise lands on the right-hand end of the CTA at phone
       widths. Desktop is wide enough that they never meet. */
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-paper pb-28 md:pb-0">
      <Ground />

      <div className="gutter relative z-10 flex w-full flex-col items-center pt-header">
        <Eyebrow />

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.2, ease: EASE }}
          /* Bottom-aligned, so the three bays stand on one springing
             line the way an arcade does. */
          className="mt-[clamp(0.5rem,1.6vh,1.25rem)] flex items-end justify-center gap-[clamp(0.75rem,2.2vw,2rem)]"
        >
          <Jharokha {...BAYS[0]} className="hidden h-[clamp(0px,42.2vh,29.1rem)] md:block" />
          <Jharokha
            {...BAYS[1]}
            arc="ZARDOZI · DABKA · AARI · MUKAISH"
            className="h-[clamp(220px,55vh,38rem)]"
          />
          <Jharokha {...BAYS[2]} className="hidden h-[clamp(0px,42.2vh,29.1rem)] md:block" />
        </motion.div>

        <Headline />
        <Actions />
      </div>
    </div>
  );
}

/**
 * Slide 2 — a full-bleed film with the luxury-pret billing.
 *
 * The layout is bottom-weighted like the reference: the headline and its
 * two actions hold the lower-left, a short description sits opposite on
 * the lower-right, and everything reads paper-on-film over a scrim that
 * darkens the foot enough to carry the type.
 */
function VideoSlide({ active }: { active: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-umber">
      <HeroVideo active={active} />

      {/* Foot-heavy wash: bright film at the top, ink at the bottom where
          the copy sits. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber/88 via-umber/30 to-umber/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-5 border border-gold/30 md:inset-8"
      />

      {/* Bottom padding clears the fixed WhatsApp button, which lives in
          the lower-right where the standfirst also sits. */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-[clamp(1.5rem,5vw,5rem)] pb-[clamp(5rem,13vh,7rem)] pt-header">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          {/* Left — eyebrow, headline, actions. */}
          <div className="max-w-[20ch] md:max-w-[48%]">
            <p className="label text-gold [text-shadow:0_1px_10px_rgb(var(--color-umber-rgb)_/_0.6)]">
              Luxury Pret
            </p>
            <h2 className="statement mt-4 text-pretty text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.0] text-paper [text-shadow:0_2px_24px_rgb(var(--color-umber-rgb)_/_0.5)]">
              Ready to wear,
              <br />
              worked by hand
            </h2>

            <div className="mt-[clamp(1.5rem,3vh,2.25rem)] flex flex-wrap gap-3">
              <Link
                href="/collections/ready-to-ship"
                className="label border border-paper/50 px-7 py-[0.95rem] text-paper transition-colors duration-300 hover:bg-paper hover:text-umber"
              >
                Ready to Ship
              </Link>
            </div>
          </div>

          {/* Right — the standfirst, set opposite the headline. */}
          <p className="max-w-[36ch] font-body text-body font-light leading-[1.75] text-paper/85 md:text-right [text-shadow:0_1px_12px_rgb(var(--color-umber-rgb)_/_0.6)]">
            Couture hands on everyday silhouettes — organza, drape and thread
            work, finished to the standard of the made-to-order floor.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The slide-2 film. The src is attached only once the slide has been
 * reached, and playback runs only while it is the active slide. A
 * reduced-motion viewer never gets the src at all — the poster stands in.
 */
function HeroVideo({ active }: { active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const arm = () => setArmed(true);
    if (active) arm();
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && !reduced) el.play().catch(() => {});
    else el.pause();
  }, [active, reduced, armed]);

  return (
    <video
      ref={ref}
      src={armed && !reduced ? "/showreel.mp4" : undefined}
      poster="/showreel-poster.jpg"
      muted
      loop
      playsInline
      preload="none"
      className="h-full w-full object-cover"
    />
  );
}

/** Slide indicators — short rules that fill on the active slide. */
function Dots({
  index,
  count,
  onDark,
  onGo,
}: {
  index: number;
  count: number;
  onDark: boolean;
  onGo: (to: number) => void;
}) {
  return (
    <div className="absolute bottom-[clamp(1.25rem,3vh,2rem)] left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
      {Array.from({ length: count }, (_, i) => {
        const on = i === index;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={on}
            onClick={() => onGo(i)}
            className="group relative h-4 py-1.5"
          >
            <span
              className={cn(
                "block h-px transition-all duration-500",
                on ? "w-12" : "w-9",
                on
                  ? onDark
                    ? "bg-paper"
                    : "bg-brand"
                  : onDark
                    ? "bg-paper/40"
                    : "bg-ink/25",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * The miniature floral ground.
 *
 * Two veils sit over it. The painting is a dense, mid-contrast field and
 * type laid straight onto it is unreadable, so a flat wash of the page
 * ground knocks it most of the way back — the pattern survives as a
 * ghost rather than a picture — and a soft radial opens a calmer pool
 * under the centre column.
 */
function Ground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        /* The painting carries its own dark frame line about half a
           percent in from each edge. Scaling past it crops it out — left
           in, it reads as an accidental hairline round the viewport. */
        className="scale-105 object-cover"
      />
      <div className="absolute inset-0 bg-paper/55" />
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(58% 54% at 50% 52%, ${PAPER_A(0.86)} 0%, ${PAPER_A(0.44)} 55%, ${PAPER_A(0)} 84%)`,
        }}
      />
    </div>
  );
}

/** Rule, lozenge, rule — the mark that opens the page. */
function Eyebrow() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
      className="flex flex-col items-center gap-[clamp(0.5rem,1.4vh,0.9rem)]"
    >
      {/* Lozenge draws in currentColor; terracotta picks up the red
          blossoms in the painting behind it. */}
      <Lozenge className="text-brand" />
      <p
        className="label text-ink"
        /* Halo, not a plate: it clears the vines from immediately behind
           each letter while staying invisible as an effect. */
        style={{ textShadow: `0 0 10px ${PAPER_A(0.95)}, 0 0 3px ${PAPER_A(0.95)}` }}
      >
        Hand embroidered in India
      </p>
    </motion.div>
  );
}

function Jharokha({
  src,
  frame,
  arc,
  className,
}: {
  src: string;
  frame: Frame;
  arc?: string;
  className?: string;
}) {
  /* Every instance needs its own clip, gradient and arc ids. Hardcoded
     ones collide in the document and all three bays end up clipped to
     whichever path the browser saw first. */
  const uid = useId().replace(/:/g, "");
  const clip = `clip-${uid}`;
  const fade = `fade-${uid}`;
  const curve = `curve-${uid}`;
  const lift = `lift-${uid}`;

  return (
    <svg
      /* The centre bay needs headroom above the stonework for the arced
         caps; the flanking bays would only render that as dead space. */
      viewBox={arc ? "-62 -66 424 562" : "-12 -14 324 510"}
      className={`block w-auto overflow-visible ${className ?? ""}`}
      aria-hidden
    >
      <defs>
        <clipPath id={clip}>
          <path d={ARCH_D} />
        </clipPath>
        <linearGradient id={fade} x1="0" y1="0.62" x2="0" y2="1">
          <stop offset="0%" stopColor={PAPER} stopOpacity="0" />
          <stop offset="100%" stopColor={PAPER} stopOpacity="0.85" />
        </linearGradient>
        {/* Lifts each bay off the patterned wall — without it the light
            photographs and the cream ground dissolve into each other. */}
        <filter id={lift} x="-20%" y="-12%" width="140%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor={INK} floodOpacity="0.26" />
        </filter>
      </defs>

      <g clipPath={`url(#${clip})`} filter={`url(#${lift})`}>
        <image
          href={src}
          x={frame.x}
          y={frame.y}
          width={frame.w}
          height={frame.h}
          preserveAspectRatio="xMidYMid slice"
        />
        {/* Dissolves the foot of each photograph into the parchment, so
            the bays sit in the page rather than on top of it. */}
        <rect x="0" y="0" width={ARCH_W} height={ARCH_H} fill={`url(#${fade})`} />
      </g>

      {/* Single stroke. Espresso, not gold — gold hairline is invisible
          against the ochre vines of the ground. */}
      <path d={ARCH_D} fill="none" stroke="var(--color-ink)" strokeWidth="1.6" />

      {arc ? (
        <>
          {/* A bare arc struck well outside the stonework, so the caps
              clear the cusps. */}
          <path id={curve} d="M-26,220 C-26,58 58,-44 150,-44 C242,-44 326,58 326,220" fill="none" />
          <text
            className="font-body"
            fill="var(--color-ink)"
            stroke={PAPER}
            strokeWidth={3}
            paintOrder="stroke"
            strokeLinejoin="round"
            style={{ fontSize: 14, fontWeight: 500, letterSpacing: 4.2 }}
          >
            <textPath href={`#${curve}`} startOffset="50%" textAnchor="middle">
              {arc}
            </textPath>
          </text>
        </>
      ) : null}
    </svg>
  );
}

function Headline() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.85, ease: EASE }}
      className="statement mt-[clamp(1rem,2.6vh,2rem)] max-w-[30ch] text-center text-title"
    >
      Heirloom bridal, worked by hand over months
    </motion.h1>
  );
}

function Actions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 1.05, ease: EASE }}
      className="mt-[clamp(1.25rem,3vh,2.25rem)]"
    >
      {/* Solid, not outlined. An outline over a painted ground gives the
          label the same legibility problem the rest of the micro-type
          had; a filled block guarantees its own contrast. */}
      <Link
        href="/collections"
        className="label group relative inline-flex items-center gap-3 bg-ink px-10 py-[1.1rem] text-paper shadow-[0_10px_26px_rgba(33,29,25,0.20)] transition-colors duration-500 hover:bg-brand"
      >
        {/* Hairline held just inside the edge — the same double-line
            device as the arch, at button scale. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[5px] border border-paper/25"
        />
        Explore collections
        <span className="block h-px w-5 bg-current transition-all duration-500 group-hover:w-8" />
      </Link>
    </motion.div>
  );
}
