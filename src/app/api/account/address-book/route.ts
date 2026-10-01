import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  AddressBookError,
  addAddress,
  deleteAddress,
  getAddressBook,
  setDefaults,
  updateAddress,
} from "@/lib/address-book";

async function withUser(
  handler: (email: string) => Promise<unknown>
): Promise<Response> {
  const user = await getSessionUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  try {
    return NextResponse.json(await handler(user.email));
  } catch (error) {
    if (error instanceof AddressBookError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[address-book]", error);
    return NextResponse.json(
      { error: "Couldn't update your addresses. Please try again." },
      { status: 502 }
    );
  }
}

type Body = {
  id?: string;
  address?: Record<string, string>;
  setDefaultBilling?: boolean;
  setDefaultShipping?: boolean;
  defaultBilling?: string;
  defaultShipping?: string;
};

const readBody = async (request: Request) =>
  ((await request.json().catch(() => ({}))) ?? {}) as Body;

export async function GET() {
  return withUser((email) => getAddressBook(email));
}

/** Add an address. */
export async function POST(request: Request) {
  const body = await readBody(request);
  return withUser(async (email) => {
    if (!body.address) throw new AddressBookError("Missing address.");
    const { book, id } = await addAddress(email, body.address, {
      billing: body.setDefaultBilling,
      shipping: body.setDefaultShipping,
    });
    return { ...book, id };
  });
}

/** Edit an address. */
export async function PUT(request: Request) {
  const body = await readBody(request);
  return withUser((email) => {
    if (!body.id || !body.address) throw new AddressBookError("Missing address.");
    return updateAddress(email, body.id, body.address, {
      billing: body.setDefaultBilling,
      shipping: body.setDefaultShipping,
    });
  });
}

/** Change the default billing and/or shipping address. */
export async function PATCH(request: Request) {
  const body = await readBody(request);
  return withUser((email) =>
    setDefaults(email, {
      billing: body.defaultBilling,
      shipping: body.defaultShipping,
    })
  );
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  return withUser((email) => {
    if (!id) throw new AddressBookError("Missing address id.");
    return deleteAddress(email, id);
  });
}
