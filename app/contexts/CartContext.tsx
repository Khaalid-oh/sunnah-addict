"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export type CartSnapshot = {
  count: number;
  checkoutUrl: string | null;
  cartId: string | null;
  lines: CartLine[];
  totalAmount: { amount: string; currencyCode: string } | null;
};

type CartContextValue = {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
  refreshCart: () => Promise<CartSnapshot>;
  /** Loads cookie cart or creates an empty cart (Shopify cart id persisted like SecureStore). */
  ensureCart: () => Promise<CartSnapshot>;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId?: string;
  title?: string;
  image?: { url: string; altText?: string } | null;
  price?: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  productHandle?: string;
  cost?: { amount: string; currencyCode: string };
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const parseCartJson = useCallback((data: Record<string, unknown>): CartSnapshot => {
    const count = typeof data.count === "number" ? data.count : 0;
    const lines = Array.isArray(data.lines) ? (data.lines as CartLine[]) : [];
    const totalAmount =
      data.totalAmount &&
      typeof data.totalAmount === "object" &&
      data.totalAmount !== null &&
      "amount" in data.totalAmount &&
      "currencyCode" in data.totalAmount
        ? (data.totalAmount as CartSnapshot["totalAmount"])
        : null;
    return {
      count,
      checkoutUrl: typeof data.checkoutUrl === "string" ? data.checkoutUrl : null,
      cartId: typeof data.cartId === "string" ? data.cartId : null,
      lines,
      totalAmount,
    };
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as Record<string, unknown>;
      const snap = parseCartJson(data);
      setCartCount(snap.count);
      return snap;
    } catch {
      setCartCount(0);
      return {
        count: 0,
        checkoutUrl: null,
        cartId: null,
        lines: [],
        totalAmount: null,
      };
    }
  }, [parseCartJson]);

  const ensureCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/ensure", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (data.error) {
        setCartCount(0);
        return {
          count: 0,
          checkoutUrl: null,
          cartId: null,
          lines: [],
          totalAmount: null,
        };
      }
      const snap = parseCartJson(data);
      setCartCount(snap.count);
      return snap;
    } catch {
      setCartCount(0);
      return {
        count: 0,
        checkoutUrl: null,
        cartId: null,
        lines: [],
        totalAmount: null,
      };
    }
  }, [parseCartJson]);

  return (
    <CartContext.Provider
      value={{
        cartOpen,
        setCartOpen,
        cartCount,
        setCartCount,
        refreshCart,
        ensureCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
