"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  SlidersHorizontal,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

type CategoryPageClientProps = {
  displayName: string;
  products: Product[];
  categories: Array<{ name: string; slug: string }>;
  currentCategorySlug?: string;
};

export function CategoryPageClient({
  displayName,
  products,
  categories,
  currentCategorySlug,
}: CategoryPageClientProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const prices = useMemo(
    () => products.map((product) => product.price).filter((price) => price > 0),
    [products],
  );
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const [priceCap, setPriceCap] = useState(maxPrice || 0);
  const [sort, setSort] = useState("default");
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [variationSwatches, setVariationSwatches] = useState<
    Record<string, Array<{ label: string; image?: string }>>
  >({});
  const [hoverImage, setHoverImage] = useState<Record<string, string>>({});

  useEffect(() => {
    setPriceCap(maxPrice || 0);
  }, [maxPrice]);

  useEffect(() => {
    setVisibleCount(10);
  }, [priceCap, sort, products]);

  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (!stored) return;
    try {
      const ids = JSON.parse(stored) as string[];
      setWishlistIds(ids);
    } catch {
      setWishlistIds([]);
    }
  }, []);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const filteredProducts = useMemo(() => {
    let next = products.filter((product) => product.price <= priceCap);
    if (sort === "price-asc") {
      next = [...next].sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      next = [...next].sort((a, b) => b.price - a.price);
    }
    return next;
  }, [products, priceCap, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const totalVisible = Math.min(
    visibleProducts.length,
    filteredProducts.length,
  );

  const stripHtml = (value?: string) =>
    value ? value.replace(/<[^>]+>/g, "").trim() : "";

  const colorToHex = (value: string) => {
    const key = value.toLowerCase().replace(/\s+/g, "");
    const map: Record<string, string> = {
      chocolate: "#4e342e",
      coffee: "#6f4e37",
      indigo: "#3f51b5",
      purple: "#7b1fa2",
      winered: "#7b1e2b",
      rosepink: "#f7a3b5",
      nardogrey: "#9da3a6",
      grey: "#9e9e9e",
      gray: "#9e9e9e",
      black: "#111111",
      white: "#f5f5f5",
      red: "#c62828",
      blue: "#1e88e5",
      green: "#2e7d32",
      yellow: "#f9a825",
      orange: "#f57c00",
    };
    return map[key] || "#d1d5db";
  };

  const toggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(next));
      window.dispatchEvent(new Event("wishlist:updated"));
      return next;
    });
  };

  const addToCart = async (id: string) => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id), quantity: 1 }),
    });
    window.dispatchEvent(
      new CustomEvent("cart:updated", { detail: { open: true } }),
    );
  };

  useEffect(() => {
    const ids = visibleProducts
      .map((product) => product.id)
      .filter((id) => !variationSwatches[id]);
    if (!ids.length) return;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/products/variations?ids=${encodeURIComponent(ids.join(","))}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as Record<
          string,
          Array<{ label: string; image?: string }>
        >;
        setVariationSwatches((prev) => ({ ...prev, ...data }));
      } catch {
        return;
      }
    };
    load();
  }, [visibleProducts, variationSwatches]);

  return (
    <div className="min-h-screen  pb-4 pt-4">
      <div className="container mx-auto mb-8 px-4 md:px-8">
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#DA3234]">
            Home
          </Link>
          <span>/</span>
          <span className="capitalize">{displayName}</span>
        </div>
        <h1 className="text-4xl font-bold capitalize text-gray-900">
          {displayName}
        </h1>
      </div>

      <div className="container mx-auto flex flex-col gap-12 px-4 md:px-8 lg:flex-row">
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Clear All
              </h3>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 flex cursor-pointer items-center justify-between text-lg font-bold">
              Categories <ChevronDown className="h-4 w-4" />
            </h3>
            <div className="space-y-3 pl-2">
              {categories.map((category) => {
                const active = currentCategorySlug === category.slug;
                return (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="group flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={active}
                      readOnly
                    />
                    <span className="brand-checkbox" />
                    <span className="text-gray-700 transition-colors group-hover:text-[#DA3234]">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold">Price</h3>
            <div className="px-2">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceCap}
                onChange={(event) => setPriceCap(Number(event.target.value))}
                className="brand-range"
              />
              <div className="mt-4 flex justify-between text-xs font-medium text-gray-600">
                <span>{formatPrice(minPrice)}</span>
                <span>-</span>
                <span>{formatPrice(priceCap || maxPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 lg:hidden">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded bg-gray-100 px-4 py-2 text-sm font-bold uppercase tracking-wide"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="flex-1">
          <div className="mb-6 flex flex-col items-center justify-between pb-2 md:flex-row">
            <p className="mb-4 text-sm text-gray-600 md:mb-0">
              Showing 1-{totalVisible} of {filteredProducts.length} results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="cursor-pointer border-none bg-transparent text-sm font-bold text-gray-900 focus:ring-0"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block rounded-3xl border border-black/5 bg-white/95 p-4 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3eee8]">
                  {hoverImage[product.id] || product.image ? (
                    <img
                      src={hoverImage[product.id] || product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <button
                    type="button"
                    className={`absolute right-4 top-4 rounded-full p-2 shadow-sm transition ${
                      wishlistIds.includes(product.id)
                        ? "bg-[color:var(--brand)] text-white"
                        : "bg-white text-[color:var(--muted)] opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      toggleWishlist(product.id);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--brand)]">
                      {product.name}
                    </h3>
                    <span className="text-sm font-semibold text-[color:var(--brand)]">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[color:var(--muted)]">
                    {stripHtml(product.shortDescription || product.description)}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {variationSwatches[product.id]?.length
                        ? variationSwatches[product.id]
                            .slice(0, 4)
                            .map((swatch) => (
                              <span
                                key={swatch.label}
                                title={swatch.label}
                                className="h-3.5 w-3.5 rounded-full border border-black/10 bg-center bg-no-repeat"
                                style={{
                                  backgroundImage: swatch.image
                                    ? `url(${swatch.image})`
                                    : undefined,
                                  backgroundSize: "cover",
                                }}
                                onMouseEnter={() => {
                                  if (swatch.image) {
                                    setHoverImage((prev) => ({
                                      ...prev,
                                      [product.id]: swatch.image as string,
                                    }));
                                  }
                                }}
                                onMouseLeave={() =>
                                  setHoverImage((prev) => {
                                    const next = { ...prev };
                                    delete next[product.id];
                                    return next;
                                  })
                                }
                              />
                            ))
                        : (
                            product.attributes
                              ?.find((attr) => {
                                const name = attr.name.toLowerCase();
                                return (
                                  name.includes("color") ||
                                  name.includes("colour")
                                );
                              })
                              ?.options.slice(0, 4) ?? ["Red", "Black", "Grey"]
                          ).map((option) => (
                            <span
                              key={option}
                              className="h-3.5 w-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: colorToHex(option) }}
                            />
                          ))}
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        addToCart(product.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div
            ref={loaderRef}
            className="py-10 text-center text-sm text-gray-500"
          >
            {visibleProducts.length < filteredProducts.length
              ? "Loading more products..."
              : ""}
          </div>
        </div>
      </div>

      {isMobileFilterOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 lg:hidden">
          <div className="w-full rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-sm font-semibold text-gray-500"
              >
                Close
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Categories
                </h4>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const active = currentCategorySlug === category.slug;
                    return (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="flex items-center gap-3"
                        onClick={() => setIsMobileFilterOpen(false)}
                      >
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={active}
                          readOnly
                        />
                        <span className="brand-checkbox" />
                        <span className="text-gray-700">{category.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Price
                </h4>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceCap}
                  onChange={(event) => setPriceCap(Number(event.target.value))}
                  className="brand-range"
                />
              </div>
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-6 w-full rounded bg-gray-900 py-3 text-sm font-bold uppercase tracking-wide text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
