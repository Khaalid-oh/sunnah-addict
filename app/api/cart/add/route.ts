import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import {
  cartCreateMutation,
  cartLinesAddMutation,
} from "@/app/utils/mutations";

const CART_ID_COOKIE = "shopify_cart_id";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const variantId = body?.merchandiseId ?? body?.variantId;
    const quantity = Math.max(1, Math.min(99, Number(body?.quantity) || 1));

    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json(
        { error: "merchandiseId (variant ID) is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (cartId) {
      const addRes = await storefront(cartLinesAddMutation, {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      });
      const userErrors = addRes?.data?.cartLinesAdd?.userErrors ?? [];
      if (userErrors?.length) {
        return NextResponse.json(
          { error: userErrors[0]?.message ?? "Failed to add to cart" },
          { status: 422 }
        );
      }
      const cart = addRes?.data?.cartLinesAdd?.cart;
      const checkoutUrl = cart?.checkoutUrl ?? null;

      return NextResponse.json({
        cartId: cart?.id ?? cartId,
        checkoutUrl,
      });
    }

    const createRes = await storefront(cartCreateMutation, {
      lines: [{ merchandiseId: variantId, quantity }],
    });
    const userErrors =
      createRes?.data?.cartCreate?.userErrors ?? [];
    if (userErrors?.length) {
      return NextResponse.json(
        { error: userErrors[0]?.message ?? "Failed to create cart" },
        { status: 422 }
      );
    }
    const cart = createRes?.data?.cartCreate?.cart;
    const newCartId = cart?.id ?? null;
    const checkoutUrl = cart?.checkoutUrl ?? null;

    if (newCartId) {
      const res = NextResponse.json({
        cartId: newCartId,
        checkoutUrl,
      });
      res.cookies.set(CART_ID_COOKIE, newCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 14, // 14 days
        path: "/",
      });
      return res;
    }

    return NextResponse.json(
      { error: "Failed to create cart" },
      { status: 500 }
    );
  } catch (err) {
    console.error("Cart add error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
