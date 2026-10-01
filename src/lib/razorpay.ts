import { createHmac, timingSafeEqual } from "node:crypto";
import {
  addOrderNote,
  fetchOrderById,
  updateOrder,
} from "@/lib/woocommerce";

const RAZORPAY_API = "https://api.razorpay.com/v1";
/** Woo order meta key holding the Razorpay order created for it. */
export const RAZORPAY_ORDER_META = "rr_razorpay_order_id";

export type WooOrder = Awaited<ReturnType<typeof fetchOrderById>>;

export function getRazorpayConfig() {
  const keyId = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
    ""
  ).trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  // The example env ships a placeholder key; treat it as "not configured".
  const configured =
    /^rzp_(test|live)_/.test(keyId) &&
    !/x{6,}/i.test(keyId) &&
    keySecret.length > 0;
  return { keyId, keySecret, configured };
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getOrderMeta(order: WooOrder, key: string) {
  const value = order.meta_data?.find((entry) => entry.key === key)?.value;
  return typeof value === "string" ? value : undefined;
}

/** Converts a WooCommerce decimal total ("2390.00") to the smallest unit. */
export function toMinorUnits(total: string) {
  return Math.round(Number(total) * 100);
}

export function orderAwaitingPayment(order: WooOrder) {
  return (
    order.payment_method === "razorpay" &&
    (order.status === "pending" || order.status === "failed") &&
    !order.date_paid
  );
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayConfig();
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
        "base64"
      )}`,
    },
    body: JSON.stringify({ ...input, payment_capture: 1 }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    amount?: number;
    currency?: string;
    error?: { description?: string };
  };
  if (!res.ok || !data.id) {
    throw new Error(
      data.error?.description || "Razorpay could not start the payment."
    );
  }
  return data as { id: string; amount: number; currency: string };
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayConfig();
  const expected = createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return safeEqual(expected, input.signature);
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return safeEqual(expected, signature);
}

/**
 * Marks the WooCommerce order paid (WooCommerce then moves it to Processing,
 * reduces stock and sends the order emails). Safe to call more than once.
 */
export async function markOrderPaid(
  order: WooOrder,
  razorpayPaymentId: string,
  source: string
) {
  if (order.date_paid || !orderAwaitingPayment(order)) return;
  await updateOrder(order.id, {
    set_paid: true,
    transaction_id: razorpayPaymentId,
  });
  await addOrderNote(
    order.id,
    `Razorpay payment ${razorpayPaymentId} confirmed (${source}).`
  ).catch(() => undefined);
}
