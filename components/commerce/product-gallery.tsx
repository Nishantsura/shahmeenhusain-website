"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ShopImage } from "@/lib/shopify/types";

export function ProductGallery({
  images,
  title,
}: {
  images: ShopImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const active = images[index];

  if (!active) {
    return <div className="aspect-[2/3] w-full bg-paper-deep" />;
  }

  return (
    <div className="flex gap-4 max-md:flex-col-reverse">
      {images.length > 1 ? (
        <div className="flex shrink-0 gap-2 md:flex-col">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-24 w-20 shrink-0 overflow-hidden border transition-colors",
                i === index ? "border-ink" : "border-transparent hover:border-rule",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative aspect-[2/3] flex-1 overflow-hidden bg-paper-deep">
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
        />

        {images.length > 1 ? (
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
            <GalleryNav
              label="Previous image"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            >
              <polyline points="15 18 9 12 15 6" />
            </GalleryNav>
            <GalleryNav
              label="Next image"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
            >
              <polyline points="9 6 15 12 9 18" />
            </GalleryNav>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GalleryNav({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center bg-paper/80 text-ink backdrop-blur transition-colors hover:bg-paper"
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
