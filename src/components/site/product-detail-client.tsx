"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RazorpayButton } from "@/components/checkout/razorpay-button";
import { formatPrice } from "@/lib/format";
import { ShareRow } from "@/components/site/share-row";
import type { Product } from "@/lib/products";

const finishOptions = [
  {
    name: "Pebble Grey",
    preview:
      "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg",
  },
  {
    name: "Smoked Sand",
    preview:
      "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg",
  },
];

const seatingOptions = ["1 Seater", "2 Seater", "3 Seater", "L-Shape"];

const offers = [
  "Save up to Rs. 5000 on select bank cards.",
  "Extra 10% off with code RAJ10 at checkout.",
  "No-cost EMI available on select cards.",
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "reviews", label: "Reviews" },
  { id: "shipping", label: "Shipping" },
];

const reviews = [
  {
    title: "Elegant and comfortable",
    body: "The finish feels premium and the cushions are firm but comfortable. Looks even better in person.",
    author: "Rhea S.",
    date: "3 days ago",
  },
  {
    title: "Perfect for our living room",
    body: "Great proportions and high-quality upholstery. Delivery was handled with care.",
    author: "Arjun K.",
    date: "1 week ago",
  },
];

type ProductDetailClientProps = {
  product: Product;
  heroImage: string;
  secondImage: string;
  images: string[];
  related: Product[];
};

export function ProductDetailClient({
  product,
  heroImage,
  secondImage,
  images,
  related,
}: ProductDetailClientProps) {
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0]);
  const [selectedSeating, setSelectedSeating] = useState(seatingOptions[2]);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const gallery = images.length ? images : [heroImage, secondImage].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const variationAttributes =
    product.attributes?.filter((attr) => attr.variation) ?? [];
  const [variantSelections, setVariantSelections] = useState<
    Record<string, string>
  >({});

  const variationPayload = useMemo(() => {
    if (!Object.keys(variantSelections).length) return undefined;
    const entries = Object.entries(variantSelections)
      .filter(([, value]) => value)
      .map(([attribute, value]) => ({ attribute, value }));
    return entries.length ? entries : undefined;
  }, [variantSelections]);

  const comparePrice = useMemo(
    () => Math.round(product.price * 1.25),
    [product.price]
  );

  return (
    <div className="space-y-12">
      <div className="text-xs text-[color:var(--muted)]">
        Home / {product.category} / {product.name}
      </div>

      <section className="grid gap-[10px] lg:grid-cols-[11fr_9fr]">
        <div className="grid gap-6 rounded-[12px] border border-black/5 bg-white/95 p-4">
          <div className="grid gap-4 lg:grid-cols-[80px_1fr]">
            <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-y-auto">
              {gallery.map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`relative h-16 w-16 shrink-0 rounded-[12px] border ${
                    activeImage === image
                      ? "border-[color:var(--brand)]"
                      : "border-black/10"
                  }`}
                >
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="rounded-[12px] object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#f2ede6]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute left-4 top-4 rounded-[12px] bg-white/90 px-3 py-1 text-xs font-semibold">
                3 year warranty
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28">
          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[color:var(--ink)] md:text-3xl">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  3-years warranty · Solid wood · Premium upholstery
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-[color:var(--brand)]">★ 4.9</span>
                  <span className="text-[color:var(--muted)]">(168 reviews)</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="rounded-[12px] border border-black/10 p-2">↗</button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-[color:var(--brand)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm line-through text-[color:var(--muted)]">
                {formatPrice(comparePrice)}
              </span>
              <span className="rounded-[12px] bg-[color:var(--brand)]/10 px-3 py-1 text-xs text-[color:var(--brand)]">
                15% Off
              </span>
            </div>

            <div className="mt-4 rounded-[12px] border border-black/5 bg-[#f4efe8] p-4 text-sm text-[color:var(--muted)]">
              <p className="text-[color:var(--ink)]">Product offers</p>
              <ul className="mt-2 space-y-1">
                {offers.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">Finish</p>
                <div className="mt-2 flex items-center gap-3">
                  {finishOptions.map((finish) => (
                    <button
                      key={finish.name}
                      onClick={() => setSelectedFinish(finish)}
                      className={`rounded-xl border p-2 ${
                        selectedFinish.name === finish.name
                          ? "border-[color:var(--brand)]"
                          : "border-black/10"
                      }`}
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#f1ece4]">
                        <Image
                          src={finish.preview}
                          alt={finish.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">
                  Seating capacity
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {seatingOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedSeating(option)}
                      className={`rounded-[12px] border px-4 py-2 text-xs ${
                        selectedSeating === option
                          ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                          : "border-black/10 text-[color:var(--muted)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-black/5 bg-white p-4">
                <p className="text-sm font-semibold text-[color:var(--ink)]">
                  Check delivery & assembly
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    placeholder="Enter pincode"
                    className="w-full rounded-[12px] border border-black/10 px-4 py-2 text-sm"
                  />
                  <button className="text-sm font-semibold text-[color:var(--brand)]">
                    Check
                  </button>
                </div>
              </div>

              <div className="rounded-[12px] border border-black/5 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    Need help deciding?
                  </p>
                  <button className="rounded-[12px] border border-black/10 px-3 py-1 text-xs">
                    Call me back
                  </button>
                </div>
                <p className="mt-2 text-xs text-[color:var(--muted)]">
                  Speak with our in-store experts for guidance on the perfect
                  piece.
                </p>
              </div>
            </div>

            {variationAttributes.length ? (
              <div className="mt-4 space-y-3">
                {variationAttributes.map((attr) => (
                  <label key={attr.name} className="block text-sm">
                    <span className="text-[color:var(--muted)]">{attr.name}</span>
                    <select
                      className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-3 py-2 text-sm"
                      value={variantSelections[attr.name] ?? ""}
                      onChange={(event) =>
                        setVariantSelections({
                          ...variantSelections,
                          [attr.name]: event.target.value,
                        })
                      }
                    >
                      <option value="">Select {attr.name}</option>
                      {attr.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                className="bg-[color:var(--brand)] text-white hover:brightness-110"
                onClick={async () => {
                  await fetch("/api/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: Number(product.id),
                      quantity: qty,
                      variation: variationPayload,
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
              <RazorpayButton title={product.name} price={product.price} />
            </div>

            <div className="mt-4">
              <ShareRow />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-[10px] lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
          <h3 className="text-base font-semibold">Product details</h3>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
            <li>Premium joinery and reinforced frame.</li>
            <li>Matte lacquer finish with artisan polish.</li>
            <li>Crafted from {product.material}.</li>
            <li>Ready in 4-6 weeks · White-glove delivery.</li>
          </ul>
        </div>
        <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
          <h3 className="text-base font-semibold">Specifications</h3>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
            <li>Overall: 64.5&quot; w x 38.5&quot; d x 35&quot; h</li>
            <li>Arm: 7&quot; w x 38.5&quot; d x 22.5&quot; h</li>
            <li>Legs: 5.5&quot; w x 2&quot; d x 2&quot; h</li>
            <li>Weight: 48 kg</li>
          </ul>
        </div>
      </section>

      <section className="rounded-[12px] border border-black/5 bg-white/95 p-8">
        <div className="flex flex-wrap items-center gap-6 border-b border-black/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-semibold ${
                activeTab === tab.id
                  ? "text-[color:var(--brand)]"
                  : "text-[color:var(--muted)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-6 text-sm text-[color:var(--muted)]">
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-base font-semibold text-[color:var(--ink)]">
                  Crafted to endure
                </h4>
                <p className="mt-3">
                  Each piece is refined with artisan techniques, premium
                  materials, and a finish that ages beautifully.
                </p>
              </div>
              <div>
                <h4 className="text-base font-semibold text-[color:var(--ink)]">
                  Designed for modern homes
                </h4>
                <p className="mt-3">
                  Clean lines, balanced proportions, and comfort-forward details
                  that elevate your space.
                </p>
              </div>
            </div>
          )}
          {activeTab === "details" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-base font-semibold text-[color:var(--ink)]">
                  Product features
                </h4>
                <ul className="mt-3 space-y-2">
                  <li>Breathable upholstery keeps you cool.</li>
                  <li>Premium joinery and reinforced frame.</li>
                  <li>Hand-finished edges and soft-close fittings.</li>
                </ul>
              </div>
              <div>
                <h4 className="text-base font-semibold text-[color:var(--ink)]">
                  Dimensions & weights
                </h4>
                <ul className="mt-3 space-y-2">
                  <li>Overall: 64.5&quot; w x 38.5&quot; d x 35&quot; h</li>
                  <li>Arm: 7&quot; w x 38.5&quot; d x 22.5&quot; h</li>
                </ul>
              </div>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink)]">
                    4.9
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    168 ratings
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[color:var(--brand)]">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx}>★</span>
                  ))}
                </div>
                <Button variant="outline">Write a review</Button>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.title}
                    className="rounded-[12px] border border-black/10 bg-white/90 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[color:var(--ink)]">
                        {review.title}
                      </p>
                      <span className="text-xs text-[color:var(--muted)]">
                        {review.date}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {review.body}
                    </p>
                    <p className="mt-3 text-xs text-[color:var(--muted)]">
                      {review.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "shipping" && (
            <div className="space-y-3">
              <p>Express: 5-7 business days</p>
              <p>Returns accepted within 14 days of delivery.</p>
              <p>White-glove delivery available in metro areas.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">You might be interested</h2>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {related.map((item) => (
            <div
              key={item.id}
              className="rounded-[12px] border border-black/5 bg-white/95 p-5"
            >
              <div className="relative h-48 overflow-hidden rounded-[12px] bg-[#f1ece4]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-4 text-sm text-[color:var(--muted)]">
                {item.category}
              </p>
              <p className="mt-2 text-lg font-semibold">{item.name}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {formatPrice(item.price)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-6 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-[12px] border border-black/10 bg-white/95 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-10 overflow-hidden rounded-[12px] bg-[#f1ece4]">
              <Image
                src={heroImage}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{product.name}</p>
              <p className="text-xs text-[color:var(--muted)]">
                {selectedFinish.name}, {selectedSeating}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-8 w-8 rounded-[12px] border border-black/10"
              >
                -
              </button>
              <span className="text-sm">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="h-8 w-8 rounded-[12px] border border-black/10"
              >
                +
              </button>
            </div>
            <Button
              className="bg-[color:var(--brand)] text-white hover:brightness-110"
              onClick={async () => {
                await fetch("/api/cart/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: Number(product.id),
                    quantity: qty,
                    variation: variationPayload,
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
        </div>
      </div>
    </div>
  );
}
