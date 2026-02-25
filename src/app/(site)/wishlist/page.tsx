"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import { useCartIds } from "@/lib/cart-client";

type RowState = {
  checked: boolean;
  quantity: number;
};
type VariantSelection = Record<string, string>;

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [variantSelections, setVariantSelections] = useState<
    Record<string, VariantSelection>
  >({});
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>(
    {},
  );
  const { toast } = useToast();
  const cartIds = useCartIds();

  const selectedIds = useMemo(
    () =>
      Object.entries(rowState)
        .filter(([, state]) => state.checked)
        .map(([id]) => id),
    [rowState],
  );

  const loadWishlist = async () => {
    const stored = localStorage.getItem("wishlist");
    if (!stored) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let ids: string[] = [];
    try {
      ids = JSON.parse(stored) as string[];
    } catch {
      ids = [];
    }
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`,
      );
      if (!res.ok) {
        setProducts([]);
      } else {
        const data = (await res.json()) as Product[];
        setProducts(data);
        setRowState((prev) => {
          const next = { ...prev };
          data.forEach((product) => {
            if (!next[product.id]) {
              next[product.id] = { checked: false, quantity: 1 };
            }
          });
          return next;
        });
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeFromWishlist = (productId: string) => {
    const stored = localStorage.getItem("wishlist");
    let ids: string[] = [];
    if (stored) {
      try {
        ids = JSON.parse(stored) as string[];
      } catch {
        ids = [];
      }
    }
    const nextIds = ids.filter((id) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(nextIds));
    window.dispatchEvent(new Event("wishlist:updated"));
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setRowState((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    toast({
      title: "Removed from wishlist",
      description: "Item removed from your wishlist.",
      variant: "success",
      position: "left",
    });
  };

  const addSelectedToCart = async () => {
    const selected = products.filter((product) =>
      selectedIds.includes(product.id),
    );
    if (!selected.length) return;
    for (const product of selected) {
      if (cartIds.includes(product.id)) {
        continue;
      }
      if (
        product.type === "variable" &&
        !hasCompleteSelection(product, variantSelections[product.id] ?? {})
      ) {
        toast({
          title: "Select variant",
          description: "Please choose a variant before adding to cart.",
          position: "left",
        });
        continue;
      }
      const qty = rowState[product.id]?.quantity ?? 1;
      const selection = variantSelections[product.id] ?? {};
      const variationPayload = Object.entries(selection).map(
        ([attribute, value]) => ({ attribute, value }),
      );
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(product.id),
          quantity: qty,
          variation:
            product.type === "variable" && variationPayload.length
              ? variationPayload
              : undefined,
        }),
      });
    }
    window.dispatchEvent(new Event("cart:updated"));
    toast({
      title: "Added to cart",
      description: "Selected items have been added to your cart.",
      variant: "success",
      position: "left",
    });
  };

  const buyNowSelected = async () => {
    await addSelectedToCart();
    router.push("/cart");
  };

  const getVariationAttributes = (product: Product) =>
    product.attributes?.filter((attr) => attr.variation) ?? [];

  const getAttributeOptions = (product: Product, name: string) => {
    const fromVariations =
      product.variations
        ?.flatMap((variation) =>
          variation.attributes
            .filter((attr) => attr.name === name)
            .map((attr) => attr.option),
        )
        .filter(Boolean) ?? [];
    const fromProduct =
      product.attributes?.find((attr) => attr.name === name)?.options ?? [];
    const combined = [...fromVariations, ...fromProduct];
    return Array.from(new Set(combined));
  };

  const hasCompleteSelection = (
    product: Product,
    selection: VariantSelection,
  ) => getVariationAttributes(product).every((attr) => selection[attr.name]);

  const findMatchingVariation = (
    product: Product,
    selection: VariantSelection,
  ) =>
    product.variations?.find((variation) =>
      variation.attributes.every(
        (attr) => selection[attr.name] === attr.option,
      ),
    );

  return (
    <div className="space-y-8 container mx-auto pt-32 mb-24">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--ink)]">
          Wishlist
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Products you’ve saved for later.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : products.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-black/5 bg-white/90 p-4">
            <div className="text-sm text-[color:var(--muted)]">
              {selectedIds.length} selected
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addSelectedToCart}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[color:var(--muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                Add to cart
              </button>
              <button
                onClick={buyNowSelected}
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                Buy now
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white/90">
            <div className="grid grid-cols-[40px_1.4fr_0.5fr_0.7fr_0.7fr] gap-4 border-b border-black/5 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
              <span />
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Actions</span>
            </div>
            {products.map((product) => {
              const state = rowState[product.id] ?? {
                checked: false,
                quantity: 1,
              };
              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[40px_1.4fr_0.5fr_0.7fr_0.7fr] items-center gap-4 border-b border-black/5 px-6 py-4 text-sm last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={state.checked}
                    onChange={(event) =>
                      setRowState((prev) => ({
                        ...prev,
                        [product.id]: {
                          ...state,
                          checked: event.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                  />

                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#f1ece4]">
                      {imageOverrides[product.id] || product.image ? (
                        <Image
                          src={imageOverrides[product.id] || product.image!}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-semibold text-[color:var(--ink)] hover:text-[color:var(--brand)]"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-[color:var(--muted)]">
                        {product.category}
                      </p>
                      {product.type === "variable" &&
                      getVariationAttributes(product).length ? (
                        <div className="mt-2 grid gap-2">
                          {getVariationAttributes(product).map((attr) => (
                            <label key={attr.name} className="text-xs">
                              <span className="text-[color:var(--muted)]">
                                {attr.name}
                              </span>
                              <select
                                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2 py-1 text-xs"
                                value={
                                  variantSelections[product.id]?.[attr.name] ??
                                  ""
                                }
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setVariantSelections((prev) => {
                                    const next = {
                                      ...(prev[product.id] ?? {}),
                                      [attr.name]: value,
                                    };
                                    return { ...prev, [product.id]: next };
                                  });
                                  const selection = {
                                    ...(variantSelections[product.id] ?? {}),
                                    [attr.name]: value,
                                  };
                                  const match = findMatchingVariation(
                                    product,
                                    selection,
                                  );
                                  if (match?.image) {
                                    setImageOverrides((prev) => ({
                                      ...prev,
                                      [product.id]: match.image as string,
                                    }));
                                  }
                                }}
                              >
                                <option value="">Select {attr.name}</option>
                                {getAttributeOptions(product, attr.name).map(
                                  (option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ),
                                )}
                              </select>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="font-semibold text-[color:var(--brand)]">
                    {formatPrice(product.price)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setRowState((prev) => ({
                          ...prev,
                          [product.id]: {
                            ...state,
                            quantity: Math.max(1, state.quantity - 1),
                          },
                        }))
                      }
                      className="h-8 w-8 rounded-full border border-black/10 text-[color:var(--muted)]"
                    >
                      -
                    </button>
                    <span className="min-w-[24px] text-center">
                      {state.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setRowState((prev) => ({
                          ...prev,
                          [product.id]: {
                            ...state,
                            quantity: state.quantity + 1,
                          },
                        }))
                      }
                      className="h-8 w-8 rounded-full border border-black/10 text-[color:var(--muted)]"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        if (
                          product.type === "variable" &&
                          !hasCompleteSelection(
                            product,
                            variantSelections[product.id] ?? {},
                          )
                        ) {
                          toast({
                            title: "Select variant",
                            description:
                              "Please choose a variant before adding to cart.",
                          });
                          return;
                        }
                        if (cartIds.includes(product.id)) {
                          toast({
                            title: "Already in cart",
                            description: "This item is already in your cart.",
                            position: "left",
                          });
                          return;
                        }
                        const selection = variantSelections[product.id] ?? {};
                        const variationPayload = Object.entries(selection).map(
                          ([attribute, value]) => ({ attribute, value }),
                        );
                        await fetch("/api/cart/add", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: Number(product.id),
                            quantity: state.quantity,
                            variation:
                              product.type === "variable" &&
                              variationPayload.length
                                ? variationPayload
                                : undefined,
                          }),
                        });
                        window.dispatchEvent(new Event("cart:updated"));
                        toast({
                          title: "Added to cart",
                          description: "Item has been added to your cart.",
                          variant: "success",
                          position: "left",
                        });
                      }}
                      disabled={cartIds.includes(product.id)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                        cartIds.includes(product.id)
                          ? "cursor-not-allowed border-black/5 text-gray-400"
                          : product.type === "variable" &&
                              !hasCompleteSelection(
                                product,
                                variantSelections[product.id] ?? {},
                              )
                            ? "border-gray-200 bg-gray-100 text-gray-500"
                            : "border-black/10 text-[color:var(--muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                      }`}
                    >
                      {cartIds.includes(product.id)
                        ? "Already in cart"
                        : "Add to cart"}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="rounded-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white/90 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.8 4.6C20.3 4.1 19.7 3.7 19.1 3.4C18.4 3.1 17.7 3 17 3C16.2 3 15.5 3.1 14.8 3.4C14.2 3.7 13.6 4.1 13.1 4.6L12 5.7L10.9 4.6C9.9 3.6 8.5 3 7.1 3C5.6 3 4.2 3.6 3.2 4.6C2.1 5.6 1.5 7 1.5 8.5C1.5 10 2.1 11.4 3.2 12.4L4.2 13.4L12 21.2L19.8 13.4L20.8 12.4C21.8 11.4 22.5 10 22.5 8.5C22.5 7 21.8 5.6 20.8 4.6Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-[color:var(--ink)]">
            Wishlist is empty
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Save your favorites to revisit them anytime.
          </p>
          <button
            className="mt-4 rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
            onClick={() => router.push("/products")}
          >
            Browse products
          </button>
        </div>
      )}
    </div>
  );
}
