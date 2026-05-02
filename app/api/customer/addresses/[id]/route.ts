import { NextResponse } from "next/server";
import { storefront } from "@/app/utils/storefront";
import { getStorefrontCustomerAccessToken } from "@/app/utils/storefront-customer-token";
import {
  customerAddressUpdateMutation,
  customerAddressDeleteMutation,
} from "@/app/utils/mutations";

type AddressBody = {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
};

function toMailingInput(
  body: AddressBody
): Record<string, string> & {
  address1: string;
  city: string;
  country: string;
  zip: string;
} {
  const address1 = (body.address1 ?? "").trim();
  const city = (body.city ?? "").trim();
  const country = (body.country ?? "").trim();
  const zip = (body.zip ?? "").trim();
  const out: Record<string, string> & {
    address1: string;
    city: string;
    country: string;
    zip: string;
  } = { address1, city, country, zip };
  const address2 = (body.address2 ?? "").trim();
  const province = (body.province ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (address2) out.address2 = address2;
  if (province) out.province = province;
  if (phone) out.phone = phone;
  return out;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const token = await getStorefrontCustomerAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "Storefront sign-in required to manage addresses." },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }

  let body: AddressBody;
  try {
    body = (await request.json()) as AddressBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const address = toMailingInput(body);
  if (!address.address1 || !address.city || !address.country || !address.zip) {
    return NextResponse.json(
      { error: "Address, city, country, and ZIP are required." },
      { status: 400 }
    );
  }

  const res = await storefront(customerAddressUpdateMutation, {
    customerAccessToken: token,
    id,
    address,
  });

  if (res?.errors?.length) {
    return NextResponse.json(
      { error: res.errors[0]?.message ?? "Request failed" },
      { status: 502 }
    );
  }

  const payload = res?.data?.customerAddressUpdate;
  const errors = payload?.customerUserErrors ?? [];
  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, customerUserErrors: errors },
      { status: 422 }
    );
  }

  return NextResponse.json({
    ok: true,
    customerAddress: payload?.customerAddress ?? null,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const token = await getStorefrontCustomerAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "Storefront sign-in required to manage addresses." },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }

  const res = await storefront(customerAddressDeleteMutation, {
    customerAccessToken: token,
    id,
  });

  if (res?.errors?.length) {
    return NextResponse.json(
      { error: res.errors[0]?.message ?? "Request failed" },
      { status: 502 }
    );
  }

  const payload = res?.data?.customerAddressDelete;
  const errors = payload?.customerUserErrors ?? [];
  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, customerUserErrors: errors },
      { status: 422 }
    );
  }

  return NextResponse.json({
    ok: true,
    deletedCustomerAddressId: payload?.deletedCustomerAddressId ?? null,
  });
}
