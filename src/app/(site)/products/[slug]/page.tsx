import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/products";
import { ProductDetailClient } from "@/components/site/product-detail-client";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const related = allProducts
    .filter((item) => item.slug !== product.slug)
    .filter((item) => item.categorySlug === product.categorySlug)
    .slice(0, 3);
  const fallbackRelated = allProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const images = (product.images?.length ? product.images : undefined) ?? [];
  const heroImage =
    images[0] ||
    product.image ||
    "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg";
  const secondImage =
    images[1] ||
    product.image ||
    "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg";

  return (
    <div className="mx-auto w-full max-w-[96rem] px-6">
      <ProductDetailClient
        product={product}
        heroImage={heroImage}
        secondImage={secondImage}
        images={images.length ? images : [heroImage, secondImage]}
        related={related.length > 0 ? related : fallbackRelated}
      />
    </div>
  );
}