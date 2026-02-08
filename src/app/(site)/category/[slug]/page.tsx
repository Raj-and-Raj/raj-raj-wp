import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/site/category-page-client";
import { getProducts } from "@/lib/products";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    notFound();
  }
  const products = await getProducts(slug);
  const displayName = slug.replace(/-/g, " ");

  return <CategoryPageClient displayName={displayName} products={products} />;
}
