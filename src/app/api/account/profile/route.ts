import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const wordpressUrl = process.env.WORDPRESS_URL;

export async function POST(request: Request) {
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

  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (body.name) update.name = body.name;
  if (body.email) update.email = body.email;
  if (body.password) update.password = body.password;

  const res = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: data?.message || "Unable to update profile." },
      { status: res.status }
    );
  }

  const data = await res.json();
  const response = NextResponse.json({ ok: true, user: data });
  if (data?.email) {
    response.cookies.set({
      name: "wp_email",
      value: data.email,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}
