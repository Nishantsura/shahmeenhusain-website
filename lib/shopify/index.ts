import "server-only";

import { storefront, CURRENCY, isConfigured } from "./client";
import {
  COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_QUERY,
} from "./queries";
import { normalizeCollection, normalizeProduct, nodes } from "./normalize";
import type { Collection, Product, ProductSortKey } from "./types";

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
