import { NextResponse } from "next/server";
import { fetchOrderById } from "@/lib/woocommerce";
import {
  RAZORPAY_ORDER_META,
  getOrderMeta,
  markOrderPaid,
  verifyWebhookSignature,
} from "@/lib/razorpay";

// Backup for when the customer closes the tab after paying but before the
// checkout page confirms the payment. Configure in the Razorpay dashboard
// with the events "payment.captured" and "order.paid".
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
          notes?: Record<string, string>;
        };
      };
      order?: {
        entity?: { id?: string; receipt?: string; notes?: Record<string, string> };
      };
    };
  };
  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrder = event.payload?.order?.entity;
  const orderId = Number(
    payment?.notes?.woocommerce_order_id ??
      razorpayOrder?.notes?.woocommerce_order_id ??
      razorpayOrder?.receipt
  );
  if (!payment?.id || !payment.order_id || !orderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const order = await fetchOrderById(orderId);
    if (getOrderMeta(order, RAZORPAY_ORDER_META) !== payment.order_id) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    await markOrderPaid(order, payment.id, "webhook");
  } catch {
    // Non-2xx makes Razorpay retry the webhook later.
    return NextResponse.json({ message: "Order update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
