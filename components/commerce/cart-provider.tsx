"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  addToCart as addToCartAction,
  getCart as getCartAction,
  removeCartLine as removeCartLineAction,
  updateCartLine as updateCartLineAction,
} from "@/lib/shopify/cart";
import type { Cart, LineAttribute } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  open: boolean;
  busy: boolean;
  setOpen: (open: boolean) => void;
  add: (
    variantId: string,
    quantity?: number,
    attributes?: LineAttribute[],
  ) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  /* Deliberately hydrated on the client rather than read in the root
     layout: touching cookies() there would opt every route out of static
     rendering, which is a poor trade for a cart badge. Pages stay static
     / ISR and the cart fills in on mount. */
  useEffect(() => {
    let cancelled = false;
    getCartAction()
      .then((c) => {
        if (!cancelled) setCart(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback(
    async (
      variantId: string,
      quantity = 1,
      attributes: LineAttribute[] = [],
    ) => {
      setBusy(true);
      try {
        const next = await addToCartAction(variantId, quantity, attributes);
        setCart(next);
        setOpen(true);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const setQuantity = useCallback(async (lineId: string, quantity: number) => {
    setBusy(true);
    try {
      const next = await updateCartLineAction(lineId, quantity);
      if (next) setCart(next);
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = useCallback(async (lineId: string) => {
    setBusy(true);
    try {
      const next = await removeCartLineAction(lineId);
      if (next) setCart(next);
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo(
    () => ({ cart, open, busy, setOpen, add, setQuantity, remove }),
    [cart, open, busy, add, setQuantity, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
