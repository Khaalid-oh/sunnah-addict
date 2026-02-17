"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
};

export type ProductDetailData = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  descriptionHtml: string | null;
  featuredImage: { url: string; altText?: string | null } | null;
  media: Array<{
    image: { url: string; altText?: string | null } | null;
  } | null>;
  variants: ProductVariant[];
};

type ProductDetailProps = {
  product: ProductDetailData;
};

function getMediaImages(product: ProductDetailData): Array<{ url: string; altText?: string | null }> {
  const out: Array<{ url: string; altText?: string | null }> = [];
  if (product.featuredImage?.url) {
    out.push({
      url: product.featuredImage.url,
      altText: product.featuredImage.altText ?? product.title,
    });
  }
  for (const edge of product.media ?? []) {
    const img = edge?.image;
    if (img?.url && !out.some((o) => o.url === img.url)) {
      out.push({ url: img.url, altText: img.altText ?? product.title });
    }
  }
  return out;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const images = getMediaImages(product);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const firstAvailableVariant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailableVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? firstAvailableVariant;
  const price = selectedVariant?.price;
  const canAddToCart = Boolean(selectedVariant?.availableForSale);

  const addToCart = (goToCheckout: boolean) => {
    if (!selectedVariantId) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchandiseId: selectedVariantId,
            quantity,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "error", text: data?.error ?? "Failed to add to cart" });
          return;
        }
        if (goToCheckout && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setMessage({ type: "success", text: "Added to cart" });
      } catch {
        setMessage({ type: "error", text: "Something went wrong" });
      }
    });
  };

  const optionNames = Array.from(
    new Set(
      product.variants.flatMap((v) => v.selectedOptions.map((o) => o.name))
    )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-3/4 w-full overflow-hidden bg-zinc-100">
            {images[selectedImageIndex] ? (
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].altText ?? product.title}
                width={800}
                height={1067}
                className="h-full w-full object-cover object-center"
                priority
              />
            ) : (
              <div className="h-full w-full bg-zinc-200" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  aria-label={`View image ${i + 1} of ${images.length}`}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden border-2 transition ${
                    selectedImageIndex === i ? "border-black" : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? ""}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-medium uppercase tracking-tight text-zinc-900 md:text-3xl">
            {product.title}
          </h1>
          {price && (
            <p className="mt-2 text-lg text-zinc-700">
              {price.currencyCode} {Number(price.amount).toFixed(2)}
            </p>
          )}

          {/* Variant options */}
          {optionNames.length > 0 &&
            optionNames.map((optionName) => {
              const values = Array.from(
                new Set(
                  product.variants
                    .filter((v) => v.selectedOptions.some((o) => o.name === optionName))
                    .map((v) => v.selectedOptions.find((o) => o.name === optionName)?.value)
                    .filter(Boolean) as string[]
                )
              );
              if (values.length <= 1) return null;
              return (
                <div key={optionName} className="mt-4">
                  <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    {optionName}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {values.map((value) => {
                      const optionMatch = (v: ProductVariant) =>
                        v.selectedOptions.some(
                          (o) => o.name === optionName && o.value === value
                        );
                      const variantForValue = product.variants.find((v) => {
                        if (!optionMatch(v)) return false;
                        const otherOptions = selectedVariant?.selectedOptions.filter(
                          (o) => o.name !== optionName
                        ) ?? [];
                        return otherOptions.every((opt) =>
                          v.selectedOptions.some(
                            (o) => o.name === opt.name && o.value === opt.value
                          )
                        );
                      }) ?? product.variants.find(optionMatch);
                      const isSelected = selectedVariant?.selectedOptions.some(
                        (o) => o.name === optionName && o.value === value
                      );
                      const disabled = variantForValue && !variantForValue.availableForSale;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!!disabled}
                          onClick={() =>
                            variantForValue && setSelectedVariantId(variantForValue.id)
                          }
                          className={`border px-4 py-2 text-xs font-medium uppercase tracking-wide transition ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-500 disabled:opacity-50"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Quantity */}
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
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
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

          {/* Add to cart / Buy it now */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!canAddToCart || isPending}
              onClick={() => addToCart(false)}
              className="w-full border border-black bg-white px-6 py-3 text-xs font-medium uppercase tracking-widest text-black transition hover:bg-zinc-50 disabled:opacity-50 sm:w-auto"
            >
              {isPending ? "Adding..." : "Add to cart"}
            </button>
            <button
              type="button"
              disabled={!canAddToCart || isPending}
              onClick={() => addToCart(true)}
              className="w-full bg-black px-6 py-3 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
            >
              Buy it now
            </button>
          </div>
          {message && (
            <p
              className={`mt-3 text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Retractable description (open by default) */}
          {(product.description || product.descriptionHtml) && (
            <div className="mt-10 border-t border-zinc-200 pt-8">
              <button
                type="button"
                onClick={() => setDescriptionOpen((o) => !o)}
                className="flex w-full items-center justify-between text-left text-xs font-medium uppercase tracking-widest text-zinc-900"
                aria-expanded={descriptionOpen}
              >
                Description
                <span className="text-zinc-500" aria-hidden>
                  {descriptionOpen ? "−" : "+"}
                </span>
              </button>
              {descriptionOpen && (
                <div className="mt-4 text-sm text-zinc-600">
                  {product.descriptionHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      className="prose prose-sm max-w-none prose-p:mb-2"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{product.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
