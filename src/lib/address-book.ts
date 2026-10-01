import { randomUUID } from "node:crypto";
import {
  fetchCustomerByEmail,
  updateCustomer,
  type WooCustomer,
} from "@/lib/woocommerce";
import type {
  AddressBook,
  AddressInput,
  SavedAddress,
} from "@/lib/address-book-types";

/** Customer meta key holding the address book as JSON. */
const META_KEY = "rr_address_book";
const MAX_ADDRESSES = 20;
const LEGACY_STATES: Record<string, string> = { TG: "TS", OR: "OD", UT: "UK" };

const FIELDS = [
  "label",
  "first_name",
  "last_name",
  "company",
  "address_1",
  "address_2",
  "city",
  "state",
  "postcode",
  "country",
  "phone",
] as const;

type WooAddress = NonNullable<WooCustomer["shipping"]>;

export class AddressBookError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function clean(input: AddressInput): Omit<SavedAddress, "id"> {
  const out = {} as Omit<SavedAddress, "id">;
  FIELDS.forEach((field) => {
    out[field] = String(input[field] ?? "").trim().slice(0, 200);
  });
  out.country = out.country || "IN";
  out.state = LEGACY_STATES[out.state.toUpperCase()] ?? out.state.toUpperCase();
  out.label = out.label.slice(0, 40);
  return out;
}

function validate(address: Omit<SavedAddress, "id">) {
  const missing = (
    [
      ["first_name", "first name"],
      ["last_name", "last name"],
      ["address_1", "street address"],
      ["city", "city"],
      ["state", "state"],
      ["postcode", "PIN code"],
      ["phone", "phone"],
    ] as const
  )
    .filter(([key]) => !address[key])
    .map(([, label]) => label);
  if (missing.length) {
    throw new AddressBookError(`Please fill in: ${missing.join(", ")}.`);
  }
  if (address.country === "IN" && !/^\d{6}$/.test(address.postcode)) {
    throw new AddressBookError("Please enter a valid 6-digit PIN code.");
  }
}

function fromWoo(address: WooAddress | undefined, label: string): SavedAddress | null {
  if (!address?.address_1 && !address?.city) return null;
  return { id: randomUUID(), ...clean({ ...address, label }) };
}

function sameAddress(a: SavedAddress, b: SavedAddress) {
  return FIELDS.filter((f) => f !== "label").every(
    (f) => a[f].toLowerCase() === b[f].toLowerCase()
  );
}

function toWoo(address: SavedAddress): WooAddress {
  const { id: _id, label: _label, ...rest } = address;
  void _id;
  void _label;
  return rest;
}

/** Reads the stored book, or builds one from the customer's WooCommerce addresses. */
function readBook(customer: WooCustomer): AddressBook {
  const raw = customer.meta_data?.find((m) => m.key === META_KEY)?.value;
  if (typeof raw === "string" && raw) {
    try {
      const parsed = JSON.parse(raw) as AddressBook;
      if (Array.isArray(parsed.addresses)) {
        const addresses = parsed.addresses.map((a) => ({
          id: String(a.id || randomUUID()),
          ...clean(a),
        }));
        const has = (id: string | null) => !!id && addresses.some((a) => a.id === id);
        return {
          addresses,
          defaultBilling: has(parsed.defaultBilling) ? parsed.defaultBilling : addresses[0]?.id ?? null,
          defaultShipping: has(parsed.defaultShipping) ? parsed.defaultShipping : addresses[0]?.id ?? null,
        };
      }
    } catch {
      // fall through and rebuild from WooCommerce fields
    }
  }

  // First use: import the single billing/shipping pair WooCommerce stores.
  const billing = fromWoo(customer.billing, "Home");
  let shipping = fromWoo(customer.shipping, "Home");
  if (billing && shipping && sameAddress(billing, shipping)) shipping = null;
  if (billing && shipping) shipping.label = "Shipping";
  const addresses = [billing, shipping].filter((a): a is SavedAddress => a !== null);
  return {
    addresses,
    defaultBilling: billing?.id ?? addresses[0]?.id ?? null,
    defaultShipping: shipping?.id ?? billing?.id ?? null,
  };
}

async function persist(customer: WooCustomer, book: AddressBook, email: string) {
  const billing = book.addresses.find((a) => a.id === book.defaultBilling);
  const shipping = book.addresses.find((a) => a.id === book.defaultShipping);
  // Keep WooCommerce's own billing/shipping fields in step with the defaults
  // so orders, emails and wp-admin show the customer's preferred addresses.
  await updateCustomer(customer.id, {
    meta_data: [{ key: META_KEY, value: JSON.stringify(book) }],
    ...(billing ? { billing: { ...toWoo(billing), email } } : {}),
    ...(shipping ? { shipping: toWoo(shipping) } : {}),
  });
  return book;
}

async function loadCustomer(email: string) {
  const customer = await fetchCustomerByEmail(email);
  if (!customer) throw new AddressBookError("Customer account not found.", 404);
  return customer;
}

export async function getAddressBook(email: string) {
  return readBook(await loadCustomer(email));
}

export async function addAddress(
  email: string,
  input: AddressInput,
  defaults: { billing?: boolean; shipping?: boolean } = {}
) {
  const customer = await loadCustomer(email);
  const book = readBook(customer);
  const address = clean(input);
  validate(address);

  const duplicate = book.addresses.find((a) => sameAddress(a, { id: "", ...address }));
  const id = duplicate?.id ?? randomUUID();
  if (!duplicate) {
    if (book.addresses.length >= MAX_ADDRESSES) {
      throw new AddressBookError(`You can save up to ${MAX_ADDRESSES} addresses.`);
    }
    book.addresses.push({ id, ...address, label: address.label || "Other" });
  }
  if (defaults.billing || !book.defaultBilling) book.defaultBilling = id;
  if (defaults.shipping || !book.defaultShipping) book.defaultShipping = id;
  await persist(customer, book, email);
  return { book, id };
}

export async function updateAddress(
  email: string,
  id: string,
  input: AddressInput,
  defaults: { billing?: boolean; shipping?: boolean } = {}
) {
  const customer = await loadCustomer(email);
  const book = readBook(customer);
  const index = book.addresses.findIndex((a) => a.id === id);
  if (index === -1) throw new AddressBookError("Address not found.", 404);
  const address = clean(input);
  validate(address);
  book.addresses[index] = { id, ...address, label: address.label || "Other" };
  if (defaults.billing) book.defaultBilling = id;
  if (defaults.shipping) book.defaultShipping = id;
  return persist(customer, book, email);
}

export async function deleteAddress(email: string, id: string) {
  const customer = await loadCustomer(email);
  const book = readBook(customer);
  if (!book.addresses.some((a) => a.id === id)) {
    throw new AddressBookError("Address not found.", 404);
  }
  book.addresses = book.addresses.filter((a) => a.id !== id);
  const fallback = book.addresses[0]?.id ?? null;
  if (book.defaultBilling === id) book.defaultBilling = fallback;
  if (book.defaultShipping === id) book.defaultShipping = fallback;
  return persist(customer, book, email);
}

export async function setDefaults(
  email: string,
  defaults: { billing?: string; shipping?: string }
) {
  const customer = await loadCustomer(email);
  const book = readBook(customer);
  const exists = (id?: string) => !!id && book.addresses.some((a) => a.id === id);
  if (defaults.billing) {
    if (!exists(defaults.billing)) throw new AddressBookError("Address not found.", 404);
    book.defaultBilling = defaults.billing;
  }
  if (defaults.shipping) {
    if (!exists(defaults.shipping)) throw new AddressBookError("Address not found.", 404);
    book.defaultShipping = defaults.shipping;
  }
  return persist(customer, book, email);
}
