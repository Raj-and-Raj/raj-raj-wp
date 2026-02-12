"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import { useCartIds } from "@/lib/cart-client";

type RowState = {
  checked: boolean;
  quantity: number;
};

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const { toast } = useToast();
  const cartIds = useCartIds();

  const selectedIds = useMemo(
    () =>
      Object.entries(rowState)
        .filter(([, state]) => state.checked)
        .map(([id]) => id),
    [rowState]
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
        `/api/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`
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
  };

  const addSelectedToCart = async () => {
    const selected = products.filter((product) =>
      selectedIds.includes(product.id)
    );
    if (!selected.length) return;
    for (const product of selected) {
      if (cartIds.includes(product.id)) {
        continue;
      }
      const qty = rowState[product.id]?.quantity ?? 1;
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(product.id),
          quantity: qty,
        }),
      });
    }
    window.dispatchEvent(new Event("cart:updated"));
    toast({
      title: "Added to cart",
      description: "Selected items have been added to your cart.",
      variant: "success",
    });
  };

  const buyNowSelected = async () => {
    await addSelectedToCart();
    router.push("/cart");
  };

  return (
    <div className="space-y-8 pt-32">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--ink)]">
          Wishlist
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Products you’ve saved for later.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-black/5 bg-white/90 p-8 text-sm text-[color:var(--muted)]">
          Loading wishlist...
        </div>
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
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--ink)]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {product.category}
                      </p>
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
                        if (cartIds.includes(product.id)) {
                          toast({
                            title: "Already in cart",
                            description: "This item is already in your cart.",
                          });
                          return;
                        }
                        await fetch("/api/cart/add", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: Number(product.id),
                            quantity: state.quantity,
                          }),
                        });
                        window.dispatchEvent(new Event("cart:updated"));
                        toast({
                          title: "Added to cart",
                          description: "Item has been added to your cart.",
                          variant: "success",
                        });
                      }}
                      disabled={cartIds.includes(product.id)}
                      className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-[color:var(--muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:border-black/5 disabled:text-gray-400 disabled:hover:text-gray-400"
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
        <div className="rounded-3xl border border-black/5 bg-white/90 p-8 text-sm text-[color:var(--muted)]">
          Your wishlist is empty.
        </div>
      )}
    </div>
  );
}
