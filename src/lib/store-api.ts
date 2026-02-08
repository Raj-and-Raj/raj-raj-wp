const wordpressUrl = process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL;
export const STORE_API_NONCE_COOKIE = "wc_store_nonce";
export const STORE_API_CART_TOKEN_COOKIE = "wc_cart_token";

export function getStoreApiUrl(path: string) {
  if (!wordpressUrl) {
    throw new Error("Missing WORDPRESS_URL env var");
  }
  return `${wordpressUrl}/wp-json/wc/store/${path}`;
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
  headers: Record<string, string> = {}
) {
  const cookie = request.headers.get("cookie") ?? "";
  const nonce = readCookieValue(cookie, STORE_API_NONCE_COOKIE);
  const cartToken = readCookieValue(cookie, STORE_API_CART_TOKEN_COOKIE);
  return {
    ...headers,
    cookie,
    ...(nonce ? { "X-WC-Store-API-Nonce": nonce } : {}),
    ...(cartToken ? { "Cart-Token": cartToken } : {}),
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
