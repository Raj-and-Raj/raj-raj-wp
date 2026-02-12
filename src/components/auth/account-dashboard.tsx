"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AddressBookEntry = {
  id: string;
  label: string;
  address: Address;
};

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
  const [tracked, setTracked] = useState<null | {
    id: number;
    status: string;
    total: string;
  }>(null);
  const [profileDraft, setProfileDraft] = useState({ name: "", email: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordDraft, setPasswordDraft] = useState({
    password: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [addressForm, setAddressForm] = useState<Address>({});
  const [addressLabel, setAddressLabel] = useState("");
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<null | {
    id: number;
    status: string;
    total: string;
    line_items?: Array<{
      id: number;
      name: string;
      quantity: number;
      total: string;
      image?: { src?: string };
    }>;
  }>(null);

  const loadAll = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProfile({ name: data.name, email: data.email });
    setProfileDraft({ name: data.name, email: data.email ?? "" });

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

  useEffect(() => {
    const stored = localStorage.getItem("addressBook");
    const defaultId = localStorage.getItem("defaultAddressId");
    if (defaultId) {
      setDefaultAddressId(defaultId);
    }
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as AddressBookEntry[];
      setAddressBook(parsed);
    } catch {
      setAddressBook([]);
    }
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

  const saveProfile = async () => {
    setProfileMessage("");
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileDraft.name,
        email: profileDraft.email,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileMessage(data?.error || "Unable to update profile.");
      return;
    }
    setProfileMessage("Profile updated.");
    loadAll();
  };

  const savePassword = async () => {
    setPasswordMessage("");
    if (!passwordDraft.password || passwordDraft.password.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
    if (passwordDraft.password !== passwordDraft.confirm) {
      setPasswordMessage("Passwords do not match.");
      return;
    }
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: passwordDraft.password,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordMessage(data?.error || "Unable to update password.");
      return;
    }
    setPasswordMessage("Password updated.");
    setPasswordDraft({ password: "", confirm: "" });
  };

  const addAddress = () => {
    if (!addressLabel.trim()) return;
    const id = `${Date.now()}`;
    const entry: AddressBookEntry = {
      id,
      label: addressLabel.trim(),
      address: addressForm,
    };
    const next = [...addressBook, entry];
    setAddressBook(next);
    localStorage.setItem("addressBook", JSON.stringify(next));
    setAddressForm({});
    setAddressLabel("");
  };

  const removeAddress = (id: string) => {
    const next = addressBook.filter((entry) => entry.id !== id);
    setAddressBook(next);
    localStorage.setItem("addressBook", JSON.stringify(next));
    if (defaultAddressId === id) {
      setDefaultAddressId(null);
      localStorage.removeItem("defaultAddressId");
    }
  };

  const setDefaultAddress = (id: string) => {
    setDefaultAddressId(id);
    localStorage.setItem("defaultAddressId", id);
  };

  const loadOrderDetails = async (id: number) => {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setOrderDetails({
      id: data.id,
      status: data.status,
      total: data.total,
      line_items: data.line_items ?? [],
    });
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
    <div className="space-y-8 pt-32">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-black/5 bg-white/95 p-6">
        <div>
          <h1 className="text-2xl font-semibold">My account</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Welcome back, {profile.name}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap gap-2 rounded-[14px] border border-black/5 bg-white/80 p-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

      <TabsContent value="overview" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Profile
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)]/10 text-lg font-semibold text-[color:var(--brand)]">
              {profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-semibold">{profile.name}</p>
              <p className="text-sm text-[color:var(--muted)]">
                {profile.email}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <input
              className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              placeholder="Full name"
              value={profileDraft.name}
              onChange={(event) =>
                setProfileDraft({ ...profileDraft, name: event.target.value })
              }
            />
            <input
              className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              placeholder="Email"
              value={profileDraft.email}
              onChange={(event) =>
                setProfileDraft({ ...profileDraft, email: event.target.value })
              }
            />
            {profileMessage ? (
              <p className="text-xs text-[color:var(--muted)]">
                {profileMessage}
              </p>
            ) : null}
            <Button onClick={saveProfile}>Save profile</Button>
          </div>
        </div>

        <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Track order
            </p>
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
              <p className="text-[color:var(--muted)]">
                Status: {tracked.status}
              </p>
              <p className="text-[color:var(--muted)]">
                Total: ₹{tracked.total}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      </TabsContent>

      <TabsContent value="security" className="mt-6">
      <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Change password
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
            type="password"
            placeholder="New password"
            value={passwordDraft.password}
            onChange={(event) =>
              setPasswordDraft({ ...passwordDraft, password: event.target.value })
            }
          />
          <input
            className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
            type="password"
            placeholder="Confirm password"
            value={passwordDraft.confirm}
            onChange={(event) =>
              setPasswordDraft({ ...passwordDraft, confirm: event.target.value })
            }
          />
        </div>
        {passwordMessage ? (
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            {passwordMessage}
          </p>
        ) : null}
        <Button className="mt-4" onClick={savePassword}>
          Update password
        </Button>
      </div>
      </TabsContent>

      <TabsContent value="orders" className="mt-6">
      <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Orders
          </p>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            No orders yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-black/10 bg-white p-4 text-sm"
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
                <Button size="sm" variant="outline" onClick={() => loadOrderDetails(order.id)}>
                  View details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      </TabsContent>

      <TabsContent value="addresses" className="mt-6">
      <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Address book
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <input
              className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              placeholder="Label (Home, Office)"
              value={addressLabel}
              onChange={(event) => setAddressLabel(event.target.value)}
            />
            <input
              className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              placeholder="Address line 1"
              value={addressForm.address_1 ?? ""}
              onChange={(event) =>
                setAddressForm({ ...addressForm, address_1: event.target.value })
              }
            />
            <input
              className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              placeholder="Address line 2"
              value={addressForm.address_2 ?? ""}
              onChange={(event) =>
                setAddressForm({ ...addressForm, address_2: event.target.value })
              }
            />
            <input
              className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              placeholder="City"
              value={addressForm.city ?? ""}
              onChange={(event) =>
                setAddressForm({ ...addressForm, city: event.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                placeholder="State"
                value={addressForm.state ?? ""}
                onChange={(event) =>
                  setAddressForm({ ...addressForm, state: event.target.value })
                }
              />
              <input
                className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                placeholder="Postcode"
                value={addressForm.postcode ?? ""}
                onChange={(event) =>
                  setAddressForm({ ...addressForm, postcode: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                placeholder="Country"
                value={addressForm.country ?? ""}
                onChange={(event) =>
                  setAddressForm({ ...addressForm, country: event.target.value })
                }
              />
              <input
                className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                placeholder="Phone"
                value={addressForm.phone ?? ""}
                onChange={(event) =>
                  setAddressForm({ ...addressForm, phone: event.target.value })
                }
              />
            </div>
            <Button onClick={addAddress}>Save address</Button>
          </div>
          <div className="space-y-3">
            {addressBook.length === 0 ? (
              <p className="text-sm text-[color:var(--muted)]">
                No saved addresses yet.
              </p>
            ) : (
              addressBook.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[12px] border border-black/10 bg-white p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{entry.label}</p>
                    <button
                      className="text-xs text-red-500"
                      onClick={() => removeAddress(entry.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-2 text-[color:var(--muted)]">
                    {entry.address.address_1}
                  </p>
                  <p className="text-[color:var(--muted)]">
                    {entry.address.address_2}
                  </p>
                  <p className="text-[color:var(--muted)]">
                    {[entry.address.city, entry.address.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      className={`text-xs font-semibold ${
                        defaultAddressId === entry.id
                          ? "text-[color:var(--brand)]"
                          : "text-[color:var(--muted)]"
                      }`}
                      onClick={() => setDefaultAddress(entry.id)}
                    >
                      {defaultAddressId === entry.id
                        ? "Default address"
                        : "Set as default"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-black/5 bg-white/95 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Addresses
          </p>
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
      </TabsContent>
      </Tabs>

      {orderDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Order #{orderDetails.id}
              </h3>
              <button
                onClick={() => setOrderDetails(null)}
                className="text-sm text-[color:var(--muted)]"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p>Status: {orderDetails.status}</p>
              <p>Total: ₹{orderDetails.total}</p>
              <div className="mt-4 space-y-2">
                {orderDetails.line_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-black/5 pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-[10px] bg-[#f1ece4]">
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
                    <span>₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button onClick={() => window.print()} className="w-full">
                Print invoice
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOrderDetails(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
