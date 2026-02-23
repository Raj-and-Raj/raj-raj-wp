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
  const { email, code, password } = body as {
    email?: string;
    code?: string;
    password?: string;
  };

  if (!email || !code || !password) {
    return NextResponse.json(
      { error: "Email, code, and password required" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${wordpressUrl}/wp-json/raj/v1/password/reset/set`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Unable to reset password", detail: text || undefined },
      { status: res.status || 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
