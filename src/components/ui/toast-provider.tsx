"use client";

import { ToastProvider as ToastStateProvider } from "@/components/ui/use-toast";
import { ToastProvider as ToastPrimitiveProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

export function ToastRoot({ children }: { children: React.ReactNode }) {
  return (
    <ToastStateProvider>
      {children}
      <ToastPrimitiveProvider>
        <Toaster />
      </ToastPrimitiveProvider>
    </ToastStateProvider>
  );
}
