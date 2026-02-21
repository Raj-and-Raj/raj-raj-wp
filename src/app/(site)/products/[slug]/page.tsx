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
    product.description?.replace(/<[^>]+>/g, "").trim() ||
    product.name?.replace(/<[^>]+>/g, "").trim() ||
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

  const productCategorySlugs = Array.from(
    new Set(
      product.categories?.map((cat) => cat.slug).filter(Boolean) ?? [
        product.categorySlug,
      ],
    ),
  );

  const relatedPools = await Promise.all(
    productCategorySlugs.map((slug) => getProducts(slug)),
  );
  const relatedMap = new Map<string, (typeof relatedPools)[number][number]>();
  relatedPools.flat().forEach((item) => {
    if (item.slug === product.slug) return;
    if (!relatedMap.has(item.id)) {
      relatedMap.set(item.id, item);
    }
  });
  const related = Array.from(relatedMap.values()).slice(0, 6);

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
        related={related}
      />
    </div>
  );
}
