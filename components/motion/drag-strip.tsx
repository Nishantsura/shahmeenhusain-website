"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A horizontally dragged row of imagery.
 *
 * Pointer events rather than mouse events, so a trackpad flick, a mouse
 * drag and a touch swipe all land in the same code path. Two details
 * matter:
 *
 *  - We only capture the pointer once the drag passes a few pixels.
 *    Capturing on pointerdown steals the click from the cards, so a
 *    plain tap on an image would stop navigating.
 *  - Native touch scrolling is left alone (`touch-action: pan-x`); it is
 *    already better than anything we would write, and Lenis does not
 *    touch the horizontal axis.
 */
export function DragStrip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      down = true;
      dragging = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };

    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 4) return;
        dragging = true;
        el.setPointerCapture(e.pointerId);
      }
      el.scrollLeft = startScroll - dx;
    };

    const end = (e: PointerEvent) => {
      if (dragging) {
        // Swallow the click the browser is about to synthesise at the
        // end of the drag, so releasing over a card does not navigate.
        el.addEventListener("click", stop, { capture: true, once: true });
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      }
      down = false;
      dragging = false;
    };

    const stop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "no-scrollbar gutter flex touch-pan-x select-none gap-3 overflow-x-auto overscroll-x-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}
