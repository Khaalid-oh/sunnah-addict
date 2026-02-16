import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  decodeSessionCookie,
  getStoreDomain,
  authCookies,
} from "@/app/utils/auth";

export type SessionCustomer = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

const customerQuery = `
  query Customer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(authCookies.session.name)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ customer: null });
  }

  const accessToken = decodeSessionCookie(sessionCookie);
  if (!accessToken) {
    return NextResponse.json({ customer: null });
  }

  try {
    const domain = getStoreDomain();
    const apiUrl = `https://${domain}/.well-known/customer-account-api`;
    const configRes = await fetch(apiUrl);
    if (!configRes.ok) {
      return NextResponse.json({ customer: null });
    }
    const config = (await configRes.json()) as { api_endpoint?: string };
    const apiEndpoint = config.api_endpoint;
    if (!apiEndpoint) {
      return NextResponse.json({ customer: null });
    }

    const gqlRes = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: customerQuery }),
    });

    if (!gqlRes.ok) {
      return NextResponse.json({ customer: null });
    }

    const gqlData = (await gqlRes.json()) as {
      data?: { customer?: { id: string; firstName?: string; lastName?: string; emailAddress?: { emailAddress?: string } } };
      errors?: Array<{ message: string }>;
    };

    if (gqlData.errors?.length || !gqlData.data?.customer) {
      return NextResponse.json({ customer: null });
    }

    const c = gqlData.data.customer;
    const customer: SessionCustomer = {
      id: c.id,
      firstName: c.firstName ?? null,
      lastName: c.lastName ?? null,
      email: c.emailAddress?.emailAddress ?? null,
    };
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
