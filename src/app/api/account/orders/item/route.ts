import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchCustomerByEmail,
  fetchOrdersByCustomer,
  fetchOrdersByEmail,
} from "@/lib/woocommerce";

const wordpressUrl = process.env.WORDPRESS_URL;

export async function GET(request: Request) {
  if (!wordpressUrl) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_URL" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const token = (await cookies()).get("wp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRes = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!userRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await userRes.json();
  const email =
    (user?.email as string | undefined) ||
    (await cookies()).get("wp_email")?.value;

  if (!email) {
    return NextResponse.json({ error: "Email not available" }, { status: 400 });
  }

  const customer = await fetchCustomerByEmail(email);
  let orders = [];
  if (customer) {
    orders = await fetchOrdersByCustomer(customer.id);
  }
  if (!orders.length) {
    orders = await fetchOrdersByEmail(email);
  }
  const order = orders.find((item) => String(item.id) === orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
