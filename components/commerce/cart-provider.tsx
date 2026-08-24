"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import {
  addToCart as addToCartAction,
  removeCartLine as removeCartLineAction,
  updateCartLine as updateCartLineAction,
} from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  open: boolean;
  busy: boolean;
  setOpen: (open: boolean) => void;
  add: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: Cart | null;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const add = useCallback(async (variantId: string, quantity = 1) => {
    setBusy(true);
    try {
      const next = await addToCartAction(variantId, quantity);
      setCart(next);
      setOpen(true);
    } finally {
      setBusy(false);
    }
  }, []);

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
