import type {
  Cart,
  Collection,
  Money,
  Product,
  ShopImage,
  Variant,
} from "./types";

/* Unwrap Shopify's `{ edges: [{ node }] }` envelopes. */
function nodes<T>(conn: { edges?: { node: T }[] } | null | undefined): T[] {
  return conn?.edges?.map((e) => e.node) ?? [];
}

type RawMoney = { amount: string; currencyCode: string } | null | undefined;

function money(m: RawMoney): Money {
  return { amount: m?.amount ?? "0", currencyCode: m?.currencyCode ?? "INR" };
}

function image(i: unknown): ShopImage | null {
  if (!i || typeof i !== "object") return null;
  const img = i as Record<string, unknown>;
  if (typeof img.url !== "string") return null;
  return {
    url: img.url,
    altText: (img.altText as string | null) ?? null,
    width: (img.width as number | null) ?? null,
    height: (img.height as number | null) ?? null,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeProduct(p: any): Product {
  const price = money(p?.priceRange?.minVariantPrice);
  const compareRaw = money(p?.compareAtPriceRange?.minVariantPrice);
  // Only a genuine markdown counts — Shopify returns 0 or the same value otherwise.
  const compareAtPrice =
    Number(compareRaw.amount) > Number(price.amount) ? compareRaw : null;

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    productType: p.productType ?? "",
    tags: p.tags ?? [],
    availableForSale: Boolean(p.availableForSale),
    price,
    compareAtPrice,
    featuredImage: image(p.featuredImage),
    images: nodes<any>(p.images).map(image).filter(Boolean) as ShopImage[],
    options: (p.options ?? []).map((o: any) => ({
      name: o.name,
      values: o.values ?? [],
    })),
    variants: nodes<any>(p.variants).map(
      (v): Variant => ({
        id: v.id,
        title: v.title,
        availableForSale: Boolean(v.availableForSale),
        selectedOptions: v.selectedOptions ?? [],
        price: money(v.price),
      }),
    ),
    ...(p.description !== undefined ? { description: p.description } : {}),
    ...(p.descriptionHtml !== undefined
      ? { descriptionHtml: p.descriptionHtml }
      : {}),
  };
}

export function normalizeCollection(c: any): Collection {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
    description: c.description ?? "",
    image: image(c.image),
  };
}

export function normalizeCart(cart: any): Cart | null {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity ?? 0,
    subtotal: cart.cost?.subtotalAmount
      ? money(cart.cost.subtotalAmount)
      : null,
    lines: nodes<any>(cart.lines).map((l) => ({
      id: l.id,
      quantity: l.quantity,
      attributes: (l.attributes ?? [])
        .filter((a: any) => a?.key && a?.value)
        .map((a: any) => ({ key: a.key, value: a.value })),
      variantId: l.merchandise?.id ?? "",
      variantTitle: l.merchandise?.title ?? "",
      image: image(l.merchandise?.image),
      price: money(l.merchandise?.price),
      productTitle: l.merchandise?.product?.title ?? "",
      handle: l.merchandise?.product?.handle ?? "",
    })),
  };
}

export { nodes };
