import { NextResponse } from "next/server";
import { fetchOrderById } from "@/lib/woocommerce";
import {
  RAZORPAY_ORDER_META,
  getOrderMeta,
  getRazorpayConfig,
  markOrderPaid,
  safeEqual,
  verifyPaymentSignature,
} from "@/lib/razorpay";

export async function POST(request: Request) {
  if (!getRazorpayConfig().configured) {
    return NextResponse.json(
      { message: "Online payment is not configured." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    orderId?: number | string;
    orderKey?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };
  const orderId = Number(body.orderId);
  const orderKey = String(body.orderKey ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const razorpayOrderId = String(body.razorpay_order_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  if (!orderId || !orderKey || !paymentId || !razorpayOrderId || !signature) {
    return NextResponse.json(
      { message: "Incomplete payment details." },
      { status: 400 }
    );
  }

  let order;
  try {
    order = await fetchOrderById(orderId);
  } catch {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }
  if (!order.order_key || !safeEqual(orderKey, order.order_key)) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  const expectedRazorpayOrder = getOrderMeta(order, RAZORPAY_ORDER_META);
  if (
    !expectedRazorpayOrder ||
    expectedRazorpayOrder !== razorpayOrderId ||
    !verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId: paymentId,
      signature,
    })
  ) {
    return NextResponse.json(
      {
        message:
          "We couldn't verify this payment. If money was deducted, please contact us with your order number.",
      },
      { status: 400 }
    );
  }

  try {
    await markOrderPaid(order, paymentId, "checkout");
  } catch {
    return NextResponse.json(
      {
        message:
          "Payment received, but we couldn't update your order. Please contact us with your order number.",
      },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, orderId: order.id });
}
