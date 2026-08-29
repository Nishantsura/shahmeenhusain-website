"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The showreel clip.
 *
 * A 5.7MB file has no business loading — let alone playing — while it is
 * two screens below the fold, so an IntersectionObserver holds the src
 * back until the band is near, then plays only while it is on screen and
 * pauses the moment it leaves. The poster carries the first paint, and a
 * `reduced-motion` viewer gets the poster and nothing that moves.
 */
export function ShowreelVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  // The observer only toggles `active`. Playback is driven from a
  // separate effect below, because on first entry the src is attached by
  // the render that `active` triggers — calling play() inside the
  // observer runs a tick too early, on a still-src-less element.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  return (
    <video
      ref={ref}
      // src is attached only once near-viewport, so the file is never
      // fetched for a visitor who does not scroll this far.
      src={active ? "/showreel.mp4" : undefined}
      poster="/showreel-poster.jpg"
      muted
      loop
      playsInline
      preload="none"
      className="h-full w-full object-cover"
    />
  );
}
