"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type SearchProduct = {
  id: string;
  title: string;
  handle: string;
  image: { url: string; altText?: string } | null;
  price?: string;
};

type SearchPage = { label: string; href: string };

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
};

export default function SearchOverlay({
  isOpen,
  onClose,
  initialQuery = "",
}: SearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [pages, setPages] = useState<SearchPage[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([]);
      setPages([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setPages(data.pages ?? []);
    } catch {
      setProducts([]);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery.length >= 2) fetchResults(initialQuery);
    else {
      setProducts([]);
      setPages([]);
    }
  }, [initialQuery, isOpen, fetchResults]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query, isOpen, fetchResults]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const viewAllSearchHref = query
    ? `/search?q=${encodeURIComponent(query)}`
    : "#";

  return (
    <div
      className="fixed inset-0 z-50 bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="flex flex-1 items-center gap-2">
            <span className="text-zinc-500" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products and pages..."
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              aria-label="Search"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 text-zinc-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,280px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">
                {loading
                  ? "Searching..."
                  : query.length < 2
                    ? "Type to search"
                    : `${products.length} RESULTS`}
              </span>
              {query.length >= 2 && products.length > 0 && (
                <Link
                  href={viewAllSearchHref}
                  className="text-sm font-medium uppercase tracking-wide text-zinc-600 underline hover:text-black"
                  onClick={onClose}
                >
                  View all
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.handle}`}
                  className="group flex flex-col overflow-hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  onClick={onClose}
                >
                  <div className="aspect-3/4 w-full overflow-hidden bg-zinc-200">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText ?? item.title}
                        width={240}
                        height={320}
                        className="h-full w-full object-cover object-center transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-b from-zinc-300 to-zinc-400" />
                    )}
                  </div>
                  <p className="mt-2 text-center text-sm font-medium uppercase tracking-wide text-black group-hover:underline">
                    {item.title}
                  </p>
                  {item.price != null && (
                    <p className="mt-0.5 text-center text-sm text-zinc-600">
                      ₦{item.price}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Pages</span>
              {pages.length > 0 && (
                <Link
                  href="/"
                  className="text-sm font-medium uppercase tracking-wide text-zinc-600 underline hover:text-black"
                  onClick={onClose}
                >
                  View all
                </Link>
              )}
            </div>
            <ul className="flex flex-col gap-2">
              {pages.map((page) => (
                <li key={page.href + page.label}>
                  <Link
                    href={page.href}
                    className="text-sm font-medium uppercase tracking-wide text-zinc-700 hover:text-black hover:underline"
                    onClick={onClose}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
