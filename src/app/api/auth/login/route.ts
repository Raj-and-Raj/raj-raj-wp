import { NextResponse } from "next/server";

const wordpressUrl = process.env.WORDPRESS_URL;
const jwtEndpoint =
  process.env.WORDPRESS_JWT_ENDPOINT ||
  (wordpressUrl ? `${wordpressUrl}/wp-json/jwt-auth/v1/token` : "");

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // JWT plugin's default token lifetime

function loginErrorMessage(code?: string) {
  if (!code) return "Invalid username or password.";
  if (code.includes("invalid_username") || code.includes("invalid_email")) {
    return "No account found with that username or email.";
  }
  if (code.includes("incorrect_password")) {
    return "Incorrect password. Please try again or reset your password.";
  }
  return "Invalid username or password.";
}

export async function POST(request: Request) {
  if (!jwtEndpoint) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_URL or WORDPRESS_JWT_ENDPOINT" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };
  if (!username || !password) {
    return NextResponse.json(
      { error: "Enter your username/email and password." },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(jwtEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the login server. Please try again." },
      { status: 502 }
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    code?: string;
    user_email?: string;
    user_display_name?: string;
  };

  if (!res.ok || !data.token) {
    return NextResponse.json(
      { error: loginErrorMessage(data.code) },
      { status: res.status >= 500 ? 502 : 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    email: data.user_email,
    name: data.user_display_name,
  });
  response.cookies.set({
    name: "wp_token",
    value: data.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  if (data.user_email) {
    response.cookies.set({
      name: "wp_email",
      value: data.user_email,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  }
  return response;
}
