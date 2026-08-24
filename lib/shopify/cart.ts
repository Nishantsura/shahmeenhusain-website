"use server";

import { cookies } from "next/headers";

import { storefrontLive } from "./client";
import {
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_QUERY,
} from "./queries";
import { normalizeCart } from "./normalize";
import type { Cart } from "./types";

/* The legacy site kept the cart id in localStorage. A cookie is
   better: it is available during SSR, so the header badge and drawer
   render with the right contents on first paint instead of popping in
   after hydration. */
const CART_COOKIE = "sh_cart_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/* eslint-disable @typescript-eslint/no-explicit-any */

async function readCartId(): Promise<string | null> {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

async function clearCartId() {
  (await cookies()).delete(CART_COOKIE);
}

async function createCart(): Promise<{ id: string; checkoutUrl: string }> {
  const data = await storefrontLive<any>(CART_CREATE);
  const cart = data.cartCreate?.cart;
  if (!cart) {
    const msg = data.cartCreate?.userErrors?.[0]?.message ?? "Could not create cart";
    throw new Error(msg);
  }
  await writeCartId(cart.id);
  return cart;
}

/** Read the current cart. Returns null when there isn't one. */
export async function getCart(): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  try {
    const data = await storefrontLive<any>(CART_QUERY, { id });
    if (!data.cart) {
      await clearCartId();
      return null;
    }
    return normalizeCart(data.cart);
  } catch {
    return null;
  }
}

/**
 * Add a variant to the cart.
 *
 * Preserves the legacy expired-cart behaviour: Shopify carts expire, and
 * cartLinesAdd then returns no cart rather than an error. In that case we
 * discard the id, create a fresh cart and retry exactly once.
 */
export async function addToCart(
  variantId: string,
  quantity = 1,
): Promise<Cart> {
  let id = await readCartId();
  if (!id) id = (await createCart()).id;

  const run = (cartId: string) =>
    storefrontLive<any>(CART_LINES_ADD, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });

  let data = await run(id);

  if (!data.cartLinesAdd?.cart) {
    await clearCartId();
    const fresh = await createCart();
    data = await run(fresh.id);
  }

  if (!data.cartLinesAdd?.cart) {
    const msg =
      data.cartLinesAdd?.userErrors?.[0]?.message ?? "Could not add to cart";
    throw new Error(msg);
  }

  return normalizeCart(data.cartLinesAdd.cart)!;
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  if (quantity <= 0) return removeCartLine(lineId);

  const data = await storefrontLive<any>(CART_LINES_UPDATE, {
    cartId: id,
    lines: [{ id: lineId, quantity }],
  });
  return normalizeCart(data.cartLinesUpdate?.cart);
}

export async function removeCartLine(lineId: string): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;

  const data = await storefrontLive<any>(CART_LINES_REMOVE, {
    cartId: id,
    lineIds: [lineId],
  });
  return normalizeCart(data.cartLinesRemove?.cart);
}
