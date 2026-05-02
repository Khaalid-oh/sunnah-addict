import { NextResponse } from "next/server";
import { storefront } from "@/app/utils/storefront";
import { customerRecoverMutation } from "@/app/utils/mutations";

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const res = await storefront(customerRecoverMutation, { email });

    if (res?.errors?.length) {
      const msg = res.errors
        .map((e: { message?: string }) => e.message)
        .filter(Boolean)
        .join(" ");
      return NextResponse.json(
        {
          ok: false,
          error: msg || "Request failed.",
          graphQLErrors: res.errors,
        },
        { status: 502 }
      );
    }

    const payload = res?.data?.customerRecover;
    const customerUserErrors: CustomerUserError[] =
      payload?.customerUserErrors ?? [];

    if (customerUserErrors.length > 0) {
      return NextResponse.json({
        ok: false,
        customerUserErrors,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Recover error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
