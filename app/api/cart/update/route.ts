import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import { cartLinesUpdateMutation } from "@/app/utils/mutations";

const CART_ID_COOKIE = "shopify_cart_id";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lineId = body?.lineId;
    const quantity = Math.max(0, Math.min(99, Number(body?.quantity) ?? 0));

    if (!lineId || typeof lineId !== "string") {
      return NextResponse.json(
        { error: "lineId is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
    if (!cartId) {
      return NextResponse.json({ error: "No cart" }, { status: 400 });
    }

    const res = await storefront(cartLinesUpdateMutation, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });
    const userErrors = res?.data?.cartLinesUpdate?.userErrors ?? [];
    if (userErrors.length) {
      return NextResponse.json(
        { error: userErrors[0]?.message ?? "Failed to update line" },
        { status: 422 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart update error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
