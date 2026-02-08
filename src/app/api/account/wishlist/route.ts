import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const wishlistEndpoint = process.env.WORDPRESS_WISHLIST_ENDPOINT;

async function proxyWishlist(request: Request, method: string) {
  if (!wishlistEndpoint) {
    return NextResponse.json(
      { error: "Missing WORDPRESS_WISHLIST_ENDPOINT" },
      { status: 500 }
    );
  }

  const token = cookies().get("wp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = method === "GET" ? undefined : await request.json();
  const res = await fetch(wishlistEndpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Wishlist request failed" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function GET(request: Request) {
  return proxyWishlist(request, "GET");
}

export async function POST(request: Request) {
  return proxyWishlist(request, "POST");
}

export async function DELETE(request: Request) {
  return proxyWishlist(request, "DELETE");
}
