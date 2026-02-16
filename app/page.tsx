import AnnouncementBar from "./components/AnnouncementBar";
import CategoryGrid from "./components/CategoryGrid";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero, { type HeroSlide } from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import { storefront } from "./utils/storefront";
import { productsQuery, discoverCollectionQuery } from "./utils/queries";
import CollectionGrid from "./components/CollectionGrid";

/** Map Shopify Storefront API product edges to ProductGrid product shape */
function mapProducts(
  edges: Array<{
    node: {
      id: string;
      title: string;
      handle: string;
      media?: {
        edges: Array<{ node: { image?: { url: string; altText?: string } } }>;
      };
    };
  }>,
) {
  if (!edges?.length) return [];
  return edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    image: node.media?.edges?.[0]?.node?.image ?? null,
  }));
}

/** Map Discover collection products to CategoryGrid category shape (product links) */
function mapDiscoverToCategories(
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
    href: `/products/${node.handle}`,
    image: node.featuredImage ?? null,
  }));
}

export default async function Home() {
  const [productsRes, discoverRes] = await Promise.all([
    storefront(productsQuery),
    storefront(discoverCollectionQuery, { handle: "discover" }),
  ]);

  const edges = productsRes?.data?.products?.edges ?? [];
  const products = mapProducts(edges);

  const discoverCollection = discoverRes?.data?.collection;
  const discoverProductEdges = discoverCollection?.products?.edges ?? [];
  const discoverCategories = mapDiscoverToCategories(discoverProductEdges);

  const heroSlides: HeroSlide[] = [
    {
      src: "https://images.unsplash.com/photo-1606838977034-c63af9f4f026?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Elegant scarves and modest wear fabrics",
    },
    {
      src: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2675&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Islamic-inspired jewelry and accessories",
    },
    {
      src: "https://images.unsplash.com/photo-1572048572872-2394404cf1f3?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Home decor and Islamic interior",
    },
    {
      src: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Watches and modest accessories",
    },
    {
      src: "https://images.unsplash.com/photo-1561715276-a2d087060f1d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Islamic geometric pattern and design",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main>
        <Hero
          pretitle="RAMADAN 2026"
          title="SUNNAH ADDICT"
          ctaLabel="SHOP NOW"
          ctaHref="/collections"
          slides={heroSlides}
          slideInterval={5000}
        />

        <ProductGrid
          pretitle="RAMADAN COLLECTION"
          viewAllHref="/new-arrivals"
          viewAllLabel="VIEW ALL PRODUCTS"
          products={products}
        />

        <CategoryGrid
          pretitle="DISCOVER"
          categories={
            discoverCategories.length > 0 ? discoverCategories : undefined
          }
        />

        <CollectionGrid
          pretitle="LATEST COLLECTIONS"
          viewAllHref="/new-arrivals"
          viewAllLabel="VIEW ALL PRODUCTS"
          products={products}
        />
      </main>

      <Footer />
    </div>
  );
}
