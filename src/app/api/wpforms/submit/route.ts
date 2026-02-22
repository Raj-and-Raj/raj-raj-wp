import { NextResponse } from "next/server";

const submitUrl = process.env.WPFORMS_SUBMIT_URL;
const formId = process.env.WPFORMS_FORM_ID;
const fieldName = process.env.WPFORMS_FIELD_NAME;
const fieldEmail = process.env.WPFORMS_FIELD_EMAIL;
const fieldMobile = process.env.WPFORMS_FIELD_MOBILE;
const fieldProduct = process.env.WPFORMS_FIELD_PRODUCT;
const nonce = process.env.WPFORMS_NONCE;

export async function POST(request: Request) {
  if (
    !submitUrl ||
    !formId ||
    !fieldName ||
    !fieldEmail ||
    !fieldMobile ||
    !fieldProduct
  ) {
    return NextResponse.json(
      {
        error:
          "Missing WPFORMS_* env vars. Please set submit URL, form ID, and field IDs.",
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const name = (body?.name || "").toString().trim();
  const email = (body?.email || "").toString().trim();
  const mobile = (body?.mobile || "").toString().trim();
  const productName = (body?.productName || "").toString().trim();

  if (!name || !email || !mobile || !productName) {
    return NextResponse.json(
      { error: "Missing required enquiry fields." },
      { status: 400 }
    );
  }

  const formData = new FormData();
  formData.append("action", "wpforms_submit");
  formData.append("wpforms[id]", formId);
  formData.append(`wpforms[fields][${fieldName}]`, name);
  formData.append(`wpforms[fields][${fieldEmail}]`, email);
  formData.append(`wpforms[fields][${fieldMobile}]`, mobile);
  formData.append(`wpforms[fields][${fieldProduct}]`, productName);
  if (nonce) {
    formData.append("wpforms[nonce]", nonce);
  }

  const res = await fetch(submitUrl, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const raw = await res.text();
  let data: unknown = raw;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "WPForms submission failed.", details: data },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true, data });
}
