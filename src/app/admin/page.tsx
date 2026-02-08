"use client";

import { Card } from "@/components/ui/card";

const orders = [
  {
    id: "RR-1084",
    item: "Santorini Lounge Chair",
    total: "₹28,500",
    status: "Paid",
  },
  {
    id: "RR-1085",
    item: "Verve Dining Table",
    total: "₹52,000",
    status: "Pending",
  },
  {
    id: "RR-1086",
    item: "Halo Pendant Light",
    total: "₹18,500",
    status: "Paid",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-[96rem] space-y-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Raj & Raj Admin</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Overview of your store performance and recent orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
            Today’s sales
          </p>
          <p className="mt-3 text-2xl font-semibold">₹1,02,500</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
            Orders in queue
          </p>
          <p className="mt-3 text-2xl font-semibold">12</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
            Active categories
          </p>
          <p className="mt-3 text-2xl font-semibold">8</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Recent orders</h2>
        <div className="mt-4 overflow-hidden rounded-[8px] border border-black/10">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr] bg-black/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            <span>Order</span>
            <span>Item</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center border-t border-black/10 px-4 py-3 text-sm"
            >
              <span>{order.id}</span>
              <span>{order.item}</span>
              <span>{order.total}</span>
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status === "Paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
