import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchCustomerByEmail } from "@/lib/woocommerce";

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

  const res = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await res.json();
  const fallbackEmail = (await cookies()).get("wp_email")?.value;
  const rawFirst =
    data.first_name ??
    data?.acf?.first_name ??
    data?.meta?.first_name ??
    data?.user_firstname ??
    "";
  const rawLast =
    data.last_name ??
    data?.acf?.last_name ??
    data?.meta?.last_name ??
    data?.user_lastname ??
    "";
  const displayName = String(data.name ?? data.display_name ?? "").trim();
  const splitName =
    !rawFirst && !rawLast && displayName.includes(" ")
      ? displayName.split(" ")
      : [];
  const firstName = String(rawFirst || splitName[0] || "").trim();
  const lastName = String(rawLast || splitName.slice(1).join(" ") || "").trim();

  let customerFirst = "";
  let customerLast = "";
  const email = data.email || fallbackEmail;
  if (email) {
    try {
      const customer = await fetchCustomerByEmail(email);
      customerFirst =
        customer?.billing?.first_name ||
        customer?.shipping?.first_name ||
        "";
      customerLast =
        customer?.billing?.last_name || customer?.shipping?.last_name || "";
    } catch {
      // ignore customer lookup failures
    }
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    username: data.username ?? data.name,
    firstName: firstName || customerFirst,
    lastName: lastName || customerLast,
    email,
  });
}
