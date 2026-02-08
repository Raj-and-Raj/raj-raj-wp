import { getParentCategories } from "@/lib/products";

export async function GET() {
  try {
    const categories = await getParentCategories();
    return Response.json(categories);
  } catch (error) {
    console.error("Failed to load parent categories", error);
    return Response.json([], { status: 200 });
  }
}
