import { NextResponse } from "next/server";

const wordpressUrl = process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL;
export const STORE_API_NONCE_COOKIE = "wc_store_nonce";
export const STORE_API_CART_TOKEN_COOKIE = "wc_cart_token";
const AUTH_TOKEN_COOKIE = "wp_token";

export function getStoreApiUrl(path: string) {
  if (!wordpressUrl) {
    throw new Error("Missing WORDPRESS_URL env var");
  }
  return `${wordpressUrl.trim()}/wp-json/wc/store/v1/${path}`;
}

function readCookieValue(cookieHeader: string, name: string) {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

export function getStoreApiRequestHeaders(
  request: Request,
  headers: Record<string, string> = {},
  { withAuth = true }: { withAuth?: boolean } = {}
) {
  const cookie = request.headers.get("cookie") ?? "";
  const nonce = readCookieValue(cookie, STORE_API_NONCE_COOKIE);
  const cartToken = readCookieValue(cookie, STORE_API_CART_TOKEN_COOKIE);
  // Forward the signed-in WordPress user so orders are attached to their
  // account instead of being created as guest orders.
  const authToken = withAuth
    ? readCookieValue(cookie, AUTH_TOKEN_COOKIE)
    : undefined;
  return {
    ...headers,
    cookie,
    ...(nonce ? { "X-WC-Store-API-Nonce": nonce } : {}),
    ...(cartToken ? { "Cart-Token": cartToken } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}

export function getStoreApiSetCookies(res: Response) {
  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];
  if (setCookies.length === 0) {
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) setCookies.push(setCookie);
  }
  return setCookies;
}

export function getStoreApiNonce(res: Response) {
  return (
    res.headers.get("x-wc-store-api-nonce") ??
    res.headers.get("X-WC-Store-API-Nonce")
  );
}

export function getStoreApiCartToken(res: Response) {
  return res.headers.get("cart-token") ?? res.headers.get("Cart-Token");
}

function errorCode(status: number, data: unknown) {
  if (status !== 401 && status !== 403) return "";
  const code = (data as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : "";
}

function sessionCookies(nonce: string | null, cartToken: string | null) {
  const cookies: string[] = [];
  if (nonce) {
    cookies.push(
      `${STORE_API_NONCE_COOKIE}=${encodeURIComponent(nonce)}; Path=/; SameSite=Lax`
    );
  }
  if (cartToken) {
    cookies.push(
      `${STORE_API_CART_TOKEN_COOKIE}=${encodeURIComponent(
        cartToken
      )}; Path=/; SameSite=Lax`
    );
  }
  return cookies;
}

/**
 * Proxies a request to the WooCommerce Store API, forwarding the cart
 * session (cookies, nonce, cart token) and the signed-in user, and passing
 * the refreshed session cookies back to the browser.
 */
export async function proxyStoreApi(
  request: Request,
  path: string,
  init: { method?: string; body?: unknown } = {}
) {
  const method = init.method ?? "GET";
  let withAuth = true;
  let session: Record<string, string> = {};
  const setCookies: string[] = [];

  const send = (url: string, sendMethod: string, body?: unknown) =>
    fetch(url, {
      method: sendMethod,
      headers: {
        ...getStoreApiRequestHeaders(
          request,
          body === undefined ? {} : { "Content-Type": "application/json" },
          { withAuth }
        ),
        ...session,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });

  const collect = (res: Response) => {
    setCookies.push(...getStoreApiSetCookies(res));
    const nonce = getStoreApiNonce(res);
    const cartToken = getStoreApiCartToken(res);
    setCookies.push(...sessionCookies(nonce, cartToken));
    return { nonce, cartToken };
  };

  let res = await send(getStoreApiUrl(path), method, init.body);
  let data = await res.json().catch(() => ({}));

  // An expired login token makes WordPress reject every REST call; fall back
  // to the guest cart rather than breaking the cart for that visitor.
  if (errorCode(res.status, data).startsWith("jwt_auth")) {
    withAuth = false;
    res = await send(getStoreApiUrl(path), method, init.body);
    data = await res.json().catch(() => ({}));
  }

  // First write on a fresh visit has no nonce/cart token yet: start a cart
  // session, then retry once with it.
  const code = errorCode(res.status, data);
  if (
    method !== "GET" &&
    (code === "woocommerce_rest_missing_nonce" ||
      code === "woocommerce_rest_invalid_nonce")
  ) {
    const sessionRes = await send(getStoreApiUrl("cart"), "GET");
    const { nonce, cartToken } = collect(sessionRes);
    session = {
      ...(nonce ? { "X-WC-Store-API-Nonce": nonce } : {}),
      ...(cartToken ? { "Cart-Token": cartToken } : {}),
    };
    res = await send(getStoreApiUrl(path), method, init.body);
    data = await res.json().catch(() => ({}));
  }

  collect(res);
  const response = NextResponse.json(data, { status: res.status });
  setCookies.forEach((cookie) => response.headers.append("set-cookie", cookie));
  return response;
}
