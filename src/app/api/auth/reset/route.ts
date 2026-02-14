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
    // Fallback to WP core lostpassword form endpoint
    if (wordpressUrl) {
      const form = new URLSearchParams();
      form.set("user_login", email);
      form.set("redirect_to", "");
      const fallback = await fetch(
        `${wordpressUrl}/wp-login.php?action=lostpassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        }
      );
      if (fallback.ok) {
        return NextResponse.json({ ok: true });
      }
    }
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Unable to send reset link", detail: text || undefined },
      { status: res.status || 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
