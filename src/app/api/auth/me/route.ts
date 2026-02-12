import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
  return NextResponse.json({
    id: data.id,
    name: data.name,
    email: data.email || fallbackEmail,
  });
}
