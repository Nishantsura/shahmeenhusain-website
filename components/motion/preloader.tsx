"use client";

import { useEffect, useState } from "react";

import { Lozenge } from "@/components/ui/lozenge";
import { ARCH_D, ARCH_H, ARCH_W } from "@/lib/arch";

/* How long the mark is held after it has drawn in, before the sheet
   lifts. Kept short — a preloader, not a gate. */
const HOLD_MS = 2400;
/* Sheet slide-up; must match the CSS duration on the container. */
const EXIT_MS = 1000;

/* Ornament drawn in the arch's own coordinate space (0..ARCH_W, 0..ARCH_H,
   apex at the top). A kalash finial crowns the apex; a mukaish medallion —
   the radiating metal-dot embroidery the atelier is known for — sits in
   the niche, so the arch frames a hand-worked motif the way the hero
   arches frame a photograph. All symmetric about the centre. */
const CX = ARCH_W / 2;
const MED_CY = 334; // medallion centre, sitting in the niche
const FINIAL_D = `M${CX},6 L${CX},-14 M${CX - 6},-11 L${CX + 6},-11 M${CX},-14 C${CX - 7},-20 ${CX - 7},-30 ${CX},-38 C${CX + 7},-30 ${CX + 7},-20 ${CX},-14 Z`;

/* One petal drawn along +x from the medallion centre; rotated into eight. */
const MED_PETAL_D = `M${CX + 22},${MED_CY} C${CX + 32},${MED_CY - 7.5} ${CX + 44},${MED_CY - 7.5} ${CX + 54},${MED_CY} C${CX + 44},${MED_CY + 7.5} ${CX + 32},${MED_CY + 7.5} ${CX + 22},${MED_CY} Z`;
const MED_PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  // Round so SSR and client serialise the same string — a raw float can
  // differ in its last digit between the two and trip a hydration mismatch.
  const round = (v: number) => Math.round(v * 1000) / 1000;
  return [round(CX + r * Math.cos(a)), round(MED_CY + r * Math.sin(a))];
};
/* Rosette around the centre, dots in the petal gaps, and an outer halo —
   the dotted rings that read as mukaish. */
const MED_ROSETTE = MED_PETAL_ANGLES.map((d) => polar(12, d));
const MED_GAP_DOTS = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((d) => polar(41, d));
const MED_HALO = Array.from({ length: 12 }, (_, i) => polar(70, i * 30));

/**
 * Intro veil. The house arch traces itself on over the parchment ground,
 * the wordmark settles beneath it, and the whole sheet lifts to uncover
 * the store. Drawn from the same geometry as the hero arches (lib/arch),
 * so it is unmistakably of this site — no image, no video, no deps.
 * Plays on every load; auto-dismisses.
 */
export function Preloader() {
  const [entered, setEntered] = useState(false); // drives the draw-in
  const [leaving, setLeaving] = useState(false); // drives the lift-off
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Flip on the next frame so the transitions run from their initial
    // (hidden) state rather than being there on first paint.
    const raf = requestAnimationFrame(() => setEntered(true));

    const hold = reduce ? 400 : HOLD_MS;
    const lift = window.setTimeout(() => setLeaving(true), hold);
    const clear = window.setTimeout(() => {
      document.body.classList.remove("no-scroll");
      setGone(true);
    }, hold + EXIT_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(lift);
      window.clearTimeout(clear);
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (gone) return null;

  return (
    <div
      data-preloader
      aria-hidden
      /* Parchment shell, so lifting it uncovers the warm hero rather than
         flashing a dark seam. */
      className={`fixed inset-0 z-[4000] flex flex-col items-center justify-center bg-paper-deep transition-transform duration-[1000ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${
        leaving ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* The house arch as a jharokha: traced on as a fine gold hairline,
          crowned by a finial, framing a mukaish medallion. The viewBox
          opens above the apex to make room for the finial. Width steps up
          across breakpoints so the motif keeps its presence on every size. */}
      <svg
        viewBox={`0 -44 ${ARCH_W} ${ARCH_H + 44}`}
        fill="none"
        stroke="var(--color-gold)"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="h-auto w-[118px] sm:w-[132px] md:w-[146px]"
      >
        {/* The arch itself draws on. pathLength=1 normalises the dash
            maths regardless of the generated path length. */}
        <path
          d={ARCH_D}
          strokeWidth={4}
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: entered ? 0 : 1,
            transition: "stroke-dashoffset 1300ms cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />
        {/* Finial fades in as the arch completes. */}
        <path
          d={FINIAL_D}
          strokeWidth={3}
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 800ms ease",
            transitionDelay: "700ms",
          }}
        />
        {/* The mukaish medallion settles in last, like embroidery worked
            into the niche. Petals are hairline outlines; the dotted rings
            are filled, so they read as metal specks. */}
        <g
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 1000ms ease",
            transitionDelay: "850ms",
          }}
        >
          {MED_PETAL_ANGLES.map((deg) => (
            <path
              key={deg}
              d={MED_PETAL_D}
              strokeWidth={2.4}
              transform={`rotate(${deg} ${CX} ${MED_CY})`}
            />
          ))}
          <circle cx={CX} cy={MED_CY} r={4.5} fill="var(--color-gold)" stroke="none" />
          {MED_ROSETTE.map(([x, y], i) => (
            <circle key={`r${i}`} cx={x} cy={y} r={2.2} fill="var(--color-gold)" stroke="none" />
          ))}
          {MED_GAP_DOTS.map(([x, y], i) => (
            <circle key={`g${i}`} cx={x} cy={y} r={2.6} fill="var(--color-gold)" stroke="none" />
          ))}
          {MED_HALO.map(([x, y], i) => (
            <circle key={`h${i}`} cx={x} cy={y} r={2} fill="var(--color-gold)" stroke="none" />
          ))}
        </g>
      </svg>

      <h1
        className="mt-8 font-display text-[clamp(1.7rem,5.5vw,3rem)] font-normal leading-none text-ink"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(14px)",
          letterSpacing: entered ? "0.08em" : "0.34em",
          transition:
            "opacity 1000ms ease, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 1300ms cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: "500ms",
        }}
      >
        Shahmeen Husain
      </h1>

      <div
        className="mt-7"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 900ms ease",
          transitionDelay: "1050ms",
        }}
      >
        <Lozenge className="w-[62px] text-gold" />
      </div>
    </div>
  );
}
