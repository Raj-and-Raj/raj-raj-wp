import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchCustomerByEmail, fetchOrdersByCustomer } from "@/lib/woocommerce";

const wordpressUrl = process.env.WORDPRESS_URL;

export async function GET() {
  if (!wordpressUrl) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_URL" },
      { status: 500 }
    );
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
  const email = user?.email as string | undefined;

  if (!email) {
    return NextResponse.json({ error: "Email not available" }, { status: 400 });
  }

  const customer = await fetchCustomerByEmail(email);
  if (!customer) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await fetchOrdersByCustomer(customer.id);
  return NextResponse.json({ orders });
}
