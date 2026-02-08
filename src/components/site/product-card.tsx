"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group rounded-3xl border border-black/5 bg-white/90 p-5 shadow-sm"
    >
      <div className="relative flex h-48 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(221,51,51,0.2),_transparent_60%)] text-sm font-medium text-[color:var(--muted)]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={520}
            height={520}
            unoptimized
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          <span>{product.material}</span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">{product.category}</p>
        <p className="text-sm font-semibold text-[color:var(--brand)]">
          {formatPrice(product.price)}
        </p>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
        {product.name}
      </h3>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        {product.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex items-center text-sm font-semibold text-[color:var(--brand)]"
        >
          View details -
        </Link>
        <Button
          size="sm"
          onClick={async () => {
            await fetch("/api/cart/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: Number(product.id),
                quantity: 1,
              }),
            });
            window.dispatchEvent(
              new CustomEvent("cart:updated", {
                detail: { open: true, redirect: true },
              })
            );
          }}
        >
          Add to cart
        </Button>
      </div>
    </motion.div>
  );
}
