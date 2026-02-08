import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Products"
        title="Everything for modern interiors"
        description="Minimalist furniture, layered lighting, and refined storage crafted for elevated living."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
