// Customer address book, shared by the API, the account page and checkout.

export type SavedAddress = {
  id: string;
  /** Customer-chosen name, e.g. "Home", "Office". */
  label: string;
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
};

export type AddressBook = {
  addresses: SavedAddress[];
  defaultBilling: string | null;
  defaultShipping: string | null;
};

export type AddressInput = Partial<Omit<SavedAddress, "id">>;

export const ADDRESS_LABELS = ["Home", "Office", "Warehouse", "Other"];

export function addressSummary(address: Partial<SavedAddress>) {
  return [address.address_1, address.address_2, address.city, address.postcode]
    .filter(Boolean)
    .join(", ");
}

export function addressName(address: Partial<SavedAddress>) {
  return [address.first_name, address.last_name].filter(Boolean).join(" ");
}
