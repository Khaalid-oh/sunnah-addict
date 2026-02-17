"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";

type ProductGridProps = {
  pretitle?: string;
  title?: string;
  products?: Array<{
    id: string;
    title: string;
    handle?: string;
    image?: { url: string; altText?: string } | null;
  }>;
  viewAllHref?: string;
  viewAllLabel?: string;
};

const DEFAULT_PRODUCTS: ProductGridProps["products"] = [
  { id: "1", title: "KHIMAR MAO GRAPE", handle: "khimar-mao-grape" },
  { id: "2", title: "HIJAB + ABAYA DRESS", handle: "hijab-abaya-dress" },
  { id: "3", title: "LONG HIJAB CAPE II", handle: "long-hijab-cape-ii" },
  { id: "4", title: "COASTLINE HIJAB", handle: "coastline-hijab" },
];

function productToItem(p: NonNullable<ProductGridProps["products"]>[number]): {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string } | null;
} {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle ?? p.title.toLowerCase().replace(/\s+/g, "-"),
    image: p.image ?? null,
  };
}

export default function ProductGrid({
  pretitle,
  title,
  products = DEFAULT_PRODUCTS,
  viewAllHref = "#",
  viewAllLabel = "VIEW ALL PRODUCTS",
}: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items = products?.map(productToItem) ?? [];

  const sectionId = (title ?? pretitle ?? "products")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/'/g, "");

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, items.length]);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="border-t border-zinc-200 bg-white py-12 md:py-16"
      aria-labelledby={`section-${sectionId}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          {pretitle && (
            <p
              className={
                title
                  ? "mb-1 text-sm font-medium uppercase tracking-widest text-zinc-500"
                  : "text-sm font-medium uppercase tracking-widest text-zinc-500"
              }
            >
              {pretitle}
            </p>
          )}
          {title && (
            <h2
              id={`section-${sectionId}`}
              className="text-2xl font-bold uppercase tracking-tight text-black md:text-3xl"
            >
              {title}
            </h2>
          )}
          {!title && pretitle && (
            <h2 id={`section-${sectionId}`} className="sr-only">
              {pretitle}
            </h2>
          )}
        </header>

        <div className="flex items-center gap-8">
          {items.length > 2 && (
            <div className="hidden shrink-0 lg:block">
              {canScrollLeft ? (
                <button
                  type="button"
                  onClick={() => scroll("prev")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-zinc-600 shadow-sm transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  aria-label="Previous products"
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
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              ) : (
                <div className="h-10 w-10" aria-hidden="true" />
              )}
            </div>
          )}

          <div
            ref={scrollRef}
            className="min-w-0 flex-1 flex gap-4 overflow-x-auto overflow-y-hidden py-2 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            aria-label="Product carousel"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex min-w-[calc(50%-0.5rem)] shrink-0 flex-col overflow-hidden sm:min-w-[calc(25%-0.75rem)]"
              >
                <Link
                  href={`/products/${item.handle}`}
                  className="flex flex-col focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <div className="aspect-3/4 w-full overflow-hidden bg-zinc-200">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText ?? item.title}
                        width={240}
                        height={320}
                        quality={100}
                        className="h-full w-full object-cover object-center transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-b from-zinc-300 to-zinc-400" />
                    )}
                  </div>
                  <p className="mt-3 text-center text-xs font-medium uppercase tracking-wide text-black group-hover:underline">
                    {item.title}
                  </p>
                </Link>
              </div>
            ))}
          </div>

          {items.length > 2 && (
            <div className="hidden shrink-0 lg:block">
              {canScrollRight ? (
                <button
                  type="button"
                  onClick={() => scroll("next")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-zinc-600 shadow-sm transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  aria-label="Next products"
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
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              ) : (
                <div className="h-10 w-10" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={viewAllHref}
            className="inline-flex items-center justify-center bg-black px-8 py-3 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            {viewAllLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
