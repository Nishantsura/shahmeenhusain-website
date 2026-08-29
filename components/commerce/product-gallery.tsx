"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import type { ShopImage } from "@/lib/shopify/types";

/**
 * Shared state between the image column and the thumbnail rail, which sit
 * in different grid columns (see app/products/[handle]/page.tsx) and so
 * cannot pass props directly. `select` both sets the index and drives the
 * scroll; the intersection observer in `ProductGallery` only ever calls
 * `setIndex`, so a thumbnail click cannot fight the scroll it just caused.
 */
type GalleryState = {
  images: ShopImage[];
  index: number;
  setIndex: (i: number) => void;
  select: (i: number) => void;
  registerFrame: (i: number, el: HTMLDivElement | null) => void;
};

const GalleryContext = createContext<GalleryState | null>(null);

function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) {
    throw new Error("Gallery components must render inside ProductGalleryProvider");
  }
  return ctx;
}

export function ProductGalleryProvider({
  images,
  children,
}: {
  images: ShopImage[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const lenis = useLenis();

  const registerFrame = useCallback((i: number, el: HTMLDivElement | null) => {
    frames.current[i] = el;
  }, []);

  /* Thumbnail click: jump the shared Lenis instance rather than the
     native `scrollIntoView`, which would start a competing smooth-scroll
     animation on top of the one Lenis drives every frame (see AGENTS.md). */
  const select = useCallback(
    (i: number) => {
      setIndex(i);
      const el = frames.current[i];
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -100 });
      else el.scrollIntoView({ block: "start" });
    },
    [lenis],
  );

  const value = useMemo(
    () => ({ images, index, setIndex, select, registerFrame }),
    [images, index, select, registerFrame],
  );

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

/**
 * One column of images, no thumbnails and no arrows.
 *
 * Desktop stacks every frame full-bleed and lets the column scroll past
 * the pinned buy panel — the photography is the page, and a 96px thumb
 * rail is a worse way to see it than simply scrolling. Below md the same
 * markup becomes a horizontal snap track, because a phone cannot afford
 * six full-height images before the price.
 *
 * `data-lenis-prevent-horizontal` releases only the sideways gesture, so
 * vertical scrolling over the column stays Lenis-smoothed like the rest
 * of the page.
 */
export function ProductGallery({ title }: { title: string }) {
  const { images, index, setIndex, registerFrame } = useGallery();
  const track = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  /* Which frame the mobile track has landed on. Derived from scroll
     position rather than tracked per-image, so a flick that crosses two
     frames still reports the one on screen. */
  function onScroll() {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(next);
  }

  /* On desktop the frames are just stacked in the page flow, so "which
     image is current" for the thumbnail rail comes from whichever frame
     has the most of itself in view — not from the mobile track's scroll
     math, which does not apply here. */
  useEffect(() => {
    const root = wrap.current;
    if (!root || images.length < 2) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = { ratio: 0, i: -1 };
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.frameIndex);
          if (entry.intersectionRatio > best.ratio) {
            best = { ratio: entry.intersectionRatio, i };
          }
        }
        if (best.i >= 0) setIndex(best.i);
      },
      { threshold: [0.25, 0.5, 0.75, 1] },
    );

    const frames = root.querySelectorAll<HTMLElement>("[data-frame-index]");
    frames.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [images.length, setIndex]);

  if (!images.length) {
    return <div className="aspect-[4/5] w-full bg-paper-deep" />;
  }

  return (
    <div ref={wrap} className="relative">
      <div
        ref={track}
        onScroll={onScroll}
        data-lenis-prevent-horizontal
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:block md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div
            key={img.url}
            data-frame-index={i}
            ref={(el) => registerFrame(i, el)}
            className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-paper-deep"
          >
            <ZoomableImage
              src={img.url}
              alt={img.altText ?? `${title} — view ${i + 1}`}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-current={i === index || undefined}
              onClick={() => {
                const el = track.current;
                if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
              }}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === index ? "bg-ink" : "bg-ink/25",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The small rail beside the buy panel. Desktop only — on a phone the
 * dots under the image track already do this job, and there is no
 * spare width for a second control doing it again.
 */
export function ProductThumbnails({ className }: { className?: string }) {
  const { images, index, select } = useGallery();

  if (images.length < 2) return null;

  return (
    <div className={cn("hidden gap-2 md:flex md:flex-wrap", className)}>
      {images.map((img, i) => (
        <button
          key={img.url}
          type="button"
          onClick={() => select(i)}
          aria-label={`View image ${i + 1}`}
          aria-current={i === index || undefined}
          className={cn(
            "relative h-[76px] w-[60px] shrink-0 overflow-hidden border transition-colors",
            i === index
              ? "border-ink"
              : "border-rule hover:border-ink-mute",
          )}
        >
          <Image src={img.url} alt="" fill sizes="60px" className="object-cover" />
        </button>
      ))}
    </div>
  );
}

/**
 * Cursor-tracked magnify, in place — the cursor position becomes the
 * transform-origin and the frame scales up around it, clipped by the
 * frame's own `overflow-hidden`. Amazon's version opens a second panel
 * because its base image is thumbnail-sized; these are already full
 * column width, so scaling in place shows the embroidery detail without
 * needing space this layout does not have.
 *
 * The origin is written straight to the element's style on every
 * `mousemove` rather than through React state, so moving the cursor
 * never triggers a render — the same imperative-style-write pattern the
 * other motion components use to stay off the render path per frame.
 */
function ZoomableImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoomed, setZoomed] = useState(false);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = imgRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.transformOrigin = `${x}% ${y}%`;
  }

  return (
    <div
      onMouseMove={handleMove}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      className="absolute inset-0"
    >
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(max-width: 767px) 100vw, 50vw"
        className={cn(
          "object-cover transition-transform duration-300 ease-out",
          zoomed && "md:scale-[2]",
        )}
      />
    </div>
  );
}
