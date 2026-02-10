import { NextResponse } from "next/server";
import { fetchOrderById } from "@/lib/woocommerce";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = Number(params.id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  try {
    const order = await fetchOrderById(orderId);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Order fetch failed" },
      { status: 500 }
    );
  }
}
