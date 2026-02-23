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

  // Prime the reset flow: hit the rp action to validate key and receive reset cookies if required by plugins.
  let resetCookie = "";
  try {
    const prime = await fetch(
      `${wordpressUrl}/wp-login.php?action=rp&key=${encodeURIComponent(
        key
      )}&login=${encodeURIComponent(login)}`,
      {
        method: "GET",
        redirect: "manual",
      }
    );
    const setCookie = prime.headers.get("set-cookie") || "";
    resetCookie = setCookie.split(";")[0] || "";
    const primeText = await prime.text().catch(() => "");
    if (primeText.includes("login_error") || primeText.includes("invalidkey")) {
      return NextResponse.json(
        { error: "Unable to reset password.", detail: "invalidkey" },
        { status: 400 }
      );
    }
  } catch {
    // If priming fails, continue without cookies; WP core should still accept rp_login/rp_key.
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(resetCookie ? { Cookie: resetCookie } : {}),
    },
    body: form.toString(),
    redirect: "manual",
  });

  const isRedirect = res.status >= 300 && res.status < 400;
  if (isRedirect) {
    const location = res.headers.get("location") || "";
    if (location.includes("resetpass=complete")) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      {
        error: "Unable to reset password.",
        detail: location || undefined,
      },
      { status: 400 }
    );
  }

  const text = await res.text().catch(() => "");
  const hasLoginError =
    text.includes("login_error") || text.includes("invalidkey");
  if (!res.ok || hasLoginError) {
    return NextResponse.json(
      { error: "Unable to reset password.", detail: text || undefined },
      { status: res.status || 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
