"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { ARCH_D_UNIT, openArch } from "@/lib/arch";
import { cn } from "@/lib/utils";

/* ============================================================
   ScrollChoreography — the jharokha arcade opens
   ------------------------------------------------------------
   Three cusped Mughal arch bays stand on one springing line, the same
   arcade the hero opens the page with and drawn from the same generated
   outline (lib/arch). Each bay holds a collection.

   On scroll the flanking bays withdraw and the centre bay — the
   flagship — widens to fill the viewport while its arch *un-cusps* into
   a plain rectangle: the middle window of the haveli opening, rather
   than a picture being scaled up. What you walk through into is the
   collection itself, which opens beneath it.

   Everything is measured rather than expressed in vw/vh, because the
   arch has a fixed 5:8 proportion: sized in viewport units the bays
   stretch on wide screens and overflow the width on phones.
   ============================================================ */

const ARCH_RATIO = 300 / 480; // width : height of the house arch

/** Bay proportions, as fractions of the centre bay's height. */
const FLANK_SCALE = 0.74;

export interface ArcadeBay {
  image: string;
  label: string;
  href: string;
}

interface ScrollChoreographyProps {
  className?: string;
  /** The centre bay — the one that opens. */
  hero: ArcadeBay & { eyebrow?: string; cta?: string };
  left: ArcadeBay;
  right: ArcadeBay;
  /** Small caps above the arcade while it stands. */
  eyebrow?: string;
}

type Geometry = {
  vw: number;
  vh: number;
  centreW: number;
  centreH: number;
  flankW: number;
  flankH: number;
  offset: number;
  spring: number;
};

function measure(vw: number, vh: number): Geometry {
  const gap = vw < 768 ? 8 : 18;
  // The arcade must fit the width as well as the height. Solve for the
  // centre bay height that satisfies both, then hang everything off it.
  const budget = (vw < 768 ? 0.94 : 0.84) * vw - 2 * gap;
  const widthSpan = ARCH_RATIO * (2 * FLANK_SCALE + 1); // total width per unit of centre height
  const centreH = Math.min(0.62 * vh, budget / widthSpan);
  const centreW = ARCH_RATIO * centreH;
  const flankH = FLANK_SCALE * centreH;
  const flankW = ARCH_RATIO * flankH;

  return {
    vw,
    vh,
    centreW,
    centreH,
    flankW,
    flankH,
    offset: centreW / 2 + gap + flankW / 2,
    // The springing line sits low, leaving headroom for the eyebrow and
    // room beneath for the plaques.
    spring: Math.max(0.13 * vh, (vh - centreH) * 0.55),
  };
}

export function ScrollChoreography({
  className,
  hero,
  left,
  right,
  eyebrow = "The Collections",
}: ScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // A nominal desktop until the real viewport is known. The arcade sits
  // several screens down the page, so it is always measured long before
  // anyone scrolls to it.
  const [geo, setGeo] = useState<Geometry>(() => measure(1440, 820));

  useEffect(() => {
    const read = () => setGeo(measure(window.innerWidth, window.innerHeight));
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const p = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 42,
    mass: 0.9,
    restDelta: 0.0005,
  });

  /* Beats:
     0.00–0.10  the arcade settles onto its springing line
     0.10–0.42  it stands
     0.42–0.80  flanks withdraw, centre widens and un-cusps
     0.80–0.95  the collection cover lands                        */

  const standY = useTransform(p, [0, 0.1], [34, 0]);
  const standOpacity = useTransform(p, [0, 0.08], [0, 1]);
  const chromeOpacity = useTransform(p, [0.36, 0.5], [1, 0]);

  const flankOpacity = useTransform(p, [0.42, 0.66], [1, 0]);
  const leftX = useTransform(p, [0.42, 0.8], [-geo.offset, -(geo.vw / 2 + geo.flankW)]);
  const rightX = useTransform(p, [0.42, 0.8], [geo.offset, geo.vw / 2 + geo.flankW]);

  const centreW = useTransform(p, [0.42, 0.8], [geo.centreW, geo.vw]);
  const centreH = useTransform(p, [0.42, 0.8], [geo.centreH, geo.vh]);
  const centreBottom = useTransform(p, [0.42, 0.8], [geo.spring, 0]);

  // The arch unwinds a beat behind the growth, so the stonework is still
  // reading as an arch while the bay is already opening.
  const archOpen = useTransform(p, [0.46, 0.82], [0, 1]);
  const centreClip = useTransform(archOpen, (v) => openArch(v, { unit: true }));
  const centreStroke = useTransform(archOpen, (v) => openArch(v));
  const strokeOpacity = useTransform(p, [0.42, 0.62], [1, 0]);

  const coverOpacity = useTransform(p, [0.8, 0.95], [0, 1]);
  const coverY = useTransform(p, [0.8, 0.95], [24, 0]);

  // The foot fade seats a bay on the parchment ground. Once the centre
  // has opened to full bleed there is no ground left to seat it on, and
  // the wash just reads as a pale band along the bottom of the picture.
  const footOpacity = useTransform(p, [0.42, 0.62], [1, 0]);

  return (
    <div ref={containerRef} className={cn("relative h-[260vh] w-full", className)}>
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-paper">
        {/* Small caps above the arcade, on the axis. */}
        <motion.p
          style={{ opacity: chromeOpacity }}
          className="label absolute inset-x-0 top-[clamp(2rem,7vh,4.5rem)] z-40 text-center text-brand"
        >
          {eyebrow}
        </motion.p>

        <motion.div style={{ y: standY, opacity: standOpacity }} className="absolute inset-0">
          <Bay
            bay={left}
            x={leftX}
            width={geo.flankW}
            height={geo.flankH}
            bottom={geo.spring}
            opacity={flankOpacity}
            labelOpacity={chromeOpacity}
          />
          <Bay
            bay={right}
            x={rightX}
            width={geo.flankW}
            height={geo.flankH}
            bottom={geo.spring}
            opacity={flankOpacity}
            labelOpacity={chromeOpacity}
          />

          {/* The centre bay: the one that opens. */}
          <Bay
            bay={hero}
            x={0}
            width={centreW}
            height={centreH}
            bottom={centreBottom}
            clip={centreClip}
            stroke={centreStroke}
            strokeOpacity={strokeOpacity}
            labelOpacity={chromeOpacity}
            footOpacity={footOpacity}
            priority
            className="z-30"
          >
            {/* The collection cover, revealed once the window is open. */}
            <motion.div
              style={{ opacity: coverOpacity }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              {/* These photographs are near-white, so a bottom-up gradient
                  leaves the copy unreadable. The hero solves the same
                  problem the same way: a flat knock-back plus a soft
                  radial that opens a calmer pool under the type. */}
              <span aria-hidden className="absolute inset-0 bg-umber/28" />
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(52% 42% at 50% 50%, rgba(20,16,13,0.62) 0%, rgba(20,16,13,0.32) 58%, rgba(20,16,13,0) 84%)",
                }}
              />
              <motion.div style={{ y: coverY }} className="relative flex flex-col items-center px-6">
                <p className="label text-gold">
                  {hero.eyebrow ?? "The Collection"}
                </p>
                <p className="statement statement-tight mt-3 text-paper">{hero.label}</p>
                <Link
                  href={hero.href}
                  className="label group mt-7 inline-flex items-center gap-2.5 border-b border-paper/40 pb-1.5 font-light text-paper transition-colors hover:border-gold hover:text-gold"
                >
                  {hero.cta ?? "Enter the collection"}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                    className="h-3.5 w-3.5 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    <line x1="2" y1="14" x2="14" y2="2" />
                    <polyline points="5 2 14 2 14 11" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </Bay>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * One bay: a photograph clipped to the house arch, with the stonework
 * stroked over it and a plaque on the ground beneath.
 *
 * The clip is declared in objectBoundingBox units so a single outline
 * stretches to the bay whatever size it is animated to, and the stroke is
 * drawn with a non-scaling stroke so the line stays even as it does.
 */
function Bay({
  bay,
  x,
  width,
  height,
  bottom,
  opacity,
  clip,
  stroke,
  strokeOpacity,
  labelOpacity,
  footOpacity,
  priority,
  className,
  children,
}: {
  bay: ArcadeBay;
  x: MotionValue<number> | number;
  width: MotionValue<number> | number;
  height: MotionValue<number> | number;
  bottom: MotionValue<number> | number;
  opacity?: MotionValue<number>;
  clip?: MotionValue<string>;
  stroke?: MotionValue<string>;
  strokeOpacity?: MotionValue<number>;
  labelOpacity?: MotionValue<number>;
  footOpacity?: MotionValue<number>;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const uid = useId().replace(/:/g, "");
  const clipId = `arch-clip-${uid}`;

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            {clip ? <motion.path d={clip} /> : <path d={ARCH_D_UNIT} />}
          </clipPath>
        </defs>
      </svg>

      <motion.div
        style={{ x, width, height, bottom, opacity, clipPath: `url(#${clipId})` }}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 overflow-hidden bg-paper-deep will-change-transform",
          className,
        )}
      >
        <Image
          src={bay.image}
          alt={bay.label}
          fill
          sizes="(max-width: 768px) 40vw, 30vw"
          className="object-cover"
          priority={priority}
        />
        {/* Dissolves the foot of the photograph into the parchment, so the
            bay stands in the page rather than on top of it. */}
        <motion.span
          aria-hidden
          style={{ opacity: footOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper/80 to-transparent"
        />
        {children}
      </motion.div>

      {/* Stonework. Espresso, not gold — a gold hairline disappears
          against the lighter photographs.

          The box is animated on a wrapping div, never on the <svg>
          itself: Motion writes width/height onto an SVG element as
          attributes rather than styles, so a plain number that changes
          between renders (as these do on resize) never reaches it and
          the outline stays at whatever size it first mounted with. */}
      <motion.div
        aria-hidden
        style={{ x, width, height, bottom, opacity: strokeOpacity ?? opacity }}
        className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
      >
        <svg
          viewBox="0 0 300 480"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          {stroke ? (
            <motion.path
              d={stroke}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <path
              d={openArch(0)}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </motion.div>

      {/* The plaque, on the ground under the bay. */}
      <motion.div
        style={{ x, bottom, opacity: labelOpacity }}
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 translate-y-[calc(100%+1.15rem)]"
      >
        <Link
          href={bay.href}
          className="label pointer-events-auto whitespace-nowrap text-ink transition-colors hover:text-brand"
        >
          {bay.label}
        </Link>
      </motion.div>
    </>
  );
}

export default ScrollChoreography;
