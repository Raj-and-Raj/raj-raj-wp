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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const body = await request.json();
  const resolvedParams = await params;
  const res = await fetch(getStoreApiUrl(`checkout/${resolvedParams.orderId}`), {
    method: "POST",
    headers: getStoreApiRequestHeaders(request, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
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
