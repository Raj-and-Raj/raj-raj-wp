"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";

type CartItem = {
  key: string;
  name: string;
  quantity: number;
  prices?: { price?: number | string };
  images?: Array<{ src?: string; thumbnail?: string }>;
};

type CartTotals = {
  total?: number | string;
  subtotal?: number | string;
  total_tax?: number | string;
  total_price?: number | string;
  discount_total?: number | string;
  discount_tax?: number | string;
};

type Cart = {
  items?: CartItem[];
  totals?: CartTotals;
  coupons?: Array<{ code?: string; discount?: string | number }>;
  shipping_rates?: Array<{
    shipping_rates?: Array<{
      rate_id?: string;
      name?: string;
      price?: string | number;
      method_id?: string;
    }>;
  }>;
};

type AddressBookEntry = {
  id: string;
  label: string;
  address: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingMethod, setShippingMethod] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<AddressBookEntry[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  useEffect(() => {
    const load = async () => {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.replace("/login?redirect=/checkout");
        return;
      }
      setIsAuthed(true);
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        const options =
          data?.shipping_rates
            ?.flatMap((pkg: { shipping_rates?: Array<{ rate_id?: string; method_id?: string }> }) =>
              pkg.shipping_rates ?? []
            )
            ?.map((rate: { rate_id?: string; method_id?: string }) =>
              rate.rate_id || rate.method_id
            )
            ?.filter(Boolean) ?? [];
        if (options.length && !shippingMethod) {
          setShippingMethod(options[0] as string);
        } else if (!options.length && !shippingMethod) {
          setShippingMethod("free");
        }
      }
      if (!hasPrefilled) {
        const mergeAddress = (
          current: typeof billing,
          incoming?: Partial<typeof billing> | null
        ) => {
          if (!incoming) return current;
          const next = { ...current };
          (Object.keys(next) as Array<keyof typeof billing>).forEach((key) => {
            if (!next[key] && incoming[key]) {
              next[key] = incoming[key] as string;
            }
          });
          return next;
        };

        let nextBilling: typeof billing | null = null;
        const addressRes = await fetch("/api/account/addresses");
        if (addressRes.ok) {
          const data = await addressRes.json();
          nextBilling = mergeAddress(
            nextBilling ?? billing,
            data?.billing ?? data?.shipping
          );
        }

        const checkoutRes = await fetch("/api/checkout");
        if (checkoutRes.ok) {
          const draft = await checkoutRes.json();
          nextBilling = mergeAddress(
            nextBilling ?? billing,
            draft?.billing_address
          );
        }

        if (nextBilling) {
          setBilling(nextBilling);
        }
        setHasPrefilled(true);
      }
    };
    load();
  }, [shippingMethod, router, hasPrefilled]);

  useEffect(() => {
    const stored = localStorage.getItem("addressBook");
    const defaultId = localStorage.getItem("defaultAddressId");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AddressBookEntry[];
        setSavedAddresses(parsed);
        if (defaultId) {
          setSelectedAddressId(defaultId);
          const match = parsed.find((entry) => entry.id === defaultId);
          if (match) {
            setBilling((prev) => ({ ...prev, ...match.address }));
          }
        }
      } catch {
        setSavedAddresses([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!couponSuccess) return;
    const timer = window.setTimeout(() => {
      setCouponSuccess("");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [couponSuccess]);

  const placeOrder = async () => {
    if (!isAuthed) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    setIsPlacing(true);
    setError("");
    try {
      const createRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: billing,
          shipping_address: billing,
          shipping_method: shippingMethod ? [shippingMethod] : undefined,
          payment_method: paymentMethod,
          payment_data: [],
          customer_note: orderNotes,
        }),
      });
      const processed = await createRes.json();
      if (!createRes.ok) {
        throw new Error(processed?.message || "Payment failed.");
      }
      const orderId = processed?.order_id || processed?.id;
      if (orderId) {
        window.location.href = `/checkout/success?order_id=${orderId}`;
        return;
      }
      window.location.href = "/checkout/success";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setIsPlacing(false);
    }
  };

  const toCents = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    return 0;
  };

  const refreshCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCart(data);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    const res = await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCouponError(data?.message || "Unable to apply coupon.");
    } else {
      setCouponSuccess("Coupon applied successfully.");
    }
    setCoupon("");
    refreshCart();
  };

  const removeCoupon = async (code?: string) => {
    if (!code) return;
    await fetch("/api/cart/remove-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setCouponSuccess("");
    refreshCart();
  };

  const itemsSubtotalCents =
    cart?.items?.reduce((sum, item) => {
      const price =
        typeof item.prices?.price === "number"
          ? item.prices?.price
          : Number(item.prices?.price || 0);
      return sum + price * (item.quantity ?? 0);
    }, 0) ?? 0;
  const totalsCents = toCents(cart?.totals?.total_price ?? cart?.totals?.total);
  const subtotalCentsRaw = toCents(cart?.totals?.subtotal);
  const subtotalCents =
    subtotalCentsRaw > 0 ? subtotalCentsRaw : itemsSubtotalCents;
  const couponDiscountFromCoupons =
    cart?.coupons?.reduce(
      (sum, entry) => sum + toCents(entry.discount),
      0,
    ) ?? 0;
  const couponDiscountFromTotals =
    toCents(cart?.totals?.discount_total) +
    toCents(cart?.totals?.discount_tax);
  const derivedDiscountFromTotals = Math.max(0, subtotalCents - totalsCents);
  const derivedDiscountFromItems = Math.max(0, itemsSubtotalCents - subtotalCents);
  const couponDiscountCents =
    couponDiscountFromCoupons > 0
      ? couponDiscountFromCoupons
      : couponDiscountFromTotals > 0
        ? couponDiscountFromTotals
        : derivedDiscountFromTotals > 0
          ? derivedDiscountFromTotals
          : derivedDiscountFromItems;
  const derivedTotalCents = Math.max(
    0,
    subtotalCents - couponDiscountCents,
  );
  const shippingRates =
    cart?.shipping_rates?.flatMap((pkg) => pkg.shipping_rates ?? []) ?? [];
  const selectedRate = shippingRates.find(
    (rate) => (rate.rate_id || rate.method_id) === shippingMethod
  );
  const selectedRateCents = selectedRate
    ? typeof selectedRate.price === "number"
      ? selectedRate.price
      : Number(selectedRate.price || 0)
    : 0;
  const fallbackShippingCents = shippingMethod === "flat" ? 10000 : 0;
  const orderTotalCents =
    totalsCents > 0
      ? totalsCents
      : derivedTotalCents + (selectedRateCents || fallbackShippingCents);

  return (
    <div className="mx-auto w-full max-w-[96rem] px-6 pt-32">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <h1 className="text-xl font-semibold">Billing &amp; Shipping</h1>
            {savedAddresses.length ? (
              <div className="mt-4">
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  Saved address
                </label>
                <select
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={selectedAddressId}
                  onChange={(event) => {
                    const id = event.target.value;
                    setSelectedAddressId(id);
                    const match = savedAddresses.find((entry) => entry.id === id);
                    if (match) {
                      setBilling((prev) => ({ ...prev, ...match.address }));
                    }
                  }}
                >
                  <option value="">Select saved address</option>
                  {savedAddresses.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                First name <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.first_name}
                  onChange={(event) =>
                    setBilling({ ...billing, first_name: event.target.value })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Last name <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.last_name}
                  onChange={(event) =>
                    setBilling({ ...billing, last_name: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Company name (optional)
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.company ?? ""}
                onChange={(event) =>
                  setBilling({ ...billing, company: event.target.value })
                }
              />
            </label>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Country / Region <span className="text-[color:var(--brand)]">*</span>
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.country}
                onChange={(event) =>
                  setBilling({ ...billing, country: event.target.value })
                }
              />
            </label>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Street address <span className="text-[color:var(--brand)]">*</span>
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                placeholder="House number and street name"
                value={billing.address_1}
                onChange={(event) =>
                  setBilling({ ...billing, address_1: event.target.value })
                }
              />
            </label>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Apartment, suite, unit, etc. (optional)
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.address_2}
                onChange={(event) =>
                  setBilling({ ...billing, address_2: event.target.value })
                }
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Town / City <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.city}
                  onChange={(event) =>
                    setBilling({ ...billing, city: event.target.value })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                State / County <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.state}
                  onChange={(event) =>
                    setBilling({ ...billing, state: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Postcode / ZIP <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.postcode}
                  onChange={(event) =>
                    setBilling({ ...billing, postcode: event.target.value })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Phone <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.phone}
                  onChange={(event) =>
                    setBilling({ ...billing, phone: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Email address <span className="text-[color:var(--brand)]">*</span>
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.email}
                onChange={(event) =>
                  setBilling({ ...billing, email: event.target.value })
                }
              />
            </label>
            <label className="mt-6 block text-xs font-semibold text-[color:var(--muted)]">
              Additional information
              <textarea
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                rows={4}
                placeholder="Notes about your order, e.g. special notes for delivery."
                value={orderNotes}
                onChange={(event) => setOrderNotes(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <h2 className="text-lg font-semibold">Your order</h2>
            {cart ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between font-semibold text-[color:var(--muted)]">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>
                {cart.items?.map((item) => (
                  <div key={item.key} className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-[10px] bg-[#f1ece4]">
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
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted)]">
                          x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span>{formatPrice(Number(item.prices?.price ?? 0) / 100)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemsSubtotalCents / 100)}</span>
                </div>
                {cart.coupons?.length || couponDiscountCents > 0 ? (
                  <div className="flex justify-between text-sm text-[color:var(--brand)]">
                    <span>Coupon</span>
                    <span>-{formatPrice(couponDiscountCents / 100)}</span>
                  </div>
                ) : null}
                {cart.coupons?.length ? (
                  <div className="mt-2 rounded-[10px] border border-black/5 bg-white/80 p-3 text-xs">
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
                {!cart.coupons?.length ? (
                  <>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={coupon}
                        onChange={(event) => setCoupon(event.target.value)}
                        placeholder="Coupon code"
                        className="w-full rounded-[10px] border border-black/10 px-3 py-2 text-sm"
                      />
                      <Button onClick={applyCoupon} size="sm">
                        Apply
                      </Button>
                    </div>
                    {couponError ? (
                      <p className="mt-2 text-xs text-red-500">{couponError}</p>
                    ) : null}
                    {couponSuccess ? (
                      <p className="mt-2 text-xs text-emerald-600">
                        {couponSuccess}
                      </p>
                    ) : null}
                  </>
                ) : null}
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-[color:var(--muted)]">Shipping</p>
                  {shippingRates.length ? (
                    shippingRates.map((rate) => {
                      const id = rate.rate_id || rate.method_id || "";
                      const priceCents =
                        typeof rate.price === "number"
                          ? rate.price
                          : Number(rate.price || 0);
                      return (
                        <label key={id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === id}
                            onChange={() => setShippingMethod(id)}
                          />
                          {rate.name || "Shipping"}{" "}
                          <span className="text-[color:var(--muted)]">
                            {priceCents > 0
                              ? `· ${formatPrice(priceCents / 100)}`
                              : "· Free"}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === "free"}
                          onChange={() => setShippingMethod("free")}
                        />
                        Free shipping
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === "flat"}
                          onChange={() => setShippingMethod("flat")}
                        />
                        Flat rate: ₹100
                      </label>
                    </>
                  )}
                </div>
                <div className="flex justify-between border-t border-black/10 pt-3 font-semibold">
                  <span>
                    Total
                    {couponDiscountCents > 0
                      ? ` (saved ${formatPrice(couponDiscountCents / 100)})`
                      : ""}
                  </span>
                  <span>{formatPrice(orderTotalCents / 100)}</span>
                </div>
              </div>
            ) : (
              <Loader />
            )}
          </div>

          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <h3 className="text-sm font-semibold">Payment</h3>
            <div className="mt-3 space-y-3 text-sm">
              <label className="flex items-center gap-2 rounded-[10px] border border-black/10 px-3 py-2">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on delivery
              </label>
              <label className="flex items-center gap-2 rounded-[10px] border border-black/10 px-3 py-2">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Razorpay
              </label>
            </div>
            {error ? (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            ) : null}
            <Button onClick={placeOrder} className="mt-6 w-full" disabled={isPlacing}>
              {isPlacing ? "Placing order..." : "Place order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
