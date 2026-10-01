"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  CreditCard,
  Home,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { INDIA_STATES } from "@/lib/india-states";
import { payOrderWithRazorpay } from "@/lib/razorpay-client";

type Address = {
  first_name?: string;
  last_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type Order = {
  id: number;
  status: string;
  payment_method?: string;
  payment_method_title?: string;
  needs_payment?: boolean;
  total: string;
  shipping_total?: string;
  discount_total?: string;
  total_tax?: string;
  currency: string;
  date_created: string;
  customer_note?: string;
  billing?: Address;
  shipping?: Address;
  line_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
    price: number;
    image?: { src?: string };
  }>;
};

const SUPPORT_PHONE = { display: "+91 33 4800 0018", href: "tel:+913348000018" };

const amount = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const stateName = (code?: string) =>
  INDIA_STATES.find((s) => s.code === code)?.name ?? code;

const countryName = (code?: string) => (code === "IN" ? "India" : code);

function addressLines(address?: Address) {
  if (!address) return [];
  return [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.company,
    address.address_1,
    address.address_2,
    [address.city, stateName(address.state)].filter(Boolean).join(", ") +
      (address.postcode ? ` – ${address.postcode}` : ""),
    countryName(address.country),
  ].filter((line): line is string => Boolean(line && line.trim()));
}

function hasAddress(address?: Address) {
  return Boolean(address?.address_1 || address?.city);
}

// Progress through WooCommerce statuses. WooCommerce has no "shipped" status
// by default, so "completed" marks the order as delivered.
const STEPS = [
  { label: "Order placed", Icon: ShoppingBag },
  { label: "Confirmed", Icon: CheckCheck },
  { label: "Shipped", Icon: Truck },
  { label: "Delivered", Icon: Home },
];

function stepIndex(status: string) {
  switch (status) {
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const orderKey = params.get("key");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/orders/${orderId}${orderKey ? `?key=${encodeURIComponent(orderKey)}` : ""}`,
        );
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
  }, [orderId, orderKey]);

  const completePayment = async () => {
    if (!order || !orderKey) return;
    setPaying(true);
    setPayError("");
    try {
      await payOrderWithRazorpay({ orderId: order.id, orderKey });
      window.location.reload();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed.");
      setPaying(false);
    }
  };

  if (!orderId || error) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-[color:var(--ink)]">
            We couldn&apos;t load this order
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {error || "The order link is incomplete."} If you placed an order,
            you&apos;ll find it in your account or confirmation email.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              My orders
            </Link>
            <a
              href={SUPPORT_PHONE.href}
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)]"
            >
              Call {SUPPORT_PHONE.display}
            </a>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!order) return <LoadingState />;

  const paymentFailed = order.status === "failed";
  const awaitingPayment =
    !paymentFailed &&
    (order.needs_payment ??
      (order.status === "pending" && order.payment_method !== "cod"));
  const cancelled = order.status === "cancelled" || order.status === "refunded";
  const confirmed = !paymentFailed && !awaitingPayment && !cancelled;

  const itemsSubtotal =
    order.line_items?.reduce((sum, item) => sum + amount(item.total), 0) ?? 0;
  const shipping = amount(order.shipping_total);
  const discount = amount(order.discount_total);
  const tax = amount(order.total_tax);
  const firstName = order.billing?.first_name?.trim();
  const placedOn = new Date(order.date_created).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const shipTo = hasAddress(order.shipping) ? order.shipping : order.billing;

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white px-6 pb-10 pt-12 text-center shadow-sm sm:px-10">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 -top-32 mx-auto h-72 max-w-3xl rounded-full blur-3xl",
            confirmed
              ? "bg-emerald-200/50"
              : paymentFailed || cancelled
                ? "bg-red-200/50"
                : "bg-amber-200/60",
          )}
        />
        <StatusBadge
          tone={confirmed ? "success" : paymentFailed || cancelled ? "error" : "pending"}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="relative"
        >
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-[color:var(--ink)] sm:text-4xl">
            {confirmed
              ? firstName
                ? `Thank you, ${firstName}!`
                : "Thank you for your order!"
              : paymentFailed
                ? "Payment didn't go through"
                : cancelled
                  ? "This order was cancelled"
                  : "Almost there — payment pending"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[color:var(--muted)]">
            {confirmed
              ? "Your order is confirmed and our team is getting it ready."
              : paymentFailed
                ? "We couldn't confirm your payment. Your order is saved, so you can try again."
                : cancelled
                  ? "If you have questions about this order, our team is happy to help."
                  : "Your order is saved. Complete the payment to confirm it."}
          </p>

          <OrderNumber id={order.id} />

          {(awaitingPayment || paymentFailed) &&
          order.payment_method === "razorpay" &&
          orderKey ? (
            <div className="mx-auto mt-6 max-w-sm">
              <button
                type="button"
                disabled={paying}
                onClick={completePayment}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(221,51,51,0.3)] transition hover:brightness-110 disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {paying ? "Processing payment..." : "Complete payment"}
              </button>
              {payError ? (
                <div
                  role="alert"
                  className="mt-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {payError}
                </div>
              ) : null}
            </div>
          ) : null}
        </motion.div>

        {/* Quick facts */}
        <motion.dl
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-4"
        >
          {[
            { Icon: CalendarDays, label: "Order date", value: placedOn },
            { Icon: ShoppingBag, label: "Total", value: formatPrice(amount(order.total)) },
            {
              Icon: CreditCard,
              label: "Payment",
              value: order.payment_method_title || "—",
            },
            { Icon: Mail, label: "Email", value: order.billing?.email || "—" },
          ].map(({ Icon, label, value }) => (
            <motion.div
              key={label}
              variants={rise}
              className="rounded-2xl border border-black/5 bg-slate-50/80 px-4 py-3"
            >
              <dt className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                <Icon className="h-3.5 w-3.5" /> {label}
              </dt>
              <dd className="mt-1 truncate text-sm font-semibold text-[color:var(--ink)]" title={value}>
                {value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>

        {confirmed && order.billing?.email ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="relative mt-6 text-xs text-[color:var(--muted)]"
          >
            A confirmation email is on its way to{" "}
            <span className="font-medium text-[color:var(--ink)]">{order.billing.email}</span>.
          </motion.p>
        ) : null}
      </section>

      {/* Progress */}
      {!cancelled ? <Timeline current={stepIndex(order.status)} muted={!confirmed} /> : null}

      {/* Details */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"
      >
        <motion.section
          variants={rise}
          className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Items ordered</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-[color:var(--muted)]">
              {order.line_items?.reduce((n, item) => n + item.quantity, 0) ?? 0} item(s)
            </span>
          </div>

          <ul className="mt-5 divide-y divide-black/5">
            {order.line_items?.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className="flex items-center gap-4 py-4 first:pt-0"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f4f1ec] ring-1 ring-black/5">
                  {item.image?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image.src}
                      alt={item.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
                      <PackageCheck className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[color:var(--ink)]">{item.name}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    Qty {item.quantity}
                    {item.quantity > 1 ? ` × ${formatPrice(amount(item.total) / item.quantity)}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[color:var(--ink)]">
                  {formatPrice(amount(item.total))}
                </span>
              </motion.li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-dashed border-black/10 pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(itemsSubtotal)} />
            {discount > 0 ? (
              <Row label="Discount" value={`− ${formatPrice(discount)}`} className="text-emerald-600" />
            ) : null}
            <Row label="Shipping" value={shipping > 0 ? formatPrice(shipping) : "Free"} />
            {tax > 0 ? <Row label="Tax" value={formatPrice(tax)} /> : null}
            <div className="flex items-center justify-between border-t border-black/5 pt-3 text-base font-bold text-[color:var(--ink)]">
              <dt>Total</dt>
              <dd>{formatPrice(amount(order.total))}</dd>
            </div>
          </dl>

          {order.customer_note ? (
            <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-[color:var(--muted)]">
              <span className="font-medium text-[color:var(--ink)]">Order note: </span>
              {order.customer_note}
            </p>
          ) : null}
        </motion.section>

        <div className="space-y-6">
          <motion.section variants={rise} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
              <MapPin className="h-4 w-4 text-[color:var(--brand)]" /> Delivering to
            </h3>
            <address className="mt-3 space-y-0.5 text-sm not-italic leading-relaxed text-[color:var(--muted)]">
              {addressLines(shipTo).map((line, i) => (
                <p key={i} className={i === 0 ? "font-medium text-[color:var(--ink)]" : undefined}>
                  {line}
                </p>
              ))}
            </address>
          </motion.section>

          <motion.section variants={rise} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
              <UserRound className="h-4 w-4 text-[color:var(--brand)]" /> Contact
            </h3>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              {order.billing?.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {order.billing.phone}
                </p>
              ) : null}
              {order.billing?.email ? (
                <p className="flex items-center gap-2 break-all">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {order.billing.email}
                </p>
              ) : null}
            </div>
          </motion.section>

          <motion.section
            variants={rise}
            className="relative overflow-hidden rounded-3xl bg-[#111] p-6 text-white shadow-sm"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color:var(--brand)]/40 blur-2xl" />
            <h3 className="relative text-sm font-semibold">Need help with your order?</h3>
            <p className="relative mt-1 text-sm text-white/70">
              Our team is available Mon–Sat, 10am–7pm.
            </p>
            <a
              href={SUPPORT_PHONE.href}
              className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
            >
              <Phone className="h-4 w-4" /> {SUPPORT_PHONE.display}
            </a>
          </motion.section>
        </div>
      </motion.div>

      {/* Next steps */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(221,51,51,0.28)] transition hover:brightness-110"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-black/25"
        >
          View my orders
        </Link>
      </motion.div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(221,51,51,0.06),transparent_55%)]" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-32 sm:px-6">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between text-[color:var(--muted)]", className)}>
      <dt>{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function OrderNumber({ id }: { id: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(String(id));
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          // clipboard unavailable (e.g. insecure context) — nothing to do
        }
      }}
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--muted)] shadow-sm transition hover:border-black/20"
      aria-label={`Copy order number ${id}`}
    >
      Order <span className="font-semibold text-[color:var(--ink)]">#{id}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

const CONFETTI_COLORS = ["#DD3333", "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"];

function StatusBadge({ tone }: { tone: "success" | "pending" | "error" }) {
  const reduceMotion = useReducedMotion();
  const palette = {
    success: { ring: "bg-emerald-400/30", fill: "bg-emerald-500", Icon: null },
    pending: { ring: "bg-amber-400/30", fill: "bg-amber-500", Icon: Clock3 },
    error: { ring: "bg-red-400/30", fill: "bg-red-500", Icon: XCircle },
  }[tone];

  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      {!reduceMotion ? (
        <motion.span
          className={cn("absolute inset-0 rounded-full", palette.ring)}
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
        />
      ) : null}

      {tone === "success" && !reduceMotion
        ? Array.from({ length: 18 }).map((_, i) => {
            const angle = (i / 18) * Math.PI * 2;
            const distance = 70 + (i % 3) * 22;
            return (
              <motion.span
                key={i}
                className="absolute h-2 w-1.5 rounded-sm"
                style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
                initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance + 24,
                  opacity: [0, 1, 1, 0],
                  rotate: (i % 2 ? 1 : -1) * 220,
                  scale: 1,
                }}
                transition={{ duration: 1.4, delay: 0.35 + (i % 4) * 0.03, ease: "easeOut" }}
              />
            );
          })
        : null}

      <motion.div
        className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg",
          palette.fill,
        )}
        initial={reduceMotion ? false : { scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        {palette.Icon ? (
          <palette.Icon className="h-10 w-10" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" aria-hidden="true">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
        )}
      </motion.div>
    </div>
  );
}

function Timeline({ current, muted }: { current: number; muted: boolean }) {
  const progress = (current / (STEPS.length - 1)) * 100;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="mt-8 rounded-3xl border border-black/5 bg-white px-6 py-7 shadow-sm sm:px-10"
      aria-label="Order progress"
    >
      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-slate-100" />
        <motion.div
          className={cn(
            "absolute left-[12.5%] top-5 h-1 rounded-full",
            muted ? "bg-amber-400" : "bg-emerald-500",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${(progress / 100) * 75}%` }}
          transition={{ delay: 0.9, duration: 0.9, ease: "easeInOut" }}
        />
        <ol className="relative grid grid-cols-4">
          {STEPS.map(({ label, Icon }, index) => {
            const done = index <= current;
            return (
              <li key={label} className="flex flex-col items-center text-center">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.15, type: "spring", stiffness: 300, damping: 18 }}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white",
                    done
                      ? muted
                        ? "border-amber-400 text-amber-500"
                        : "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 text-slate-300",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium sm:text-sm",
                    done ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </motion.section>
  );
}

function LoadingState() {
  return (
    <PageShell>
      <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading order">
        <div className="flex flex-col items-center rounded-3xl border border-black/5 bg-white px-6 py-12">
          <div className="h-20 w-20 rounded-full bg-slate-100" />
          <div className="mt-6 h-8 w-64 rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-slate-100" />
          <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="h-28 rounded-3xl border border-black/5 bg-white" />
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="h-72 rounded-3xl border border-black/5 bg-white" />
          <div className="h-72 rounded-3xl border border-black/5 bg-white" />
        </div>
      </div>
    </PageShell>
  );
}
