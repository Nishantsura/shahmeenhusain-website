"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * The scroll-filled statement.
 *
 * Words sit at a low opacity until their slice of the progress passes, so
 * the sentence resolves out of its own ghost as it crosses the viewport.
 *
 * This used to pin: a 200svh section holding a sticky full-height panel,
 * spending a whole screen of scroll on one sentence. It earns a block,
 * not a chapter — so the fill is now driven by the paragraph's own
 * passage through the viewport and the section costs only its own height.
 *
 * Everything animated here is driven by MotionValues straight onto style,
 * never through state — a per-word `useState` would re-render the whole
 * sentence on every frame of the scroll.
 */
export function ScrollStatement({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  /* Starts filling as the line clears the bottom of the screen and
     finishes a little above centre, so it is complete while the reader
     is still looking at it rather than resolving on the way out. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.42"],
  });

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <p
      ref={ref}
      className={cn(
        "statement statement-tight mx-auto max-w-[24ch] text-balance text-center",
        className,
      )}
    >
      {words
        .map((word, i) => (
          <Word key={`${word}-${i}`} progress={scrollYProgress} range={slice(i, words.length)}>
            {word}
          </Word>
        ))
        .flatMap((node, i) => (i ? [" ", node] : [node]))}
    </p>
  );
}

/* Each word fades across its own slice, with the slices overlapping so
   the fill reads as a sweep rather than a row of switches flipping. The
   sweep is packed into the first 85% so the finished sentence holds for
   a beat. Offsets must stay inside [0,1] — Motion rejects a range that
   runs past the end of the progress. */
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
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span data-reveal-word style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}
