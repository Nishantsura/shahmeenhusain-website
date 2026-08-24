"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const SEEN_KEY = "sh-intro-seen";
const DURATION = 1600;

/** Monogram + 0→100 counter, once per session. */
export function Preloader() {
  const countRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  /* Whether to play the intro depends on sessionStorage and matchMedia,
     neither of which exists during SSR. Reading them through an external
     store keeps it out of render (no hydration desync) without the extra
     render pass an effect+setState would cost. */
  const shouldIntro = useSyncExternalStore(
    useCallback(() => () => {}, []), // fixed for the life of the session
    () =>
      !sessionStorage.getItem(SEEN_KEY) &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // server: never render the intro into SSR output
  );

  useEffect(() => {
    if (!shouldIntro) return;
    document.body.classList.add("no-scroll");

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      // easeOutExpo, so it decelerates into 100
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      if (countRef.current) {
        countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem(SEEN_KEY, "1");
        document.body.classList.remove("no-scroll");
        setDone(true);
        window.setTimeout(() => setGone(true), 1200);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("no-scroll");
    };
  }, [shouldIntro]);

  if (!shouldIntro || gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[4000] flex items-center justify-center bg-paper transition-transform duration-[1100ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${
        done ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <span className="absolute bottom-6 left-6 text-label uppercase tracking-[0.18em] text-ink-mute sm:bottom-16 sm:left-20">
        Shahmeen Husain
      </span>
      <span className="font-display text-[clamp(4rem,14vw,11rem)] font-light leading-none tracking-tight text-ink">
        S.H
      </span>
      <span
        ref={countRef}
        className="absolute bottom-6 right-6 font-body text-base font-light tabular-nums tracking-wider text-ink sm:bottom-16 sm:right-20"
      >
        000
      </span>
    </div>
  );
}
