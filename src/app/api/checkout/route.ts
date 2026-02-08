import { NextResponse } from "next/server";
import {
  STORE_API_CART_TOKEN_COOKIE,
  STORE_API_NONCE_COOKIE,
  getStoreApiCartToken,
  getStoreApiNonce,
  getStoreApiRequestHeaders,
  getStoreApiSetCookies,
  getStoreApiUrl,
} from "@/lib/store-api";

async function proxyCheckout(
  request: Request,
  init?: RequestInit,
  urlOverride?: string
) {
  const res = await fetch(urlOverride ?? getStoreApiUrl("checkout"), {
    ...init,
    headers: getStoreApiRequestHeaders(request, {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    }),
  });

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  getStoreApiSetCookies(res).forEach((cookie) =>
    response.headers.append("set-cookie", cookie)
  );
  const nonce = getStoreApiNonce(res);
  if (nonce) {
    response.headers.append(
      "set-cookie",
      `${STORE_API_NONCE_COOKIE}=${encodeURIComponent(
        nonce
      )}; Path=/; SameSite=Lax`
    );
  }
  const cartToken = getStoreApiCartToken(res);
  if (cartToken) {
    response.headers.append(
      "set-cookie",
      `${STORE_API_CART_TOKEN_COOKIE}=${encodeURIComponent(
        cartToken
      )}; Path=/; SameSite=Lax`
    );
  }
  return response;
}

export async function GET(request: Request) {
  return proxyCheckout(request, { method: "GET" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyCheckout(request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const url = new URL(request.url);
  const calcTotals = url.searchParams.get("__experimental_calc_totals");
  const query = calcTotals ? `?__experimental_calc_totals=${calcTotals}` : "";
  return proxyCheckout(
    request,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    getStoreApiUrl(`checkout${query}`)
  );
}
