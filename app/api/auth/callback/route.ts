import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getOpenIdConfig,
  getCustomerAccountClientId,
  decodePkceCookie,
  encodeSessionCookie,
  authCookies,
} from "@/app/utils/auth";

function getOrigin(request: Request): string {
  const headers = new Headers(request.headers);
  const host = headers.get("x-forwarded-host") || headers.get("host");
  const proto = headers.get("x-forwarded-proto") || "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

function callbackUrl(request: Request): string {
  return `${getOrigin(request)}/api/auth/callback`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getOrigin(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/?error=auth_denied&message=${errorParam}`, origin).toString()
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=auth_callback_missing", origin).toString()
    );
  }

  const cookieStore = await cookies();
  const pkceCookie = cookieStore.get(authCookies.pkce.name)?.value;
  if (!pkceCookie) {
    return NextResponse.redirect(
      new URL("/?error=auth_session_expired", origin).toString()
    );
  }

  const pkce = decodePkceCookie(pkceCookie);
  if (!pkce || pkce.state !== state) {
    return NextResponse.redirect(
      new URL("/?error=auth_invalid_state", origin).toString()
    );
  }

  try {
    const openId = await getOpenIdConfig();
    const clientId = getCustomerAccountClientId();
    const redirectUri = callbackUrl(request);

    const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET || "";
    const tokenHeaders: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (clientSecret) {
      tokenHeaders["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    }

    const tokenRes = await fetch(openId.token_endpoint, {
      method: "POST",
      headers: tokenHeaders,
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        code_verifier: pkce.codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Token exchange failed:", tokenRes.status, text);
      return NextResponse.redirect(
        new URL("/?error=auth_token_failed", origin).toString()
      );
    }

    const tokenData = (await tokenRes.json()) as Record<string, unknown>;
    console.log("DEBUG tokenData keys:", Object.keys(tokenData));
    console.log("DEBUG tokenData:", JSON.stringify(tokenData).substring(0, 500));
    const accessToken = tokenData.access_token as string | undefined;
    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/?error=auth_no_token", origin).toString()
      );
    }

    const sessionValue = encodeSessionCookie(accessToken);
    const returnTo = url.searchParams.get("returnTo") || "/";

    const res = NextResponse.redirect(new URL(returnTo, origin).toString());
    res.cookies.delete(authCookies.pkce.name);
    res.cookies.set(authCookies.session.name, sessionValue, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: authCookies.session.maxAge,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(
      new URL("/?error=auth_callback_error", origin).toString()
    );
  }
}
