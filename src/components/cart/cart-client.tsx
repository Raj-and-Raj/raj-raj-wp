"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export function CartClient() {
  const [cart, setCart] = useState<any>(null);
  const [coupon, setCoupon] = useState("");

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

  useEffect(() => {
    loadCart();
  }, []);

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

  const applyCoupon = async () => {
    if (!coupon) return;
    await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    setCoupon("");
    loadCart();
  };

  if (!cart) {
    return <p className="text-sm text-[color:var(--muted)]">Loading...</p>;
  }

  const itemsCount =
    cart.items?.reduce(
      (sum: number, item: any) => sum + (item.quantity ?? 0),
      0
    ) ?? 0;
  const subtotalCents = toCents(
    cart.totals?.total_items ?? cart.totals?.subtotal ?? cart.totals?.total
  );
  const taxCents = toCents(cart.totals?.total_tax);
  const totalCents = toCents(
    cart.totals?.total_price ?? cart.totals?.total ?? subtotalCents + taxCents
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.items?.length ? (
            cart.items.map((item: any) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-[12px] border border-black/5 bg-white/95 p-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {formatPrice(item.prices?.price / 100)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 w-8 rounded-[12px] border border-black/10"
                    onClick={() => updateItem(item.key, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="h-8 w-8 rounded-[12px] border border-black/10"
                    onClick={() => updateItem(item.key, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="text-xs text-red-500"
                    onClick={() => removeItem(item.key)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[color:var(--muted)]">Cart is empty.</p>
          )}
        </div>
        <div className="rounded-[12px] border border-black/5 bg-white/95 p-4">
          <p className="text-sm font-semibold">Summary</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{itemsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents / 100)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{formatPrice(taxCents / 100)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalCents / 100)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Coupon code"
              className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
            />
            <Button onClick={applyCoupon} size="sm">
              Apply
            </Button>
          </div>
          <Button className="mt-6 w-full" onClick={() => (window.location.href = "/checkout")}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
