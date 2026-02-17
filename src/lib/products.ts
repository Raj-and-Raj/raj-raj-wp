import {
  fetchCategories,
  fetchCategoryBySlug,
  fetchProductBySlug,
  fetchProductById,
  fetchProducts,
  fetchProductVariations,
} from "./woocommerce";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  categorySlug: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  sku?: string;
  stockStatus?: string;
  stockQuantity?: number | null;
  backorders?: string;
  dimensions?: { length?: string; width?: string; height?: string };
  weight?: string;
  categories?: Array<{ name: string; slug: string }>;
  tagItems?: Array<{ name: string; slug: string }>;
  material: string;
  tagLabels: string[];
  isFeatured?: boolean;
  image?: string;
  images?: string[];
  type?: string;
  attributes?: Array<{
    name: string;
    variation: boolean;
    options: string[];
  }>;
  variations?: Array<{
    id: number;
    image?: string;
    attributes: Array<{ name: string; option: string }>;
    price?: number;
    regularPrice?: number;
    salePrice?: number;
    onSale?: boolean;
  }>;
  acf?: {
    introDescription?: string;
    qualityAssurance?: string;
    warrantySupport?: string;
    dimensionsSpecifications?: string;
  };
};

const fallbackProducts: Product[] = [
  {
    id: "rr-101",
    slug: "santorini-lounge-chair",
    name: "Santorini Lounge Chair",
    description:
      "Low-slung comfort with sculpted oak arms and linen blend upholstery.",
    category: "Seating",
    categorySlug: "seating",
    price: 28500,
    material: "Oak + Linen",
    tagLabels: ["signature", "soft"],
    isFeatured: true,
    images: [],
  },
  {
    id: "rr-102",
    slug: "verve-dining-table",
    name: "Verve Dining Table",
    description: "Monolithic surface with clean cut edges and a matte finish.",
    category: "Dining",
    categorySlug: "dining",
    price: 52000,
    material: "Teak + Resin",
    tagLabels: ["bold", "best-seller"],
    isFeatured: true,
    images: [],
  },
  {
    id: "rr-103",
    slug: "halo-pendant-light",
    name: "Halo Pendant Light",
    description: "Architectural lighting tuned for warm, ambient glow.",
    category: "Lighting",
    categorySlug: "lighting",
    price: 18500,
    material: "Brass",
    tagLabels: ["ambient"],
    isFeatured: true,
    images: [],
  },
  {
    id: "rr-104",
    slug: "ridge-sideboard",
    name: "Ridge Sideboard",
    description: "Long profile storage with soft-close panels and deep grain.",
    category: "Storage",
    categorySlug: "storage",
    price: 64000,
    material: "Walnut",
    tagLabels: ["storage"],
    images: [],
  },
  {
    id: "rr-105",
    slug: "veil-area-rug",
    name: "Veil Area Rug",
    description: "Hand-tufted wool with a low, plush pile and shadow detail.",
    category: "Textiles",
    categorySlug: "textiles",
    price: 22000,
    material: "Wool",
    tagLabels: ["soft"],
    images: [],
  },
  {
    id: "rr-106",
    slug: "crest-console",
    name: "Crest Console",
    description: "Slim entry console with floating drawer and stone top.",
    category: "Entry",
    categorySlug: "entry",
    price: 29500,
    material: "Stone + Ash",
    tagLabels: ["entry"],
    images: [],
  },
];

const fallbackCategories = [
  { name: "Seating", slug: "seating" },
  { name: "Dining", slug: "dining" },
  { name: "Lighting", slug: "lighting" },
  { name: "Storage", slug: "storage" },
  { name: "Textiles", slug: "textiles" },
  { name: "Entry", slug: "entry" },
];

const hasWoo =
  process.env.WOOCOMMERCE_URL &&
  process.env.WOOCOMMERCE_CONSUMER_KEY &&
  process.env.WOOCOMMERCE_CONSUMER_SECRET;

export async function getFeaturedProducts() {
  if (!hasWoo) return fallbackProducts.filter((item) => item.isFeatured);
  const items = await fetchProducts();
  return items.slice(0, 6).map(mapWooProduct);
}

export async function getProducts(category?: string) {
  if (!hasWoo) {
    return category
      ? fallbackProducts.filter((item) => item.categorySlug === category)
      : fallbackProducts;
  }
  let categoryId: string | undefined;
  if (category) {
    const found = await fetchCategoryBySlug(category);
    if (!found) return [];
    categoryId = String(found.id);
  }
  const items = await fetchProducts({ category: categoryId });
  return items.map(mapWooProduct);
}

export async function getProduct(slug: string) {
  if (!hasWoo) return fallbackProducts.find((item) => item.slug === slug);
  const item = await fetchProductBySlug(slug);
  if (!item) return undefined;
  const mapped: Product = mapWooProduct(item);
  if (item.type === "variable") {
    await applyVariationsToProduct(mapped, item.id);
  }
  return mapped;
}

export async function getCategories() {
  if (!hasWoo) return fallbackCategories;
  const items = await fetchCategories();
  return items.map((item) => ({ name: item.name, slug: item.slug }));
}

export async function getParentCategories() {
  if (!hasWoo) return fallbackCategories;
  const items = await fetchCategories({ parent: 0 });
  return items.map((item) => ({ name: item.name, slug: item.slug }));
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  if (!hasWoo) {
    return fallbackProducts.filter((item) => ids.includes(item.id));
  }
  const numericIds = ids
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
  if (!numericIds.length) return [];
  const items = await Promise.all(
    numericIds.map(async (id) => {
      try {
        return await fetchProductById(id);
      } catch {
        return null;
      }
    })
  );
  const filtered = items.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );
  const mapped = filtered.map(mapWooProduct);
  await Promise.all(
    mapped.map(async (product, idx) => {
      const item = filtered[idx];
      if (item?.type === "variable") {
        await applyVariationsToProduct(product, item.id);
      }
    })
  );
  return mapped;
}

async function applyVariationsToProduct(product: Product, productId: number) {
  const variations = await fetchProductVariations(productId);
  product.variations = variations.map((variation) => ({
    id: variation.id,
    image: variation.image?.src,
    price: variation.price ? Number(variation.price) : undefined,
    regularPrice: variation.regular_price
      ? Number(variation.regular_price)
      : undefined,
    salePrice: variation.sale_price ? Number(variation.sale_price) : undefined,
    onSale: variation.on_sale,
    attributes: variation.attributes.map((attr) => ({
      name: attr.name,
      option: attr.option,
    })),
  }));

  const regulars = product.variations
    .map((v) => v.regularPrice)
    .filter((v): v is number => typeof v === "number");
  const sales = product.variations
    .map((v) => v.salePrice)
    .filter((v): v is number => typeof v === "number" && v > 0);
  if (regulars.length) {
    product.regularPrice = Math.min(...regulars);
  }
  if (sales.length) {
    product.salePrice = Math.min(...sales);
  }
}

function mapWooProduct(item: {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  sku?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  backorders?: string;
  dimensions?: { length?: string; width?: string; height?: string };
  weight?: string;
  images: Array<{ src: string }>;
  categories: Array<{ name: string; slug: string }>;
  tags?: Array<{ name: string; slug: string }>;
  type?: string;
  attributes?: Array<{ name: string; variation: boolean; options: string[] }>;
  meta_data?: Array<{ key: string; value: unknown }>;
}): Product {
  const metaLookup = new Map(
    (item.meta_data ?? []).map((entry) => [entry.key, entry.value])
  );
  const getMeta = (key: string) => {
    const value = metaLookup.get(key);
    return typeof value === "string" ? value : undefined;
  };
  const category = item.categories?.[0];
  return {
    id: String(item.id),
    slug: item.slug,
    name: item.name,
    description: item.description,
    shortDescription: item.short_description,
    category: category?.name || "Collection",
    categorySlug: category?.slug || "collection",
    price: Number(item.price || item.sale_price || item.regular_price || 0),
    regularPrice: item.regular_price ? Number(item.regular_price) : undefined,
    salePrice: item.sale_price ? Number(item.sale_price) : undefined,
    sku: item.sku,
    stockStatus: item.stock_status,
    stockQuantity: item.stock_quantity ?? null,
    backorders: item.backorders,
    dimensions: item.dimensions,
    weight: item.weight,
    categories: item.categories?.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
    })),
    tagItems: item.tags?.map((tag) => ({ name: tag.name, slug: tag.slug })),
    material: "Wood + Textile",
    tagLabels: [],
    image: item.images?.[0]?.src,
    images: item.images?.map((image) => image.src) ?? [],
    type: item.type,
    attributes: item.attributes?.map((attr) => ({
      name: attr.name,
      variation: attr.variation,
      options: attr.options,
    })),
    acf: {
      introDescription: getMeta("intro_description"),
      qualityAssurance: getMeta("quality_assurance"),
      warrantySupport: getMeta("warranty_support"),
      dimensionsSpecifications: getMeta("dimensions_specifications"),
    },
  };
}
