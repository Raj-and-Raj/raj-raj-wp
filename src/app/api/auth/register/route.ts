import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/woocommerce";

export async function POST(request: Request) {
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

    return NextResponse.json({ ok: true, id: customer.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
