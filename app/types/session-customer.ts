export type SessionAddress = {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  zip?: string | null;
};

export type SessionOrderLineItem = {
  title: string;
  quantity: number;
};

export type SessionOrderSummary = {
  id: string;
  name: string;
  orderNumber: number | null;
  processedAt: string | null;
  totalAmount: string;
  totalCurrency: string;
  fulfillmentStatus: string;
  financialStatus: string | null;
  lineItems: SessionOrderLineItem[];
};

export type SessionCustomer = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  /** How this session was authenticated (Storefront token vs Customer Account OAuth). */
  authSource: "storefront" | "customer_account";
  phone?: string | null;
  numberOfOrders?: string | null;
  createdAt?: string | null;
  defaultAddress?: SessionAddress | null;
  recentOrders?: SessionOrderSummary[];
};
