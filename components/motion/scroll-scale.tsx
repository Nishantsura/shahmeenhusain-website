"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Media that grows into its frame as it enters.
 *
 * The frame reserves the full final size from the first paint and the
 * child is scaled down inside it, so nothing below ever shifts — the
 * alternative (animating width/height) relays out the page on every
 * frame and drags the whole document with it.
 */
export function ScrollScale({
  children,
  className,
  from = 0.7,
  radius = 0,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [from, 1]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        style={{ scale, borderRadius: radius }}
        className="h-full w-full origin-center overflow-hidden will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
