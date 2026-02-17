"use client";

import Image from "next/image";
import Link from "next/link";

type ProductItem = {
  id: string;
  title: string;
  handle?: string;
  image?: { url: string; altText?: string } | null;
};

type CollectionGridProps = {
  pretitle?: string;
  products?: ProductItem[];
  viewAllHref?: string;
  viewAllLabel?: string;
  showViewAll?: boolean;
};

function toHandle(p: ProductItem): string {
  return p.handle ?? p.title.toLowerCase().replace(/\s+/g, "-");
}

export default function CollectionGrid({
  pretitle = "LATEST COLLECTIONS",
  products = [],
  viewAllHref = "/new-arrivals",
  viewAllLabel = "VIEW ALL PRODUCTS",
  showViewAll = true,
}: CollectionGridProps) {
  const items = products.map((p) => ({
    ...p,
    handle: toHandle(p),
  }));

  const sectionId = "latest-collections";

  return (
    <section
      className="border-t border-zinc-200 bg-white py-12 md:py-16"
      aria-labelledby={sectionId}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h2
            id={sectionId}
            className="text-sm font-medium uppercase tracking-widest text-zinc-900"
          >
            {pretitle}
          </h2>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden"
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

        {showViewAll && viewAllLabel && (
          <div className="mt-8 flex justify-center">
            <a
              href={viewAllHref}
              className="inline-flex items-center justify-center bg-black px-8 py-3 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              {viewAllLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
