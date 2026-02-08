"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type Address = {
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
};

export function AccountDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<null | {
    name: string;
    email: string;
  }>(null);
  const [orders, setOrders] = useState<
    Array<{ id: number; status: string; total: string; date_created: string }>
  >([]);
  const [addresses, setAddresses] = useState<{
    billing: null | Address;
    shipping: null | Address;
  }>({ billing: null, shipping: null });
  const [editing, setEditing] = useState(false);
  const [billingDraft, setBillingDraft] = useState<Address>({});
  const [shippingDraft, setShippingDraft] = useState<Address>({});
  const [trackId, setTrackId] = useState("");
  const [tracked, setTracked] = useState<any>(null);

  const loadAll = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProfile({ name: data.name, email: data.email });

    const ordersRes = await fetch("/api/account/orders");
    if (ordersRes.ok) {
      const orderData = await ordersRes.json();
      setOrders(orderData.orders ?? []);
    }

    const addressRes = await fetch("/api/account/addresses");
    if (addressRes.ok) {
      const addressData = await addressRes.json();
      setAddresses({
        billing: addressData.billing,
        shipping: addressData.shipping,
      });
      setBillingDraft(addressData.billing ?? {});
      setShippingDraft(addressData.shipping ?? {});
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const saveAddresses = async () => {
    await fetch("/api/account/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billing: billingDraft, shipping: shippingDraft }),
    });
    setEditing(false);
    loadAll();
  };


  const trackOrder = async () => {
    if (!trackId) return;
    const res = await fetch(`/api/account/orders/item?id=${trackId}`);
    if (res.ok) {
      const data = await res.json();
      setTracked(data.order);
    } else {
      setTracked(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-[color:var(--muted)]">Loading...</p>;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[color:var(--muted)]">
          Please sign in to view your dashboard.
        </p>
        <Button onClick={() => router.push("/login")}>Go to login</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My account</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Welcome back, {profile.name}
        </p>
      </div>

      <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
        <p className="text-sm text-[color:var(--muted)]">Email</p>
        <p className="mt-1 text-base font-semibold">{profile.email}</p>
      </div>

      <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
        <p className="text-sm text-[color:var(--muted)]">Orders</p>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-[12px] border border-black/10 bg-white p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-[color:var(--muted)]">
                    {new Date(order.date_created).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.total}</p>
                  <p className="text-[color:var(--muted)]">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[color:var(--muted)]">Track order</p>
          <Button size="sm" variant="outline" onClick={trackOrder}>
            Track
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={trackId}
            onChange={(event) => setTrackId(event.target.value)}
            placeholder="Enter order id"
            className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        {tracked ? (
          <div className="mt-4 rounded-[12px] border border-black/10 bg-white p-4 text-sm">
            <p className="font-semibold">Order #{tracked.id}</p>
            <p className="text-[color:var(--muted)]">Status: {tracked.status}</p>
            <p className="text-[color:var(--muted)]">Total: ₹{tracked.total}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[color:var(--muted)]">Addresses</p>
          <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[12px] border border-black/10 bg-white p-4 text-sm">
            <p className="font-semibold">Billing</p>
            {editing ? (
              <div className="mt-3 space-y-2">
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="First name"
                  value={billingDraft.first_name ?? ""}
                  onChange={(event) =>
                    setBillingDraft({
                      ...billingDraft,
                      first_name: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Last name"
                  value={billingDraft.last_name ?? ""}
                  onChange={(event) =>
                    setBillingDraft({
                      ...billingDraft,
                      last_name: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Address line 1"
                  value={billingDraft.address_1 ?? ""}
                  onChange={(event) =>
                    setBillingDraft({
                      ...billingDraft,
                      address_1: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Address line 2"
                  value={billingDraft.address_2 ?? ""}
                  onChange={(event) =>
                    setBillingDraft({
                      ...billingDraft,
                      address_2: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="City"
                  value={billingDraft.city ?? ""}
                  onChange={(event) =>
                    setBillingDraft({ ...billingDraft, city: event.target.value })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="State"
                  value={billingDraft.state ?? ""}
                  onChange={(event) =>
                    setBillingDraft({ ...billingDraft, state: event.target.value })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Postcode"
                  value={billingDraft.postcode ?? ""}
                  onChange={(event) =>
                    setBillingDraft({
                      ...billingDraft,
                      postcode: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Country"
                  value={billingDraft.country ?? ""}
                  onChange={(event) =>
                    setBillingDraft({ ...billingDraft, country: event.target.value })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Phone"
                  value={billingDraft.phone ?? ""}
                  onChange={(event) =>
                    setBillingDraft({ ...billingDraft, phone: event.target.value })
                  }
                />
              </div>
            ) : addresses.billing ? (
              <div className="mt-2 text-[color:var(--muted)]">
                <p>
                  {addresses.billing.first_name} {addresses.billing.last_name}
                </p>
                <p>{addresses.billing.address_1}</p>
                <p>{addresses.billing.address_2}</p>
                <p>
                  {addresses.billing.city} {addresses.billing.state}
                </p>
                <p>{addresses.billing.postcode}</p>
                <p>{addresses.billing.country}</p>
                <p>{addresses.billing.phone}</p>
              </div>
            ) : (
              <p className="mt-2 text-[color:var(--muted)]">
                No billing address saved.
              </p>
            )}
          </div>
          <div className="rounded-[12px] border border-black/10 bg-white p-4 text-sm">
            <p className="font-semibold">Shipping</p>
            {editing ? (
              <div className="mt-3 space-y-2">
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="First name"
                  value={shippingDraft.first_name ?? ""}
                  onChange={(event) =>
                    setShippingDraft({
                      ...shippingDraft,
                      first_name: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Last name"
                  value={shippingDraft.last_name ?? ""}
                  onChange={(event) =>
                    setShippingDraft({
                      ...shippingDraft,
                      last_name: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Address line 1"
                  value={shippingDraft.address_1 ?? ""}
                  onChange={(event) =>
                    setShippingDraft({
                      ...shippingDraft,
                      address_1: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Address line 2"
                  value={shippingDraft.address_2 ?? ""}
                  onChange={(event) =>
                    setShippingDraft({
                      ...shippingDraft,
                      address_2: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="City"
                  value={shippingDraft.city ?? ""}
                  onChange={(event) =>
                    setShippingDraft({ ...shippingDraft, city: event.target.value })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="State"
                  value={shippingDraft.state ?? ""}
                  onChange={(event) =>
                    setShippingDraft({ ...shippingDraft, state: event.target.value })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Postcode"
                  value={shippingDraft.postcode ?? ""}
                  onChange={(event) =>
                    setShippingDraft({
                      ...shippingDraft,
                      postcode: event.target.value,
                    })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Country"
                  value={shippingDraft.country ?? ""}
                  onChange={(event) =>
                    setShippingDraft({ ...shippingDraft, country: event.target.value })
                  }
                />
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="Phone"
                  value={shippingDraft.phone ?? ""}
                  onChange={(event) =>
                    setShippingDraft({ ...shippingDraft, phone: event.target.value })
                  }
                />
              </div>
            ) : addresses.shipping ? (
              <div className="mt-2 text-[color:var(--muted)]">
                <p>
                  {addresses.shipping.first_name} {addresses.shipping.last_name}
                </p>
                <p>{addresses.shipping.address_1}</p>
                <p>{addresses.shipping.address_2}</p>
                <p>
                  {addresses.shipping.city} {addresses.shipping.state}
                </p>
                <p>{addresses.shipping.postcode}</p>
                <p>{addresses.shipping.country}</p>
                <p>{addresses.shipping.phone}</p>
              </div>
            ) : (
              <p className="mt-2 text-[color:var(--muted)]">
                No shipping address saved.
              </p>
            )}
          </div>
        </div>
        {editing ? (
          <div className="mt-4">
            <Button onClick={saveAddresses}>Save addresses</Button>
          </div>
        ) : null}
      </div>

      <Button variant="outline" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}
