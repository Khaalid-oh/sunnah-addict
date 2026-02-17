import { NextResponse } from "next/server";
import { storefront } from "@/app/utils/storefront";
import { singleProductByHandleQuery } from "@/app/utils/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ error: "handle required" }, { status: 400 });
  }
  try {
    const res = await storefront(singleProductByHandleQuery, { handle });
    const product = res?.data?.product;
    if (!product) {
      return NextResponse.json(null);
    }
    const variants = (product.variants?.edges ?? []).map(
      (e: { node?: { id: string; title: string; availableForSale?: boolean; price?: { amount: string; currencyCode: string } } }) => ({
        id: e.node?.id,
        title: e.node?.title,
        availableForSale: e.node?.availableForSale ?? false,
        price: e.node?.price ?? { amount: "0", currencyCode: "NGN" },
      })
    );
    return NextResponse.json({
      id: product.id,
      title: product.title,
      handle: product.handle,
      featuredImage: product.featuredImage ?? null,
      variants,
    });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
