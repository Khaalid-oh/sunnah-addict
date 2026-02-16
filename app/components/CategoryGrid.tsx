import Image from "next/image";

type CategoryItem = {
  id: string;
  title: string;
  handle?: string;
  /** When set, used as link; otherwise /collections/{handle} */
  href?: string;
  image?: { url: string; altText?: string } | null;
};

type CategoryGridProps = {
  pretitle?: string;
  categories?: CategoryItem[];
};

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "1", title: "KHIMAR", handle: "khimar" },
  { id: "2", title: "HIJAB 26", handle: "hijab-26" },
  { id: "3", title: "JILBAB +", handle: "jilbab" },
  { id: "4", title: "MIODRE", handle: "miodre" },
];

export default function CategoryGrid({
  pretitle = "DISCOVER",
  categories = DEFAULT_CATEGORIES,
}: CategoryGridProps) {
  return (
    <section
      className="border-t border-zinc-200 bg-white py-12 md:py-16"
      aria-labelledby="discover-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h2
            id="discover-section"
            className="text-sm font-medium uppercase tracking-widest text-zinc-500"
          >
            {pretitle}
          </h2>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={
                cat.href ?? (cat.handle ? `/collections/${cat.handle}` : "#")
              }
              className="group relative aspect-3/4 overflow-hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <div className="absolute inset-0 bg-zinc-200">
                {cat.image?.url ? (
                  <Image
                    src={cat.image.url}
                    alt={cat.image.altText ?? cat.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover object-center transition group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-b from-zinc-300 to-zinc-400" />
                )}
                <div
                  className="absolute inset-0 bg-black/40 transition group-hover:bg-black/10"
                  aria-hidden="true"
                />
              </div>
              <div
                className="absolute inset-x-0 bottom-1/3
               flex items-end justify-center p-4"
              >
                <span className="text-center text-sm font-medium uppercase tracking-wide text-white drop-shadow-md">
                  {cat.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
