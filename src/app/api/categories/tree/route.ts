import { getCategoryTree } from "@/lib/products";

export async function GET() {
  try {
    const categories = await getCategoryTree();
    return Response.json(categories);
  } catch (error) {
    console.error("Failed to load category tree", error);
    return Response.json([], { status: 200 });
  }
}
