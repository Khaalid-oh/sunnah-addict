import { NextResponse } from "next/server";
import { authCookies } from "@/app/utils/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/";

  const res = NextResponse.redirect(new URL(returnTo, url.origin).toString());
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
