import Image from "next/image";
import Link from "next/link";

type ProductItem = {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string | null } | null;
};

type YouMayAlsoLikeProps = {
  products: ProductItem[];
  currentHandle: string;
};

export default function YouMayAlsoLike({
  products,
  currentHandle,
}: YouMayAlsoLikeProps) {
  const filtered = products.filter((p) => p.handle !== currentHandle).slice(0, 4);
  if (filtered.length === 0) return null;

  return (
    <section
      className="border-t border-zinc-200 bg-white py-12 md:py-16"
      aria-labelledby="you-may-also-like"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="you-may-also-like"
          className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-zinc-900"
        >
          You may also like
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.handle}`}
              className="group flex flex-col overflow-hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <div className="aspect-3/4 w-full overflow-hidden bg-zinc-200">
                {item.image?.url ? (
                  <Image
                    src={item.image.url}
                    alt={item.image.altText ?? item.title}
                    width={300}
                    height={400}
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
          ))}
        </div>
      </div>
    </section>
  );
}
