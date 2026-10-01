import { NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay";

export async function GET() {
  return NextResponse.json({ enabled: getRazorpayConfig().configured });
}
