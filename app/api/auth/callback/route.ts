import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getOpenIdConfig,
  getCustomerAccountClientId,
  decodePkceCookie,
  encodeSessionCookie,
  authCookies,
} from "@/app/utils/auth";

function callbackUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}/api/auth/callback`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/?error=auth_denied&message=${errorParam}`, url.origin).toString()
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=auth_callback_missing", url.origin).toString()
    );
  }

  const cookieStore = await cookies();
  const pkceCookie = cookieStore.get(authCookies.pkce.name)?.value;
  if (!pkceCookie) {
    return NextResponse.redirect(
      new URL("/?error=auth_session_expired", url.origin).toString()
    );
  }

  const pkce = decodePkceCookie(pkceCookie);
  if (!pkce || pkce.state !== state) {
    return NextResponse.redirect(
      new URL("/?error=auth_invalid_state", url.origin).toString()
    );
  }

  try {
    const openId = await getOpenIdConfig();
    const clientId = getCustomerAccountClientId();
    const redirectUri = callbackUrl(request);

    const tokenRes = await fetch(openId.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
        new URL("/?error=auth_token_failed", url.origin).toString()
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      expires_in?: number;
    };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/?error=auth_no_token", url.origin).toString()
      );
    }

    const sessionValue = encodeSessionCookie(accessToken);
    const returnTo = url.searchParams.get("returnTo") || "/account";

    const res = NextResponse.redirect(new URL(returnTo, url.origin).toString());
    res.cookies.delete(authCookies.pkce.name);
    res.cookies.set(authCookies.session.name, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authCookies.session.maxAge,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(
      new URL("/?error=auth_callback_error", url.origin).toString()
    );
  }
}
