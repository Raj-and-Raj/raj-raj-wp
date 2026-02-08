import { NextResponse } from "next/server";

const wordpressUrl = process.env.WORDPRESS_URL;
const resetEndpoint =
  process.env.WORDPRESS_PASSWORD_RESET_ENDPOINT ||
  (wordpressUrl ? `${wordpressUrl}/wp-json/wp/v2/users/lostpassword` : "");

export async function POST(request: Request) {
  if (!resetEndpoint) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_URL or reset endpoint" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { email } = body as { email: string };

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const res = await fetch(resetEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_login: email }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Unable to send reset link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
