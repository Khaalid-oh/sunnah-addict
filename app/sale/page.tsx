import AnnouncementBar from "../components/AnnouncementBar";
import CollectionGrid from "../components/CollectionGrid";
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

export default async function SalePage() {
  const res = await storefront(collectionQuery, {
    handle: "sale",
    first: 50,
  });

  const collection = res?.data?.collection;
  const productEdges = collection?.products?.edges ?? [];
  const products = mapCollectionProducts(productEdges);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main>
        <CollectionGrid
          pretitle="SALE"
          viewAllHref="/new-arrivals"
          viewAllLabel="VIEW ALL PRODUCTS"
          products={products}
        />
      </main>

      <Footer />
    </div>
  );
}
