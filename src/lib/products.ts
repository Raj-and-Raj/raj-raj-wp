import { fetchCategories, fetchProductBySlug, fetchProducts } from "./woocommerce";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  price: number;
  material: string;
  tags: string[];
  isFeatured?: boolean;
  image?: string;
  images?: string[];
  type?: string;
  attributes?: Array<{
    name: string;
    variation: boolean;
    options: string[];
  }>;
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
    tags: ["signature", "soft"],
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
    tags: ["bold", "best-seller"],
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
    tags: ["ambient"],
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
    tags: ["storage"],
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
    tags: ["soft"],
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
    tags: ["entry"],
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
  const items = await fetchProducts({ category });
  return items.map(mapWooProduct);
}

export async function getProduct(slug: string) {
  if (!hasWoo) return fallbackProducts.find((item) => item.slug === slug);
  const item = await fetchProductBySlug(slug);
  return item ? mapWooProduct(item) : undefined;
}

export async function getCategories() {
  if (!hasWoo) return fallbackCategories;
  const items = await fetchCategories();
  return items.map((item) => ({ name: item.name, slug: item.slug }));
}

function mapWooProduct(item: {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  images: Array<{ src: string }>;
  categories: Array<{ name: string; slug: string }>;
}) {
  const category = item.categories?.[0];
  return {
    id: String(item.id),
    slug: item.slug,
    name: item.name,
    description: item.short_description || item.description,
    category: category?.name || "Collection",
    categorySlug: category?.slug || "collection",
    price: Number(item.price || 0),
    material: "Wood + Textile",
    tags: [],
    image: item.images?.[0]?.src,
    images: item.images?.map((image) => image.src) ?? [],
    type: item.type,
    attributes: item.attributes?.map((attr) => ({
      name: attr.name,
      variation: attr.variation,
      options: attr.options,
    })),
  } satisfies Product;
}
