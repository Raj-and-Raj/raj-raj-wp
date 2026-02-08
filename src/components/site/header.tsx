"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";

type CartItem = {
  quantity?: number;
};

type CartSummary = {
  items?: CartItem[];
};

const navItems = [
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/category/seating" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Animation", href: "/animation" },
];

export function SiteHeader() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadCartCount = async () => {
    const res = await fetch("/api/cart");
    if (!res.ok) return;
    const data: CartSummary = await res.json();
    const count = data?.items?.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    );
    setCartCount(count || 0);
  };

  useEffect(() => {
    loadCartCount();
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      loadCartCount();
      if (detail.open) {
        setDrawerOpen(true);
      }
      if (detail.redirect) {
        setTimeout(() => router.push("/cart"), 900);
      }
    };
    window.addEventListener("cart:updated", handler as EventListener);
    return () => window.removeEventListener("cart:updated", handler as EventListener);
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand)] text-white text-sm font-semibold">
              R
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--ink)]">
              Raj & Raj
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[color:var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-black/10"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open cart"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H22L20 14H8L6 3H3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-[10px] text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <ButtonLink href="/login" variant="outline" size="sm">
              Login
            </ButtonLink>
            <ButtonLink href="/register" size="sm">
              Sign up
            </ButtonLink>
          </div>
        </div>
      </header>
      <MiniCartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
