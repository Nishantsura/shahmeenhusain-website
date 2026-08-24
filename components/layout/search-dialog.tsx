"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * TODO: the legacy site's search input was decorative — nothing was ever
 * wired behind it. This preserves that UI. Making it real means a
 * Storefront `predictiveSearch` query and a results route.
 */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Search"
          className="text-ink transition-colors hover:text-brand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-5 w-5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="top-24 max-w-2xl translate-y-0 border-rule bg-paper">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // no-op until search is wired to the Storefront API
          }}
        >
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-none border-0 border-b border-rule bg-transparent px-0 font-serif text-2xl shadow-none focus-visible:ring-0"
          />
        </form>
        <p className="text-label uppercase tracking-[0.18em] text-ink-mute">
          Search is not connected yet
        </p>
      </DialogContent>
    </Dialog>
  );
}
