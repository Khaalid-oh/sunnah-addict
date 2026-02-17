import type { Metadata } from "next";
import AnnouncementBar from "../../components/AnnouncementBar";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import ProductDetail, {
  type ProductDetailData,
} from "../../components/ProductDetail";
import YouMayAlsoLike from "../../components/YouMayAlsoLike";
import { notFound } from "next/navigation";
import { storefront } from "../../utils/storefront";
import {
  singleProductByHandleQuery,
  allProductsQuery,
} from "../../utils/queries";

type RawProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  descriptionHtml?: string | null;
  featuredImage?: { url: string; altText?: string | null } | null;
  featuredMedia?: {
    image?: { url: string; altText?: string | null } | null;
  } | null;
  media?: {
    edges?: Array<{
      node?: { image?: { url: string; altText?: string | null } | null } | null;
    } | null>;
  } | null;
  variants?: {
    edges?: Array<{
      node?: {
        id: string;
        title: string;
        availableForSale?: boolean;
        quantityAvailable?: number | null;
        selectedOptions?: Array<{ name: string; value: string }>;
        price?: { amount: string; currencyCode: string };
      } | null;
    } | null>;
  } | null;
};

function mapProductForDetail(raw: RawProduct): ProductDetailData {
  const mediaEdges = raw?.media?.edges ?? [];
  const media = mediaEdges.map((e) => {
    const node = e?.node;
    const img = node && "image" in node ? node.image : null;
    return { image: img ?? null };
  });
  const variantEdges = raw?.variants?.edges ?? [];
  const variants: ProductDetailData["variants"] = variantEdges
    .map((e) => {
      const n = e?.node;
      if (!n) return null;
      return {
        id: n.id,
        title: n.title,
        availableForSale: n.availableForSale ?? false,
        quantityAvailable: n.quantityAvailable ?? null,
        selectedOptions: n.selectedOptions ?? [],
        price: n.price ?? { amount: "0", currencyCode: "USD" },
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const featuredImage =
    raw?.featuredMedia && "image" in raw?.featuredMedia
      ? (raw?.featuredMedia?.image ?? null)
      : (raw?.featuredImage ?? null);

  return {
    id: raw?.id,
    title: raw?.title,
    handle: raw?.handle,
    description: raw?.description ?? null,
    descriptionHtml: raw?.descriptionHtml ?? null,
    featuredImage,
    media,
    variants,
  };
}

function mapRelatedProducts(
  edges: Array<{
    node: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: { url: string; altText?: string | null } | null;
    };
  }>,
) {
  return edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    image: node.featuredImage ?? null,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const res = await storefront(singleProductByHandleQuery, { handle });
  const product = res?.data?.product;
  if (!product) return { title: "Product" };
  return {
    title: `${product.title} | Sunnah Addict`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [productRes, relatedRes] = await Promise.all([
    storefront(singleProductByHandleQuery, { handle }),
    storefront(allProductsQuery, { first: 12 }),
  ]);

  const rawProduct = productRes?.data?.product ?? null;
  if (!rawProduct) notFound();

  const product = mapProductForDetail(rawProduct);
  const relatedEdges = relatedRes?.data?.products?.edges ?? [];
  const relatedProducts = mapRelatedProducts(relatedEdges);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="border-t border-zinc-200">
        <ProductDetail product={product} />
        <YouMayAlsoLike
          products={relatedProducts}
          currentHandle={product.handle}
        />
      </main>

      <Footer />
    </div>
  );
}
