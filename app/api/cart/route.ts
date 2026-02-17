import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import { cartQuery } from "@/app/utils/queries";

const CART_ID_COOKIE = "shopify_cart_id";

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
  if (!cartId) {
    return NextResponse.json({ count: 0, checkoutUrl: null, lines: [] });
  }
  try {
    const res = await storefront(cartQuery, { id: cartId });
    const cart = res?.data?.cart;
    if (!cart) {
      return NextResponse.json({ count: 0, checkoutUrl: null, lines: [] });
    }
    const edges = cart.lines?.edges ?? [];
    const count = edges.reduce(
      (sum: number, e: { node?: { quantity?: number } }) =>
        sum + (e.node?.quantity ?? 0),
      0
    );
    const lines = edges.map(
      (e: {
        node?: {
          id: string;
          quantity: number;
          merchandise?: {
            id: string;
            title: string;
            image?: { url: string; altText?: string } | null;
            price?: { amount: string; currencyCode: string };
            compareAtPrice?: { amount: string; currencyCode: string } | null;
            product?: { handle: string };
          };
          cost?: { totalAmount?: { amount: string; currencyCode: string } };
        };
      }) => {
        const n = e.node;
        const merch = n?.merchandise;
        return {
          id: n?.id,
          quantity: n?.quantity ?? 0,
          merchandiseId: merch?.id,
          title: merch?.title,
          image: merch?.image ?? null,
          price: merch?.price,
          compareAtPrice: merch?.compareAtPrice ?? null,
          productHandle: merch?.product?.handle,
          cost: n?.cost?.totalAmount,
        };
      }
    );
    return NextResponse.json({
      count,
      checkoutUrl: cart.checkoutUrl ?? null,
      cartId: cart.id,
      lines,
    });
  } catch {
    return NextResponse.json({ count: 0, checkoutUrl: null, lines: [] });
  }
}
