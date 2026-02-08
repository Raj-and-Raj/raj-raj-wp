import { NextResponse } from "next/server";

const wordpressUrl = process.env.WORDPRESS_URL;
const jwtEndpoint =
  process.env.WORDPRESS_JWT_ENDPOINT ||
  (wordpressUrl ? `${wordpressUrl}/wp-json/jwt-auth/v1/token` : "");

export async function POST(request: Request) {
  if (!jwtEndpoint) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_URL or WORDPRESS_JWT_ENDPOINT" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { username, password } = body as { username: string; password: string };

  const res = await fetch(jwtEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = (await res.json()) as { token: string };
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "wp_token",
    value: data.token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
