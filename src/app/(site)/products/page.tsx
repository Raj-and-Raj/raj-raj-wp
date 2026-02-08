import { CategoryPageClient } from "@/components/site/category-page-client";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <CategoryPageClient displayName="All Products" products={products} />
  );
}
