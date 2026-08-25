import "server-only";

import { storefront, CURRENCY, isConfigured, SHOPIFY_DOMAIN } from "./client";
import {
  COLLECTIONS_INDEX_QUERY,
  MENU_QUERY,
  COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_QUERY,
} from "./queries";
import { normalizeCollection, normalizeProduct, nodes } from "./normalize";
import type { Collection, MenuItem, Product, ProductSortKey, ShopImage } from "./types";

export { isConfigured, CURRENCY };
export * from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function getProducts({
  first = 24,
  sortKey = "BEST_SELLING",
  reverse = false,
}: {
  first?: number;
  sortKey?: ProductSortKey;
  reverse?: boolean;
} = {}): Promise<Product[]> {
  const data = await storefront<any>(PRODUCTS_QUERY, {
    variables: { first, sortKey, reverse },
  });
  return nodes<any>(data.products).map(normalizeProduct);
}

export async function getCollections({ first = 30 } = {}): Promise<Collection[]> {
  const data = await storefront<any>(COLLECTIONS_QUERY, {
    variables: { first },
  });
  return nodes<any>(data.collections).map(normalizeCollection);
}

/**
 * Collections for the index page, each with a usable cover.
 *
 * Only six of this store's collections have an `image` set, so the first
 * product's shot stands in for the rest. Collections with no products at
 * all are dropped — a card that leads to an empty grid is a dead end —
 * as is Shopify's `featured-product` utility collection, which is theme
 * plumbing rather than something to browse.
 */
export type CollectionCard = Collection & { cover: ShopImage | null };

const HIDDEN_COLLECTIONS = new Set(["featured-product"]);

export async function getCollectionsIndex({ first = 40 } = {}): Promise<CollectionCard[]> {
  const data = await storefront<any>(COLLECTIONS_INDEX_QUERY, {
    variables: { first },
  });

  return nodes<any>(data.collections)
    .filter((c) => !HIDDEN_COLLECTIONS.has(c.handle) && nodes<any>(c.products).length > 0)
    .map((c) => {
      const base = normalizeCollection(c);
      const firstProduct = nodes<any>(c.products)[0];
      return {
        ...base,
        cover: base.image ?? (firstProduct?.featuredImage ?? null),
      };
    });
}

export async function getCollectionProducts(
  handle: string,
  { first = 48 } = {},
): Promise<{ title: string; description: string; products: Product[] } | null> {
  const data = await storefront<any>(COLLECTION_PRODUCTS_QUERY, {
    variables: { handle, first },
  });
  if (!data.collection) return null;
  return {
    title: data.collection.title,
    description: data.collection.description ?? "",
    products: nodes<any>(data.collection.products).map(normalizeProduct),
  };
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefront<any>(PRODUCT_QUERY, { variables: { handle } });
  return data.product ? normalizeProduct(data.product) : null;
}

/**
 * Fetch a collection, falling back to the full catalogue when the handle
 * does not resolve. The legacy site behaved this way on purpose: several
 * nav links (celebrities, cocktail, men-*, jumpsuits) point at handles
 * that do not exist in Shopify, and showing everything beats a dead end.
 */
export async function getCollectionOrAll(
  handle: string | null,
  { first = 48 } = {},
): Promise<{ title: string | null; products: Product[] }> {
  if (handle) {
    try {
      const col = await getCollectionProducts(handle, { first });
      if (col?.products.length) {
        return { title: col.title, products: col.products };
      }
    } catch {
      // fall through to the catalogue
    }
  }
  const products = await getProducts({ first, sortKey: "BEST_SELLING" });
  return { title: null, products };
}

/* ============================================
   Navigation
   ============================================ */

/**
 * Hosts whose URLs are ours, and should become internal routes rather
 * than links back out to the storefront we are replacing.
 */
const OWN_HOSTS = new Set([
  SHOPIFY_DOMAIN,
  "shahmeenhusain.com",
  "www.shahmeenhusain.com",
]);

/**
 * Shopify hands back absolute URLs on the live domain. Left alone they
 * would bounce every visitor off this build and onto the old site, so
 * anything on one of our own hosts is reduced to a path. Genuinely
 * external links (an Instagram profile, say) are left whole.
 */
function localiseHref(url: string): string {
  try {
    const u = new URL(url);
    return OWN_HOSTS.has(u.host) ? `${u.pathname}${u.search}` : url;
  } catch {
    // Relative already, or something Shopify stored by hand.
    return url;
  }
}

function toMenuItem(node: any): MenuItem {
  return {
    id: node.id,
    title: node.title,
    href: localiseHref(node.url ?? "/"),
    items: (node.items ?? []).map(toMenuItem),
  };
}

/**
 * The store's own navigation. Returns null rather than throwing: a menu
 * that fails to load should cost us a nav, not every page on the site,
 * and the header carries a small fallback for exactly that case.
 */
export async function getMenu(handle = "main-menu"): Promise<MenuItem[] | null> {
  try {
    const data = await storefront<any>(MENU_QUERY, {
      variables: { handle },
      revalidate: 3600,
    });
    const items = data?.menu?.items;
    if (!Array.isArray(items) || items.length === 0) return null;
    return items.map(toMenuItem);
  } catch {
    return null;
  }
}
