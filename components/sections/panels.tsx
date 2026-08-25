import Image from "next/image";

import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The stacked panel run.
 *
 * Every panel is `sticky top-0 h-svh` inside one tall parent, so each
 * arrives over the top of the last and holds while the next one climbs
 * in — no pinning library, and nothing measures anything.
 *
 * The headline is white with `mix-blend-mode: difference`, which is what
 * lets one colour work on all three grounds: it reads black over the
 * cream panels, white over the dark ones, and inverts wherever the
 * photograph runs behind it. The panel sets `isolate` so the blend stops
 * at its own edge instead of reaching the page underneath.
 */

const PANELS = [
  {
    index: "01",
    copy: "You know the piece you want and cannot find it anywhere. We cut it to your measurements, in your palette, from the first sketch.",
    headline: "You have something specific in mind",
  },
  {
    index: "02",
    copy: "A wedding week is not one outfit. We build the whole run together so the mehendi, the sangeet and the day itself belong to each other.",
    headline: "You are dressing for more than a day",
  },
  {
    index: "03",
    copy: "Hand work takes the time it takes. Start early and you get the heavier zardozi, the fittings, and none of the compromises.",
    headline: "You want the work done properly",
  },
  {
    index: "04",
    copy: "Sizes change, plans change, and heirlooms should survive both. Everything we make can be let out, taken in and restored by the atelier.",
    headline: "You expect it to outlast the occasion",
  },
];

export function StickyPanels({ images = [] }: { images?: string[] }) {
  return (
    <section className="relative bg-paper">
      {/* Accent panel — the premise, before the four cases for it. */}
      <div className="gutter sticky top-0 flex h-svh flex-col items-center justify-center gap-12 overflow-hidden bg-brand">
        <div className="w-full md:w-[72%]">
          <RevealWords
            as="p"
            className="grotesk text-justify text-paper"
            text="Couture is not a heavier version of ready-to-wear."
          />
          <RevealWords
            as="p"
            delay={0.1}
            className="grotesk mt-[1.6em] text-justify text-paper"
            text="It is a garment built around one person, by people who will never make it twice, out of techniques that cannot be rushed without showing."
          />
          <RevealWords
            as="p"
            delay={0.2}
            className="grotesk mt-[1.6em] text-justify text-paper"
            text="Here is when clients usually come to us:"
          />
        </div>
      </div>

      {PANELS.map((panel, i) => (
        <Panel key={panel.index} {...panel} dark={i % 2 === 0} image={images[i]} />
      ))}
    </section>
  );
}

function Panel({
  index,
  copy,
  headline,
  dark,
  image,
}: {
  index: string;
  copy: string;
  headline: string;
  dark: boolean;
  image?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 isolate flex h-svh flex-col overflow-hidden",
        dark ? "bg-panel" : "bg-paper",
      )}
    >
      {image ? (
        /* Parallax sets `relative` on its own root, so the placement has
           to happen on a wrapper — passing `absolute` in its className
           loses to the built-in and drops the plate back into flow. */
        <div className="pointer-events-none absolute right-0 top-[31%] h-[69%] w-[62%] opacity-80 md:right-[35px] md:w-[39%]">
          <Parallax speed={0.34} className="h-full w-full">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 767px) 62vw, 39vw"
              className="object-cover"
            />
          </Parallax>
        </div>
      ) : null}

      <div className="gutter relative flex h-full flex-col justify-between py-[clamp(1.5rem,3vw,2.2rem)] md:pr-[70px]">
        <Reveal kind="rise" className="flex flex-col gap-2.5 md:w-[48%]">
          <p className="grotesk-sm text-brand">{index}</p>
          <p className={cn("grotesk-sm mt-2", dark ? "text-paper" : "text-ink")}>{copy}</p>
        </Reveal>

        <h2 className="statement statement-mega mix-blend-difference md:w-[85%]" style={{ color: "#fff" }}>
          {headline}
        </h2>
      </div>
    </div>
  );
}
