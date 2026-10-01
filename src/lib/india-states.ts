"use client";

import { useEffect, useState } from "react";

export type StateOption = { code: string; name: string };

// Matches WooCommerce's codes for India (wc/v3/data/countries/in). Used until
// the live list loads, or if it can't be fetched.
export const INDIA_STATES: StateOption[] = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DN", name: "Dadra and Nagar Haveli" },
  { code: "DD", name: "Daman and Diu" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

// Codes this site used to send, which WooCommerce rejects. Addresses saved
// with them are converted on load.
const LEGACY_CODES: Record<string, string> = {
  TG: "TS",
  OR: "OD",
  UT: "UK",
};

export function normalizeStateCode(code?: string) {
  if (!code) return code ?? "";
  const upper = code.toUpperCase();
  return LEGACY_CODES[upper] ?? upper;
}

let cached: Promise<StateOption[]> | null = null;

function loadStates() {
  if (!cached) {
    cached = fetch("/api/states?country=IN")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { states?: StateOption[] } | null) =>
        data?.states?.length ? data.states : INDIA_STATES,
      )
      .catch(() => {
        cached = null;
        return INDIA_STATES;
      });
  }
  return cached;
}

/** India's states as configured in WooCommerce. */
export function useIndiaStates() {
  const [states, setStates] = useState<StateOption[]>(INDIA_STATES);
  useEffect(() => {
    let active = true;
    loadStates().then((list) => {
      if (active) setStates(list);
    });
    return () => {
      active = false;
    };
  }, []);
  return states;
}
