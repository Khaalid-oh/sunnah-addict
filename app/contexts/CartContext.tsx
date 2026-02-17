"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type CartContextValue = {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
  refreshCart: () => Promise<{
    count: number;
    checkoutUrl: string | null;
    lines: CartLine[];
  }>;
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

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      const count = data?.count ?? 0;
      const lines = Array.isArray(data?.lines) ? data.lines : [];
      setCartCount(count);
      return {
        count,
        checkoutUrl: data?.checkoutUrl ?? null,
        lines,
      };
    } catch {
      setCartCount(0);
      return { count: 0, checkoutUrl: null, lines: [] };
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartOpen,
        setCartOpen,
        cartCount,
        setCartCount,
        refreshCart,
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
