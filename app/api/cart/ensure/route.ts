import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import { cartQuery } from "@/app/utils/queries";
import { cartCreateMutation } from "@/app/utils/mutations";
import {
  serializeStorefrontCart,
  SHOPIFY_CART_ID_COOKIE,
} from "@/app/utils/shopify-cart";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 14,
  path: "/",
};

/**
 * Returns the cart for the current cookie, or creates an empty cart and sets the cookie.
 * Mirrors mobile getOrCreateCart / SecureStore cartId persistence.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const existingId = cookieStore.get(SHOPIFY_CART_ID_COOKIE)?.value;

    if (existingId) {
      const res = await storefront(cartQuery, { id: existingId });
      const cart = res?.data?.cart;
      if (cart) {
        return NextResponse.json(serializeStorefrontCart(cart));
      }
    }

    const createRes = await storefront(cartCreateMutation, { input: {} });
    const userErrors = createRes?.data?.cartCreate?.userErrors ?? [];
    if (userErrors.length) {
      return NextResponse.json(
        { error: userErrors[0]?.message ?? "Could not create cart" },
        { status: 422 }
      );
    }

    const newCartId = createRes?.data?.cartCreate?.cart?.id as
      | string
      | undefined;
    if (!newCartId) {
      return NextResponse.json(
        { error: "Failed to create cart" },
        { status: 500 }
      );
    }

    const fullRes = await storefront(cartQuery, { id: newCartId });
    const fullCart = fullRes?.data?.cart;
    if (!fullCart) {
      return NextResponse.json(
        { error: "Failed to load cart" },
        { status: 500 }
      );
    }

    const out = NextResponse.json(serializeStorefrontCart(fullCart));
    out.cookies.set(SHOPIFY_CART_ID_COOKIE, newCartId, cookieOptions);
    return out;
  } catch (err) {
    console.error("Cart ensure error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
