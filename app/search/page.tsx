import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Link from "next/link";
import { storefront } from "../utils/storefront";
import { productSearchQuery } from "../utils/queries";
import CollectionGrid from "../components/CollectionGrid";

function mapSearchProducts(
  edges: Array<{
    node: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: { url: string; altText?: string } | null;
    };
  }>,
) {
  if (!edges?.length) return [];
  return edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    image: node.featuredImage ?? null,
  }));
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let products: Array<{ id: string; title: string; handle: string; image: { url: string; altText?: string } | null }> = [];

  if (query.length >= 2) {
    try {
      const res = await storefront(productSearchQuery, {
        query,
        first: 50,
      });
      const edges = res?.data?.products?.edges ?? [];
      products = mapSearchProducts(edges);
    } catch {
      // leave products empty
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {query ? (
            <>
              <h1 className="mb-6 text-2xl font-bold uppercase tracking-tight text-black">
                Search: {query}
              </h1>
              {products.length > 0 ? (
                <CollectionGrid
                  pretitle=""
                  products={products}
                  showViewAll={false}
                />
              ) : (
                <p className="text-zinc-600">
                  {query.length < 2
                    ? "Enter at least 2 characters to search."
                    : "No products found. Try a different search."}
                </p>
              )}
            </>
          ) : (
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold uppercase tracking-tight text-black">
                Search
              </h1>
              <p className="text-zinc-600">
                Use the search bar in the header to find products and pages.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block text-sm font-medium uppercase tracking-wide text-black underline hover:no-underline"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
