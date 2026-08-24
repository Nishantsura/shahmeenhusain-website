"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "./cart-provider";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CartSheet() {
  const { cart, open, setOpen, busy, setQuantity, remove } = useCart();
  const [redirecting, setRedirecting] = useState(false);
  const lines = cart?.lines ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 bg-paper p-0 sm:max-w-md">
        <SheetHeader className="border-b border-rule px-6 py-5">
          <SheetTitle className="font-serif text-2xl font-normal text-ink">
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <p className="text-sm text-ink-soft">Your cart is empty</p>
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/collections" onClick={() => setOpen(false)}>
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex gap-4 border-b border-rule py-5 last:border-0"
                data-line-id={line.id}
              >
                <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-paper-deep">
                  {line.image?.url ? (
                    <Image
                      src={line.image.url}
                      alt={line.image.altText ?? line.productTitle}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/products/${line.handle}`}
                    onClick={() => setOpen(false)}
                    className="font-serif text-base leading-snug text-ink hover:text-brand"
                  >
                    {line.productTitle}
                  </Link>

                  {/* Shopify names a sole variant "Default Title" — never show it */}
                  {line.variantTitle && line.variantTitle !== "Default Title" ? (
                    <span className="mt-0.5 text-xs text-ink-mute">
                      {line.variantTitle}
                    </span>
                  ) : null}

                  <span className="mt-1 text-sm text-ink-soft">
                    {formatMoney(line.price)}
                  </span>

                  <div className="mt-auto flex items-center gap-4 pt-3">
                    <div className="flex items-center border border-rule">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={busy}
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        className="px-2.5 py-1 text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-xs tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={busy}
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        className="px-2.5 py-1 text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(line.id)}
                      className="text-label uppercase tracking-[0.18em] text-ink-mute underline-offset-4 transition-colors hover:text-brand hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lines.length > 0 ? (
          <div className="border-t border-rule px-6 py-5">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-label uppercase tracking-[0.18em] text-ink-mute">
                Subtotal
              </span>
              <span className="font-serif text-xl text-ink">
                {formatMoney(cart?.subtotal)}
              </span>
            </div>
            <p className="mb-4 text-xs text-ink-mute">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <Button
              className="w-full rounded-none bg-ink text-paper hover:bg-ink/90"
              disabled={!cart?.checkoutUrl || redirecting}
              onClick={() => {
                if (!cart?.checkoutUrl) return;
                setRedirecting(true);
                // Shopify-hosted checkout, same as the legacy site.
                window.location.href = cart.checkoutUrl;
              }}
            >
              {redirecting ? "Redirecting…" : "Checkout"}
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
