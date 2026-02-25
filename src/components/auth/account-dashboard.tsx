"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Shield,
  LogOut,
  User,
  Check,
  Edit2,
  Search,
  Truck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    username?: string;
    firstName?: string;
    lastName?: string;
  }>(null);
  const [orders, setOrders] = useState<
    Array<{ id: number; status: string; total: string; date_created: string }>
  >([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPerPage, setOrderPerPage] = useState(5);
  const [orderYear, setOrderYear] = useState<string>("all");
  const [orderMonth, setOrderMonth] = useState<string>("all");
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
  const indiaStates = [
    { code: "AN", name: "Andaman and Nicobar Islands" },
    { code: "AP", name: "Andhra Pradesh" },
    { code: "AR", name: "Arunachal Pradesh" },
    { code: "AS", name: "Assam" },
    { code: "BR", name: "Bihar" },
    { code: "CH", name: "Chandigarh" },
    { code: "CT", name: "Chhattisgarh" },
    { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { code: "DD", name: "Daman and Diu (Legacy)" },
    { code: "DL", name: "Delhi" },
    { code: "GA", name: "Goa" },
    { code: "GJ", name: "Gujarat" },
    { code: "HR", name: "Haryana" },
    { code: "HP", name: "Himachal Pradesh" },
    { code: "JK", name: "Jammu and Kashmir" },
    { code: "JH", name: "Jharkhand" },
    { code: "KA", name: "Karnataka" },
    { code: "KL", name: "Kerala" },
    { code: "LA", name: "Ladakh" },
    { code: "LD", name: "Lakshadweep" },
    { code: "MP", name: "Madhya Pradesh" },
    { code: "MH", name: "Maharashtra" },
    { code: "MN", name: "Manipur" },
    { code: "ML", name: "Meghalaya" },
    { code: "MZ", name: "Mizoram" },
    { code: "NL", name: "Nagaland" },
    { code: "OR", name: "Odisha" },
    { code: "PY", name: "Puducherry" },
    { code: "PB", name: "Punjab" },
    { code: "RJ", name: "Rajasthan" },
    { code: "SK", name: "Sikkim" },
    { code: "TN", name: "Tamil Nadu" },
    { code: "TG", name: "Telangana" },
    { code: "TR", name: "Tripura" },
    { code: "UP", name: "Uttar Pradesh" },
    { code: "UT", name: "Uttarakhand" },
    { code: "WB", name: "West Bengal" },
  ];

  const orderMonthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const orderYearOptions = useMemo(() => {
    const years = new Set<string>();
    orders.forEach((order) => {
      const date = new Date(order.date_created);
      if (Number.isNaN(date.getTime())) return;
      years.add(String(date.getFullYear()));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderYear === "all" && orderMonth === "all") return orders;
    return orders.filter((order) => {
      const date = new Date(order.date_created);
      if (Number.isNaN(date.getTime())) return false;
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, "0");
      if (orderYear !== "all" && year !== orderYear) return false;
      if (orderMonth !== "all" && month !== orderMonth) return false;
      return true;
    });
  }, [orders, orderYear, orderMonth]);

  const orderTotalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / orderPerPage)
  );
  const orderSafePage = Math.min(orderPage, orderTotalPages);
  const orderStartIndex = (orderSafePage - 1) * orderPerPage;
  const orderEndIndex = orderStartIndex + orderPerPage;
  const visibleOrders = filteredOrders.slice(orderStartIndex, orderEndIndex);

  const orderPageNumbers = useMemo(() => {
    if (orderTotalPages <= 7) {
      return Array.from({ length: orderTotalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([
      1,
      2,
      3,
      orderTotalPages - 2,
      orderTotalPages - 1,
      orderTotalPages,
    ]);
    pages.add(orderSafePage);
    pages.add(orderSafePage - 1);
    pages.add(orderSafePage + 1);
    return Array.from(pages)
      .filter((n) => n >= 1 && n <= orderTotalPages)
      .sort((a, b) => a - b);
  }, [orderSafePage, orderTotalPages]);

  const loadAll = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    const firstName = String(data.firstName ?? "").trim();
    const lastName = String(data.lastName ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const username = data.username || data.name || "";
    const fallbackName = fullName || data.name || username || "Customer";
    setProfile({
      name: fallbackName,
      email: data.email,
      username,
      firstName,
      lastName,
    });
    setProfileDraft({ name: fallbackName, email: data.email ?? "" });

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
    setOrderPage(1);
  }, [orderYear, orderMonth, orderPerPage]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.dispatchEvent(new Event("auth:updated"));
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
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-[color:var(--muted)]">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[color:var(--brand)]" />
        Loading your account...
      </div>
    );
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-black/5 bg-white/95 p-6">
        <div>
          <h1 className="text-2xl font-semibold">My account</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Welcome back, {profile.firstName || profile.name}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-8 grid h-auto w-full grid-cols-1 gap-2 bg-black/5 p-1 md:grid-cols-4">
          <TabsTrigger
            value="orders"
            className="flex items-center gap-2 rounded-md py-2.5 transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger
            value="track-order"
            className="flex items-center gap-2 rounded-md py-2.5 transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <Truck className="h-4 w-4" />
            <span>Track Order</span>
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="flex items-center gap-2 rounded-md py-2.5 transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <MapPin className="h-4 w-4" />
            <span>Addresses</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 rounded-md py-2.5 transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="track-order" className="mt-0">
          <div className="rounded-xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                Track Order
              </p>
              <Truck className="h-4 w-4 text-[color:var(--muted)]" />
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/50" />
                <Input
                  className="pl-9"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder="Order ID (e.g. 12345)"
                />
              </div>
              <Button variant="outline" onClick={trackOrder}>
                Track
              </Button>
            </div>
            {tracked && (
              <div className="mt-6 rounded-lg border border-black/5 bg-slate-50 p-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <p className="font-semibold">Order #{tracked.id}</p>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {tracked.status}
                  </span>
                </div>
                <div className="pt-3">
                  <p className="text-sm text-[color:var(--muted)]">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold">₹{tracked.total}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-0 space-y-6">
          <div className="rounded-xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                Profile
              </p>
              <User className="h-4 w-4 text-[color:var(--muted)]" />
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[color:var(--brand)] to-red-600 text-2xl font-bold text-white shadow-lg shadow-red-500/20">
                {(profile.firstName || profile.name).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold">
                  {profile.name}
                  {profile.username ? (
                    <span className="ml-2 text-xs font-medium text-[color:var(--muted)]">
                      ({profile.username})
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  {profile.email}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[color:var(--muted)]">
                  Full Name
                </label>
                <Input
                  value={profileDraft.name}
                  onChange={(e) =>
                    setProfileDraft({ ...profileDraft, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-[color:var(--muted)]">
                  Email Address
                </label>
                <Input
                  value={profileDraft.email}
                  onChange={(e) =>
                    setProfileDraft({ ...profileDraft, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              {profileMessage && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                  <Check className="mr-2 inline h-4 w-4" />
                  {profileMessage}
                </div>
              )}
              <Button onClick={saveProfile} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                Change Password
              </p>
              <Shield className="h-4 w-4 text-[color:var(--muted)]" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[color:var(--muted)]">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="New password"
                  value={passwordDraft.password}
                  onChange={(e) =>
                    setPasswordDraft({
                      ...passwordDraft,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-[color:var(--muted)]">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={passwordDraft.confirm}
                  onChange={(e) =>
                    setPasswordDraft({
                      ...passwordDraft,
                      confirm: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            {passwordMessage && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-[color:var(--brand)]">
                {passwordMessage}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={savePassword}>Update Password</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <div className="rounded-xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                Order History
              </p>
              <Package className="h-4 w-4 text-[color:var(--muted)]" />
            </div>
            {orders.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--muted)]/10">
                  <Package className="h-6 w-6 text-[color:var(--muted)]" />
                </div>
                <p className="text-sm text-[color:var(--muted)]">
                  No orders found.
                </p>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/products")}
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[color:var(--muted)]">
                        Year
                      </span>
                      <select
                        value={orderYear}
                        onChange={(e) => {
                          setOrderYear(e.target.value);
                          setOrderMonth("all");
                        }}
                        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                      >
                        <option value="all">All</option>
                        {orderYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[color:var(--muted)]">
                        Month
                      </span>
                      <select
                        value={orderMonth}
                        onChange={(e) => setOrderMonth(e.target.value)}
                        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                        disabled={orderYear === "all"}
                      >
                        <option value="all">All</option>
                        {orderMonthOptions.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[color:var(--muted)]">
                        Show
                      </span>
                      <select
                        value={orderPerPage}
                        onChange={(e) => setOrderPerPage(Number(e.target.value))}
                        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                      >
                        {[5, 10, 20, 50].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-[color:var(--muted)]">
                    Showing {visibleOrders.length} of {filteredOrders.length}
                  </p>
                </div>
                {filteredOrders.length === 0 ? (
                  <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-sm text-[color:var(--muted)]">
                      No orders for the selected filters.
                    </p>
                  </div>
                ) : null}
                {visibleOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-[16px] border border-black/5 bg-slate-50 p-5 transition-colors hover:border-black/10 hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--brand)] shadow-sm">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          {new Date(order.date_created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="text-right">
                        <p className="font-bold">₹{order.total}</p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadOrderDetails(order.id)}
                      >
                        Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredOrders.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-[color:var(--muted)]">
                      Page {orderSafePage} of {orderTotalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOrderPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={orderSafePage === 1}
                        className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:border-black/5 disabled:text-gray-400 disabled:hover:text-gray-400"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-2">
                        {orderPageNumbers.map((num, index) => {
                          const prev = orderPageNumbers[index - 1];
                          const showGap = prev && num - prev > 1;
                          return (
                            <div key={num} className="flex items-center gap-2">
                              {showGap ? (
                                <span className="text-xs text-gray-400">
                                  …
                                </span>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => setOrderPage(num)}
                                className={`h-8 min-w-[32px] rounded-full border px-3 text-xs font-semibold transition ${
                                  orderSafePage === num
                                    ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                                    : "border-black/10 text-[color:var(--muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                                }`}
                              >
                                {num}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setOrderPage((prev) =>
                            Math.min(orderTotalPages, prev + 1)
                          )
                        }
                        disabled={orderSafePage === orderTotalPages}
                        className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:border-black/5 disabled:text-gray-400 disabled:hover:text-gray-400"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="mt-0 space-y-6">
          <div className="rounded-xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                Billing & Shipping
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel Edit" : "Edit Details"}
              </Button>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-[16px] border border-black/5 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <Shield className="h-4 w-4 text-[color:var(--muted)]" />
                  </div>
                  <p className="font-semibold">Billing Address</p>
                </div>
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="First Name"
                        value={billingDraft.first_name ?? ""}
                        onChange={(e) =>
                          setBillingDraft({
                            ...billingDraft,
                            first_name: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Last Name"
                        value={billingDraft.last_name ?? ""}
                        onChange={(e) =>
                          setBillingDraft({
                            ...billingDraft,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Input
                      placeholder="Address Line 1"
                      value={billingDraft.address_1 ?? ""}
                      onChange={(e) =>
                        setBillingDraft({
                          ...billingDraft,
                          address_1: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="City"
                      value={billingDraft.city ?? ""}
                      onChange={(e) =>
                        setBillingDraft({
                          ...billingDraft,
                          city: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                        value={billingDraft.state ?? ""}
                        onChange={(e) =>
                          setBillingDraft({
                            ...billingDraft,
                            state: e.target.value,
                          })
                        }
                      >
                        <option value="">State</option>
                        {indiaStates.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Postcode"
                        value={billingDraft.postcode ?? ""}
                        onChange={(e) =>
                          setBillingDraft({
                            ...billingDraft,
                            postcode: e.target.value,
                          })
                        }
                      />
                    </div>
                    <select
                      className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                      value={billingDraft.country ?? "IN"}
                      onChange={(e) =>
                        setBillingDraft({
                          ...billingDraft,
                          country: e.target.value,
                        })
                      }
                    >
                      <option value="IN">India</option>
                    </select>
                    <Input
                      placeholder="Phone"
                      value={billingDraft.phone ?? ""}
                      onChange={(e) =>
                        setBillingDraft({
                          ...billingDraft,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : addresses.billing ? (
                  <div className="text-sm text-[color:var(--muted)] space-y-1">
                    <p className="font-medium text-[color:var(--ink)]">
                      {addresses.billing.first_name}{" "}
                      {addresses.billing.last_name}
                    </p>
                    <p>{addresses.billing.address_1}</p>
                    {addresses.billing.address_2 && (
                      <p>{addresses.billing.address_2}</p>
                    )}
                    <p>
                      {[
                        addresses.billing.city,
                        addresses.billing.state,
                        addresses.billing.postcode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{addresses.billing.country}</p>
                    <p>{addresses.billing.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--muted)]">
                    No billing address set.
                  </p>
                )}
              </div>

              <div className="rounded-[16px] border border-black/5 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <Truck className="h-4 w-4 text-[color:var(--muted)]" />
                  </div>
                  <p className="font-semibold">Shipping Address</p>
                </div>
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="First Name"
                        value={shippingDraft.first_name ?? ""}
                        onChange={(e) =>
                          setShippingDraft({
                            ...shippingDraft,
                            first_name: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Last Name"
                        value={shippingDraft.last_name ?? ""}
                        onChange={(e) =>
                          setShippingDraft({
                            ...shippingDraft,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Input
                      placeholder="Address Line 1"
                      value={shippingDraft.address_1 ?? ""}
                      onChange={(e) =>
                        setShippingDraft({
                          ...shippingDraft,
                          address_1: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="City"
                      value={shippingDraft.city ?? ""}
                      onChange={(e) =>
                        setShippingDraft({
                          ...shippingDraft,
                          city: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                        value={shippingDraft.state ?? ""}
                        onChange={(e) =>
                          setShippingDraft({
                            ...shippingDraft,
                            state: e.target.value,
                          })
                        }
                      >
                        <option value="">State</option>
                        {indiaStates.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Postcode"
                        value={shippingDraft.postcode ?? ""}
                        onChange={(e) =>
                          setShippingDraft({
                            ...shippingDraft,
                            postcode: e.target.value,
                          })
                        }
                      />
                    </div>
                    <select
                      className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                      value={shippingDraft.country ?? "IN"}
                      onChange={(e) =>
                        setShippingDraft({
                          ...shippingDraft,
                          country: e.target.value,
                        })
                      }
                    >
                      <option value="IN">India</option>
                    </select>
                    <Input
                      placeholder="Phone"
                      value={shippingDraft.phone ?? ""}
                      onChange={(e) =>
                        setShippingDraft({
                          ...shippingDraft,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : addresses.shipping ? (
                  <div className="text-sm text-[color:var(--muted)] space-y-1">
                    <p className="font-medium text-[color:var(--ink)]">
                      {addresses.shipping.first_name}{" "}
                      {addresses.shipping.last_name}
                    </p>
                    <p>{addresses.shipping.address_1}</p>
                    {addresses.shipping.address_2 && (
                      <p>{addresses.shipping.address_2}</p>
                    )}
                    <p>
                      {[
                        addresses.shipping.city,
                        addresses.shipping.state,
                        addresses.shipping.postcode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{addresses.shipping.country}</p>
                    <p>{addresses.shipping.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--muted)]">
                    No shipping address set.
                  </p>
                )}
              </div>
            </div>
            {editing && (
              <div className="mt-6 flex justify-end">
                <Button onClick={saveAddresses}>Save Changes</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {orderDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h3 className="text-lg font-semibold">
                Order #{orderDetails.id}
              </h3>
              <button
                onClick={() => setOrderDetails(null)}
                className="text-sm text-[color:var(--muted)] hover:text-black"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--muted)]">Status:</span>
                <span className="font-medium capitalize">
                  {orderDetails.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--muted)]">Total Amount:</span>
                <span className="text-lg font-bold">₹{orderDetails.total}</span>
              </div>
              <div className="mt-4 rounded-[16px] border border-black/5 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                  Items
                </p>
                <div className="space-y-3">
                  {orderDetails.line_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-[10px] bg-white border border-black/5">
                          {item.image?.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image.src}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                              <Package className="h-4 w-4 text-[color:var(--muted)]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-[color:var(--muted)]">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOrderDetails(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
