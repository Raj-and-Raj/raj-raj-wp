import { CategoryPageClient } from "@/components/site/category-page-client";
import { getProducts } from "@/lib/products";

type CategoryPageProps = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.slug;
  const products = await getProducts(slug);
  const displayName = slug.replace(/-/g, " ");

  return <CategoryPageClient displayName={displayName} products={products} />;
}
