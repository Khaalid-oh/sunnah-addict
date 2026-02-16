import AnnouncementBar from "../components/AnnouncementBar";
import CollectionPageView from "../components/CollectionPageView";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { storefront } from "../utils/storefront";
import { allProductsQuery } from "../utils/queries";

function mapProducts(
  edges: Array<{
    node: {
      id: string;
      title: string;
      handle: string;
      tags?: string[];
      featuredImage?: { url: string; altText?: string } | null;
    };
  }>,
) {
  if (!edges?.length) return [];
  return edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    tags: node.tags ?? [],
    image: node.featuredImage ?? null,
  }));
}

export default async function NewArrivalsPage() {
  const res = await storefront(allProductsQuery, { first: 100 });

  const productEdges = res?.data?.products?.edges ?? [];
  const products = mapProducts(productEdges);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="border-t border-zinc-200">
        <CollectionPageView
          title="NEW ARRIVALS"
          products={products}
          basePath="/new-arrivals"
          showCategoryFilter={false}
        />
      </main>

      <Footer />
    </div>
  );
}
