import { proxyStoreApi } from "@/lib/store-api";

export async function GET(request: Request) {
  return proxyStoreApi(request, "checkout");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyStoreApi(request, "checkout", { method: "POST", body });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const url = new URL(request.url);
  const calcTotals = url.searchParams.get("__experimental_calc_totals");
  const query = calcTotals
    ? `?__experimental_calc_totals=${encodeURIComponent(calcTotals)}`
    : "";
  return proxyStoreApi(request, `checkout${query}`, { method: "PUT", body });
}
