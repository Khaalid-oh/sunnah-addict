import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  getCustomerAccountClientId,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  encodePkceCookie,
  authCookies,
} from "@/app/utils/auth";

function callbackUrl(request: Request): string {
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

    const authUrl = new URL(openId.authorization_endpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set(
      "scope",
      "openid email profile https://api.shopify.com/auth/customer-account-api:full"
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
