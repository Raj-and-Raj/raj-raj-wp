import { CategoryFilters } from "@/components/site/category-filters";
import { SectionHeading } from "@/components/site/section-heading";
import { getProducts } from "@/lib/products";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const products = await getProducts(resolvedParams.slug);

  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Category"
        title={`Explore ${resolvedParams.slug.replace(/-/g, " ")}`}
        description="Layer textures, contrast materials, and build your modern room palette."
      />
      <CategoryFilters products={products} />
    </div>
  );
}
