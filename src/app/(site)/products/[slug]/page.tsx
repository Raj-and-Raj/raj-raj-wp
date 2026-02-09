import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/products";
import { uploadsUrl } from "@/lib/uploads";
import { ProductDetailClient } from "@/components/site/product-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const title = `${product.name} | Raj & Raj`;
  const description =
    product.shortDescription?.replace(/<[^>]+>/g, "").trim() ||
    product.description?.replace(/<[^>]+>/g, "").trim() ||
    `Shop ${product.name} at Raj & Raj.`;
  const image = product.image || product.images?.[0];
  const url = `/products/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

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
    uploadsUrl("2026/02/Popular-categories.jpg.jpeg");
  const secondImage =
    images[1] ||
    product.image ||
    uploadsUrl("2026/02/Popular-categories.jpg.jpeg");

  return (
    <div className="mx-auto w-full ">
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
