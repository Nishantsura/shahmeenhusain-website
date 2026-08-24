"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "sh-intro-seen";

/** Monogram + 0→100 counter, once per session. */
export function Preloader() {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(SEEN_KEY)) return;

    setShow(true);
    document.body.classList.add("no-scroll");

    let raf = 0;
    let start: number | null = null;
    const DURATION = 1600;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      // easeOutExpo, so it decelerates into 100
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem(SEEN_KEY, "1");
        setDone(true);
        document.body.classList.remove("no-scroll");
        window.setTimeout(() => setShow(false), 1200);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (!show) return null;

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
      <span className="absolute bottom-6 right-6 font-body text-base font-light tabular-nums tracking-wider text-ink sm:bottom-16 sm:right-20">
        {String(count).padStart(3, "0")}
      </span>
    </div>
  );
}
