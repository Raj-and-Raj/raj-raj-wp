"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type CartItem = {
  key: string;
  name: string;
  quantity: number;
  prices?: { price?: number | string };
  images?: Array<{ id?: number; src?: string; thumbnail?: string }>;
};

type CartTotals = {
  total_items?: number | string;
  subtotal?: number | string;
  total?: number | string;
  total_price?: number | string;
};

type Cart = {
  items?: CartItem[];
  totals?: CartTotals;
};

type MiniCartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MiniCartDrawer({ open, onClose }: MiniCartDrawerProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);

  const toCents = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    return 0;
  };

  const loadCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      setCart(await res.json());
    }
  };

  const updateItem = async (key: string, quantity: number) => {
    await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, quantity }),
    });
    loadCart();
  };

  const removeItem = async (key: string) => {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    loadCart();
  };

  useEffect(() => {
    if (!open) return;
    loadCart();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = () => {
      fetch("/api/cart")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setCart(data);
        });
    };
    window.addEventListener("cart:updated", handler);
    return () => window.removeEventListener("cart:updated", handler);
  }, [open]);

  const subtotalCents = toCents(
    cart?.totals?.total_items ?? cart?.totals?.subtotal ?? cart?.totals?.total
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h3 className="text-lg font-semibold">Mini cart</h3>
          <button
            onClick={onClose}
            className="text-sm text-[color:var(--muted)]"
          >
            Close
          </button>
        </div>
        <div className="flex h-[calc(100%-64px)] flex-col">
          <div className="flex-1 overflow-auto px-6 py-4">
            {!cart || !cart.items?.length ? (
              <p className="text-sm text-[color:var(--muted)]">
                Cart is empty.
              </p>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-4 rounded-[12px] border border-black/5 bg-white/95 p-3 text-sm"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-[12px] bg-[#f1ece4]">
                      {item.images?.[0]?.thumbnail || item.images?.[0]?.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.images?.[0]?.thumbnail || item.images?.[0]?.src}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            className="h-7 w-7 rounded-[10px] border border-black/10"
                            onClick={() =>
                              item.quantity > 1
                                ? updateItem(item.key, item.quantity - 1)
                                : removeItem(item.key)
                            }
                          >
                            -
                          </button>
                          <span className="text-xs">{item.quantity}</span>
                          <button
                            className="h-7 w-7 rounded-[10px] border border-black/10"
                            onClick={() => updateItem(item.key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(Number(item.prices?.price ?? 0) / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-black/5 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents / 100)}</span>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => router.push("/cart")}
            >
              Go to cart
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
