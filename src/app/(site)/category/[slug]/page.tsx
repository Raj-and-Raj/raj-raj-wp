import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/site/category-page-client";
import { getCategoryTree, getParentCategories, getProducts } from "@/lib/products";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    notFound();
  }
  const [products, categories, categoryTree] = await Promise.all([
    getProducts(slug),
    getParentCategories(),
    getCategoryTree(),
  ]);
  const currentNode = categoryTree.find((item) => item.slug === slug);
  const subcategories = currentNode?.children ?? [];
  const displayName = slug.replace(/-/g, " ");

  return (
    <CategoryPageClient
      displayName={displayName}
      products={products}
      categories={categories}
      subcategories={subcategories}
      currentCategorySlug={slug}
    />
  );
}
