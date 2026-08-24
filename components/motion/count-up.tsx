"use client";

import { useInView } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Counts up when scrolled into view.
 *
 * The value is written straight to the DOM node rather than held in
 * state: driving it through setState would re-render this component on
 * every animation frame for a purely visual effect.
 */
export function CountUp({ to, duration = 1800 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    const write = (n: number) => {
      el.textContent = n.toLocaleString("en-IN");
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      write(to);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      write(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  // Rendered with the final value so it is correct in SSR output and
  // without JS; the effect animates from 0 once it scrolls into view.
  return <span ref={ref}>{to.toLocaleString("en-IN")}</span>;
}
