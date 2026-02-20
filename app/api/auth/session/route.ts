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
  console.log("DEBUG session cookie present:", !!sessionCookie);
  if (!sessionCookie) {
    return NextResponse.json({ customer: null });
  }

  const accessToken = decodeSessionCookie(sessionCookie);
  console.log("DEBUG accessToken decoded:", !!accessToken);
  console.log("DEBUG accessToken prefix:", accessToken?.substring(0, 10));
  if (!accessToken) {
    return NextResponse.json({ customer: null });
  }

  try {
    const domain = getStoreDomain();
    const apiUrl = `https://${domain}/.well-known/customer-account-api`;
    const configRes = await fetch(apiUrl);
    if (!configRes.ok) {
      console.log("DEBUG customer-account-api config failed:", configRes.status);
      return NextResponse.json({ customer: null });
    }
    const config = (await configRes.json()) as { graphql_api?: string; api_endpoint?: string };
    const apiEndpoint = config.graphql_api || config.api_endpoint;
    console.log("DEBUG apiEndpoint:", apiEndpoint);
    if (!apiEndpoint) {
      console.log("DEBUG no api_endpoint in config");
      return NextResponse.json({ customer: null });
    }

    const gqlRes = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
      body: JSON.stringify({ query: customerQuery }),
    });

    if (!gqlRes.ok) {
      const text = await gqlRes.text();
      console.log("DEBUG gql failed:", gqlRes.status, text);
      return NextResponse.json({ customer: null });
    }

    const gqlData = (await gqlRes.json()) as {
      data?: { customer?: { id: string; firstName?: string; lastName?: string; emailAddress?: { emailAddress?: string } } };
      errors?: Array<{ message: string }>;
    };
    console.log("DEBUG gqlData:", JSON.stringify(gqlData));

    if (gqlData.errors?.length || !gqlData.data?.customer) {
      console.log("DEBUG gql errors or no customer");
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
