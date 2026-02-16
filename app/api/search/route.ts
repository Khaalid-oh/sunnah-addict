import { NextResponse } from "next/server";
import { storefront } from "@/app/utils/storefront";
import { productSearchQuery } from "@/app/utils/queries";

const SEARCH_PAGES: { label: string; href: string }[] = [
  { label: "All", href: "/" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Kids", href: "/kids" },
  { label: "Brands", href: "/brands" },
  { label: "Collections", href: "/collections" },
  { label: "Sale", href: "/sale" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Return Form", href: "/returns" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (q.length < 2) {
    return NextResponse.json({
      products: [],
      productCount: 0,
      pages: [],
    });
  }

  const filteredPages = SEARCH_PAGES.filter((p) =>
    p.label.toLowerCase().includes(q),
  );

  let products: Array<{
    id: string;
    title: string;
    handle: string;
    image: { url: string; altText?: string } | null;
    price?: string;
  }> = [];
  let productCount = 0;

  try {
    const res = await storefront(productSearchQuery, {
      query: q,
      first: 12,
    });
    const edges = res?.data?.products?.edges ?? [];
    productCount = edges.length;
    products = edges.map(({ node }: { node: { id: string; title: string; handle: string; featuredImage?: { url: string; altText?: string } | null; priceRange?: { minVariantPrice?: { amount: string } } } }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      image: node.featuredImage ?? null,
      price: node.priceRange?.minVariantPrice?.amount,
    }));
  } catch {
    // If Storefront search fails (e.g. query syntax), return empty products
  }

  return NextResponse.json({
    products,
    productCount,
    pages: filteredPages,
  });
}
