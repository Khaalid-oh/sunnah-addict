import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  getCustomerAccountClientId,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  encodePkceCookie,
  applyStorefrontCustomerSessionCookie,
  authCookies,
} from "@/app/utils/auth";
import { storefront } from "@/app/utils/storefront";
import { customerAccessTokenCreateMutation } from "@/app/utils/mutations";

function callbackUrl(request: Request): string {
  const headers = new Headers(request.headers);
  const host = headers.get("x-forwarded-host") || headers.get("host");
  const proto = headers.get("x-forwarded-proto") || "https";
  if (host) {
    return `${proto}://${host}/api/auth/callback`;
  }
  const url = new URL(request.url);
  return `${url.origin}/api/auth/callback`;
}

export async function GET(request: Request) {
  try {
    const openId = await getOpenIdConfig();
    const clientId = getCustomerAccountClientId();

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    const pkceValue = encodePkceCookie(state, codeVerifier);
    const redirectUri = callbackUrl(request);

    console.log("DEBUG request.url:", request.url);
    console.log("DEBUG redirectUri:", redirectUri);
    const authUrl = new URL(openId.authorization_endpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set(
      "scope",
      "openid email customer-account-api:full"
    );
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    const res = NextResponse.redirect(authUrl.toString());
    res.cookies.set(authCookies.pkce.name, pkceValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authCookies.pkce.maxAge,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Auth login error:", err);
    return NextResponse.redirect(
      new URL("/?error=auth_config", request.url).toString()
    );
  }
}

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const res = await storefront(customerAccessTokenCreateMutation, {
      input: { email, password },
    });

    if (res?.errors?.length) {
      const msg = res.errors
        .map((e: { message?: string }) => e.message)
        .filter(Boolean)
        .join(" ");
      return NextResponse.json(
        {
          ok: false,
          error: msg || "Login request failed.",
          graphQLErrors: res.errors,
        },
        { status: 502 }
      );
    }

    const payload = res?.data?.customerAccessTokenCreate;
    const customerUserErrors: CustomerUserError[] =
      payload?.customerUserErrors ?? [];
    const tokenObj = payload?.customerAccessToken ?? null;

    if (customerUserErrors.length > 0) {
      return NextResponse.json({
        ok: false,
        customerUserErrors,
      });
    }

    const accessToken = tokenObj?.accessToken as string | undefined;
    const expiresAt = tokenObj?.expiresAt as string | undefined;
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Could not sign in. Please try again." },
        { status: 422 }
      );
    }

    const nextRes = NextResponse.json({ ok: true });
    applyStorefrontCustomerSessionCookie(nextRes, accessToken, expiresAt);
    return nextRes;
  } catch (err) {
    console.error("Storefront login error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
