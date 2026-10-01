import { NextResponse } from "next/server";
import { isFormKey, submitWpForm } from "@/lib/wpforms";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!isFormKey(key)) {
    return NextResponse.json({ ok: false, message: "Unknown form." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    values?: Record<string, string | string[]>;
    startedAt?: number;
    website?: string;
  } | null;
  if (!body?.values || typeof body.values !== "object") {
    return NextResponse.json({ ok: false, message: "Invalid submission." }, { status: 400 });
  }
  // Honeypot: real visitors never see or fill this field.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const result = await submitWpForm(key, body.values, {
    startedAt: typeof body.startedAt === "number" ? body.startedAt : undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
