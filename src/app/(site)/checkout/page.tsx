"use client";

import { normalizeStateCode, useIndiaStates } from "@/lib/india-states";
import {
  NEW_ADDRESS,
  SavedAddressPicker,
} from "@/components/checkout/saved-address-picker";
import type { AddressBook, SavedAddress } from "@/lib/address-book-types";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { Loader } from "@/components/ui/loader";
import {
  isOnlinePaymentEnabled,
  payOrderWithRazorpay,
} from "@/lib/razorpay-client";

type CartItem = {
  key: string;
  name: string;
  quantity: number;
  prices?: { price?: number | string };
  images?: Array<{ src?: string; thumbnail?: string }>;
};

type CartTotals = {
  total?: number | string;
  subtotal?: number | string;
  total_tax?: number | string;
  total_price?: number | string;
  discount_total?: number | string;
  discount_tax?: number | string;
};

type CheckoutResponse = {
  order_id?: number;
  order_key?: string;
  status?: string;
  message?: string;
  data?: { params?: Record<string, string> };
  payment_result?: {
    payment_status?: "success" | "pending" | "failure" | "error";
    payment_details?: Array<{ key?: string; value?: string }>;
    redirect_url?: string;
  };
};

// Labels for the gateways enabled in WooCommerce; unknown ids fall back to a
// readable version of the id so newly enabled gateways still show up.
const PAYMENT_METHOD_LABELS: Record<string, { title: string; description?: string }> = {
  razorpay: {
    title: "Pay online",
    description: "UPI, cards, net banking and wallets via Razorpay.",
  },
  cod: { title: "Cash on delivery", description: "Pay when your order arrives." },
  bacs: { title: "Direct bank transfer" },
  cheque: { title: "Cheque payment" },
};

function paymentMethodLabel(id: string) {
  return (
    PAYMENT_METHOD_LABELS[id] ?? {
      title: id.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    }
  );
}

const PARAM_LABELS: Record<string, string> = {
  billing_address: "Billing address",
  shipping_address: "Shipping address",
  payment_method: "Payment method",
};

// WooCommerce's generic "Invalid parameter(s): billing_address" hides the
// real reason, which it puts in data.params per field.
function checkoutErrorMessage(response: CheckoutResponse) {
  const params = response.data?.params;
  if (params && Object.keys(params).length) {
    const reasons = new Set(
      Object.entries(params).map(([field, reason]) => {
        const text = stripHtml(reason).split(" Must be one of")[0];
        return `${PARAM_LABELS[field] ?? field}: ${text}`;
      }),
    );
    return Array.from(reasons).join(" ");
  }
  return stripHtml(response.message);
}

// Address fields shared by checkout's billing/shipping state and the book.
function addressFields(address: SavedAddress) {
  return {
    first_name: address.first_name,
    last_name: address.last_name,
    company: address.company,
    address_1: address.address_1,
    address_2: address.address_2,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
    country: address.country || "IN",
    phone: address.phone,
  };
}

function stripHtml(value?: string) {
  if (!value) return "";
  const text = value.replace(/<[^>]*>/g, "");
  if (typeof document === "undefined") return text.trim();
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value.trim();
}

type Cart = {
  items?: CartItem[];
  payment_methods?: string[];
  needs_payment?: boolean;
  totals?: CartTotals;
  coupons?: Array<{ code?: string; discount?: string | number }>;
  shipping_rates?: Array<{
    shipping_rates?: Array<{
      rate_id?: string;
      name?: string;
      price?: string | number;
      method_id?: string;
    }>;
  }>;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
  });
  const [shipping, setShipping] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    phone: "",
  });
  const [shipToBilling, setShipToBilling] = useState(true);
  const [addressBook, setAddressBook] = useState<AddressBook | null>(null);
  const [billingChoice, setBillingChoice] = useState<string>(NEW_ADDRESS);
  const [shippingChoice, setShippingChoice] = useState<string>(NEW_ADDRESS);
  const [saveNewBilling, setSaveNewBilling] = useState(true);
  const [saveNewShipping, setSaveNewShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState<
    boolean | null
  >(null);
  const [pendingOrder, setPendingOrder] = useState<{
    id: number;
    key: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginValues, setLoginValues] = useState({
    username: "",
    password: "",
  });
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const indiaStates = useIndiaStates();

  const load = useCallback(async () => {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        setIsAuthed(false);
        setAuthChecked(true);
      } else {
        setIsAuthed(true);
        setAuthChecked(true);
        const me = (await authRes.json().catch(() => null)) as { email?: string } | null;
        if (me?.email) {
          setBilling((prev) => (prev.email ? prev : { ...prev, email: me.email! }));
        }
      }
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        const gateways: string[] = data?.payment_methods ?? [];
        setPaymentMethod((current) =>
          current && gateways.includes(current) ? current : (gateways[0] ?? ""),
        );
        const options =
          data?.shipping_rates
            ?.flatMap(
              (pkg: {
                shipping_rates?: Array<{
                  rate_id?: string;
                  method_id?: string;
                }>;
              }) => pkg.shipping_rates ?? [],
            )
            ?.map(
              (rate: { rate_id?: string; method_id?: string }) =>
                rate.rate_id || rate.method_id,
            )
            ?.filter(Boolean) ?? [];
        if (options.length && !shippingMethod) {
          setShippingMethod(options[0] as string);
        } else if (!options.length && !shippingMethod) {
          setShippingMethod("free");
        }
      }
      if (!hasPrefilled && authRes.ok) {
        const mergeAddress = <T extends Record<string, string | undefined>>(
          current: T,
          incoming?: Partial<T> | null,
        ) => {
          if (!incoming) return current;
          const next = { ...current };
          (Object.keys(next) as Array<keyof T>).forEach((key) => {
            if (!next[key] && incoming[key]) {
              next[key] = incoming[key] as T[keyof T];
            }
          });
          return next;
        };

        let nextBilling: typeof billing | null = null;
        let nextShipping: typeof shipping | null = null;
        const addressRes = await fetch("/api/account/addresses");
        if (addressRes.ok) {
          const data = await addressRes.json();
          nextBilling = mergeAddress(
            nextBilling ?? billing,
            data?.billing ?? data?.shipping,
          );
          nextShipping = mergeAddress(
            nextShipping ?? shipping,
            data?.shipping ?? data?.billing,
          );
        }

        const checkoutRes = await fetch("/api/checkout");
        if (checkoutRes.ok) {
          const draft = await checkoutRes.json();
          nextBilling = mergeAddress(
            nextBilling ?? billing,
            draft?.billing_address,
          );
          nextShipping = mergeAddress(
            nextShipping ?? shipping,
            draft?.shipping_address ?? draft?.billing_address,
          );
        }

        if (nextBilling) {
          setBilling({
            ...nextBilling,
            state: normalizeStateCode(nextBilling.state),
          });
        }
        if (nextShipping) {
          setShipping({
            ...nextShipping,
            state: normalizeStateCode(nextShipping.state),
          });
        }
        const bookRes = await fetch("/api/account/address-book");
        if (bookRes.ok) {
          const book: AddressBook = await bookRes.json();
          setAddressBook(book);
          const defaultBilling = book.addresses.find((a) => a.id === book.defaultBilling);
          const defaultShipping = book.addresses.find((a) => a.id === book.defaultShipping);
          if (defaultBilling) {
            setBilling((prev) => ({ ...prev, ...addressFields(defaultBilling) }));
            setBillingChoice(defaultBilling.id);
            setSaveNewBilling(false);
          }
          if (defaultShipping) {
            setShipping((prev) => ({ ...prev, ...addressFields(defaultShipping) }));
            setShippingChoice(defaultShipping.id);
            setSaveNewShipping(false);
            if (defaultBilling && defaultShipping.id !== defaultBilling.id) {
              setShipToBilling(false);
            }
          }
        }
        setHasPrefilled(true);
      }
    }, [billing, hasPrefilled, shipping, shippingMethod]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleAuthUpdated = () => {
      setHasPrefilled(false);
      load();
    };
    window.addEventListener("auth:updated", handleAuthUpdated);
    return () => window.removeEventListener("auth:updated", handleAuthUpdated);
  }, [load]);

  useEffect(() => {
    if (isAuthed) return;
    const email = billing.email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !emailOk) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.exists) {
          setEmailWarning(
            "This email already has an account. Please log in."
          );
          setShowLoginModal(true);
          setLoginValues((prev) => ({
            ...prev,
            username: email,
          }));
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") return;
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [billing.email, isAuthed]);

  useEffect(() => {
    if (!shipToBilling) return;
    setShipping((prev) => ({ ...prev, ...billing }));
  }, [billing, shipToBilling]);

  useEffect(() => {
    if (!couponSuccess) return;
    const timer = window.setTimeout(() => {
      setCouponSuccess("");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [couponSuccess]);

  useEffect(() => {
    isOnlinePaymentEnabled().then(setOnlinePaymentEnabled);
  }, []);

  // Don't preselect online payment when it can't be used.
  useEffect(() => {
    if (onlinePaymentEnabled !== false || paymentMethod !== "razorpay") return;
    const fallback = cart?.payment_methods?.find((m) => m !== "razorpay");
    if (fallback) setPaymentMethod(fallback);
  }, [onlinePaymentEnabled, paymentMethod, cart?.payment_methods]);

  const savedAddresses = isAuthed ? (addressBook?.addresses ?? []) : [];
  const showBillingForm = savedAddresses.length === 0 || billingChoice === NEW_ADDRESS;
  const showShippingForm = savedAddresses.length === 0 || shippingChoice === NEW_ADDRESS;

  const blankAddress = {
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
  };

  const selectBillingAddress = (id: string) => {
    setBillingChoice(id);
    const saved = savedAddresses.find((a) => a.id === id);
    if (saved) {
      setBilling((prev) => ({ ...prev, ...addressFields(saved) }));
    } else {
      setBilling((prev) => ({ ...prev, ...blankAddress }));
      setSaveNewBilling(true);
    }
  };

  const selectShippingAddress = (id: string) => {
    setShippingChoice(id);
    const saved = savedAddresses.find((a) => a.id === id);
    if (saved) {
      setShipping((prev) => ({ ...prev, ...addressFields(saved) }));
    } else {
      setShipping((prev) => ({ ...prev, ...blankAddress }));
      setSaveNewShipping(true);
    }
  };

  // Adds addresses typed in at checkout to the customer's address book.
  const saveNewAddresses = async () => {
    if (!isAuthed) return;
    const pending: Array<{ address: typeof shipping; label: string }> = [];
    if (billingChoice === NEW_ADDRESS && saveNewBilling) {
      const { email: _email, ...address } = billing;
      void _email;
      pending.push({ address, label: savedAddresses.length ? "Other" : "Home" });
    }
    if (!shipToBilling && shippingChoice === NEW_ADDRESS && saveNewShipping) {
      pending.push({ address: shipping, label: "Other" });
    }
    for (const { address, label } of pending) {
      await fetch("/api/account/address-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: { ...address, label } }),
      }).catch(() => undefined);
    }
  };

  const successUrlFor = (orderId?: number, orderKey?: string) =>
    orderId
      ? `/checkout/success?order_id=${orderId}${
          orderKey ? `&key=${encodeURIComponent(orderKey)}` : ""
        }`
      : "/checkout/success";

  const placeOrder = async () => {
    if (cart?.needs_payment !== false && !paymentMethod) {
      setError("Please choose a payment method.");
      return;
    }
    if (
      paymentMethod === "razorpay" &&
      !pendingOrder &&
      onlinePaymentEnabled === false
    ) {
      setError(
        "Online payment is temporarily unavailable. Please choose Cash on delivery.",
      );
      return;
    }
    setIsPlacing(true);
    setError("");
    let redirecting = false;
    try {
      // An order already created for online payment is retried as-is so a
      // failed or cancelled payment never creates a duplicate order.
      let order = pendingOrder;
      if (!order) {
        const createRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billing_address: billing,
            shipping_address: shipToBilling ? billing : shipping,
            shipping_method: shippingMethod ? [shippingMethod] : undefined,
            payment_method: paymentMethod,
            payment_data: [],
            customer_note: orderNotes,
            ...(isAuthed ? {} : { create_account: true }),
          }),
        });
        const processed: CheckoutResponse = await createRes
          .json()
          .catch(() => ({}));
        if (!createRes.ok) {
          throw new Error(
            checkoutErrorMessage(processed) || "Unable to place your order.",
          );
        }

        const result = processed.payment_result;
        if (
          result?.payment_status === "failure" ||
          result?.payment_status === "error"
        ) {
          const detail = result.payment_details?.find(
            (entry) => entry.key === "message" || entry.key === "errorMessage",
          )?.value;
          throw new Error(
            stripHtml(detail) ||
              "Payment could not be processed. Please try again.",
          );
        }
        window.dispatchEvent(new Event("cart:updated"));
        await saveNewAddresses();

        if (paymentMethod !== "razorpay" || !processed.order_id || !processed.order_key) {
          redirecting = true;
          window.location.href = successUrlFor(
            processed.order_id,
            processed.order_key,
          );
          return;
        }
        order = { id: processed.order_id, key: processed.order_key };
        setPendingOrder(order);
      }

      // Razorpay runs on this page (instead of WordPress's payment page) so
      // any payment problem is shown here and the customer can retry.
      await payOrderWithRazorpay({ orderId: order.id, orderKey: order.key });
      redirecting = true;
      window.location.href = successUrlFor(order.id, order.key);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      if (!redirecting) setIsPlacing(false);
    }
  };

  const handleInlineLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginSubmitting) return;
    setLoginSubmitting(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginValues.username.trim(),
          password: loginValues.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data?.error || "Invalid credentials.");
        return;
      }
      window.dispatchEvent(new Event("auth:updated"));
      setShowLoginModal(false);
      setLoginValues({ username: "", password: "" });
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const toCents = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    return 0;
  };

  const refreshCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCart(data);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    const res = await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCouponError(data?.message || "Unable to apply coupon.");
    } else {
      setCouponSuccess("Coupon applied successfully.");
    }
    setCoupon("");
    refreshCart();
  };

  const removeCoupon = async (code?: string) => {
    if (!code) return;
    await fetch("/api/cart/remove-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setCouponSuccess("");
    refreshCart();
  };

  const itemsSubtotalCents =
    cart?.items?.reduce((sum, item) => {
      const price =
        typeof item.prices?.price === "number"
          ? item.prices?.price
          : Number(item.prices?.price || 0);
      return sum + price * (item.quantity ?? 0);
    }, 0) ?? 0;
  const totalsCents = toCents(cart?.totals?.total_price ?? cart?.totals?.total);
  const subtotalCentsRaw = toCents(cart?.totals?.subtotal);
  const subtotalCents =
    subtotalCentsRaw > 0 ? subtotalCentsRaw : itemsSubtotalCents;
  const couponDiscountFromCoupons =
    cart?.coupons?.reduce((sum, entry) => sum + toCents(entry.discount), 0) ??
    0;
  const couponDiscountFromTotals =
    toCents(cart?.totals?.discount_total) + toCents(cart?.totals?.discount_tax);
  const derivedDiscountFromTotals = Math.max(0, subtotalCents - totalsCents);
  const derivedDiscountFromItems = Math.max(
    0,
    itemsSubtotalCents - subtotalCents,
  );
  const couponDiscountCents =
    couponDiscountFromCoupons > 0
      ? couponDiscountFromCoupons
      : couponDiscountFromTotals > 0
        ? couponDiscountFromTotals
        : derivedDiscountFromTotals > 0
          ? derivedDiscountFromTotals
          : derivedDiscountFromItems;
  const derivedTotalCents = Math.max(0, subtotalCents - couponDiscountCents);
  const shippingRates =
    cart?.shipping_rates?.flatMap((pkg) => pkg.shipping_rates ?? []) ?? [];
  const selectedRate = shippingRates.find(
    (rate) => (rate.rate_id || rate.method_id) === shippingMethod,
  );
  const selectedRateCents = selectedRate
    ? typeof selectedRate.price === "number"
      ? selectedRate.price
      : Number(selectedRate.price || 0)
    : 0;
  const fallbackShippingCents = shippingMethod === "flat" ? 10000 : 0;
  const orderTotalCents =
    totalsCents > 0
      ? totalsCents
      : derivedTotalCents + (selectedRateCents || fallbackShippingCents);

  if (!authChecked) {
    return (
      <div className="mx-auto w-full max-w-[96rem] px-6 mb-24 pt-32">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-6 mb-24 pt-32">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-semibold">Billing details</h1>
              {!isAuthed ? (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-semibold text-[color:var(--brand)] hover:underline"
                >
                  Already have an account?
                </button>
              ) : null}
            </div>
            {savedAddresses.length ? (
              <SavedAddressPicker
                name="billing-address"
                addresses={savedAddresses}
                selected={billingChoice}
                defaultId={addressBook?.defaultBilling}
                states={indiaStates}
                onSelect={selectBillingAddress}
              />
            ) : null}
            {showBillingForm ? (
              <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                First name <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.first_name}
                  onChange={(event) =>
                    setBilling({ ...billing, first_name: event.target.value })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Last name <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.last_name}
                  onChange={(event) =>
                    setBilling({ ...billing, last_name: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Company name (optional)
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.company ?? ""}
                onChange={(event) =>
                  setBilling({ ...billing, company: event.target.value })
                }
              />
            </label>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Country / Region{" "}
              <span className="text-[color:var(--brand)]">*</span>
              <select
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.country}
                onChange={(event) =>
                  setBilling({ ...billing, country: event.target.value })
                }
              >
                <option value="IN">India</option>
              </select>
            </label>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Street address{" "}
              <span className="text-[color:var(--brand)]">*</span>
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                placeholder="House number and street name"
                value={billing.address_1}
                onChange={(event) =>
                  setBilling({ ...billing, address_1: event.target.value })
                }
              />
            </label>
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Apartment, suite, unit, etc. (optional)
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.address_2}
                onChange={(event) =>
                  setBilling({ ...billing, address_2: event.target.value })
                }
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Town / City <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.city}
                  onChange={(event) =>
                    setBilling({ ...billing, city: event.target.value })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                State / County{" "}
                <span className="text-[color:var(--brand)]">*</span>
                <select
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.state}
                  onChange={(event) =>
                    setBilling({ ...billing, state: event.target.value })
                  }
                >
                  <option value="">Select state</option>
                  {indiaStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Postcode / ZIP{" "}
                <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.postcode}
                  onChange={(event) =>
                    setBilling({ ...billing, postcode: event.target.value })
                  }
                />
              </label>
              <label className="text-xs font-semibold text-[color:var(--muted)]">
                Phone <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={billing.phone}
                  onChange={(event) =>
                    setBilling({ ...billing, phone: event.target.value })
                  }
                />
              </label>
            </div>
              {isAuthed ? (
                <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
                  <input
                    type="checkbox"
                    checked={saveNewBilling}
                    onChange={(event) => setSaveNewBilling(event.target.checked)}
                  />
                  Save this address to my address book
                </label>
              ) : null}
              </>
            ) : null}
            <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
              Email address <span className="text-[color:var(--brand)]">*</span>
              <input
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                value={billing.email}
                onChange={(event) => {
                  setBilling({ ...billing, email: event.target.value });
                  setEmailWarning("");
                }}
              />
            </label>
            {emailWarning ? (
              <p className="mt-2 text-xs text-amber-600">{emailWarning}</p>
            ) : null}
            <div className="mt-6 rounded-[12px] border border-black/5 bg-white/80 p-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
                <input
                  type="checkbox"
                  checked={shipToBilling}
                  onChange={(event) => setShipToBilling(event.target.checked)}
                />
                Ship to the same address
              </label>
            </div>
            <label className="mt-6 block text-xs font-semibold text-[color:var(--muted)]">
              Additional information
              <textarea
                className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                rows={4}
                placeholder="Notes about your order, e.g. special notes for delivery."
                value={orderNotes}
                onChange={(event) => setOrderNotes(event.target.value)}
              />
            </label>
          </div>

          {!shipToBilling ? (
            <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
              <h2 className="text-lg font-semibold">Shipping details</h2>
              {savedAddresses.length ? (
                <SavedAddressPicker
                  name="shipping-address"
                  addresses={savedAddresses}
                  selected={shippingChoice}
                  defaultId={addressBook?.defaultShipping}
                  states={indiaStates}
                  onSelect={selectShippingAddress}
                />
              ) : null}
              {showShippingForm ? (
                <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  First name{" "}
                  <span className="text-[color:var(--brand)]">*</span>
                  <input
                    className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                    value={shipping.first_name}
                    onChange={(event) =>
                      setShipping({
                        ...shipping,
                        first_name: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  Last name <span className="text-[color:var(--brand)]">*</span>
                  <input
                    className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                    value={shipping.last_name}
                    onChange={(event) =>
                      setShipping({
                        ...shipping,
                        last_name: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
                Company name (optional)
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={shipping.company ?? ""}
                  onChange={(event) =>
                    setShipping({ ...shipping, company: event.target.value })
                  }
                />
              </label>
              <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
                Country / Region{" "}
                <span className="text-[color:var(--brand)]">*</span>
                <select
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={shipping.country}
                  onChange={(event) =>
                    setShipping({ ...shipping, country: event.target.value })
                  }
                >
                  <option value="IN">India</option>
                </select>
              </label>
              <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
                Street address{" "}
                <span className="text-[color:var(--brand)]">*</span>
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  placeholder="House number and street name"
                  value={shipping.address_1}
                  onChange={(event) =>
                    setShipping({ ...shipping, address_1: event.target.value })
                  }
                />
              </label>
              <label className="mt-4 block text-xs font-semibold text-[color:var(--muted)]">
                Apartment, suite, unit, etc. (optional)
                <input
                  className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={shipping.address_2}
                  onChange={(event) =>
                    setShipping({ ...shipping, address_2: event.target.value })
                  }
                />
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  Town / City{" "}
                  <span className="text-[color:var(--brand)]">*</span>
                  <input
                    className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                    value={shipping.city}
                    onChange={(event) =>
                      setShipping({ ...shipping, city: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  State / County{" "}
                  <span className="text-[color:var(--brand)]">*</span>
                  <select
                    className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                    value={shipping.state}
                    onChange={(event) =>
                      setShipping({ ...shipping, state: event.target.value })
                    }
                  >
                    <option value="">Select state</option>
                    {indiaStates.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  Postcode / ZIP{" "}
                  <span className="text-[color:var(--brand)]">*</span>
                  <input
                    className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                    value={shipping.postcode}
                    onChange={(event) =>
                      setShipping({ ...shipping, postcode: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-semibold text-[color:var(--muted)]">
                  Phone <span className="text-[color:var(--brand)]">*</span>
                  <input
                    className="mt-2 w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                    value={shipping.phone}
                    onChange={(event) =>
                      setShipping({ ...shipping, phone: event.target.value })
                    }
                  />
                </label>
              </div>
                  {isAuthed ? (
                    <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
                      <input
                        type="checkbox"
                        checked={saveNewShipping}
                        onChange={(event) => setSaveNewShipping(event.target.checked)}
                      />
                      Save this address to my address book
                    </label>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <h2 className="text-lg font-semibold">Your order</h2>
            {cart ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between font-semibold text-[color:var(--muted)]">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>
                {cart.items?.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between border-b border-black/5 pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-[10px] bg-[#f1ece4]">
                        {item.images?.[0]?.thumbnail ||
                        item.images?.[0]?.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              item.images?.[0]?.thumbnail ||
                              item.images?.[0]?.src
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted)]">
                          x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span>
                      {formatPrice(Number(item.prices?.price ?? 0) / 100)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemsSubtotalCents / 100)}</span>
                </div>
                {cart.coupons?.length || couponDiscountCents > 0 ? (
                  <div className="flex justify-between text-sm text-[color:var(--brand)]">
                    <span>Coupon</span>
                    <span>-{formatPrice(couponDiscountCents / 100)}</span>
                  </div>
                ) : null}
                {cart.coupons?.length ? (
                  <div className="mt-2 rounded-[10px] border border-black/5 bg-white/80 p-3 text-xs">
                    <p className="mb-2 font-semibold">Applied coupons</p>
                    <div className="space-y-1">
                      {cart.coupons.map((entry) => (
                        <div
                          key={entry.code}
                          className="flex items-center justify-between"
                        >
                          <span className="uppercase">{entry.code}</span>
                          <button
                            className="text-[color:var(--brand)]"
                            onClick={() => removeCoupon(entry.code)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!cart.coupons?.length ? (
                  <>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={coupon}
                        onChange={(event) => setCoupon(event.target.value)}
                        placeholder="Coupon code"
                        className="w-full rounded-[10px] border border-black/10 px-3 py-2 text-sm"
                      />
                      <Button onClick={applyCoupon} size="sm">
                        Apply
                      </Button>
                    </div>
                    {couponError ? (
                      <p className="mt-2 text-xs text-red-500">{couponError}</p>
                    ) : null}
                    {couponSuccess ? (
                      <p className="mt-2 text-xs text-emerald-600">
                        {couponSuccess}
                      </p>
                    ) : null}
                  </>
                ) : null}
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-semibold text-[color:var(--muted)]">
                    Shipping
                  </p>
                  {shippingRates.length ? (
                    shippingRates.map((rate) => {
                      const id = rate.rate_id || rate.method_id || "";
                      const priceCents =
                        typeof rate.price === "number"
                          ? rate.price
                          : Number(rate.price || 0);
                      return (
                        <label key={id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === id}
                            onChange={() => setShippingMethod(id)}
                          />
                          {rate.name || "Shipping"}{" "}
                          <span className="text-[color:var(--muted)]">
                            {priceCents > 0
                              ? `· ${formatPrice(priceCents / 100)}`
                              : "· Free"}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === "free"}
                          onChange={() => setShippingMethod("free")}
                        />
                        Free shipping
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === "flat"}
                          onChange={() => setShippingMethod("flat")}
                        />
                        Flat rate: ₹100
                      </label>
                    </>
                  )}
                </div>
                <div className="flex justify-between border-t border-black/10 pt-3 font-semibold">
                  <span>
                    Total
                    {couponDiscountCents > 0
                      ? ` (saved ${formatPrice(couponDiscountCents / 100)})`
                      : ""}
                  </span>
                  <span>{formatPrice(orderTotalCents / 100)}</span>
                </div>
              </div>
            ) : (
              <Loader />
            )}
          </div>

          <div className="rounded-[12px] border border-black/5 bg-white/95 p-6">
            <h3 className="text-sm font-semibold">Payment</h3>
            <div className="mt-3 space-y-3 text-sm">
              {cart?.payment_methods?.length ? (
                cart.payment_methods.map((method) => {
                  const label = paymentMethodLabel(method);
                  const unavailable =
                    method === "razorpay" && onlinePaymentEnabled === false;
                  const locked = !!pendingOrder && method !== paymentMethod;
                  const disabled = unavailable || locked;
                  return (
                    <label
                      key={method}
                      className={`flex items-start gap-2 rounded-[10px] border px-3 py-2 ${
                        disabled
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      } ${
                        paymentMethod === method
                          ? "border-[color:var(--brand)]"
                          : "border-black/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="mt-1"
                        disabled={disabled}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                      />
                      <span>
                        <span className="block font-medium">{label.title}</span>
                        {unavailable ? (
                          <span className="block text-xs text-red-600">
                            Temporarily unavailable. Please choose another
                            method.
                          </span>
                        ) : label.description ? (
                          <span className="block text-xs text-[color:var(--muted)]">
                            {label.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="text-[color:var(--muted)]">
                  No payment methods are available right now.
                </p>
              )}
            </div>
            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}
            {pendingOrder ? (
              <p className="mt-3 text-xs text-[color:var(--muted)]">
                Order #{pendingOrder.id} is saved and waiting for payment.{" "}
                <a
                  href={successUrlFor(pendingOrder.id, pendingOrder.key)}
                  className="font-semibold text-[color:var(--brand)] hover:underline"
                >
                  View order
                </a>
              </p>
            ) : null}
            <Button
              onClick={placeOrder}
              className="mt-6 w-full"
              disabled={isPlacing}
            >
              {isPlacing
                ? pendingOrder
                  ? "Processing payment..."
                  : "Placing order..."
                : pendingOrder
                  ? `Pay now for order #${pendingOrder.id}`
                  : paymentMethod === "razorpay"
                    ? "Place order & pay"
                    : "Place order"}
            </Button>
            {!isAuthed ? (
              <p className="mt-3 text-xs text-[color:var(--muted)]">
                We’ll create your account after checkout and email you a
                password setup link.
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {showLoginModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sign in</h3>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="text-sm text-[color:var(--muted)]"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleInlineLogin} className="mt-4 space-y-4">
              {loginError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loginError}
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[color:var(--muted)]">
                  Email or username
                </label>
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  value={loginValues.username}
                  onChange={(event) =>
                    setLoginValues((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[color:var(--muted)]">
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm"
                  type="password"
                  value={loginValues.password}
                  onChange={(event) =>
                    setLoginValues((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <Button className="w-full" disabled={loginSubmitting}>
                {loginSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
