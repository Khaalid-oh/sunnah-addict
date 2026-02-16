import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import { cartQuery } from "@/app/utils/queries";

const CART_ID_COOKIE = "shopify_cart_id";

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
  if (!cartId) {
    return NextResponse.json({ count: 0, checkoutUrl: null });
  }
  try {
    const res = await storefront(cartQuery, { id: cartId });
    const cart = res?.data?.cart;
    if (!cart) {
      return NextResponse.json({ count: 0, checkoutUrl: null });
    }
    const edges = cart.lines?.edges ?? [];
    const count = edges.reduce(
      (sum: number, e: { node?: { quantity?: number } }) =>
        sum + (e.node?.quantity ?? 0),
      0
    );
    return NextResponse.json({
      count,
      checkoutUrl: cart.checkoutUrl ?? null,
    });
  } catch {
    return NextResponse.json({ count: 0, checkoutUrl: null });
  }
}
