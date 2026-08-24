"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Lenis owns the scroll for the whole app.
 *
 * This replaces the hand-rolled scroller in legacy/js/smooth-scroll.js.
 * Two things that bit us there and are handled by Lenis natively:
 *   - wheel deltaMode: a mouse notch reports ~3 *lines*, not 3 pixels.
 *   - competing native smooth scrolling: `scroll-behavior: smooth` in CSS
 *     turns every per-frame scroll write into its own animation. Our
 *     globals.css deliberately does not set it (see the note there).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        wheelMultiplier: 1,
        smoothWheel: true,
        // Touch devices keep their native scrolling — it is already good
        // and hijacking it costs responsiveness.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
