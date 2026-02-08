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
};

type CartTotals = {
  total?: number | string;
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

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const res = await fetch("/api/cart");
      if (res.ok) {
        setCart(await res.json());
      }
    };
    load();
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
                    className="flex items-center justify-between rounded-[12px] border border-black/5 bg-white/95 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-[color:var(--muted)]">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm">
                      {formatPrice(Number(item.prices?.price ?? 0) / 100)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-black/5 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(Number(cart?.totals?.total ?? 0) / 100)}</span>
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
