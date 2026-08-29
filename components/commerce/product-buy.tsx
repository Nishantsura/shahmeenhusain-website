"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/commerce/cart-provider";
import { SizeGuideSheet } from "@/components/commerce/size-guide-sheet";
import { formatMoney } from "@/lib/money";
import {
  basePatternSize,
  customSizeAttributes,
  customSizeSummary,
  measurementFields,
  type CustomSize,
} from "@/lib/size-guide";
import { cn } from "@/lib/utils";
import type { Product, Variant } from "@/lib/shopify/types";

/**
 * The buy panel: price, option axes, made-to-measure, quantity, add.
 *
 * Variant selection matches on every option axis rather than only the
 * one named "Size" — a size+colour product would otherwise resolve to
 * the first variant carrying the chosen size, whatever its colour. Every
 * product in the catalogue happens to have only a Size axis today, so
 * that was latent rather than broken, but matching on all of them is no
 * harder and removes the trap.
 */
export function ProductBuy({ product }: { product: Product }) {
  const axes = useMemo(
    () => product.options.filter((o) => o.values.length > 0),
    [product.options],
  );

  const sizeAxis = useMemo(
    () => axes.find((a) => /size/i.test(a.name)),
    [axes],
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

  const [custom, setCustom] = useState<CustomSize | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<"chart" | "custom">("chart");

  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">(
    "idle",
  );

  const { add } = useCart();

  const fields = useMemo(
    () => measurementFields(product.productType),
    [product.productType],
  );

  /* Sizes the store actually cuts this piece in — not the whole house
     chart, and not sizes that are sold out. */
  const sellableSizes = useMemo(() => {
    if (!sizeAxis) return [];
    return sizeAxis.values.filter((value) =>
      product.variants.some(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.some(
            (o) => o.name === sizeAxis.name && o.value === value,
          ),
      ),
    );
  }, [product.variants, sizeAxis]);

  /* A made-to-measure order still has to sit on a real variant, so the
     size the customer picked is replaced by the base pattern nearest
     their bust. The measurements on the line are what the atelier works
     to; this only decides which block they start from. */
  const effective = useMemo(() => {
    if (!custom || !sizeAxis) return selected;
    const base = basePatternSize(custom, sellableSizes);
    return base ? { ...selected, [sizeAxis.name]: base } : selected;
  }, [custom, selected, sizeAxis, sellableSizes]);

  const variant: Variant | undefined = useMemo(() => {
    if (!product.variants.length) return undefined;
    return product.variants.find((v) =>
      v.selectedOptions.every((o) => effective[o.name] === o.value),
    );
  }, [product.variants, effective]);

  const variantFor = (name: string, value: string) =>
    product.variants.find((v) =>
      v.selectedOptions.every((o) =>
        o.name === name ? o.value === value : selected[o.name] === o.value,
      ),
    );

  const price = variant?.price ?? product.price;
  const soldOut = Boolean(variant && !variant.availableForSale);

  async function onBuy() {
    if (!variant) {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1600);
      return;
    }
    setStatus("adding");
    try {
      await add(
        variant.id,
        qty,
        custom ? customSizeAttributes(custom, fields) : [],
      );
      setStatus("added");
      window.setTimeout(() => setStatus("idle"), 1400);
    } catch (err) {
      console.error("[Shahmeen] Add to cart failed:", err);
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1600);
    }
  }

  function openGuide(tab: "chart" | "custom") {
    setGuideTab(tab);
    setGuideOpen(true);
  }

  const buyLabel =
    status === "adding"
      ? "Adding…"
      : status === "added"
        ? "Added to bag"
        : status === "error"
          ? "Try again"
          : `Add to bag — ${formatMoney(price)}`;

  return (
    <div>
      <p className="mt-6 flex items-baseline gap-3 font-serif text-2xl text-ink">
        {formatMoney(price)}
        {product.compareAtPrice ? (
          <span className="text-base text-ink-mute line-through">
            {formatMoney(product.compareAtPrice)}
          </span>
        ) : null}
      </p>

      <div className="mt-8">
        {axes.map((axis) => {
          const isSize = axis === sizeAxis;
          return (
            <div key={axis.name} className="border-t border-rule py-6">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <span className="label text-ink-soft">
                  {axis.name}:{" "}
                  <span className="text-ink">
                    {isSize && custom ? "Made to measure" : selected[axis.name]}
                  </span>
                </span>
                {isSize ? (
                  <button
                    type="button"
                    onClick={() => openGuide("chart")}
                    className="eyebrow underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    Size Guide
                  </button>
                ) : null}
              </div>

              {/* A collapsed grid rather than gapped chips: shared hairlines
                  read as one segmented control, which is what the size run
                  is, and it holds its shape at nine values. */}
              <div
                className={cn(
                  "grid border-l border-t border-rule",
                  axis.values.length > 6
                    ? "grid-cols-4 sm:grid-cols-5"
                    : "grid-cols-3",
                )}
              >
                {axis.values.map((value) => {
                  const candidate = variantFor(axis.name, value);
                  const unavailable = candidate
                    ? !candidate.availableForSale
                    : true;
                  const active =
                    !(isSize && custom) && selected[axis.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={unavailable}
                      onClick={() => {
                        if (isSize) setCustom(null);
                        setSelected((s) => ({ ...s, [axis.name]: value }));
                      }}
                      className={cn(
                        "label border-b border-r border-rule py-3.5 transition-colors",
                        active
                          ? "bg-ink text-paper"
                          : "text-ink hover:bg-paper-deep",
                        unavailable &&
                          "cursor-not-allowed text-ink-mute line-through opacity-45 hover:bg-transparent",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>

              {isSize ? (
                custom ? (
                  <div className="mt-3 border border-ink bg-paper-deep px-4 py-3.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="label text-ink">Made to Measure</span>
                      <span className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => openGuide("custom")}
                          className="eyebrow underline underline-offset-4 transition-colors hover:text-brand"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustom(null)}
                          className="eyebrow underline underline-offset-4 transition-colors hover:text-brand"
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-soft">
                      {customSizeSummary(custom, fields)}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openGuide("custom")}
                    className="label mt-3 w-full border border-rule py-3.5 text-ink-soft transition-colors hover:border-brand hover:text-brand"
                  >
                    + Made to Measure
                  </button>
                )
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="border-t border-rule py-6">
        <p className="text-sm text-ink">
          Cut to order in our Lucknow atelier.
        </p>
        <p className="mt-1 text-sm text-ink-mute">
          Dispatch in 3–4 weeks. Made-to-measure at no extra cost.
        </p>
      </div>

      {/* One bordered bar rather than a bordered stepper beside a filled
          button — two separate shapes at slightly different weights is
          what read as misaligned. Sharing one outline and a single
          divider makes the quantity control and the buy action one
          object, and the button borrows the hero CTA's own device (the
          inset hairline, the tick that extends on hover, bg-ink giving
          way to the brand terracotta) rather than a plain flat black
          rectangle. */}
      <div className="flex border border-ink">
        <div className="flex items-center border-r border-ink">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-11 py-4 text-ink-soft transition-colors hover:text-brand"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm tabular-nums text-ink">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            /* legacy clamp: 1–10 */
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="w-11 py-4 text-ink-soft transition-colors hover:text-brand"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onBuy}
          disabled={status === "adding" || soldOut}
          className="label group relative flex flex-1 items-center justify-center gap-3 bg-ink px-4 py-4 text-paper transition-colors duration-500 hover:bg-brand disabled:opacity-50 disabled:hover:bg-ink"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[4px] border border-paper/25"
          />
          {soldOut ? "Sold out" : buyLabel}
          {!soldOut ? (
            <span
              aria-hidden
              className="h-px w-5 shrink-0 bg-current transition-all duration-500 group-hover:w-8"
            />
          ) : null}
        </button>
      </div>

      <a
        href={`https://wa.me/+919XXXXXXXXX?text=${encodeURIComponent(
          `Hi, I am interested in the ${product.title}`,
        )}`}
        target="_blank"
        rel="noopener"
        className="label mt-3 flex items-center justify-center gap-2 border border-rule py-3.5 text-ink-soft transition-colors hover:border-brand hover:text-brand"
      >
        Enquire on WhatsApp
      </a>

      <SizeGuideSheet
        open={guideOpen}
        onOpenChange={setGuideOpen}
        initialTab={guideTab}
        productType={product.productType}
        availableSizes={sellableSizes}
        selectedSize={
          custom || !sizeAxis ? undefined : selected[sizeAxis.name]
        }
        onSelectSize={(size) => {
          if (!sizeAxis) return;
          setCustom(null);
          setSelected((s) => ({ ...s, [sizeAxis.name]: size }));
        }}
        custom={custom}
        onSaveCustom={setCustom}
        onClearCustom={() => setCustom(null)}
      />
    </div>
  );
}
