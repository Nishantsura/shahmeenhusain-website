"use client";

import { useRef, type ReactNode } from "react";

export function Carousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        // data-lenis-prevent keeps this horizontal scroller native, so
        // Lenis does not swallow its wheel events.
        data-lenis-prevent
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <div className="container-edge mt-8 flex gap-3">
        <CarouselButton label="Previous" onClick={() => nudge(-1)}>
          <polyline points="15 18 9 12 15 6" />
        </CarouselButton>
        <CarouselButton label="Next" onClick={() => nudge(1)}>
          <polyline points="9 6 15 12 9 18" />
        </CarouselButton>
      </div>
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center border border-rule text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4"
      >
        {children}
      </svg>
    </button>
  );
}
