"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MenuItem } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export function MobileMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  /* Which section is expanded. One at a time — the full tree unrolled is
     sixteen links, which is a scroll rather than a menu on a phone. */
  const [expanded, setExpanded] = useState<string | null>(null);

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Menu"
          className="flex flex-col gap-[5px] text-current md:hidden"
        >
          <span className="block h-px w-6 bg-current" />
          <span className="block h-px w-6 bg-current" />
          <span className="block h-px w-6 bg-current" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="overflow-y-auto bg-paper">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-6 pt-4">
          {items.map((item) =>
            item.items.length ? (
              <div key={item.id} className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => setExpanded((e) => (e === item.id ? null : item.id))}
                  aria-expanded={expanded === item.id}
                  className="flex w-full items-center justify-between py-4 text-left font-serif text-2xl text-ink transition-colors hover:text-brand"
                >
                  {item.title}
                  <span
                    aria-hidden
                    className={cn(
                      "ml-4 text-brand transition-transform duration-300",
                      expanded === item.id ? "rotate-45" : "rotate-0",
                    )}
                  >
                    +
                  </span>
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    expanded === item.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  {/* The row track animates; the child must be able to
                      collapse to nothing, hence the overflow clip. */}
                  <div className="overflow-hidden">
                    <div className="flex flex-col pb-3 pl-3">
                      {item.items.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={close}
                          className="py-2.5 font-body text-[0.8rem] font-light uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-brand"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                onClick={close}
                className="border-b border-rule py-4 font-serif text-2xl text-ink transition-colors hover:text-brand"
              >
                {item.title}
              </Link>
            ),
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
