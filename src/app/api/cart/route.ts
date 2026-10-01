import { proxyStoreApi } from "@/lib/store-api";

export async function GET(request: Request) {
  return proxyStoreApi(request, "cart");
}
