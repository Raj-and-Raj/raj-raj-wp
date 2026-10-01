"use client";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error?: { description?: string; reason?: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (res: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly kind: "cancelled" | "failed" | "unavailable" | "verify"
  ) {
    super(message);
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        script.remove();
        reject(
          new PaymentError(
            "Couldn't load the payment window. Check your connection and try again.",
            "unavailable"
          )
        );
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export async function isOnlinePaymentEnabled() {
  try {
    const res = await fetch("/api/payments/razorpay/config", {
      cache: "no-store",
    });
    if (!res.ok) return false;
    return Boolean((await res.json())?.enabled);
  } catch {
    return false;
  }
}

/**
 * Opens Razorpay for an existing WooCommerce order and resolves once the
 * payment is verified and the order is marked paid. Rejects with a
 * PaymentError carrying a customer-facing message otherwise.
 */
export async function payOrderWithRazorpay(order: {
  orderId: number;
  orderKey: string;
}) {
  const startRes = await fetch("/api/payments/razorpay/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  const start = await startRes.json().catch(() => ({}));
  if (start?.paid) return;
  if (!startRes.ok) {
    throw new PaymentError(
      start?.message || "Unable to start online payment.",
      "unavailable"
    );
  }

  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new PaymentError("Payment window is unavailable.", "unavailable");
  }

  const result = await new Promise<RazorpaySuccess>((resolve, reject) => {
    let lastFailure = "";
    const instance = new window.Razorpay!({
      key: start.keyId,
      amount: start.amount,
      currency: start.currency,
      order_id: start.razorpayOrderId,
      name: "Raj & Raj",
      description: `Order #${start.orderId}`,
      prefill: start.prefill,
      notes: { woocommerce_order_id: String(start.orderId) },
      theme: { color: "#DD3333" },
      handler: (response: RazorpaySuccess) => resolve(response),
      modal: {
        ondismiss: () =>
          reject(
            new PaymentError(
              lastFailure ||
                "Payment was cancelled. Your order is saved — you can pay now or choose another method.",
              lastFailure ? "failed" : "cancelled"
            )
          ),
      },
    });
    // Razorpay keeps the window open so the customer can retry; remember the
    // reason and report it if they close the window.
    instance.on("payment.failed", (response) => {
      lastFailure = `Payment failed: ${
        response.error?.description || "the payment was declined"
      }. Please try again.`;
    });
    instance.open();
  });

  const verifyRes = await fetch("/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...order, ...result }),
  });
  if (!verifyRes.ok) {
    const data = await verifyRes.json().catch(() => ({}));
    throw new PaymentError(
      data?.message || "We couldn't confirm your payment.",
      "verify"
    );
  }
}
