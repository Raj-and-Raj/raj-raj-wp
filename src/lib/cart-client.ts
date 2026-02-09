"use client";

import { useEffect, useState } from "react";

type CartItem = {
  id?: number | string;
  product_id?: number | string;
  variation_id?: number | string;
};

type CartResponse = {
  items?: CartItem[];
};

let cachedIds: string[] | null = null;
let cachedAt = 0;
let inflight: Promise<string[]> | null = null;

const normalizeId = (value: unknown) => {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return null;
};

const extractIds = (items?: CartItem[]) => {
  const ids: string[] = [];
  items?.forEach((item) => {
    const id = normalizeId(item.id);
    const productId = normalizeId(item.product_id);
    const variationId = normalizeId(item.variation_id);
    if (id) ids.push(id);
    if (productId) ids.push(productId);
    if (variationId) ids.push(variationId);
  });
  return Array.from(new Set(ids));
};

async function fetchCartIds(force = false) {
  const now = Date.now();
  if (!force && cachedIds && now - cachedAt < 2000) {
    return cachedIds;
  }
  if (inflight) return inflight;
  inflight = fetch("/api/cart", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) return [];
      const data = (await res.json()) as CartResponse;
      return extractIds(data.items);
    })
    .catch(() => [])
    .finally(() => {
      inflight = null;
    });
  const ids = await inflight;
  cachedIds = ids;
  cachedAt = now;
  return ids;
}

export function useCartIds() {
  const [ids, setIds] = useState<string[]>(cachedIds ?? []);

  useEffect(() => {
    let active = true;
    fetchCartIds().then((next) => {
      if (active) setIds(next);
    });
    const handler = () => {
      fetchCartIds(true).then((next) => {
        if (active) setIds(next);
      });
    };
    window.addEventListener("cart:updated", handler);
    return () => {
      active = false;
      window.removeEventListener("cart:updated", handler);
    };
  }, []);

  return ids;
}
