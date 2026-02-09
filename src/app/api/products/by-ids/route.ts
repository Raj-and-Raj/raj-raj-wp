import { getProductsByIds } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!ids.length) {
    return Response.json([]);
  }

  const products = await getProductsByIds(ids);
  return Response.json(products);
}
