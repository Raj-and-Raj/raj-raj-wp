import { NextResponse } from "next/server";
import { fetchCustomerByEmail } from "@/lib/woocommerce";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ exists: false });
  }
  try {
    const customer = await fetchCustomerByEmail(email);
    return NextResponse.json({ exists: Boolean(customer?.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
