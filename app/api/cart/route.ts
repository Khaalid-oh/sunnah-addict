import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import { cartQuery } from "@/app/utils/queries";
import {
  serializeStorefrontCart,
  SHOPIFY_CART_ID_COOKIE,
  type SerializedCart,
} from "@/app/utils/shopify-cart";

const emptyPayload: SerializedCart = {
  count: 0,
  checkoutUrl: null,
  cartId: null,
  lines: [],
  totalAmount: null,
};

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(SHOPIFY_CART_ID_COOKIE)?.value;
  if (!cartId) {
    return NextResponse.json(emptyPayload);
  }
  try {
    const res = await storefront(cartQuery, { id: cartId });
    const cart = res?.data?.cart;
    if (!cart) {
      const out = NextResponse.json(emptyPayload);
      out.cookies.delete(SHOPIFY_CART_ID_COOKIE);
      return out;
    }
    return NextResponse.json(serializeStorefrontCart(cart));
  } catch {
    return NextResponse.json(emptyPayload);
  }
}
