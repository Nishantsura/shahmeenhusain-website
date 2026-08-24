"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/commerce/cart-provider";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product, Variant } from "@/lib/shopify/types";

/**
 * Variant selection across every option axis.
 *
 * The legacy implementation only looked at the /size/i option and took
 * the first variant matching that value, ignoring any other axis — so a
 * size+colour product could resolve to the wrong variant. Every product
 * in the catalogue happens to have only a Size axis today, so this was
 * latent rather than broken, but matching on all selected options is no
 * harder and removes the trap.
 */
export function ProductBuy({ product }: { product: Product }) {
  const axes = useMemo(
    () => product.options.filter((o) => o.values.length > 0),
    [product.options],
  );

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Preselect the first combination that is actually purchasable.
    const firstAvailable =
      product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    if (!firstAvailable) return {};
    return Object.fromEntries(
      firstAvailable.selectedOptions.map((o) => [o.name, o.value]),
    );
  });

  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [flash, setFlash] = useState(false);

  const { add } = useCart();

  const variant: Variant | undefined = useMemo(() => {
    if (!product.variants.length) return undefined;
    return product.variants.find((v) =>
      v.selectedOptions.every((o) => selected[o.name] === o.value),
    );
  }, [product.variants, selected]);

  const variantFor = (name: string, value: string) =>
    product.variants.find((v) =>
      v.selectedOptions.every((o) =>
        o.name === name ? o.value === value : selected[o.name] === o.value,
      ),
    );

  const price = variant?.price ?? product.price;

  async function onBuy() {
    if (!variant) {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1200);
      return;
    }
    setStatus("adding");
    try {
      await add(variant.id, qty);
      setStatus("added");
      window.setTimeout(() => setStatus("idle"), 1400);
    } catch (err) {
      console.error("[Shahmeen] Add to cart failed:", err);
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1600);
    }
  }

  const label =
    status === "adding"
      ? "ADDING…"
      : status === "added"
        ? "ADDED TO CART"
        : status === "error"
          ? "TRY AGAIN"
          : "ADD TO CART";

  return (
    <div>
      <p className="mb-8 flex items-baseline gap-3 font-serif text-2xl text-ink">
        {formatMoney(price)}
        {product.compareAtPrice ? (
          <span className="text-base text-ink-mute line-through">
            {formatMoney(product.compareAtPrice)}
          </span>
        ) : null}
      </p>

      {axes.map((axis) => (
        <div key={axis.name} className="mb-7">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="eyebrow">{axis.name}</span>
            <span className="text-xs text-ink-mute">{selected[axis.name]}</span>
          </div>
          <div
            className={cn(
              "flex flex-wrap gap-2 transition-opacity",
              flash && "animate-pulse",
            )}
          >
            {axis.values.map((value) => {
              const candidate = variantFor(axis.name, value);
              const soldOut = candidate ? !candidate.availableForSale : true;
              const active = selected[axis.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={soldOut}
                  onClick={() =>
                    setSelected((s) => ({ ...s, [axis.name]: value }))
                  }
                  className={cn(
                    "min-w-12 border px-3 py-2 text-xs uppercase tracking-[0.1em] transition-colors",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-rule text-ink hover:border-ink",
                    soldOut &&
                      "cursor-not-allowed border-rule text-ink-mute line-through opacity-50 hover:border-rule",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mb-7">
        <span className="eyebrow mb-3 block">Quantity</span>
        <div className="inline-flex items-center border border-rule">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-ink-soft transition-colors hover:text-ink"
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            /* legacy clamp: 1–10 */
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="px-4 py-2.5 text-ink-soft transition-colors hover:text-ink"
          >
            +
          </button>
        </div>
      </div>

      <Button
        onClick={onBuy}
        disabled={status === "adding" || (variant && !variant.availableForSale)}
        className="w-full rounded-none bg-ink py-6 text-label uppercase tracking-[0.18em] text-paper hover:bg-ink/90"
      >
        {variant && !variant.availableForSale ? "SOLD OUT" : label}
      </Button>

      <a
        href={`https://wa.me/+919XXXXXXXXX?text=${encodeURIComponent(
          `Hi, I am interested in the ${product.title}`,
        )}`}
        target="_blank"
        rel="noopener"
        className="mt-4 flex items-center justify-center gap-2 border border-rule py-3.5 text-label uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
      >
        Enquire on WhatsApp
      </a>
    </div>
  );
}
