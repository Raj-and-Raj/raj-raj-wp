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
  const { login, key, password } = body as {
    login?: string;
    key?: string;
    password?: string;
  };

  if (!login || !key || !password) {
    return NextResponse.json(
      { error: "Missing login, key, or password." },
      { status: 400 }
    );
  }

  const form = new URLSearchParams();
  form.set("rp_login", login);
  form.set("rp_key", key);
  form.set("pass1", password);
  form.set("pass2", password);
  form.set("wp-submit", "Reset Password");

  // WP core reset handler
  const res = await fetch(`${wordpressUrl}/wp-login.php?action=resetpass`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Unable to reset password.", detail: text || undefined },
      { status: res.status || 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
