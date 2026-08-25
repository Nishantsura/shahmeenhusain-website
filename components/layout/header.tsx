"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/commerce/cart-provider";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Lozenge } from "@/components/ui/lozenge";
import type { MenuItem } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** Used only if Shopify's menu fails to load — see getMenu(). */
const FALLBACK: MenuItem[] = [
  { id: "f1", title: "Shop", href: "/collections/women", items: [] },
  { id: "f2", title: "Luxury Pret", href: "/collections/luxury-pret", items: [] },
  { id: "f3", title: "Collections", href: "/collections", items: [] },
  { id: "f4", title: "Ready to Ship", href: "/collections/ready-to-ship", items: [] },
];

export function Header({ menu }: { menu?: MenuItem[] | null }) {
  const nav = menu?.length ? menu : FALLBACK;
  const pathname = usePathname();
  const { cart, setOpen } = useCart();

  /* One boolean, so a render only happens when the bar actually needs to
     move — a handler that stored the offset would re-render every frame. */
  const [hidden, setHidden] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Retreat on the way down, return on the way up. The 80px floor
      // stops the bar flickering during the rubber-band at the top.
      setHidden(y > last && y > 80);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* A dropdown left open across a navigation would hang over the new
     page. Adjusting during render rather than in an effect: this is the
     sanctioned way to reset state when a prop changes, and it avoids the
     extra commit an effect+setState would cost on every route change. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenId(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const count = cart?.totalQuantity ?? 0;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] h-header bg-paper text-ink shadow-[0_1px_0_var(--color-rule)] transition-transform duration-300 ease-in",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
      onMouseLeave={() => setOpenId(null)}
    >
      <div className="gutter flex h-full items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Shahmeen Husain — home">
          <Wordmark />
        </Link>

        <nav className="hidden h-full flex-1 items-center justify-center gap-[clamp(1.5rem,3.4vw,3rem)] md:flex">
          {nav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              open={openId === item.id}
              onOpen={() => setOpenId(item.items.length ? item.id : null)}
            />
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4 md:ml-0">
          {/* The mark that opens the hero, shrunk to a divider — it
              carries the ornament up into the chrome. */}
          <Lozenge className="hidden w-[52px] text-brand/60 md:block" />

          <button
            type="button"
            aria-label="Cart"
            onClick={() => setOpen(true)}
            className="relative text-current transition-opacity hover:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium tabular-nums text-paper">
                {count}
              </span>
            ) : null}
          </button>

          <MobileMenu items={nav} />
        </div>
      </div>
    </header>
  );
}

/**
 * The wordmark, painted rather than drawn.
 *
 * The Shopify asset is flat black on transparent, so masking it and
 * filling with `currentColor` lets one file serve any bar colour — an
 * <img> would be locked to black and would need a second export the
 * moment the header changes.
 */
function Wordmark() {
  return (
    <>
      <span
        aria-hidden
        className="block h-[15px] w-[132px] bg-current sm:h-[17px] sm:w-[150px]"
        style={{
          WebkitMaskImage: "url(/logo-wordmark.png)",
          maskImage: "url(/logo-wordmark.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "left center",
          maskPosition: "left center",
        }}
      />
      <span className="sr-only">Shahmeen Husain</span>
    </>
  );
}

function NavItem({
  item,
  open,
  onOpen,
}: {
  item: MenuItem;
  open: boolean;
  onOpen: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const hasChildren = item.items.length > 0;

  return (
    <div
      ref={wrap}
      className="flex h-full items-center"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      /* No gap between the trigger and the panel: the wrapper fills the
         bar's height and the panel starts at its bottom edge, so the
         pointer never crosses dead space on the way down. */
    >
      <div className="relative flex h-full items-center">
        <Link
          href={item.href}
          aria-expanded={hasChildren ? open : undefined}
          className="whitespace-nowrap font-body text-[0.75rem] font-light uppercase leading-none tracking-[0.28em] text-current transition-opacity hover:opacity-60"
        >
          {item.title}
        </Link>

        {hasChildren ? (
          <div
            className={cn(
              "absolute left-1/2 top-full min-w-[15rem] -translate-x-1/2 border border-rule bg-paper-deep py-3 shadow-[0_18px_40px_rgba(42,29,20,0.13)] transition-all duration-300",
              open
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0",
            )}
          >
            {item.items.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                className="block whitespace-nowrap px-6 py-2.5 font-body text-[0.75rem] font-light uppercase tracking-[0.22em] text-ink transition-colors hover:text-brand"
              >
                {child.title}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
