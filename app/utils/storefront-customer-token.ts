import { cookies } from "next/headers";
import { decodeSessionCookie, authCookies } from "@/app/utils/auth";

/** Signed storefront customer access token from the session cookie (server-only). */
export async function getStorefrontCustomerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(authCookies.storefrontCustomer.name)?.value;
  if (!raw) return null;
  return decodeSessionCookie(raw);
}
