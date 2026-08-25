"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * The pinned statement.
 *
 * A tall section holds a sticky full-height panel, and the extra scroll
 * length is spent filling the sentence in one word at a time rather than
 * moving anything. Words sit at a low opacity until their slice of the
 * progress passes, so the sentence resolves out of its own ghost.
 *
 * Everything animated here is driven by MotionValues straight onto style,
 * never through state — a per-word `useState` would re-render the whole
 * sentence on every frame of the scroll.
 */
export function ScrollStatement({
  text,
  className,
  height = "200svh",
}: {
  text: string;
  className?: string;
  height?: string;
}) {
  const section = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div ref={section} className="relative" style={{ height }}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        {/* Centred, not justified. A full first line reaches the gutters
            on its own; justifying would also stretch the short last line
            across the whole measure and leave craters between three
            words. */}
        <p className={cn("gutter statement w-full text-center", className)}>
          {words.map((word, i) => (
            <Word
              key={`${word}-${i}`}
              progress={scrollYProgress}
              /* Each word fades across its own slice, with the slices
                 overlapping so the fill reads as a sweep rather than a
                 row of switches flipping. The whole sweep is packed into
                 the first 85% of the pin, which leaves the finished
                 sentence on screen for a beat before it releases.
                 Offsets must stay inside [0,1] — Motion rejects a range
                 that runs past the end of the progress. */
              range={slice(i, words.length)}
            >
              {word}
            </Word>
          )).flatMap((node, i) => (i ? [" ", node] : [node]))}
        </p>
      </div>
    </div>
  );
}

const SWEEP = 0.85;
const OVERLAP = 1.8;

function slice(i: number, total: number): [number, number] {
  const start = (i / total) * SWEEP;
  const end = Math.min(1, ((i + OVERLAP) / total) * SWEEP);
  return [start, Math.max(end, start + 0.001)];
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span data-reveal-word style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}
