"use client";

import { useEffect, useState } from "react";
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

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
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
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/cart");
      if (res.ok) setCart(await res.json());
      const checkoutRes = await fetch("/api/checkout");
      if (checkoutRes.ok) {
        const draft = await checkoutRes.json();
        if (draft?.billing_address) {
          setBilling((prev) => ({ ...prev, ...draft.billing_address }));
        }
      }
    };
    load();
  }, []);

  const placeOrder = async () => {
    setIsPlacing(true);
    setError("");
    try {
      const createRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: billing,
          shipping_address: billing,
          payment_method: paymentMethod,
          payment_data: [],
        }),
      });
      const processed = await createRes.json();
      if (!createRes.ok) {
        throw new Error(processed?.message || "Payment failed.");
      }
      const redirectUrl = processed?.payment_result?.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      window.location.href = "/account";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[96rem] px-6">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[12px] border border-black/5 bg-white/95 p-6">
          <h1 className="text-xl font-semibold">Checkout</h1>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="First name"
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={billing.first_name}
              onChange={(event) =>
                setBilling({ ...billing, first_name: event.target.value })
              }
            />
            <input
              placeholder="Last name"
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={billing.last_name}
              onChange={(event) =>
                setBilling({ ...billing, last_name: event.target.value })
              }
            />
          </div>
          <input
            placeholder="Email"
            className="rounded-[12px] border border-black/10 px-3 py-2"
            value={billing.email}
            onChange={(event) => setBilling({ ...billing, email: event.target.value })}
          />
          <input
            placeholder="Phone"
            className="rounded-[12px] border border-black/10 px-3 py-2"
            value={billing.phone}
            onChange={(event) => setBilling({ ...billing, phone: event.target.value })}
          />
          <input
            placeholder="Address line 1"
            className="rounded-[12px] border border-black/10 px-3 py-2"
            value={billing.address_1}
            onChange={(event) => setBilling({ ...billing, address_1: event.target.value })}
          />
          <input
            placeholder="Address line 2"
            className="rounded-[12px] border border-black/10 px-3 py-2"
            value={billing.address_2}
            onChange={(event) => setBilling({ ...billing, address_2: event.target.value })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="City"
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={billing.city}
              onChange={(event) => setBilling({ ...billing, city: event.target.value })}
            />
            <input
              placeholder="State"
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={billing.state}
              onChange={(event) => setBilling({ ...billing, state: event.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Postcode"
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={billing.postcode}
              onChange={(event) =>
                setBilling({ ...billing, postcode: event.target.value })
              }
            />
            <input
              placeholder="Country"
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={billing.country}
              onChange={(event) =>
                setBilling({ ...billing, country: event.target.value })
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="rounded-[12px] border border-black/10 px-3 py-2"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="cod">Cash on delivery</option>
              <option value="cheque">Cheque</option>
              <option value="razorpay">Razorpay</option>
            </select>
          </div>
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
          <Button onClick={placeOrder} className="w-full" disabled={isPlacing}>
            {isPlacing ? "Placing order..." : "Place order"}
          </Button>
        </div>

        <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          {cart ? (
            <div className="mt-4 space-y-2 text-sm">
              {cart.items?.map((item) => (
                <div key={item.key} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{formatPrice(Number(item.prices?.price ?? 0) / 100)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-black/10 pt-3 font-semibold">
                <span>Total</span>
                <span>{formatPrice(Number(cart.totals?.total ?? 0) / 100)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
