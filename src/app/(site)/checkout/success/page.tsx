import { Suspense } from "react";
import { CheckoutSuccessClient } from "./checkout-success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="px-6 pt-32">Loading...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
