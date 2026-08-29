"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/sections/product-card";
import { Reveal } from "@/components/motion/reveal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/lib/shopify/types";

type Sort = "featured" | "price-low" | "price-high";

/**
 * Filter + sort over the fetched products.
 *
 * In the legacy site the filter tabs captured a DOM snapshot at
 * DOMContentLoaded, which the async product fetch then replaced — so on a
 * live store the tabs silently did nothing. As component state they work.
 */
export function CollectionGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      const type = (p.productType || "").trim();
      if (type) seen.set(type.toLowerCase(), type);
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [products]);

  const shown = useMemo(() => {
    const list =
      filter === "all"
        ? products
        : products.filter((p) => (p.productType || "").toLowerCase() === filter);

    if (sort === "featured") return list;
    const dir = sort === "price-low" ? 1 : -1;
    return [...list].sort(
      (a, b) => dir * (Number(a.price.amount) - Number(b.price.amount)),
    );
  }, [products, filter, sort]);

  return (
    <>
      <div className="container-edge flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterTab>
          {categories.map(([key, label]) => (
            <FilterTab
              key={key}
              active={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </FilterTab>
          ))}
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="label w-44 rounded-none border-rule">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="container-edge py-12">
        {shown.length === 0 ? (
          <p className="py-24 text-center text-sm text-ink-mute">
            No products found in this collection.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
            {shown.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.08}>
                <ProductCard
                  product={p}
                  priority={i < 4}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </Reveal>
            ))}
          </div>
        )}
        <p className="eyebrow mt-12">
          {shown.length} {shown.length === 1 ? "piece" : "pieces"}
        </p>
      </div>
    </>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`label border-b pb-1 transition-colors ${
        active
          ? "border-ink text-ink"
          : "border-transparent text-ink-mute hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
