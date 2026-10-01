"use client";

import Link from "next/link";
import { Building, Check, Home, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addressName,
  type SavedAddress,
} from "@/lib/address-book-types";

export const NEW_ADDRESS = "new";

/** Lets a signed-in customer pick a saved address or enter a new one. */
export function SavedAddressPicker({
  name,
  addresses,
  selected,
  defaultId,
  states,
  onSelect,
}: {
  /** Radio group name, e.g. "billing-address". */
  name: string;
  addresses: SavedAddress[];
  selected: string;
  defaultId?: string | null;
  states: Array<{ code: string; name: string }>;
  onSelect: (id: string) => void;
}) {
  const stateName = (code: string) => states.find((s) => s.code === code)?.name ?? code;

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-[color:var(--muted)]">Saved addresses</p>
        <Link
          href="/account#addresses"
          className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
        >
          Manage
        </Link>
      </div>
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => {
          const active = selected === address.id;
          const Icon =
            address.label === "Office" || address.label === "Warehouse" ? Building : Home;
          return (
            <label
              key={address.id}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-[12px] border p-3.5 text-left transition",
                active
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/[0.04] ring-1 ring-[color:var(--brand)]"
                  : "border-black/10 bg-white hover:border-black/25",
              )}
            >
              <input
                type="radio"
                name={name}
                value={address.id}
                checked={active}
                onChange={() => onSelect(address.id)}
                className="sr-only"
              />
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ink)] px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Icon className="h-3 w-3" /> {address.label || "Address"}
                </span>
                {defaultId === address.id ? (
                  <span className="text-[11px] font-medium text-[color:var(--muted)]">Default</span>
                ) : null}
                <span
                  className={cn(
                    "ml-auto flex h-5 w-5 items-center justify-center rounded-full border transition",
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                      : "border-black/20",
                  )}
                >
                  {active ? <Check className="h-3 w-3" /> : null}
                </span>
              </span>
              <span className="mt-2 text-sm font-medium text-[color:var(--ink)]">
                {addressName(address)}
              </span>
              <span className="mt-0.5 text-xs leading-relaxed text-[color:var(--muted)]">
                {[address.address_1, address.address_2].filter(Boolean).join(", ")}
                <br />
                {[address.city, stateName(address.state)].filter(Boolean).join(", ")}
                {address.postcode ? ` – ${address.postcode}` : ""}
                {address.phone ? (
                  <>
                    <br />
                    {address.phone}
                  </>
                ) : null}
              </span>
            </label>
          );
        })}
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-dashed p-3.5 text-sm font-semibold transition",
            selected === NEW_ADDRESS
              ? "border-[color:var(--brand)] bg-[color:var(--brand)]/[0.04] text-[color:var(--brand)]"
              : "border-black/15 text-[color:var(--muted)] hover:border-black/30 hover:text-[color:var(--ink)]",
          )}
        >
          <input
            type="radio"
            name={name}
            value={NEW_ADDRESS}
            checked={selected === NEW_ADDRESS}
            onChange={() => onSelect(NEW_ADDRESS)}
            className="sr-only"
          />
          <Plus className="h-4 w-4" /> Use a new address
        </label>
      </div>
    </div>
  );
}
