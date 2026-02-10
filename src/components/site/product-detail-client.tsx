"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { ShareRow } from "@/components/site/share-row";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useToast } from "@/components/ui/use-toast";
import { useCartIds } from "@/lib/cart-client";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "specs", label: "Specifications" },
  { id: "shipping", label: "Shipping" },
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
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const gallery = images.length
    ? images
    : [heroImage, secondImage].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const variationAttributes =
    product.attributes?.filter((attr) => attr.variation) ?? [];
  const staticAttributes =
    product.attributes?.filter((attr) => !attr.variation) ?? [];
  const [variantSelections, setVariantSelections] = useState<
    Record<string, string>
  >({});
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<
    | { state: "idle" }
    | { state: "loading" }
    | { state: "available"; zone?: string }
    | { state: "unavailable" }
    | { state: "error"; message: string }
  >({ state: "idle" });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const { toast } = useToast();
  const cartIds = useCartIds();

  const variationPayload = useMemo(() => {
    if (!Object.keys(variantSelections).length) return undefined;
    const entries = Object.entries(variantSelections)
      .filter(([, value]) => value)
      .map(([attribute, value]) => ({ attribute, value }));
    return entries.length ? entries : undefined;
  }, [variantSelections]);

  const displayPrice =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price;
  const comparePrice =
    product.regularPrice && product.regularPrice > displayPrice
      ? product.regularPrice
      : undefined;
  const stockLabel =
    product.stockStatus === "instock"
      ? "In stock"
      : product.stockStatus === "outofstock"
        ? "Out of stock"
        : "Available";
  const isOutOfStock = product.stockStatus === "outofstock";

  const colorAttribute = useMemo(() => {
    return variationAttributes.find((attr) => {
      const name = attr.name.toLowerCase();
      return name.includes("color") || name.includes("colour");
    });
  }, [variationAttributes]);

  const colorOptions = useMemo(() => {
    if (!colorAttribute) return [];
    const optionSet = new Set<string>();
    if (product.variations?.length) {
      product.variations.forEach((variation) => {
        const match = variation.attributes.find(
          (attr) => attr.name === colorAttribute.name,
        );
        if (match?.option) optionSet.add(match.option);
      });
    } else {
      colorAttribute.options.forEach((option) => optionSet.add(option));
    }

    const imageMap = new Map<string, string | undefined>();
    product.variations?.forEach((variation) => {
      const match = variation.attributes.find(
        (attr) => attr.name === colorAttribute.name,
      );
      if (match?.option && variation.image) {
        imageMap.set(match.option, variation.image);
      }
    });

    return Array.from(optionSet).map((option) => ({
      option,
      image: imageMap.get(option),
    }));
  }, [colorAttribute, product.variations]);

  const colorToHex = (value: string) => {
    const key = value.toLowerCase().replace(/\s+/g, "");
    const map: Record<string, string> = {
      chocolate: "#4e342e",
      coffee: "#6f4e37",
      indigo: "#3f51b5",
      purple: "#7b1fa2",
      winered: "#7b1e2b",
      rosepink: "#f7a3b5",
      nardogrey: "#9da3a6",
      grey: "#9e9e9e",
      gray: "#9e9e9e",
      black: "#111111",
      white: "#f5f5f5",
      red: "#c62828",
      blue: "#1e88e5",
      green: "#2e7d32",
      yellow: "#f9a825",
      orange: "#f57c00",
    };
    return map[key] || "#d1d5db";
  };

  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (!stored) return;
    try {
      const ids = JSON.parse(stored) as string[];
      setIsWishlisted(ids.includes(product.id));
    } catch {
      setIsWishlisted(false);
    }
  }, [product.id]);

  const toggleWishlist = () => {
    const stored = localStorage.getItem("wishlist");
    let ids: string[] = [];
    if (stored) {
      try {
        ids = JSON.parse(stored) as string[];
      } catch {
        ids = [];
      }
    }
    if (ids.includes(product.id)) {
      ids = ids.filter((id) => id !== product.id);
      setIsWishlisted(false);
    } else {
      ids = [...ids, product.id];
      setIsWishlisted(true);
    }
    localStorage.setItem("wishlist", JSON.stringify(ids));
    window.dispatchEvent(new Event("wishlist:updated"));
  };

  return (
    <div className="space-y-4 pt-32">
      <div className="text-xs text-[color:var(--muted)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-[color:var(--brand)]"
        >
          {product.category}
        </Link>{" "}
        / <span className="text-[color:var(--ink)]">{product.name}</span>
      </div>

      <section className="grid gap-[10px] lg:grid-cols-[11fr_9fr]">
        <div className="grid gap-6 rounded-[12px] border border-black/5 bg-white/95 p-3 md:p-4">
          <div className="grid gap-4 lg:grid-cols-[80px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-y-auto">
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
            <div className="order-1 relative min-h-[420px] overflow-hidden rounded-[12px] bg-[#f2ede6] lg:order-2 lg:min-h-[520px]">
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
                5 years warranty
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28">
          <div className="rounded-[12px] border border-black/5 bg-white/95 p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[color:var(--ink)] md:text-3xl">
                  {product.name}
                </h1>
                <div className="mt-2 text-sm text-[color:var(--muted)]">
                  <span>
                    {product.sku ? `SKU: ${product.sku}` : "SKU: N/A"}
                  </span>
                  <span className="mx-2">·</span>
                  <span>{stockLabel}</span>
                  {product.stockQuantity != null ? (
                    <span className="ml-2 text-xs text-[color:var(--muted)]">
                      ({product.stockQuantity} available)
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleWishlist}
                  aria-label="Toggle wishlist"
                  className={`rounded-[12px] border p-2 transition ${
                    isWishlisted
                      ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                      : "border-black/10 text-[color:var(--muted)] hover:text-[color:var(--brand)]"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-[color:var(--brand)]">
                {formatPrice(displayPrice)}
              </span>
              {comparePrice ? (
                <span className="text-sm line-through text-[color:var(--muted)]">
                  {formatPrice(comparePrice)}
                </span>
              ) : null}
              {comparePrice ? (
                <span className="rounded-[12px] bg-[color:var(--brand)]/10 px-3 py-1 text-xs text-[color:var(--brand)]">
                  Sale
                </span>
              ) : null}
            </div>

            {product.shortDescription ? (
              <div className="mt-4 rounded-[12px] border border-black/5 bg-[#f4efe8] p-4 text-sm text-[color:var(--muted)]">
                <p className="text-[color:var(--ink)]">Highlights</p>
                <div
                  className="mt-2 space-y-2"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {colorAttribute && colorOptions.length ? (
                <div>
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {colorAttribute.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {colorOptions.map((option) => {
                      const isSelected =
                        variantSelections[colorAttribute.name] ===
                        option.option;
                      return (
                        <button
                          key={option.option}
                          type="button"
                          onClick={() => {
                            setVariantSelections({
                              ...variantSelections,
                              [colorAttribute.name]: option.option,
                            });
                            if (option.image) {
                              setActiveImage(option.image);
                            }
                          }}
                          className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            isSelected
                              ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                              : "border-black/10 text-[color:var(--muted)]"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-black/10"
                            style={{
                              backgroundColor: option.image
                                ? "transparent"
                                : colorToHex(option.option),
                              backgroundImage: option.image
                                ? `url(${option.image})`
                                : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                          {option.option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {staticAttributes.length ? (
                <div>
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    Attributes
                  </p>
                  <div className="mt-2 flex flex-col gap-3 text-sm text-[color:var(--muted)]">
                    {staticAttributes.map((attr) => (
                      <div key={attr.name}>
                        <span className="font-semibold text-[color:var(--ink)]">
                          {attr.name}:
                        </span>{" "}
                        {attr.options.join(", ")}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[12px] border border-black/5 bg-white p-4">
                <p className="text-sm font-semibold text-[color:var(--ink)]">
                  Check delivery & assembly
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(event) => setPincode(event.target.value)}
                    className="w-full rounded-[12px] border border-black/10 px-4 py-2 text-sm"
                  />
                  <button
                    className="text-sm font-semibold text-[color:var(--brand)]"
                    onClick={async () => {
                      if (!pincode.trim()) {
                        setDeliveryStatus({
                          state: "error",
                          message: "Please enter a valid pincode.",
                        });
                        return;
                      }
                      setDeliveryStatus({ state: "loading" });
                      try {
                        const res = await fetch(
                          `/api/shipping/check?postcode=${encodeURIComponent(
                            pincode.trim(),
                          )}`,
                        );
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          setDeliveryStatus({
                            state: "error",
                            message:
                              data?.reason || "Unable to check delivery.",
                          });
                          return;
                        }
                        const data = await res.json();
                        if (data?.available) {
                          setDeliveryStatus({
                            state: "available",
                            zone: data?.zone,
                          });
                        } else {
                          setDeliveryStatus({ state: "unavailable" });
                        }
                      } catch {
                        setDeliveryStatus({
                          state: "error",
                          message: "Unable to check delivery.",
                        });
                      }
                    }}
                  >
                    Check
                  </button>
                </div>
                {deliveryStatus.state !== "idle" ? (
                  <div className="mt-3 text-xs">
                    {deliveryStatus.state === "loading" ? (
                      <span className="text-[color:var(--muted)]">
                        Checking availability...
                      </span>
                    ) : null}
                    {deliveryStatus.state === "available" ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        Delivery available
                        {deliveryStatus.zone ? ` · ${deliveryStatus.zone}` : ""}
                      </span>
                    ) : null}
                    {deliveryStatus.state === "unavailable" ? (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
                        Delivery not available
                      </span>
                    ) : null}
                    {deliveryStatus.state === "error" ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        {deliveryStatus.message}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* <div className="rounded-[12px] border border-black/5 bg-white p-4">
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
              </div> */}
            </div>

            {variationAttributes.length ? (
              <div className="mt-4 space-y-3">
                {variationAttributes
                  .filter((attr) => attr.name !== colorAttribute?.name)
                  .map((attr) => (
                    <label key={attr.name} className="block text-sm">
                      <span className="text-[color:var(--muted)]">
                        {attr.name}
                      </span>
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

            {(() => {
              const requiresSelection = variationAttributes.length > 0;
              const isSelectionComplete = requiresSelection
                ? variationAttributes.every(
                    (attr) => variantSelections[attr.name],
                  )
                : true;
              const isInCart = cartIds.includes(product.id);
              const disableForSelection = !isSelectionComplete;

              if (isOutOfStock) {
                return (
                  <div className="mt-6">
                    <Button
                      className="w-full rounded-[10px] bg-[color:var(--brand)] text-white hover:brightness-110"
                      onClick={() => setEnquiryOpen(true)}
                    >
                      Enquiry now
                    </Button>
                  </div>
                );
              }

              return (
                <div className="mt-6 grid grid-cols-1 gap-3 items-center sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-[12px] border border-black/10 px-3 py-2">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="h-8 w-8 rounded-[10px] border border-black/10 text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="h-8 w-8 rounded-[10px] border border-black/10 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    className="bg-[color:var(--brand)] rounded-[10px] text-white hover:brightness-110"
                    disabled={isInCart || disableForSelection}
                    onClick={async () => {
                      if (disableForSelection) return;
                      if (isInCart) {
                        toast({
                          title: "Already in cart",
                          description: "This item is already in your cart.",
                        });
                        return;
                      }
                      await fetch("/api/cart/add", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: Number(product.id),
                          quantity: qty,
                          variation: variationPayload,
                        }),
                      });
                      window.dispatchEvent(new Event("cart:updated"));
                      toast({
                        title: "Added to cart",
                        description: "Item has been added to your cart.",
                        variant: "success",
                      });
                    }}
                  >
                    {isInCart ? "Already in cart" : "Add to cart"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-[10px] bg-black border-black/10 text-white hover:border-[color:var(--brand)] hover:bg-[color:var(--brand)] hover:text-white"
                    disabled={disableForSelection}
                    onClick={async () => {
                      if (disableForSelection) return;
                      if (!isInCart) {
                        await fetch("/api/cart/add", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: Number(product.id),
                            quantity: qty,
                            variation: variationPayload,
                          }),
                        });
                        window.dispatchEvent(new Event("cart:updated"));
                      }
                      window.location.href = "/checkout";
                    }}
                  >
                    Buy now
                  </Button>
                </div>
              );
            })()}

            <div className="mt-4">
              <ShareRow />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-[10px] lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
          <h3 className="text-base font-semibold">Product details</h3>
          {product.description ? (
            <div
              className="mt-4 space-y-3 text-sm text-[color:var(--muted)]"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <p className="mt-4 text-sm text-[color:var(--muted)]">
              No additional description available.
            </p>
          )}
        </div>
        <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
          <h3 className="text-base font-semibold">Specifications</h3>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
            <li>SKU: {product.sku ?? "N/A"}</li>
            <li>Stock: {stockLabel}</li>
            {product.weight ? <li>Weight: {product.weight}</li> : null}
            {product.dimensions ? (
              <li>
                Dimensions:{" "}
                {[
                  product.dimensions.length,
                  product.dimensions.width,
                  product.dimensions.height,
                ]
                  .filter(Boolean)
                  .join(" x ")}
              </li>
            ) : null}
            {product.categories?.length ? (
              <li>
                Categories:{" "}
                {product.categories.map((cat) => cat.name).join(", ")}
              </li>
            ) : null}
            {product.tagItems?.length ? (
              <li>
                Tags: {product.tagItems.map((tag) => tag.name).join(", ")}
              </li>
            ) : null}
          </ul>
        </div>
      </section>

      {/* <section className="rounded-[12px] border border-black/5 bg-white/95 p-8">
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
              <div>
                {product.shortDescription ? (
                  <div
                    className="space-y-3"
                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                  />
                ) : (
                  <p>No overview available.</p>
                )}
              </div>
            )}
            {activeTab === "details" && (
              <div>
                {product.description ? (
                  <div
                    className="space-y-3"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p>No detailed description available.</p>
                )}
              </div>
            )}
            {activeTab === "specs" && (
              <div className="space-y-2">
                <p>SKU: {product.sku ?? "N/A"}</p>
                <p>Stock: {stockLabel}</p>
                {product.weight ? <p>Weight: {product.weight}</p> : null}
                {product.dimensions ? (
                  <p>
                    Dimensions:{" "}
                    {[
                      product.dimensions.length,
                      product.dimensions.width,
                      product.dimensions.height,
                    ]
                      .filter(Boolean)
                      .join(" x ")}
                  </p>
                ) : null}
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
        </section> */}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">You might be interested</h2>
        </div>
        <div className="mt-6">
          <div className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0 xl:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group min-w-[80%] snap-start rounded-[12px] border border-black/5 bg-white/95 p-5 transition hover:-translate-y-1 hover:shadow-lg md:min-w-0"
              >
                <div className="relative h-72 overflow-hidden rounded-[12px] bg-[#f1ece4] md:h-84">
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
                <p className="mt-2 text-lg font-semibold group-hover:text-[color:var(--brand)] transition-colors">
                  {item.name}
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {formatPrice(item.price)}
                </p>
                <div className="mt-4 flex justify-end">
                  <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition group-hover:brightness-110 md:w-auto">
                    View details <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {enquiryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Enquiry now</h3>
              <button
                onClick={() => setEnquiryOpen(false)}
                className="text-sm text-[color:var(--muted)]"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              This item is currently out of stock. Leave your details and we’ll
              contact you when it’s available.
            </p>
            <div className="mt-4 grid gap-3">
              <input
                placeholder="Full name"
                className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone number"
                className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              />
              <input
                placeholder="Email address"
                className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Message"
                rows={4}
                className="rounded-[12px] border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEnquiryOpen(false)}
                className="w-full rounded-[12px] border border-black/10 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                className="w-full rounded-[12px] bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setEnquiryOpen(false)}
              >
                Submit enquiry
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* <div className="sticky bottom-6 z-30">
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
              <p className="text-xs text-[color:var(--muted)]">{stockLabel}</p>
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
                  }),
                );
              }}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
