"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useProductPreview } from "../contexts/ProductPreviewContext";

export type CollectionProduct = {
  id: string;
  title: string;
  handle: string;
  tags?: string[];
  image?: { url: string; altText?: string } | null;
};

type SortOption = "title-asc" | "title-desc";

type CollectionPageViewProps = {
  title: string;
  products: CollectionProduct[];
  /** Base path for product links and for "VIEW ALL" (no tag in URL) */
  basePath?: string;
  /** When false, hides the left category sidebar and filter button */
  showCategoryFilter?: boolean;
};

function toHandle(p: CollectionProduct): string {
  return p.handle || p.title.toLowerCase().replace(/\s+/g, "-");
}

export default function CollectionPageView({
  title,
  products,
  basePath = "/women",
  showCategoryFilter = true,
}: CollectionPageViewProps) {
  void basePath; // reserved for product URL base; currently product links use /products/{handle}
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("title-asc");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      (p.tags ?? []).forEach((t) => set.add(t));
    });
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let list = selectedTag
      ? products.filter((p) => (p.tags ?? []).includes(selectedTag))
      : [...products];
    list = [...list].sort((a, b) => {
      if (sort === "title-asc")
        return a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
        });
      return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
    });
    return list;
  }, [products, selectedTag, sort]);

  const closeFilter = useCallback(() => setFilterOpen(false), []);
  const closeSort = useCallback(() => setSortDropdownOpen(false), []);
  const { openPreview } = useProductPreview();

  const categoryList = (
    <ul className="flex flex-col gap-0" role="list">
      <li>
        <button
          type="button"
          onClick={() => {
            setSelectedTag(null);
            closeFilter();
          }}
          className={`w-full py-2 text-left text-xs font-medium uppercase tracking-widest transition hover:underline ${
            selectedTag === null ? "text-black underline" : "text-zinc-600"
          }`}
        >
          VIEW ALL
        </button>
      </li>
      {categories.map((tag) => (
        <li key={tag}>
          <button
            type="button"
            onClick={() => {
              setSelectedTag(tag);
              closeFilter();
            }}
            className={`w-full py-2 text-left text-xs font-medium uppercase tracking-widest transition hover:underline ${
              selectedTag === tag ? "text-black underline" : "text-zinc-600"
            }`}
          >
            {tag}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Toolbar: title, grid toggles, sort, filter */}
      <h1 className="uppercase tracking-tight text-center text-zinc-900 md:text-xl py-12">
        {title}
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200 ">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Grid view toggles */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGridCols(4)}
              aria-label="4 columns"
              className={`flex h-9 w-9 items-center justify-center border-zinc-300 transition ${
                gridCols === 4
                  ? "bg-zinc-300 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="4" height="4" fill="black" />
                <rect y="7" width="4" height="4" fill="black" />
                <rect y="14" width="4" height="4" fill="black" />
                <rect x="7" width="4" height="4" fill="black" />
                <rect x="7" y="7" width="4" height="4" fill="black" />
                <rect x="7" y="14" width="4" height="4" fill="black" />
                <rect x="14" width="4" height="4" fill="black" />
                <rect x="14" y="7" width="4" height="4" fill="black" />
                <rect x="14" y="14" width="4" height="4" fill="black" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setGridCols(3)}
              aria-label="3 columns"
              className={`flex h-9 w-9 items-center justify-center border-l border-zinc-300 transition ${
                gridCols === 3
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y="10" width="8" height="8" fill="#D9D9D9" />
                <rect width="8" height="8" fill="#D9D9D9" />
                <rect x="10" y="10" width="8" height="8" fill="#D9D9D9" />
                <rect x="10" width="8" height="8" fill="#D9D9D9" />
              </svg>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortDropdownOpen((o) => !o);
                setFilterOpen(false);
              }}
              className="flex items-center gap-2 border-l border-zinc-300 bg-white px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-50"
              aria-expanded={sortDropdownOpen ? "true" : "false"}
              aria-haspopup="listbox"
              aria-label="Sort options"
            >
              SORT
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {sortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={closeSort}
                />
                <div
                  className="absolute right-0 top-full z-20 mt-1 min-w-[180px] border border-zinc-200 bg-white py-1 shadow-lg"
                  role="listbox"
                  aria-label="Sort by"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === "title-asc" ? "true" : "false"}
                    onClick={() => {
                      setSort("title-asc");
                      closeSort();
                    }}
                    className="w-full px-4 py-2 text-left text-xs uppercase tracking-wider text-zinc-900 hover:bg-zinc-100"
                  >
                    Title A-Z
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === "title-desc" ? "true" : "false"}
                    onClick={() => {
                      setSort("title-desc");
                      closeSort();
                    }}
                    className="w-full px-4 py-2 text-left text-xs uppercase tracking-wider text-zinc-900 hover:bg-zinc-100"
                  >
                    Title Z-A
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Filter button (opens drawer on small screens; sidebar is visible on lg) */}
          {showCategoryFilter && (
            <button
              type="button"
              onClick={() => {
                setFilterOpen((o) => !o);
                setSortDropdownOpen(false);
              }}
              className="flex items-center gap-2 border-r border-zinc-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-50 lg:hidden"
            >
              FILTER
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8 py-8">
        {/* Category sidebar - hidden on small, visible lg */}
        {showCategoryFilter && (
          <aside
            className="hidden w-48 shrink-0 lg:block"
            aria-label="Categories"
          >
            <nav className="sticky top-28">{categoryList}</nav>
          </aside>
        )}

        {/* Filter overlay for small screens */}
        {showCategoryFilter && filterOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              aria-hidden
              onClick={closeFilter}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-64 border-r border-zinc-200 bg-white p-6 shadow-xl lg:hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <span className="text-sm font-medium uppercase tracking-widest">
                  Categories
                </span>
                <button
                  type="button"
                  onClick={closeFilter}
                  className="p-2 text-zinc-500 hover:text-zinc-900"
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
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="pt-4">{categoryList}</div>
            </div>
          </>
        )}

        {/* Product grid */}
        <div className="min-w-0 flex-1">
          {filteredAndSorted.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              No products match the selected category.
            </p>
          ) : (
            <div
              className={`grid gap-6 ${
                gridCols === 3
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {filteredAndSorted.map((item) => {
                const handle = toHandle(item);
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden"
                  >
                    <Link
                      href={`/products/${handle}`}
                      className="flex flex-col focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      <div className="aspect-3/4 w-full overflow-hidden bg-zinc-200">
                        {item.image?.url ? (
                          <Image
                            src={item.image.url}
                            alt={item.image.altText ?? item.title}
                            width={400}
                            height={533}
                            quality={90}
                            className="h-full w-full object-cover object-center transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-zinc-300" />
                        )}
                      </div>
                      <p className="mt-3 text-center text-xs font-medium uppercase tracking-wide text-black group-hover:underline">
                        {item.title}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => openPreview(handle)}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 border border-black bg-white px-4 py-2 text-xs font-medium uppercase tracking-widest text-black opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      Quick view
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
