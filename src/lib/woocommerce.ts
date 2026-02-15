export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  type?: string;
  attributes?: Array<{
    id: number;
    name: string;
    variation: boolean;
    options: string[];
  }>;
  variations?: number[];
  images: Array<{ id: number; src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
};

export type WooVariation = {
  id: number;
  image?: { src?: string };
  attributes: Array<{ name: string; option: string }>;
};

export type WooCustomer = {
  id: number;
  email: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
  };
  shipping?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
  };
};

export type WooShippingZone = {
  id: number;
  name: string;
};

export type WooShippingZoneLocation = {
  code: string;
  type: "postcode" | "country" | "state" | "continent";
};

const baseUrl = process.env.WOOCOMMERCE_URL;
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function withAuth(params: URLSearchParams) {
  if (consumerKey && consumerSecret) {
    params.set("consumer_key", consumerKey);
    params.set("consumer_secret", consumerSecret);
  }
  return params;
}

function authHeaders(): Record<string, string> {
  if (!consumerKey || !consumerSecret) return {};
  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );
  return { Authorization: `Basic ${token}` };
}

async function wooFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  if (!baseUrl) {
    throw new Error("Missing WOOCOMMERCE_URL env var");
  }

  const query = params ? `?${withAuth(params).toString()}` : "";
  const primaryUrl = `${baseUrl}/wp-json/wc/v3/${path}${query}`;
  const legacyUrl = `${baseUrl}/wc-api/v3/${path}${query}`;

  const res = await fetch(primaryUrl, {
    next: { revalidate: 60 },
    headers: { ...authHeaders() },
  });

  if (res.ok) {
    return res.json() as Promise<T>;
  }

  if (res.status === 404) {
    const legacyRes = await fetch(legacyUrl, {
      next: { revalidate: 60 },
      headers: { ...authHeaders() },
    });
    if (legacyRes.ok) {
      return legacyRes.json() as Promise<T>;
    }
    throw new Error(`WooCommerce request failed: ${legacyRes.status}`);
  }

  throw new Error(`WooCommerce request failed: ${res.status}`);
}

async function wooPost<T>(path: string, body: unknown): Promise<T> {
  if (!baseUrl) {
    throw new Error("Missing WOOCOMMERCE_URL env var");
  }
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing WooCommerce API keys");
  }

  const params = withAuth(new URLSearchParams());
  const res = await fetch(
    `${baseUrl}/wp-json/wc/v3/${path}?${params.toString()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce request failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

async function wooPut<T>(path: string, body: unknown): Promise<T> {
  if (!baseUrl) {
    throw new Error("Missing WOOCOMMERCE_URL env var");
  }
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing WooCommerce API keys");
  }

  const params = withAuth(new URLSearchParams());
  const res = await fetch(
    `${baseUrl}/wp-json/wc/v3/${path}?${params.toString()}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce request failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchProducts(params?: { category?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  return wooFetch<WooProduct[]>("products", query);
}

export async function fetchProductBySlug(slug: string) {
  const query = new URLSearchParams({ slug });
  const items = await wooFetch<WooProduct[]>("products", query);
  return items[0];
}

export async function fetchProductById(id: number) {
  return wooFetch<WooProduct>(`products/${id}`);
}

export async function fetchProductVariations(productId: number) {
  const query = new URLSearchParams();
  query.set("per_page", "100");
  return wooFetch<WooVariation[]>(`products/${productId}/variations`, query);
}

export async function fetchCategories(params?: {
  parent?: number;
  perPage?: number;
  slug?: string;
}) {
  const query = new URLSearchParams();
  query.set("per_page", String(params?.perPage ?? 100));
  if (typeof params?.parent === "number") {
    query.set("parent", String(params.parent));
  }
  if (params?.slug) {
    query.set("slug", params.slug);
  }
  return wooFetch<
    Array<{ id: number; name: string; slug: string; parent: number }>
  >("products/categories", query);
}

export async function fetchCategoryBySlug(slug: string) {
  const items = await fetchCategories({ slug, perPage: 100 });
  return items[0];
}

export async function fetchCustomerByEmail(email: string) {
  const query = new URLSearchParams({ email });
  const items = await wooFetch<WooCustomer[]>("customers", query);
  return items[0];
}

export async function fetchShippingZones() {
  return wooFetch<WooShippingZone[]>("shipping/zones");
}

export async function fetchShippingZoneLocations(zoneId: number) {
  return wooFetch<WooShippingZoneLocation[]>(`shipping/zones/${zoneId}/locations`);
}

export async function fetchOrdersByCustomer(customerId: number) {
  const query = new URLSearchParams({ customer: String(customerId) });
  return wooFetch<
    Array<{
      id: number;
      status: string;
      total: string;
      date_created: string;
    }>
  >("orders", query);
}

export async function fetchOrdersByEmail(email: string) {
  const query = new URLSearchParams();
  query.set("search", email);
  query.set("per_page", "20");
  // Some Woo setups accept email as a filter; harmless if ignored.
  query.set("email", email);
  return wooFetch<
    Array<{
      id: number;
      status: string;
      total: string;
      date_created: string;
    }>
  >("orders", query);
}

export async function fetchOrderById(orderId: number) {
  return wooFetch<{
    id: number;
    status: string;
    total: string;
    currency: string;
    date_created: string;
    billing: WooCustomer["billing"];
    shipping: WooCustomer["shipping"];
    line_items: Array<{
      id: number;
      name: string;
      quantity: number;
      total: string;
      price: number;
      sku?: string;
      variation_id?: number;
      image?: { src?: string };
      meta_data?: Array<{ key: string; value: string }>;
    }>;
  }>(`orders/${orderId}`);
}

export async function updateCustomer(
  customerId: number,
  input: {
    billing?: WooCustomer["billing"];
    shipping?: WooCustomer["shipping"];
  }
) {
  return wooPut<WooCustomer>(`customers/${customerId}`, input);
}

export async function createCustomer(input: {
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  password?: string;
}) {
  return wooPost<{ id: number; email: string }>("customers", input);
}
