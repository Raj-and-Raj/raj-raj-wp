"use client";

import { useIndiaStates } from "@/lib/india-states";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Home,
  Loader2,
  LogOut,
  MapPin,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  ADDRESS_LABELS,
  addressName,
  type AddressBook,
  type AddressInput,
  type SavedAddress,
} from "@/lib/address-book-types";

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

type OrderSummary = {
  id: number;
  status: string;
  total: string;
  date_created: string;
};

type OrderDetails = OrderSummary & {
  payment_method_title?: string;
  shipping_total?: string;
  discount_total?: string;
  shipping?: Address;
  billing?: Address & { email?: string };
  line_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
    image?: { src?: string };
  }>;
};

type Tab = "orders" | "track" | "addresses" | "profile";

const TABS: Array<{ id: Tab; label: string; Icon: typeof Package; hint: string }> = [
  { id: "orders", label: "My orders", Icon: Package, hint: "History & details" },
  { id: "track", label: "Track order", Icon: Truck, hint: "Check delivery status" },
  { id: "addresses", label: "Addresses", Icon: MapPin, hint: "Billing & shipping" },
  { id: "profile", label: "Profile & security", Icon: Shield, hint: "Name, email, password" },
];

const STATUS: Record<string, { label: string; className: string; dot: string }> = {
  pending: { label: "Pending payment", className: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  "on-hold": { label: "On hold", className: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  shipped: { label: "Shipped", className: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  completed: { label: "Delivered", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  refunded: { label: "Refunded", className: "bg-purple-50 text-purple-700 ring-purple-200", dot: "bg-purple-500" },
  failed: { label: "Payment failed", className: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
};

const statusInfo = (status: string) =>
  STATUS[status] ?? {
    label: status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };

const IN_PROGRESS = new Set(["pending", "on-hold", "processing", "shipped"]);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const money = (value?: string) => formatPrice(Number(value) || 0);

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const inputClass =
  "w-full rounded-[10px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)]/60 transition focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15 disabled:bg-slate-50";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(221,51,51,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]";

export function AccountDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const indiaStates = useIndiaStates();
  const [tab, setTab] = useState<Tab>("orders");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<null | {
    name: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<number | null>(null);
  const [trackPrefill, setTrackPrefill] = useState("");

  // Keep the selected tab in the URL hash so it survives reloads and links.
  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = window.location.hash.replace("#", "") as Tab;
      if (TABS.some((t) => t.id === fromHash)) setTab(fromHash);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, "", `#${next}`);
  };

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
    setProfile({
      name: fullName || data.name || username || "Customer",
      email: data.email,
      username,
      firstName,
      lastName,
    });

    const ordersRes = await fetch("/api/account/orders");
    if (ordersRes.ok) {
      const orderData = await ordersRes.json();
      setOrders(orderData.orders ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.dispatchEvent(new Event("auth:updated"));
    router.push("/login");
  };

  const openOrder = async (id: number) => {
    setDetailsLoading(id);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error();
      setOrderDetails(await res.json());
    } catch {
      toast({ variant: "destructive", title: "Couldn't load order", description: `Order #${id}` });
    } finally {
      setDetailsLoading(null);
    }
  };


  if (loading) return <DashboardSkeleton />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
        <User className="mx-auto h-10 w-10 text-[color:var(--muted)]" />
        <p className="mt-4 text-sm text-[color:var(--muted)]">Please sign in to view your account.</p>
        <button type="button" className={cn(primaryBtn, "mt-6")} onClick={() => router.push("/login?redirect=/account")}>
          Go to login
        </button>
      </div>
    );
  }

  const displayName = profile.firstName || profile.name;
  const initials =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((part) => part!.charAt(0))
      .join("")
      .toUpperCase() || displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-[#111] p-6 text-white shadow-lg sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand)]/35 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:26px_26px]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand)] to-red-500 text-xl font-bold shadow-lg shadow-red-900/40">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white/60">Welcome back</p>
              <h1 className="truncate text-2xl font-bold sm:text-3xl">Hi, {displayName}</h1>
              <p className="truncate text-sm text-white/60">{profile.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 md:self-center"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Navigation */}
        <nav aria-label="Account sections" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div
            role="tablist"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:rounded-3xl lg:border lg:border-black/5 lg:bg-white lg:p-3 lg:shadow-sm"
          >
            {TABS.map(({ id, label, Icon, hint }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => selectTab(id)}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-3 rounded-full border px-4 py-2.5 text-left text-sm font-medium transition lg:rounded-2xl lg:border-transparent lg:py-3",
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white lg:bg-[color:var(--brand)]/[0.07] lg:text-[color:var(--brand)]"
                      : "border-black/10 bg-white text-[color:var(--ink)] hover:border-black/20 lg:hover:bg-slate-50",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="account-tab-indicator"
                      className="absolute inset-y-2 left-0 hidden w-1 rounded-full bg-[color:var(--brand)] lg:block"
                    />
                  ) : null}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    {label}
                    <span className="hidden text-xs font-normal text-[color:var(--muted)] lg:block">{hint}</span>
                  </span>
                </button>
              );
            })}
            <Link
              href="/wishlist"
              className="flex shrink-0 items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--ink)] transition hover:border-black/20 lg:rounded-2xl lg:border-transparent lg:py-3 lg:hover:bg-slate-50"
            >
              <Heart className="h-4 w-4" />
              <span className="whitespace-nowrap">
                Wishlist
                <span className="hidden text-xs font-normal text-[color:var(--muted)] lg:block">Saved products</span>
              </span>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="min-w-0"
          >
            {tab === "orders" ? (
              <OrdersPanel
                orders={orders}
                loadingId={detailsLoading}
                onOpen={openOrder}
                onTrack={(id) => {
                  setTrackPrefill(String(id));
                  selectTab("track");
                }}
              />
            ) : tab === "track" ? (
              <TrackPanel key={trackPrefill} initialId={trackPrefill} onOpen={openOrder} />
            ) : tab === "addresses" ? (
              <AddressBookPanel states={indiaStates} />
            ) : (
              <ProfilePanel profile={profile} onSaved={loadAll} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <OrderDrawer
        order={orderDetails}
        states={indiaStates}
        onClose={() => setOrderDetails(null)}
        onTrack={(id) => {
          setOrderDetails(null);
          setTrackPrefill(String(id));
          selectTab("track");
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared bits

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--ink)]">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-[color:var(--muted)]">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const info = statusInfo(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", info.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", info.dot)} />
      {info.label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

const STEPS = [
  { label: "Placed", Icon: ShoppingBag },
  { label: "Confirmed", Icon: CheckCheck },
  { label: "Shipped", Icon: Truck },
  { label: "Delivered", Icon: Home },
];

function stepFor(status: string) {
  if (status === "completed") return 3;
  if (status === "shipped") return 2;
  if (status === "processing") return 1;
  return 0;
}

function Progress({ status }: { status: string }) {
  if (["cancelled", "refunded", "failed"].includes(status)) {
    return (
      <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-[color:var(--muted)]">
        This order is <span className="font-medium text-[color:var(--ink)]">{statusInfo(status).label.toLowerCase()}</span>.
        Contact us if you have any questions.
      </p>
    );
  }
  const current = stepFor(status);
  return (
    <div className="relative">
      <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-slate-100" />
      <motion.div
        className="absolute left-[12.5%] top-5 h-1 rounded-full bg-emerald-500"
        initial={{ width: 0 }}
        animate={{ width: `${(current / 3) * 75}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <ol className="relative grid grid-cols-4">
        {STEPS.map(({ label, Icon }, i) => (
          <li key={label} className="flex flex-col items-center text-center">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white transition",
                i <= current ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-300",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className={cn("mt-2 text-xs font-medium", i <= current ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]")}>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Orders

function OrdersPanel({
  orders,
  loadingId,
  onOpen,
  onTrack,
}: {
  orders: OrderSummary[];
  loadingId: number | null;
  onOpen: (id: number) => void;
  onTrack: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const visibleOrders = useMemo(() => orders.filter((o) => o.status !== "checkout-draft"), [orders]);

  const statusOptions = useMemo(() => {
    const counts = new Map<string, number>();
    visibleOrders.forEach((o) => counts.set(o.status, (counts.get(o.status) ?? 0) + 1));
    return Array.from(counts.entries());
  }, [visibleOrders]);

  const years = useMemo(() => {
    const set = new Set<string>();
    visibleOrders.forEach((o) => {
      const d = new Date(o.date_created);
      if (!Number.isNaN(d.getTime())) set.add(String(d.getFullYear()));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [visibleOrders]);

  const filtered = useMemo(() => {
    const q = query.replace(/[^0-9]/g, "");
    return visibleOrders.filter((o) => {
      if (q && !String(o.id).includes(q)) return false;
      if (status !== "all" && o.status !== status) return false;
      const d = new Date(o.date_created);
      if (year !== "all" && String(d.getFullYear()) !== year) return false;
      if (month !== "all" && String(d.getMonth() + 1).padStart(2, "0") !== month) return false;
      return true;
    });
  }, [visibleOrders, query, status, year, month]);

  useEffect(() => setPage(1), [query, status, year, month, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageOrders = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const filtersActive = query || status !== "all" || year !== "all" || month !== "all";

  if (visibleOrders.length === 0) {
    return (
      <Panel title="My orders">
        <div className="flex flex-col items-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-semibold text-[color:var(--ink)]">No orders yet</h3>
          <p className="mt-1 max-w-xs text-sm text-[color:var(--muted)]">
            When you place an order, you&apos;ll be able to follow it right here.
          </p>
          <Link href="/products" className={cn(primaryBtn, "mt-6")}>
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="My orders"
      description={`${visibleOrders.length} order${visibleOrders.length === 1 ? "" : "s"} placed`}
    >
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputMode="numeric"
              placeholder="Search by order number"
              aria-label="Search by order number"
              className={cn(inputClass, "pl-10")}
            />
          </div>
          <div className="flex gap-2">
            <select aria-label="Year" value={year} onChange={(e) => { setYear(e.target.value); setMonth("all"); }} className={cn(inputClass, "w-auto")}>
              <option value="all">All years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select aria-label="Month" value={month} disabled={year === "all"} onChange={(e) => setMonth(e.target.value)} className={cn(inputClass, "w-auto")}>
              <option value="all">All months</option>
              {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
            </select>
          </div>
        </div>
        {statusOptions.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {[["all", visibleOrders.length] as [string, number], ...statusOptions].map(([value, count]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  status === value
                    ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white"
                    : "border-black/10 bg-white text-[color:var(--muted)] hover:border-black/25",
                )}
              >
                {value === "all" ? "All" : statusInfo(value).label}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* List */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center">
            <PackageSearch className="mx-auto h-8 w-8 text-[color:var(--muted)]" />
            <p className="mt-3 text-sm text-[color:var(--muted)]">No orders match these filters.</p>
            {filtersActive ? (
              <button
                type="button"
                onClick={() => { setQuery(""); setStatus("all"); setYear("all"); setMonth("all"); }}
                className="mt-3 text-sm font-semibold text-[color:var(--brand)] hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          pageOrders.map((order, index) => (
            <motion.article
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group flex flex-col gap-4 rounded-2xl border border-black/5 bg-slate-50/60 p-4 transition hover:border-black/10 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[color:var(--brand)] shadow-sm ring-1 ring-black/5">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[color:var(--ink)]">Order #{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Placed on {formatDate(order.date_created)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3 sm:border-0 sm:pt-0">
                <p className="text-lg font-bold text-[color:var(--ink)]">{money(order.total)}</p>
                <div className="flex gap-2">
                  {IN_PROGRESS.has(order.status) ? (
                    <button type="button" onClick={() => onTrack(order.id)} className={cn(secondaryBtn, "px-3")} aria-label={`Track order ${order.id}`}>
                      <Truck className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button type="button" onClick={() => onOpen(order.id)} className={secondaryBtn} disabled={loadingId === order.id}>
                    {loadingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
            Show
            <select aria-label="Orders per page" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs">
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            per page · {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-40 disabled:hover:border-black/10 disabled:hover:text-[color:var(--muted)]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .map((n, i, list) => (
                  <span key={n} className="flex items-center gap-1">
                    {i > 0 && n - list[i - 1] > 1 ? <span className="px-1 text-xs text-[color:var(--muted)]">…</span> : null}
                    <button
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === safePage ? "page" : undefined}
                      className={cn(
                        "h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition",
                        n === safePage ? "bg-[color:var(--brand)] text-white" : "text-[color:var(--muted)] hover:bg-slate-100",
                      )}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button type="button" aria-label="Next page" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-40 disabled:hover:border-black/10 disabled:hover:text-[color:var(--muted)]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Track order

function TrackPanel({ initialId, onOpen }: { initialId: string; onOpen: (id: number) => void }) {
  const [trackId, setTrackId] = useState(initialId);
  const [tracked, setTracked] = useState<OrderSummary | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "notfound">("idle");

  const track = async (id = trackId) => {
    const clean = id.replace(/[^0-9]/g, "");
    if (!clean) return;
    setState("loading");
    const res = await fetch(`/api/account/orders/item?id=${clean}`);
    if (res.ok) {
      const data = await res.json();
      setTracked(data.order);
      setState("idle");
    } else {
      setTracked(null);
      setState("notfound");
    }
  };

  useEffect(() => {
    if (initialId) track(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Panel title="Track order" description="Enter an order number from your account to see where it is.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          track();
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[color:var(--muted)]">#</span>
          <input
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            inputMode="numeric"
            placeholder="Order number, e.g. 499"
            aria-label="Order number"
            className={cn(inputClass, "pl-8")}
          />
        </div>
        <button type="submit" className={primaryBtn} disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
          Track
        </button>
      </form>

      {state === "notfound" ? (
        <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We couldn&apos;t find that order in your account. Check the number and try again.
        </div>
      ) : null}

      {tracked ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-black/5 bg-slate-50/60 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-[color:var(--ink)]">Order #{tracked.id}</p>
              <p className="text-sm text-[color:var(--muted)]">
                {tracked.date_created ? `Placed on ${formatDate(tracked.date_created)} · ` : ""}
                {money(tracked.total)}
              </p>
            </div>
            <StatusBadge status={tracked.status} />
          </div>
          <div className="mt-6">
            <Progress status={tracked.status} />
          </div>
          <button type="button" onClick={() => onOpen(tracked.id)} className={cn(secondaryBtn, "mt-6")}>
            View order details <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      ) : state === "idle" && !initialId ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-[color:var(--muted)]">
          <PackageSearch className="h-5 w-5 shrink-0" />
          Tip: you can also tap the truck icon next to any order in My orders.
        </div>
      ) : null}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Address book

function AddressBookPanel({ states }: { states: Array<{ code: string; name: string }> }) {
  const { toast } = useToast();
  const [book, setBook] = useState<AddressBook | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<null | { id: string | null }>(null);
  const [draft, setDraft] = useState<AddressInput>({});
  const [makeDefault, setMakeDefault] = useState({ billing: false, shipping: false });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const call = async (method: string, body?: unknown, query = "") => {
    const res = await fetch(`/api/account/address-book${query}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Something went wrong.");
    return data as AddressBook;
  };

  useEffect(() => {
    call("GET")
      .then(setBook)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Couldn't load addresses."));
  }, []);

  const stateName = (code?: string) => states.find((s) => s.code === code)?.name ?? code;

  const openEditor = (address?: SavedAddress) => {
    setFormError("");
    setConfirmDelete(null);
    if (address) {
      const { id, ...rest } = address;
      setDraft(rest);
      setEditor({ id });
    } else {
      setDraft({ label: book?.addresses.length ? "Office" : "Home", country: "IN" });
      setEditor({ id: null });
    }
    setMakeDefault({ billing: false, shipping: false });
  };

  const save = async () => {
    if (!editor) return;
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        address: draft,
        setDefaultBilling: makeDefault.billing,
        setDefaultShipping: makeDefault.shipping,
      };
      const next = editor.id
        ? await call("PUT", { id: editor.id, ...payload })
        : await call("POST", payload);
      setBook(next);
      setEditor(null);
      toast({ variant: "success", title: editor.id ? "Address updated" : "Address added" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't save address.");
    } finally {
      setSaving(false);
    }
  };

  const makeDefaultFor = async (id: string, kind: "billing" | "shipping") => {
    setBusyId(id);
    try {
      setBook(await call("PATCH", kind === "billing" ? { defaultBilling: id } : { defaultShipping: id }));
      toast({ variant: "success", title: `Default ${kind} address updated` });
    } catch (err) {
      toast({ variant: "destructive", title: "Couldn't update default", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      setBook(await call("DELETE", undefined, `?id=${encodeURIComponent(id)}`));
      setConfirmDelete(null);
      toast({ variant: "success", title: "Address removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Couldn't remove address", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyId(null);
    }
  };

  const set = (field: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const editorCard = editor ? (
    <motion.div
      key="editor"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[color:var(--brand)]/40 bg-white p-5 shadow-md md:col-span-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[color:var(--ink)]">{editor.id ? "Edit address" : "Add a new address"}</h3>
        <button type="button" onClick={() => setEditor(null)} aria-label="Close" className="rounded-full p-1.5 text-[color:var(--muted)] hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">Save as</span>
        <div className="flex flex-wrap gap-2">
          {ADDRESS_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, label }))}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                draft.label === label
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                  : "border-black/10 bg-white text-[color:var(--muted)] hover:border-black/25",
              )}
            >
              {label}
            </button>
          ))}
          <input
            aria-label="Custom label"
            placeholder="Custom label"
            value={ADDRESS_LABELS.includes(draft.label ?? "") ? "" : draft.label ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
            className="w-32 rounded-full border border-black/10 px-3.5 py-1.5 text-xs focus:border-[color:var(--brand)] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="First name *"><input className={inputClass} autoComplete="given-name" value={draft.first_name ?? ""} onChange={set("first_name")} /></Field>
        <Field label="Last name *"><input className={inputClass} autoComplete="family-name" value={draft.last_name ?? ""} onChange={set("last_name")} /></Field>
        <div className="sm:col-span-2">
          <Field label="Company (optional)"><input className={inputClass} autoComplete="organization" value={draft.company ?? ""} onChange={set("company")} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Street address *"><input className={inputClass} autoComplete="address-line1" placeholder="House number and street name" value={draft.address_1 ?? ""} onChange={set("address_1")} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Apartment, suite, landmark (optional)"><input className={inputClass} autoComplete="address-line2" value={draft.address_2 ?? ""} onChange={set("address_2")} /></Field>
        </div>
        <Field label="Town / City *"><input className={inputClass} autoComplete="address-level2" value={draft.city ?? ""} onChange={set("city")} /></Field>
        <Field label="State *">
          <select className={inputClass} value={draft.state ?? ""} onChange={set("state")}>
            <option value="">Select state</option>
            {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="PIN code *"><input className={inputClass} inputMode="numeric" maxLength={6} autoComplete="postal-code" value={draft.postcode ?? ""} onChange={set("postcode")} /></Field>
        <Field label="Phone *"><input className={inputClass} type="tel" autoComplete="tel" value={draft.phone ?? ""} onChange={set("phone")} /></Field>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-6">
        {(["billing", "shipping"] as const).map((kind) => {
          const already = editor.id && book?.[kind === "billing" ? "defaultBilling" : "defaultShipping"] === editor.id;
          return (
            <label key={kind} className="flex items-center gap-2 text-sm text-[color:var(--ink)]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[color:var(--brand)]"
                checked={Boolean(already) || makeDefault[kind]}
                disabled={Boolean(already)}
                onChange={(e) => setMakeDefault((prev) => ({ ...prev, [kind]: e.target.checked }))}
              />
              Use as default {kind} address
            </label>
          );
        })}
      </div>

      {formError ? (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{formError}</div>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => setEditor(null)} className={secondaryBtn} disabled={saving}>Cancel</button>
        <button type="button" onClick={save} className={primaryBtn} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {editor.id ? "Save changes" : "Save address"}
        </button>
      </div>
    </motion.div>
  ) : null;

  return (
    <Panel
      title="Address book"
      description="Save several addresses and choose between them at checkout."
      action={
        book && !editor ? (
          <button type="button" onClick={() => openEditor()} className={primaryBtn}>
            <Plus className="h-4 w-4" /> Add address
          </button>
        ) : null
      }
    >
      {loadError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      ) : !book ? (
        <div className="grid animate-pulse gap-4 md:grid-cols-2">
          <div className="h-48 rounded-2xl bg-slate-100" />
          <div className="h-48 rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {editor && !editor.id ? editorCard : null}

          {book.addresses.length === 0 && !editor ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center md:col-span-2">
              <MapPin className="h-8 w-8 text-[color:var(--muted)]" />
              <p className="mt-3 font-semibold text-[color:var(--ink)]">No saved addresses yet</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Add your home, office or site address for faster checkout.</p>
              <button type="button" onClick={() => openEditor()} className={cn(primaryBtn, "mt-5")}>
                <Plus className="h-4 w-4" /> Add address
              </button>
            </div>
          ) : null}

          {book.addresses.map((address) => {
            if (editor?.id === address.id) return <div key={address.id} className="contents">{editorCard}</div>;
            const isBilling = book.defaultBilling === address.id;
            const isShipping = book.defaultShipping === address.id;
            const busy = busyId === address.id;
            return (
              <motion.div
                key={address.id}
                layout
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5 transition",
                  isBilling || isShipping ? "border-[color:var(--brand)]/25 bg-[color:var(--brand)]/[0.03]" : "border-black/5 bg-slate-50/60",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ink)] px-2.5 py-1 text-xs font-semibold text-white">
                    {address.label === "Office" || address.label === "Warehouse" ? <Building className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                    {address.label || "Address"}
                  </span>
                  {isBilling ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">Default billing</span> : null}
                  {isShipping ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">Default shipping</span> : null}
                </div>

                <address className="mt-4 flex-1 space-y-0.5 text-sm not-italic leading-relaxed text-[color:var(--muted)]">
                  <p className="font-medium text-[color:var(--ink)]">{addressName(address)}</p>
                  {address.company ? <p>{address.company}</p> : null}
                  <p>{[address.address_1, address.address_2].filter(Boolean).join(", ")}</p>
                  <p>{[address.city, stateName(address.state)].filter(Boolean).join(", ")}{address.postcode ? ` – ${address.postcode}` : ""}</p>
                  {address.phone ? <p>{address.phone}</p> : null}
                </address>

                {confirmDelete === address.id ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    Remove this address?
                    <span className="flex gap-2">
                      <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-full px-3 py-1 text-xs font-semibold text-[color:var(--ink)] hover:bg-white">Keep</button>
                      <button type="button" onClick={() => remove(address.id)} disabled={busy} className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">
                        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Remove
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/5 pt-3 text-xs font-semibold">
                    <button type="button" onClick={() => openEditor(address)} disabled={!!editor} className="inline-flex items-center gap-1 text-[color:var(--ink)] hover:text-[color:var(--brand)] disabled:opacity-40">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(address.id)} disabled={!!editor} className="inline-flex items-center gap-1 text-[color:var(--muted)] hover:text-red-600 disabled:opacity-40">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                    <span className="ml-auto flex flex-wrap gap-x-3 gap-y-1">
                      {!isBilling ? (
                        <button type="button" onClick={() => makeDefaultFor(address.id, "billing")} disabled={busy} className="text-[color:var(--brand)] hover:underline disabled:opacity-50">Set default billing</button>
                      ) : null}
                      {!isShipping ? (
                        <button type="button" onClick={() => makeDefaultFor(address.id, "shipping")} disabled={busy} className="text-[color:var(--brand)] hover:underline disabled:opacity-50">Set default shipping</button>
                      ) : null}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Profile & security

function ProfilePanel({
  profile,
  onSaved,
}: {
  profile: { name: string; email: string; username?: string };
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState({ name: profile.name, email: profile.email ?? "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [password, setPassword] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const profileChanged = draft.name !== profile.name || draft.email !== (profile.email ?? "");

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name, email: draft.email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to update profile.");
      }
      toast({ variant: "success", title: "Profile updated" });
      onSaved();
    } catch (err) {
      toast({ variant: "destructive", title: "Couldn't update profile", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSavingProfile(false);
    }
  };

  const strength =
    password.password.length === 0
      ? 0
      : [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password.password)).length;

  const savePassword = async () => {
    setPasswordError("");
    if (password.password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (password.password !== password.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to update password.");
      }
      toast({ variant: "success", title: "Password updated" });
      setPassword({ password: "", confirm: "" });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Profile" description="Your name and email for orders and updates.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputClass} autoComplete="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Email address">
            <input className={inputClass} type="email" autoComplete="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </Field>
          {profile.username ? (
            <Field label="Username">
              <input className={inputClass} value={profile.username} disabled />
            </Field>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={saveProfile} className={primaryBtn} disabled={!profileChanged || savingProfile}>
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
        </div>
      </Panel>

      <Panel title="Change password" description="Use at least 8 characters with a mix of letters, numbers and symbols.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password">
            <div className="relative">
              <input
                className={cn(inputClass, "pr-10")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password.password}
                onChange={(e) => setPassword({ ...password, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm new password">
            <input
              className={inputClass}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
            />
          </Field>
        </div>
        {password.password ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition",
                    i < strength ? (strength <= 1 ? "bg-red-400" : strength <= 2 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-200",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-[color:var(--muted)]">
              {strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength === 3 ? "Good" : "Strong"}
            </span>
          </div>
        ) : null}
        {passwordError ? (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {passwordError}
          </div>
        ) : null}
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={savePassword} className={primaryBtn} disabled={!password.password || savingPassword}>
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Update password
          </button>
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order details drawer

function OrderDrawer({
  order,
  states,
  onClose,
  onTrack,
}: {
  order: OrderDetails | null;
  states: Array<{ code: string; name: string }>;
  onClose: () => void;
  onTrack: (id: number) => void;
}) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [order, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ship = order?.shipping?.address_1 ? order.shipping : order?.billing;
  const subtotal = order?.line_items?.reduce((sum, item) => sum + (Number(item.total) || 0), 0) ?? 0;
  const shippingCost = Number(order?.shipping_total) || 0;
  const discount = Number(order?.discount_total) || 0;

  if (!mounted) return null;

  // Portal + max z-index: the site header sits at the browser's max z-index.
  return createPortal(
    <AnimatePresence>
      {order ? (
        <div className="fixed inset-0 z-[2147483647]">
          <motion.button
            type="button"
            aria-label="Close order details"
            className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${order.id} details`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-black/5 p-5">
              <div>
                <p className="text-xs text-[color:var(--muted)]">Placed on {formatDate(order.date_created)}</p>
                <h3 className="mt-0.5 text-xl font-bold text-[color:var(--ink)]">Order #{order.id}</h3>
                <div className="mt-2"><StatusBadge status={order.status} /></div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-slate-100 hover:text-[color:var(--ink)]">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <Progress status={order.status} />

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">Items</h4>
                <ul className="mt-3 divide-y divide-black/5">
                  {order.line_items?.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f4f1ec] ring-1 ring-black/5">
                        {item.image?.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image.src} alt={item.name} className="h-full w-full object-contain p-1" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><Package className="h-5 w-5 text-[color:var(--muted)]" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[color:var(--ink)]">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted)]">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-[color:var(--ink)]">{money(item.total)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-2 space-y-1.5 border-t border-dashed border-black/10 pt-3 text-sm text-[color:var(--muted)]">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
                  {discount > 0 ? <div className="flex justify-between text-emerald-600"><dt>Discount</dt><dd>− {formatPrice(discount)}</dd></div> : null}
                  <div className="flex justify-between"><dt>Shipping</dt><dd>{shippingCost > 0 ? formatPrice(shippingCost) : "Free"}</dd></div>
                  <div className="flex justify-between pt-1 text-base font-bold text-[color:var(--ink)]"><dt>Total</dt><dd>{money(order.total)}</dd></div>
                </dl>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                {ship?.address_1 ? (
                  <section className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--ink)]"><MapPin className="h-3.5 w-3.5 text-[color:var(--brand)]" /> Delivery address</h4>
                    <address className="mt-2 text-xs not-italic leading-relaxed text-[color:var(--muted)]">
                      {[ship.first_name, ship.last_name].filter(Boolean).join(" ")}<br />
                      {ship.address_1}{ship.address_2 ? `, ${ship.address_2}` : ""}<br />
                      {[ship.city, states.find((s) => s.code === ship.state)?.name ?? ship.state].filter(Boolean).join(", ")}
                      {ship.postcode ? ` – ${ship.postcode}` : ""}
                    </address>
                  </section>
                ) : null}
                {order.payment_method_title ? (
                  <section className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--ink)]"><Wallet className="h-3.5 w-3.5 text-[color:var(--brand)]" /> Payment</h4>
                    <p className="mt-2 text-xs text-[color:var(--muted)]">{order.payment_method_title}</p>
                  </section>
                ) : null}
              </div>
            </div>

            <footer className="flex gap-2 border-t border-black/5 p-5">
              {IN_PROGRESS.has(order.status) ? (
                <button type="button" onClick={() => onTrack(order.id)} className={cn(secondaryBtn, "flex-1")}>
                  <Truck className="h-4 w-4" /> Track
                </button>
              ) : null}
              <button type="button" onClick={onClose} className={cn(primaryBtn, "flex-1")}>Done</button>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading your account">
      <div className="h-48 rounded-3xl bg-slate-200/70" />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="hidden h-72 rounded-3xl bg-white lg:block" />
        <div className="space-y-3 rounded-3xl bg-white p-6">
          <div className="h-6 w-40 rounded-full bg-slate-100" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
