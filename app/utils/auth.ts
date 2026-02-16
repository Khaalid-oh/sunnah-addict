/**
 * Shopify Customer Account API auth (OAuth 2.0 + PKCE).
 * Requires: SESSION_SECRET or AUTH_SECRET (min 32 chars),
 * NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or SHOPIFY_STORE_DOMAIN (e.g. store.myshopify.com),
 * SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (from Customer Account API / Headless channel in Shopify admin).
 */
import { createHash, createHmac, randomBytes } from "crypto";

const PKCE_COOKIE = "shopify_pkce";
const SESSION_COOKIE = "shopify_customer_session";
const PKCE_MAX_AGE = 60 * 10; // 10 minutes
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET or AUTH_SECRET must be set and at least 32 characters"
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function generateState(): string {
  return randomBytes(16).toString("base64url");
}

export function encodePkceCookie(state: string, codeVerifier: string): string {
  const payload = JSON.stringify({ state, codeVerifier });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function decodePkceCookie(
  value: string
): { state: string; codeVerifier: string } | null {
  const [encoded, sig] = value.split(".");
  if (!encoded || !sig || sig !== sign(encoded)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    );
    if (payload?.state && payload?.codeVerifier) return payload;
  } catch {
    // ignore
  }
  return null;
}

export function encodeSessionCookie(accessToken: string): string {
  const encoded = Buffer.from(accessToken, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function decodeSessionCookie(value: string): string | null {
  const [encoded, sig] = value.split(".");
  if (!encoded || !sig || sig !== sign(encoded)) return null;
  try {
    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export const authCookies = {
  pkce: {
    name: PKCE_COOKIE,
    maxAge: PKCE_MAX_AGE,
  },
  session: {
    name: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE,
  },
};

export function getStoreDomain(): string {
  const domain =
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) {
    throw new Error(
      "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or SHOPIFY_STORE_DOMAIN must be set"
    );
  }
  return domain.replace(/^https?:\/\//, "");
}

export function getCustomerAccountClientId(): string {
  const id =
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!id) {
    throw new Error(
      "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID must be set (from Customer Account API config)"
    );
  }
  return id;
}

export type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  [key: string]: unknown;
};

export async function getOpenIdConfig(): Promise<OpenIdConfig> {
  const domain = getStoreDomain();
  const url = `https://${domain}/.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenID config failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
