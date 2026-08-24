"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor — measured against fmrg.studio: a small solid arrowhead,
 * ~11x15, in the accent red, which does NOT grow or morph on hover.
 * Desktop pointers only.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch and reduced-motion users keep the system cursor. No state
    // here: the element is always rendered and hidden by CSS, which
    // avoids a re-render just to learn what device we are on.
    if (!fine || reduced) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible && ref.current) {
        visible = true;
        ref.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      if (ref.current) ref.current.style.opacity = "0";
    };

    const render = () => {
      // slight lag so the mark feels weighted rather than glued on
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      }
      raf = requestAnimationFrame(render);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(render);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5000] opacity-0 text-brand transition-opacity duration-300 will-change-transform max-[767px]:hidden motion-reduce:hidden [@media(pointer:coarse)]:hidden"
    >
      <svg width="11" height="15" viewBox="0 0 11 15" fill="none">
        <path
          d="M0.6 0.7 L0.6 13.2 L3.9 10.0 L6.1 14.4 L8.0 13.5 L5.9 9.2 L10.2 8.9 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
