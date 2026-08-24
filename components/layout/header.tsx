"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useCart } from "@/components/commerce/cart-provider";
import { SearchDialog } from "@/components/layout/search-dialog";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Shop", href: "/collections" },
  { label: "Discover", href: "/discover" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cart, setOpen } = useCart();

  const navRef = useRef<HTMLElement>(null);
  const [spreadGap, setSpreadGap] = useState<number | null>(null);

  /* Subscribing to an external browser value is exactly what
     useSyncExternalStore is for — it avoids the extra render pass an
     effect+setState would cost on every page load. */
  const pastFold = useSyncExternalStore(
    useCallback((onChange: () => void) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    }, []),
    () => window.scrollY > 80,
    () => true, // server snapshot: assume scrolled, so the logo is present
  );

  const scrolled = isHome ? pastFold : true;

  const count = cart?.totalQuantity ?? 0;
  /* At the top of the home page the giant wordmark is the logo, so the
     header carries only its links — spread edge to edge. */
  const spread = isHome && !scrolled;

  /* Measure the gap that lands the links edge to edge. It depends on the
     rendered link widths, so it cannot be a fixed value. With
     justify-end the RIGHTMOST link is the anchor in both states — it
     never moves, and the others gather toward it. That is the behaviour
     measured on the reference. */
  useLayoutEffect(() => {
    if (!isHome) return;
    const measure = () => {
      const nav = navRef.current;
      if (!nav) return;
      const items = Array.from(nav.children) as HTMLElement[];
      if (items.length < 2) return;
      const total = items.reduce((sum, el) => sum + el.offsetWidth, 0);
      const gap = (nav.clientWidth - total) / (items.length - 1);
      setSpreadGap(gap > 24 ? gap : null);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [isHome]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] h-[72px] transition-colors duration-500",
        scrolled ? "bg-paper shadow-[0_1px_0_var(--color-rule)]" : "bg-transparent",
      )}
    >
      <div className="container-edge flex h-full items-center gap-6">
        <Link
          href="/"
          className={cn(
            "shrink-0 overflow-hidden whitespace-nowrap font-body text-sm tracking-[0.2em] text-ink transition-all duration-[1150ms] ease-[cubic-bezier(0.83,0,0.17,1)]",
            spread
              ? "pointer-events-none max-w-0 -translate-y-2 opacity-0"
              : "max-w-80 translate-y-0 opacity-100",
          )}
        >
          SHAHMEEN HUSAIN
        </Link>

        <nav
          ref={navRef}
          className="hidden flex-1 items-center justify-end transition-[gap] duration-[1150ms] ease-[cubic-bezier(0.83,0,0.17,1)] md:flex"
          style={{ gap: spread && spreadGap ? `${spreadGap}px` : "70px" }}
        >
          {NAV.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="font-body text-label uppercase tracking-[0.18em] text-ink transition-colors hover:text-brand"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <SearchDialog />

          <button
            type="button"
            aria-label="Cart"
            onClick={() => setOpen(true)}
            className="relative text-ink transition-colors hover:text-brand"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
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

          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}
