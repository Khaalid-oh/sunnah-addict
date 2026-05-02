import { NextResponse } from "next/server";
import { storefront } from "@/app/utils/storefront";
import {
  customerCreateMutation,
  customerAccessTokenCreateMutation,
} from "@/app/utils/mutations";
import { applyStorefrontCustomerSessionCookie } from "@/app/utils/auth";

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };

    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    const res = await storefront(customerCreateMutation, {
      input: {
        firstName,
        lastName,
        email,
        password,
      },
    });

    if (res?.errors?.length) {
      const msg = res.errors.map((e: { message?: string }) => e.message).filter(Boolean).join(" ");
      return NextResponse.json(
        {
          ok: false,
          error: msg || "Registration request failed.",
          graphQLErrors: res.errors,
        },
        { status: 502 }
      );
    }

    const payload = res?.data?.customerCreate;
    const customerUserErrors: CustomerUserError[] =
      payload?.customerUserErrors ?? [];
    const customer = payload?.customer ?? null;

    if (customerUserErrors.length > 0) {
      return NextResponse.json({
        ok: false,
        customerUserErrors,
      });
    }

    if (!customer) {
      return NextResponse.json(
        { ok: false, error: "Could not create account. Please try again." },
        { status: 422 }
      );
    }

    const loginRes = await storefront(customerAccessTokenCreateMutation, {
      input: { email, password },
    });

    const loginPayload = loginRes?.data?.customerAccessTokenCreate;
    const loginErrors = loginPayload?.customerUserErrors ?? [];
    const tokenObj = loginPayload?.customerAccessToken ?? null;
    const accessToken = tokenObj?.accessToken as string | undefined;
    const expiresAt = tokenObj?.expiresAt as string | undefined;

    const customerPayload = {
      id: customer.id,
      firstName: customer.firstName ?? null,
      lastName: customer.lastName ?? null,
      email: customer.email ?? null,
    };

    if (
      !loginRes?.errors?.length &&
      loginErrors.length === 0 &&
      accessToken
    ) {
      const nextRes = NextResponse.json({
        ok: true,
        signedIn: true,
        customer: customerPayload,
      });
      applyStorefrontCustomerSessionCookie(nextRes, accessToken, expiresAt);
      return nextRes;
    }

    return NextResponse.json({
      ok: true,
      signedIn: false,
      customer: customerPayload,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
