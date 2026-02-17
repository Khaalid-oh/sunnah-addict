"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useProductPreview } from "../contexts/ProductPreviewContext";
import { useCart } from "../contexts/CartContext";

type PreviewProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage: { url: string; altText?: string } | null;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: { amount: string; currencyCode: string };
  }>;
};

function formatPrice(amount: string, code: string) {
  const n = Number(amount);
  if (code === "NGN")
    return `\u20A6${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  return `${code} ${Number(amount).toFixed(2)}`;
}

export default function ProductPreviewModal() {
  const { previewHandle, closePreview } = useProductPreview();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<PreviewProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!previewHandle) {
      setProduct(null);
      setQuantity(1);
      return;
    }
    setLoading(true);
    fetch(`/api/products/preview?handle=${encodeURIComponent(previewHandle)}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data ?? null);
        setQuantity(1);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [previewHandle]);

  useEffect(() => {
    if (previewHandle) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closePreview();
      };
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [previewHandle, closePreview]);

  const addToCart = useCallback(async () => {
    if (!product?.variants?.length) return;
    const variant =
      product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    setAdding(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchandiseId: variant.id, quantity }),
      });
      if (res.ok) {
        await refreshCart();
        closePreview();
      }
    } finally {
      setAdding(false);
    }
  }, [product, quantity, refreshCart, closePreview]);

  if (!previewHandle) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Product preview"
    >
      <div
        className="absolute inset-0 bg-black/30"
        aria-hidden="true"
        onClick={closePreview}
      />
      <div
        className="relative flex w-full max-w-md flex-col bg-white shadow-xl sm:w-[400px]"
        style={{ maxWidth: "min(400px, 100%)" }}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <h2 className="text-lg font-medium uppercase tracking-tight text-zinc-900">
            Quick view
          </h2>
          <button
            type="button"
            onClick={closePreview}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close"
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
            <p className="py-12 text-center text-sm text-zinc-500">
              Loading...
            </p>
          ) : !product ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Product not found.
            </p>
          ) : (
            <>
              <div className="relative aspect-3/4 w-full overflow-hidden bg-zinc-100">
                {product.featuredImage?.url ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText ?? product.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-200" />
                )}
              </div>
              <h3 className="mt-4 text-base font-medium uppercase tracking-wide text-zinc-900">
                {product.title}
              </h3>
              {product.variants[0]?.price && (
                <p className="mt-2 text-sm text-zinc-700">
                  {formatPrice(
                    product.variants[0].price.amount,
                    product.variants[0].price.currencyCode ?? "NGN",
                  )}
                </p>
              )}
              <div className="mt-6">
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Quantity
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="flex h-10 w-10 items-center justify-center border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={
                    adding || !product.variants.some((v) => v.availableForSale)
                  }
                  onClick={addToCart}
                  className="w-full bg-black py-3 text-sm font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add to cart"}
                </button>
                <Link
                  href={`/products/${product.handle}`}
                  onClick={closePreview}
                  className="block w-full border border-black py-3 text-center text-sm font-medium uppercase tracking-widest text-black transition hover:bg-zinc-50"
                >
                  View full details
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
