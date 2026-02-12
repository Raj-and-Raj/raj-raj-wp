import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/woocommerce";

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
  const { email, firstName, lastName, username, password } = body as {
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
  };

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const customer = await createCustomer({
      email,
      first_name: firstName,
      last_name: lastName,
      username,
      password,
    });

    const authRes = await fetch(jwtEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username || email,
        password,
      }),
    });

    if (!authRes.ok) {
      return NextResponse.json({ ok: true, id: customer.id });
    }

    const authData = (await authRes.json()) as {
      token: string;
      user_email?: string;
      user_display_name?: string;
    };
    const response = NextResponse.json({ ok: true, id: customer.id });
    response.cookies.set({
      name: "wp_token",
      value: authData.token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    if (authData.user_email) {
      response.cookies.set({
        name: "wp_email",
        value: authData.user_email,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
