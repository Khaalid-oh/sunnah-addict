import { NextResponse } from "next/server";
import { authCookies } from "@/app/utils/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  const host = headers.get("x-forwarded-host") || headers.get("host");
  const proto = headers.get("x-forwarded-proto") || "https";
  const origin = host ? `${proto}://${host}` : url.origin;
  const returnTo = url.searchParams.get("returnTo") || "/";

  const res = NextResponse.redirect(new URL(returnTo, origin).toString());
  res.cookies.delete(authCookies.session.name);
  res.cookies.delete(authCookies.pkce.name);
  return res;
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(authCookies.session.name);
  res.cookies.delete(authCookies.pkce.name);
  return res;
}
