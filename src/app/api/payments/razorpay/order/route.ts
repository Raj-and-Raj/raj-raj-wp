import { NextResponse } from "next/server";
import { fetchOrderById, updateOrder } from "@/lib/woocommerce";
import {
  RAZORPAY_ORDER_META,
  createRazorpayOrder,
  getOrderMeta,
  getRazorpayConfig,
  orderAwaitingPayment,
  safeEqual,
  toMinorUnits,
} from "@/lib/razorpay";

const UNAVAILABLE =
  "Online payment is temporarily unavailable. Please choose Cash on delivery or try again later.";

export async function POST(request: Request) {
  const config = getRazorpayConfig();
  if (!config.configured) {
    return NextResponse.json({ message: UNAVAILABLE }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    orderId?: number | string;
    orderKey?: string;
  };
  const orderId = Number(body.orderId);
  const orderKey = String(body.orderKey ?? "");
  if (!Number.isInteger(orderId) || orderId <= 0 || !orderKey) {
    return NextResponse.json({ message: "Invalid order." }, { status: 400 });
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
  if (order.date_paid || !["pending", "failed"].includes(order.status)) {
    return NextResponse.json(
      { message: "This order has already been paid.", paid: true },
      { status: 409 }
    );
  }
  if (!orderAwaitingPayment(order)) {
    return NextResponse.json(
      { message: "This order was not placed with online payment." },
      { status: 400 }
    );
  }

  const amount = toMinorUnits(order.total);
  const currency = order.currency || "INR";

  try {
    // Reuse the Razorpay order on retries so one Woo order maps to one
    // Razorpay order (Razorpay allows several payment attempts per order).
    let razorpayOrderId = getOrderMeta(order, RAZORPAY_ORDER_META);
    if (!razorpayOrderId) {
      const created = await createRazorpayOrder({
        amount,
        currency,
        receipt: String(order.id),
        notes: { woocommerce_order_id: String(order.id) },
      });
      razorpayOrderId = created.id;
      await updateOrder(order.id, {
        meta_data: [{ key: RAZORPAY_ORDER_META, value: razorpayOrderId }],
      });
    }

    const name = [order.billing?.first_name, order.billing?.last_name]
      .filter(Boolean)
      .join(" ");
    return NextResponse.json({
      keyId: config.keyId,
      razorpayOrderId,
      amount,
      currency,
      orderId: order.id,
      prefill: {
        name,
        email: order.billing?.email ?? "",
        contact: order.billing?.phone ?? "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? `Unable to start online payment: ${error.message}`
            : UNAVAILABLE,
      },
      { status: 502 }
    );
  }
}
