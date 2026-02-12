"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Order = {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  shipping?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  line_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
    price: number;
    image?: { src?: string };
    meta_data?: Array<{ key: string; value: string }>;
  }>;
};

const toCents = (value?: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return parsed * 100;
};

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Unable to fetch order.");
        }
        setOrder(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch order.");
      }
    };
    load();
  }, [orderId]);

  return (
    <div className="mx-auto w-full max-w-[96rem] px-6 pt-32">
      <div className="mb-8 rounded-[16px] border border-black/5 bg-white/95 p-6">
        <h1 className="text-2xl font-semibold">Order received</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Thank you. Your order has been received.
        </p>
      </div>

      {!orderId ? (
        <p className="text-sm text-red-500">Missing order id.</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : !order ? (
        <p className="text-sm text-[color:var(--muted)]">Loading order...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
            <h2 className="text-lg font-semibold">Order details</h2>
            <div className="mt-4 space-y-4">
              {order.line_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-black/5 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-[12px] bg-[#f1ece4]">
                      {item.image?.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image.src}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-[color:var(--muted)]">
                        x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(toCents(item.total) / 100)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
              <h3 className="text-sm font-semibold">Summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order</span>
                  <span>#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(toCents(order.total) / 100)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
              <h3 className="text-sm font-semibold">Billing</h3>
              <div className="mt-3 text-sm text-[color:var(--muted)]">
                <p>
                  {order.billing?.first_name} {order.billing?.last_name}
                </p>
                <p>{order.billing?.address_1}</p>
                <p>{order.billing?.address_2}</p>
                <p>
                  {[order.billing?.city, order.billing?.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{order.billing?.postcode}</p>
                <p>{order.billing?.country}</p>
                <p>{order.billing?.phone}</p>
                <p>{order.billing?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
