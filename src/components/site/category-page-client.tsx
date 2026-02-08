"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Heart, SlidersHorizontal } from "lucide-react";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

type CategoryPageClientProps = {
  displayName: string;
  products: Product[];
};

export function CategoryPageClient({
  displayName,
  products,
}: CategoryPageClientProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange] = useState<[number, number]>([12490, 31290]);

  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
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
              <label className="group flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#DA3234] focus:ring-[#DA3234]"
                  checked
                  readOnly
                />
                <span className="text-gray-700 transition-colors group-hover:text-[#DA3234]">
                  Wardrobes
                </span>
              </label>
              <div className="space-y-2 pl-6 text-sm text-gray-500">
                <label className="flex cursor-pointer items-center gap-2 hover:text-[#DA3234]">
                  <span className="h-2 w-2 rounded-full border border-gray-400" />
                  1-Door Wardrobes
                </label>
                <label className="flex cursor-pointer items-center gap-2 hover:text-[#DA3234]">
                  <span className="h-2 w-2 rounded-full border border-gray-400" />
                  2-Door Wardrobes
                </label>
                <label className="flex cursor-pointer items-center gap-2 hover:text-[#DA3234]">
                  <span className="h-2 w-2 rounded-full border border-gray-400" />
                  3-Door Wardrobes
                </label>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold">Price</h3>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="50000"
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#DA3234]"
              />
              <div className="mt-4 flex justify-between text-xs font-medium text-gray-600">
                <span>{formatPrice(priceRange[0])}</span>
                <span>-</span>
                <span>{formatPrice(priceRange[1])}</span>
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
          <div className="mb-8 flex flex-col items-center justify-between border-b border-gray-100 pb-4 md:flex-row">
            <p className="mb-4 text-sm text-gray-500 md:mb-0">
              Showing 1-{products.length} of {products.length} results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="cursor-pointer border-none bg-transparent text-sm font-bold text-gray-900 focus:ring-0">
                <option>Default</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}

                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-sm opacity-0 transition-opacity hover:bg-[#DA3234] hover:text-white group-hover:opacity-100"
                    onClick={(event) => event.preventDefault()}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="text-lg font-medium text-gray-900 transition-colors group-hover:text-[#DA3234]">
                      {product.name}
                    </h3>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {product.description}
                  </p>
                  <div className="flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="h-3 w-3 rounded-full border border-gray-200 bg-[#DA3234]" />
                    <div className="h-3 w-3 rounded-full border border-gray-200 bg-blue-800" />
                    <div className="h-3 w-3 rounded-full border border-gray-200 bg-gray-800" />
                  </div>
                </div>
              </Link>
            ))}
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
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#DA3234] focus:ring-[#DA3234]"
                    checked
                    readOnly
                  />
                  <span className="text-gray-700">Wardrobes</span>
                </label>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Price
                </h4>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#DA3234]"
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
