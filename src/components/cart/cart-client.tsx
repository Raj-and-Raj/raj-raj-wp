"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type CartItem = {
  key: string;
  name: string;
  quantity: number;
  prices?: { price?: number | string };
  images?: Array<{ id?: number; src?: string; thumbnail?: string }>;
  variation?: Array<{ attribute: string; value: string }>;
  sku?: string;
};

type CartTotals = {
  total_items?: number | string;
  subtotal?: number | string;
  total?: number | string;
  total_tax?: number | string;
  total_price?: number | string;
};

type Cart = {
  items?: CartItem[];
  totals?: CartTotals;
  coupons?: Array<{ code?: string; discount?: string | number }>;
};

export function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  useEffect(() => {
    if (!couponSuccess) return;
    const timer = window.setTimeout(() => {
      setCouponSuccess("");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [couponSuccess]);

  const toCents = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    return 0;
  };

  const loadCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data: Cart = await res.json();
      setCart(data);
      const hasItems = (data.items?.length ?? 0) > 0;
      const couponCodes =
        data.coupons?.map((entry) => entry.code).filter(Boolean) ?? [];
      if (!hasItems && couponCodes.length) {
        await Promise.all(
          couponCodes.map((code) =>
            fetch("/api/cart/remove-coupon", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            }),
          ),
        );
        const refreshed = await fetch("/api/cart");
        if (refreshed.ok) {
          setCart(await refreshed.json());
        }
      }
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
    window.dispatchEvent(new Event("cart:updated"));
    loadCart();
  };

  const removeItem = async (key: string) => {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    window.dispatchEvent(new Event("cart:updated"));
    loadCart();
  };

  const applyCoupon = async () => {
    if (!coupon) return;
    setCouponError("");
    setCouponSuccess("");
    const res = await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCouponError(data?.message || "Unable to apply coupon.");
    } else {
      setCouponSuccess("Coupon applied successfully.");
    }
    setCoupon("");
    window.dispatchEvent(new Event("cart:updated"));
    loadCart();
  };

  const removeCoupon = async (code?: string) => {
    if (!code) return;
    await fetch("/api/cart/remove-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setCouponSuccess("");
    window.dispatchEvent(new Event("cart:updated"));
    loadCart();
  };

  if (!cart) {
    return <p className="text-sm text-[color:var(--muted)]">Loading...</p>;
  }

  const itemsCount =
    cart.items?.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    ) ?? 0;
  const itemsSubtotalCents =
    cart.items?.reduce((sum, item) => {
      const price = toCents(item.prices?.price);
      return sum + price * (item.quantity ?? 0);
    }, 0) ?? 0;

  const subtotalCentsRaw = toCents(cart.totals?.subtotal);
  const totalCentsRaw = toCents(cart.totals?.total_price ?? cart.totals?.total);

  const subtotalCents =
    subtotalCentsRaw > 0 ? subtotalCentsRaw : itemsSubtotalCents;
  const couponDiscountFromCoupons =
    cart.coupons?.reduce(
      (sum, entry) => sum + toCents(entry.discount),
      0,
    ) ?? 0;
  const derivedDiscountFromTotals = Math.max(
    0,
    subtotalCents - totalCentsRaw,
  );
  const derivedDiscountFromItems = Math.max(
    0,
    itemsSubtotalCents - subtotalCents,
  );
  const couponDiscountCents =
    couponDiscountFromCoupons > 0
      ? couponDiscountFromCoupons
      : derivedDiscountFromTotals > 0
        ? derivedDiscountFromTotals
        : derivedDiscountFromItems;
  const derivedTotalCents = Math.max(
    0,
    subtotalCents - couponDiscountCents,
  );
  const totalCents = totalCentsRaw > 0 ? totalCentsRaw : derivedTotalCents;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.items?.length ? (
            cart.items.map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-4 rounded-[16px] border border-black/5 bg-white/95 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-[14px] bg-[#f1ece4]">
                    {item.images?.[0]?.thumbnail || item.images?.[0]?.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.images?.[0]?.thumbnail || item.images?.[0]?.src}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.variation?.length ? (
                      <div className="mt-1 text-xs text-[color:var(--muted)]">
                        {item.variation.map((variant) => (
                          <span key={variant.attribute} className="mr-2">
                            {variant.attribute}: {variant.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {formatPrice(Number(item.prices?.price ?? 0) / 100)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
                    <button
                      className="h-8 w-8 rounded-full border border-black/10"
                      onClick={() => updateItem(item.key, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="min-w-[24px] text-center">{item.quantity}</span>
                    <button
                      className="h-8 w-8 rounded-full border border-black/10"
                      onClick={() => updateItem(item.key, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-xs font-semibold text-red-500"
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
            {cart.coupons?.length ? (
              <div className="rounded-[12px] border border-black/5 bg-white/80 p-3 text-xs">
                <p className="mb-2 font-semibold">Applied coupons</p>
                <div className="space-y-1">
                  {cart.coupons.map((entry) => (
                    <div key={entry.code} className="flex items-center justify-between">
                      <span className="uppercase">{entry.code}</span>
                      <button
                        className="text-[color:var(--brand)]"
                        onClick={() => removeCoupon(entry.code)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{itemsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents / 100)}</span>
            </div>
            {cart.coupons?.length || couponDiscountCents > 0 ? (
              <div className="flex items-center justify-between text-[color:var(--brand)]">
                <span>Coupon</span>
                <span>-{formatPrice(couponDiscountCents / 100)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalCents / 100)}</span>
            </div>
          </div>
          {couponDiscountCents > 0 ? (
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              You saved {formatPrice(couponDiscountCents / 100)} with coupons.
            </p>
          ) : null}
          {!cart.coupons?.length ? (
            <>
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
              {couponError ? (
                <p className="mt-2 text-xs text-red-500">{couponError}</p>
              ) : null}
              {couponSuccess ? (
                <p className="mt-2 text-xs text-emerald-600">{couponSuccess}</p>
              ) : null}
            </>
          ) : null}
          <Button className="mt-6 w-full" onClick={() => (window.location.href = "/checkout")}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
