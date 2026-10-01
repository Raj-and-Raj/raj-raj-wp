import { proxyStoreApi } from "@/lib/store-api";

export async function POST(request: Request) {
  const body = await request.json();
  return proxyStoreApi(request, "cart/apply-coupon", { method: "POST", body });
}
