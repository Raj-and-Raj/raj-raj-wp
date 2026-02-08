"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type RazorpayButtonProps = {
  title: string;
  price: number;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayButton({ title, price }: RazorpayButtonProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = () => {
    if (!window.Razorpay) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "",
      amount: price * 100,
      currency: "INR",
      name: "Raj & Raj",
      description: title,
      theme: { color: "#DD3333" },
    };

    const payment = new window.Razorpay(options);
    payment.open();
  };

  return (
    <Button onClick={handlePay} className="w-full">
      Pay {formatPrice(price)} with Razorpay
    </Button>
  );
}
