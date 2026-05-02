import { NextResponse } from "next/server";
import { storefront } from "@/app/utils/storefront";
import { getStorefrontCustomerAccessToken } from "@/app/utils/storefront-customer-token";
import { customerDefaultAddressUpdateMutation } from "@/app/utils/mutations";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const token = await getStorefrontCustomerAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "Storefront sign-in required to manage addresses." },
      { status: 401 }
    );
  }

  const { id: addressId } = await params;
  if (!addressId) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }

  const res = await storefront(customerDefaultAddressUpdateMutation, {
    customerAccessToken: token,
    addressId,
  });

  if (res?.errors?.length) {
    return NextResponse.json(
      { error: res.errors[0]?.message ?? "Request failed" },
      { status: 502 }
    );
  }

  const payload = res?.data?.customerDefaultAddressUpdate;
  const errors = payload?.customerUserErrors ?? [];
  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, customerUserErrors: errors },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true });
}
