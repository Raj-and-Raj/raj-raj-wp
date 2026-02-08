import { CategoryPageClient } from "@/components/site/category-page-client";
import { getParentCategories, getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getParentCategories();

  return (
    <CategoryPageClient
      displayName="All Products"
      products={products}
      categories={categories}
    />
  );
}
