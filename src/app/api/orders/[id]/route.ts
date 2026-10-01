import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { fetchOrderById } from "@/lib/woocommerce";
import { getSessionUser } from "@/lib/auth";

function keysMatch(provided: string, expected?: string) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const orderId = Number(resolvedParams.id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  const orderKey = new URL(request.url).searchParams.get("key") ?? "";
  const user = orderKey ? null : await getSessionUser();
  if (!orderKey && !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let order: Awaited<ReturnType<typeof fetchOrderById>>;
  try {
    order = await fetchOrderById(orderId);
  } catch {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  // Guests prove ownership with the order key WooCommerce issues at checkout;
  // signed-in customers must own the order (by account or billing email).
  const allowed = orderKey
    ? keysMatch(orderKey, order.order_key)
    : Boolean(
        user &&
          ((order.customer_id && order.customer_id === user.id) ||
            (user.email &&
              order.billing?.email?.toLowerCase() === user.email.toLowerCase()))
      );

  if (!allowed) {
    // Same response as a missing order so ids can't be probed.
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const { order_key: _orderKey, ...safeOrder } = order;
  void _orderKey;
  return NextResponse.json(safeOrder);
}
