import { NextResponse } from "next/server";
import { fetchCountryStates } from "@/lib/woocommerce";

export async function GET(request: Request) {
  const country = (
    new URL(request.url).searchParams.get("country") || "IN"
  ).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ message: "Invalid country" }, { status: 400 });
  }
  try {
    const states = await fetchCountryStates(country);
    return NextResponse.json(
      { states },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch {
    return NextResponse.json({ states: [] }, { status: 502 });
  }
}
