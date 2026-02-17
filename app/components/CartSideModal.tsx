"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart, type CartLine } from "../contexts/CartContext";

const UPDATE_DEBOUNCE_MS = 120;

function formatPrice(amount: string, code: string) {
  const n = Number(amount);
  if (code === "NGN")
    return `\u20A6${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  return `${code} ${Number(amount).toFixed(2)}`;
}

/** Unit price from line (price.amount is per-item; cost.amount is line total). */
function getUnitPrice(line: CartLine): number {
  if (line.price?.amount) return Number(line.price.amount);
  if (line.cost?.amount && line.quantity)
    return Number(line.cost.amount) / line.quantity;
  return 0;
}

/** Line total for display; uses current quantity so total updates in real time. */
function getLineTotal(line: CartLine): number {
  return getUnitPrice(line) * line.quantity;
}

export default function CartSideModal() {
  const { cartOpen, setCartOpen, refreshCart, setCartCount } = useCart();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const updateTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingQtyRef = useRef<Record<string, number>>({});

  const loadCart = useCallback(async () => {
    const data = await refreshCart();
    setLines(data.lines);
    setCheckoutUrl(data.checkoutUrl);
  }, [refreshCart]);

  useEffect(() => {
    if (cartOpen) {
      setLoading(true);
      loadCart().finally(() => setLoading(false));
    }
  }, [cartOpen, loadCart]);

  useEffect(() => {
    if (cartOpen) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setCartOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [cartOpen, setCartOpen]);

  const flushUpdate = useCallback(
    async (lineId: string) => {
      const quantity = pendingQtyRef.current[lineId];
      delete pendingQtyRef.current[lineId];
      if (quantity === undefined) return;
      try {
        const res = await fetch("/api/cart/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lineId, quantity }),
        });
        if (!res.ok) await loadCart();
      } catch {
        await loadCart();
      }
    },
    [loadCart]
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity < 1) return;
      const line = lines.find((l) => l.id === lineId);
      if (!line) return;
      const prevQty = line.quantity;

      setLines((prev) =>
        prev.map((l) => (l.id === lineId ? { ...l, quantity } : l))
      );
      setCartCount(
        lines.reduce((s, l) => s + l.quantity, 0) - prevQty + quantity
      );

      if (updateTimeoutRef.current[lineId])
        clearTimeout(updateTimeoutRef.current[lineId]);
      pendingQtyRef.current[lineId] = quantity;
      updateTimeoutRef.current[lineId] = setTimeout(() => {
        delete updateTimeoutRef.current[lineId];
        flushUpdate(lineId);
      }, UPDATE_DEBOUNCE_MS);
    },
    [lines, setCartCount, flushUpdate]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      const line = lines.find((l) => l.id === lineId);
      if (!line) return;
      const prevCount = lines.reduce((s, l) => s + l.quantity, 0);

      setLines((prev) => prev.filter((l) => l.id !== lineId));
      setCartCount(prevCount - line.quantity);
      setRemoving(lineId);
      if (updateTimeoutRef.current[lineId]) {
        clearTimeout(updateTimeoutRef.current[lineId]);
        delete updateTimeoutRef.current[lineId];
        delete pendingQtyRef.current[lineId];
      }
      try {
        const res = await fetch("/api/cart/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lineIds: [lineId] }),
        });
        if (!res.ok) {
          const data = await refreshCart();
          setLines(data.lines);
        }
      } catch {
        const data = await refreshCart();
        setLines(data.lines);
      } finally {
        setRemoving(null);
      }
    },
    [lines, setCartCount, refreshCart]
  );

  const totalAmount = lines?.reduce(
    (sum, line) => sum + getLineTotal(line),
    0
  ) ?? 0;
  const currencyCode =
    lines[0]?.cost?.currencyCode ?? lines[0]?.price?.currencyCode ?? "NGN";

  if (!cartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
    >
      <div
        className="absolute inset-0 bg-black/30"
        aria-hidden="true"
        onClick={() => setCartOpen(false)}
      />
      <div
        className="relative flex w-full max-w-md flex-col bg-white shadow-xl sm:w-[400px]"
        style={{ maxWidth: "min(400px, 100%)" }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="flex items-center gap-2 text-lg font-medium uppercase tracking-tight text-zinc-900">
            Cart
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-200 px-1.5 text-xs font-medium text-zinc-700">
              {lines.reduce((s, l) => s + l.quantity, 0)}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Loading...</p>
          ) : lines.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-600">Your cart is empty.</p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-900 underline hover:no-underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 border-b border-zinc-100 pb-6 last:border-0"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-zinc-100">
                    {line.image?.url ? (
                      <Image
                        src={line.image.url}
                        alt={line.image.altText ?? line.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium uppercase tracking-wide text-zinc-900">
                      {line.title ?? "Product"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      {line.compareAtPrice?.amount &&
                        Number(line.compareAtPrice.amount) >
                          Number(line.price?.amount ?? 0) && (
                          <span className="text-zinc-400 line-through">
                            {formatPrice(
                              line.compareAtPrice.amount,
                              line.compareAtPrice.currencyCode ?? "NGN",
                            )}
                          </span>
                        )}
                      <span className="text-zinc-900">
                        {formatPrice(
                          String(getLineTotal(line)),
                          line.price?.currencyCode ??
                            line.cost?.currencyCode ??
                            "NGN",
                        )}
                        {line.quantity > 1 && (
                          <span className="ml-1 text-zinc-500">
                            ({formatPrice(
                              String(getUnitPrice(line)),
                              line.price?.currencyCode ??
                                line.cost?.currencyCode ??
                                "NGN",
                            )}{" "}
                            each)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center border border-zinc-200 bg-white">
                        <button
                          type="button"
                          disabled={line.quantity <= 1}
                          onClick={() =>
                            updateQuantity(
                              line.id,
                              Math.max(1, line.quantity - 1),
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center text-zinc-600 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="w-10 text-center text-gray-500 text-sm font-medium">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(line.id, line.quantity + 1)
                          }
                          className="flex h-10 w-10 items-center justify-center text-zinc-600 disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={removing === line.id}
                        onClick={() => removeLine(line.id)}
                        className="flex h-8 w-8 items-center justify-center text-zinc-500 hover:text-black disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && lines.length > 0 && (
          <div className="border-t border-zinc-200 px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Discount</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                aria-label="Add discount code"
              >
                +
              </button>
            </div>
            <p className="flex justify-between text-base font-medium text-zinc-900">
              <span>Estimated total</span>
              <span>
                {formatPrice(String(totalAmount), currencyCode)} {currencyCode}
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Taxes and shipping calculated at checkout.
            </p>
            <a
              href={checkoutUrl ?? "#"}
              className="mt-4 block w-full bg-black py-3 text-center text-sm font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50"
              onClick={(e) => {
                if (!checkoutUrl) e.preventDefault();
              }}
            >
              Check out
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
