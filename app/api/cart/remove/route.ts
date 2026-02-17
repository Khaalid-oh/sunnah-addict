import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefront } from "@/app/utils/storefront";
import { cartLinesRemoveMutation } from "@/app/utils/mutations";

const CART_ID_COOKIE = "shopify_cart_id";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lineIds = Array.isArray(body?.lineIds)
      ? body.lineIds.filter((id: unknown) => typeof id === "string")
      : typeof body?.lineId === "string"
        ? [body.lineId]
        : [];

    if (lineIds.length === 0) {
      return NextResponse.json(
        { error: "lineIds or lineId is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
    if (!cartId) {
      return NextResponse.json({ error: "No cart" }, { status: 400 });
    }

    const res = await storefront(cartLinesRemoveMutation, {
      cartId,
      lineIds,
    });
    const userErrors = res?.data?.cartLinesRemove?.userErrors ?? [];
    if (userErrors.length) {
      return NextResponse.json(
        { error: userErrors[0]?.message ?? "Failed to remove line" },
        { status: 422 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart remove error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
