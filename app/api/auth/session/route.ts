import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  decodeSessionCookie,
  getStoreDomain,
  authCookies,
} from "@/app/utils/auth";
import { storefront } from "@/app/utils/storefront";
import { GET_CUSTOMER, getCustomerMinimalQuery } from "@/app/utils/mutations";
import type {
  SessionCustomer,
  SessionOrderLineItem,
  SessionOrderSummary,
} from "@/app/types/session-customer";

export type { SessionCustomer } from "@/app/types/session-customer";

const customerAccountQuery = `
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

async function fetchCustomerAccountCustomer(
  accessToken: string
): Promise<SessionCustomer | null> {
  let domain: string;
  try {
    domain = getStoreDomain();
  } catch {
    return null;
  }
  const apiUrl = `https://${domain}/.well-known/customer-account-api`;
  const configRes = await fetch(apiUrl);
  if (!configRes.ok) {
    return null;
  }
  const config = (await configRes.json()) as {
    graphql_api?: string;
    api_endpoint?: string;
  };
  const apiEndpoint = config.graphql_api || config.api_endpoint;
  if (!apiEndpoint) {
    return null;
  }

  const gqlRes = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: customerAccountQuery }),
  });

  if (!gqlRes.ok) {
    return null;
  }

  const gqlData = (await gqlRes.json()) as {
    data?: {
      customer?: {
        id: string;
        firstName?: string;
        lastName?: string;
        emailAddress?: { emailAddress?: string };
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (gqlData.errors?.length || !gqlData.data?.customer) {
    return null;
  }

  const c = gqlData.data.customer;
  return {
    id: c.id,
    firstName: c.firstName ?? null,
    lastName: c.lastName ?? null,
    email: c.emailAddress?.emailAddress ?? null,
    authSource: "customer_account",
  };
}

type StorefrontCustomerPayload = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  numberOfOrders?: string | number | null;
  createdAt?: string | null;
  defaultAddress?: {
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    zip?: string | null;
  } | null;
  orders?: {
    edges?: Array<{
      node?: {
        id: string;
        name?: string;
        orderNumber?: number | null;
        processedAt?: string | null;
        totalPrice?: { amount: string; currencyCode: string } | null;
        fulfillmentStatus?: string;
        financialStatus?: string | null;
        lineItems?: {
          edges?: Array<{
            node?: {
              title?: string;
              quantity?: number;
            };
          }>;
        };
      };
    }>;
  } | null;
};

function mapStorefrontCustomer(raw: StorefrontCustomerPayload): SessionCustomer {
  const recentOrders: SessionOrderSummary[] =
    raw.orders?.edges?.flatMap((edge) => {
      const n = edge.node;
      if (!n?.id) return [];
      const lineItems: SessionOrderLineItem[] =
        n.lineItems?.edges?.flatMap((li) => {
          const node = li.node;
          if (!node?.title) return [];
          return [
            {
              title: node.title,
              quantity: typeof node.quantity === "number" ? node.quantity : 0,
            },
          ];
        }) ?? [];
      return [
        {
          id: n.id,
          name: n.name ?? "",
          orderNumber:
            typeof n.orderNumber === "number" ? n.orderNumber : null,
          processedAt: n.processedAt ?? null,
          totalAmount: n.totalPrice?.amount ?? "0",
          totalCurrency: n.totalPrice?.currencyCode ?? "",
          fulfillmentStatus: n.fulfillmentStatus ?? "",
          financialStatus: n.financialStatus ?? null,
          lineItems,
        },
      ];
    }) ?? [];

  const n = raw.numberOfOrders;
  const numberOfOrders =
    n === undefined || n === null ? null : typeof n === "number" ? String(n) : n;

  return {
    id: raw.id,
    firstName: raw.firstName ?? null,
    lastName: raw.lastName ?? null,
    email: raw.email ?? null,
    authSource: "storefront",
    phone: raw.phone ?? null,
    numberOfOrders,
    createdAt: raw.createdAt ?? null,
    defaultAddress: raw.defaultAddress
      ? {
          address1: raw.defaultAddress.address1 ?? null,
          address2: raw.defaultAddress.address2 ?? null,
          city: raw.defaultAddress.city ?? null,
          province: raw.defaultAddress.province ?? null,
          country: raw.defaultAddress.country ?? null,
          zip: raw.defaultAddress.zip ?? null,
        }
      : null,
    recentOrders,
  };
}

async function fetchStorefrontCustomer(
  customerAccessToken: string
): Promise<SessionCustomer | null> {
  const profileRes = await storefront(GET_CUSTOMER, {
    customerAccessToken,
  });

  if (!profileRes?.errors?.length) {
    const c = profileRes?.data?.customer as StorefrontCustomerPayload | null | undefined;
    if (c?.id) {
      return mapStorefrontCustomer(c);
    }
  }

  const minimalRes = await storefront(getCustomerMinimalQuery, {
    customerAccessToken,
  });

  if (minimalRes?.errors?.length || !minimalRes?.data?.customer?.id) {
    return null;
  }

  const m = minimalRes.data.customer as {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };

  return {
    id: m.id,
    firstName: m.firstName ?? null,
    lastName: m.lastName ?? null,
    email: m.email ?? null,
    authSource: "storefront",
    recentOrders: [],
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(authCookies.session.name)?.value;
    const storefrontCookie = cookieStore.get(
      authCookies.storefrontCustomer.name
    )?.value;

    const oauthToken = sessionCookie
      ? decodeSessionCookie(sessionCookie)
      : null;
    if (oauthToken) {
      try {
        const customer = await fetchCustomerAccountCustomer(oauthToken);
        if (customer) {
          return NextResponse.json({ customer });
        }
      } catch {
        // try storefront cookie
      }
    }

    const sfToken = storefrontCookie
      ? decodeSessionCookie(storefrontCookie)
      : null;
    if (sfToken) {
      try {
        const customer = await fetchStorefrontCustomer(sfToken);
        if (customer) {
          return NextResponse.json({ customer });
        }
      } catch {
        // invalid token
      }
      const res = NextResponse.json({ customer: null });
      res.cookies.delete(authCookies.storefrontCustomer.name);
      return res;
    }

    return NextResponse.json({ customer: null });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
