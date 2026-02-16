import AnnouncementBar from "../components/AnnouncementBar";
import CollectionPageView from "../components/CollectionPageView";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { storefront } from "../utils/storefront";
import { collectionQuery } from "../utils/queries";

function mapCollectionProducts(
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

export default async function WomenPage() {
  const res = await storefront(collectionQuery, {
    handle: "women",
    first: 50,
  });

  const collection = res?.data?.collection;
  const productEdges = collection?.products?.edges ?? [];
  const products = mapCollectionProducts(productEdges);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="border-t border-zinc-200">
        <CollectionPageView
          title="WOMEN"
          products={products}
          basePath="/women"
        />
      </main>

      <Footer />
    </div>
  );
}
