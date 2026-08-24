/**
 * Ported verbatim from legacy/js/collections-page.js.
 *
 * The nav links use marketing words ("bridal", "festive") that are not
 * Shopify handles. Anything not listed falls through as a literal handle,
 * and an unresolved handle shows the full catalogue rather than a dead
 * end — several live links (celebrities, cocktail, men-*, jumpsuits)
 * depend on that fallback.
 */
export const HANDLE_ALIASES: Record<string, string> = {
  lehenga: "lehengas",
  lehengas: "lehengas",
  saree: "sarees",
  sarees: "sarees",
  gowns: "dresses",
  dress: "dresses",
  dresses: "dresses",
  anarkali: "anarkalis",
  anarkalis: "anarkalis",
  sets: "co-ords",
  "co-ords": "co-ords",
  sharara: "shararas",
  shararas: "shararas",
  bridal: "lehengas",
  wedding: "lehengas",
  festive: "luxury-pret",
  "luxury-pret": "luxury-pret",
  "ready-to-ship": "ready-to-ship",
  sale: "sale",
  new: "new-arrival",
  "new-arrival": "new-arrival",
};

export function resolveHandle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const key = raw.toLowerCase();
  return HANDLE_ALIASES[key] ?? key;
}

/** Legacy param precedence: ?collection= then ?cat= then ?sil= */
export function handleFromParams(params: {
  collection?: string;
  cat?: string;
  sil?: string;
}): string | null {
  return resolveHandle(params.collection ?? params.cat ?? params.sil ?? null);
}
