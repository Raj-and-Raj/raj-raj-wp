"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/products";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

const materials = ["Oak + Linen", "Teak + Resin", "Brass", "Walnut", "Wool"];

export function CategoryFilters({ products }: { products: Product[] }) {
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
  const [priceCap, setPriceCap] = useState(70000);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const materialOk = activeMaterial
        ? product.material.includes(activeMaterial)
        : true;
      return materialOk && product.price <= priceCap;
    });
  }, [products, activeMaterial, priceCap]);

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-3xl border border-black/5 bg-white/80 p-6">
        <p className="text-sm font-semibold">Filter</p>
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Material
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {materials.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setActiveMaterial(activeMaterial === item ? null : item)
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    activeMaterial === item
                      ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                      : "border-black/10 text-[color:var(--muted)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Price
            </p>
            <input
              type="range"
              min={10000}
              max={80000}
              value={priceCap}
              onChange={(event) => setPriceCap(Number(event.target.value))}
              className="mt-3 w-full accent-[color:var(--brand)]"
            />
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Under ?{priceCap.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          variant="outline"
          onClick={() => {
            setActiveMaterial(null);
            setPriceCap(70000);
          }}
        >
          Reset
        </Button>
      </aside>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
