import { NextResponse } from "next/server";

const wordpressUrl = process.env.WORDPRESS_URL;

export async function POST(request: Request) {
  if (!wordpressUrl) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_URL" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { email, code } = body as { email?: string; code?: string };

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code required" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${wordpressUrl}/wp-json/raj/v1/password/reset/validate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Invalid or expired code", detail: text || undefined },
      { status: res.status || 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
