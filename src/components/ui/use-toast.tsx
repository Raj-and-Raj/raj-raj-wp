"use client";

import * as React from "react";

type ToastVariant = "default" | "destructive" | "success";
type ToastPosition = "left" | "right";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  position?: ToastPosition;
};

type ToastItem = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

const TOAST_LIMIT = 3;

let toastCount = 0;

// crypto.randomUUID only exists in secure contexts (HTTPS / localhost), so it
// throws when the site is opened over plain http, e.g. via a LAN IP.
function createToastId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return `${Date.now().toString(36)}-${toastCount}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = createToastId();
    setToasts((current) => [
      { id, ...options },
      ...current.slice(0, TOAST_LIMIT - 1),
    ]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
