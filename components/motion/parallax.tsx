"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Parallax drift inside a clipping frame.
 *
 * The measurement is taken from the WRAPPER, never from the moving layer:
 * reading the transformed element's own rect feeds last frame's translate
 * back into this frame's input, and the image visibly oscillates. The
 * wrapper is also correct inside position:sticky, where a cached document
 * offset would not be.
 */
export function Parallax({
  children,
  speed = 0.12,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    let raf = 0;
    const update = () => {
      const f = frame.current;
      const l = layer.current;
      if (f && l) {
        const r = f.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom > -vh && r.top < vh * 2) {
          const centre = (r.top + r.height / 2 - vh / 2) / vh;
          l.style.transform = `translate3d(0, ${(centre * speed * 100).toFixed(2)}px, 0)`;
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <div
        ref={layer}
        className="absolute inset-x-0 -inset-y-[12%] h-[124%] will-change-transform md:block"
      >
        {children}
      </div>
    </div>
  );
}
