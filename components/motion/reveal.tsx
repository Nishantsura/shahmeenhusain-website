"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealKind = "fade" | "rise" | "mask";

const VARIANTS: Record<RevealKind, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    shown: { opacity: 1 },
  },
  rise: {
    hidden: { opacity: 0, y: 40 },
    shown: { opacity: 1, y: 0 },
  },
  /* The mask wipe lives on an inner element, never the observed one.
     Clipping the observed element to inset(100%) gives it zero visible
     area, so an intersection observer reports ratio 0 and the reveal can
     never fire — that deadlock cost us a hidden product image once. */
  mask: {
    hidden: { clipPath: "inset(100% 0 0 0)" },
    shown: { clipPath: "inset(0% 0 0 0)" },
  },
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  kind = "rise",
  delay = 0,
  className,
  as = "div",
  amount = 0.15,
}: {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  as?: ElementType;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount, margin: "0px 0px -10% 0px" });

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const duration = kind === "mask" ? 1.4 : 1.1;

  if (kind === "mask") {
    return (
      <div ref={ref} className={cn("overflow-hidden", className)}>
        <motion.div
          variants={VARIANTS.mask}
          initial="hidden"
          animate={inView ? "shown" : "hidden"}
          transition={{ duration, delay, ease: [0.83, 0, 0.17, 1] }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={VARIANTS[kind]}
      initial="hidden"
      animate={inView ? "shown" : "hidden"}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

/** Word-by-word rise, for the big editorial statements. */
export function RevealWords({
  text,
  className,
  as: Tag = "p",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -10% 0px" });
  const words = text.split(/\s+/);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          /* The mask is only as tall as the line box, so at the tight
             leading this design uses it shears the descenders clean off.
             Pad it and pull the padding back out of the layout. */
          className="inline-block overflow-hidden pb-[0.18em] align-bottom -mb-[0.18em]"
        >
          <motion.span
            data-reveal-word
            className="inline-block"
            initial={{ y: "105%" }}
            animate={inView ? { y: 0 } : { y: "105%" }}
            transition={{ duration: 1.05, delay: delay + i * 0.045, ease: EASE }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
