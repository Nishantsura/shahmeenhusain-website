"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useId } from "react";

import { Lozenge } from "@/components/ui/lozenge";

const EASE = [0.16, 1, 0.3, 1] as const;

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
 * The outline is generated rather than hand-drawn. A multifoil arch is a
 * two-centred pointed arch whose opening is then scalloped into lobes,
 * and nine lobes hand-tuned as Béziers is a losing game — the cusps come
 * out uneven and they flatten at small sizes. Sampling the guide curve
 * and hanging a semicircle off each chord gets them identical by
 * construction, and makes the lobe count a number I can tune.
 */
const ARCH_W = 300;
const ARCH_H = 480;

function cuspedArch(lobes: number) {
  // Two-centred pointed arch: each half is an arc of radius 0.75W struck
  // from the opposite springing point. That puts the apex at 0.7071W.
  const r = 0.75 * ARCH_W;
  const spring = 0.7071 * ARCH_W;
  const tMax = Math.acos(1 / 3); // where the two arcs cross, at x = W/2
  const half = Math.ceil(lobes / 2);

  const left: [number, number][] = [];
  for (let i = 0; i <= half; i++) {
    const t = (i / half) * tMax;
    left.push([r - r * Math.cos(t), spring - r * Math.sin(t)]);
  }
  // Mirror everything but the apex to get the right-hand half.
  const pts = [
    ...left,
    ...left.slice(0, -1).reverse().map(([x, y]): [number, number] => [ARCH_W - x, y]),
  ];

  let d = `M0,${ARCH_H} L${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const chord = Math.hypot(x1 - x0, y1 - y0);
    // sweep 0 bulges the lobe into the opening rather than out of it
    d += ` A${(chord / 2).toFixed(2)},${(chord / 2).toFixed(2)} 0 0 0 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  return `${d} L${ARCH_W},${ARCH_H} Z`;
}

const ARCH_D = cuspedArch(9);

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

export function Hero() {
  return (
    /* The bottom padding is clearance for the fixed WhatsApp button,
       which otherwise lands on the right-hand end of the CTA at phone
       widths. Desktop is wide enough that they never meet. */
    <section className="relative flex h-svh min-h-[600px] flex-col items-center justify-center overflow-hidden bg-paper pb-28 md:pb-0">
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
    </section>
  );
}

/**
 * The miniature floral ground.
 *
 * Two veils sit over it. The painting is a dense, mid-contrast field and
 * type laid straight onto it is unreadable, so a flat parchment wash
 * knocks the whole thing back and a soft radial opens a calmer pool
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
      <div className="absolute inset-0 bg-paper/25" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 54% at 50% 52%, rgba(241,231,214,0.82) 0%, rgba(241,231,214,0.40) 55%, rgba(241,231,214,0) 84%)",
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
        className="font-body text-[0.75rem] font-medium uppercase tracking-[0.32em] text-ink"
        /* Halo, not a plate: it clears the vines from immediately behind
           each letter while staying invisible as an effect. */
        style={{ textShadow: "0 0 10px rgba(241,231,214,0.95), 0 0 3px rgba(241,231,214,0.95)" }}
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
          <stop offset="0%" stopColor="#F1E7D6" stopOpacity="0" />
          <stop offset="100%" stopColor="#F1E7D6" stopOpacity="0.85" />
        </linearGradient>
        {/* Lifts each bay off the patterned wall — without it the light
            photographs and the cream ground dissolve into each other. */}
        <filter id={lift} x="-20%" y="-12%" width="140%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#2A1D14" floodOpacity="0.26" />
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
            stroke="#F1E7D6"
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
      className="mt-[clamp(1rem,2.6vh,2rem)] max-w-[34ch] text-center font-display text-[clamp(1rem,1.8vw,1.5rem)] uppercase leading-[1.6] tracking-[0.2em] text-ink"
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
        className="group relative inline-flex items-center gap-3 bg-ink px-10 py-[1.1rem] font-body text-[0.72rem] font-medium uppercase tracking-[0.3em] text-paper shadow-[0_10px_26px_rgba(42,29,20,0.20)] transition-colors duration-500 hover:bg-brand"
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
