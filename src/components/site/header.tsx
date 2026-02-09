"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";

type CartItem = {
  quantity?: number;
};

type CartSummary = {
  items?: CartItem[];
};

const baseLinks = [
  { label: "Home", href: "/" },
  // { label: "Shop", href: "/products" },
];

export function SiteHeader() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryLinks, setCategoryLinks] =
    useState<Array<{ label: string; href: string }>>(baseLinks);

  const loadCartCount = async () => {
    const res = await fetch("/api/cart");
    if (!res.ok) return;
    const data: CartSummary = await res.json();
    const count = data?.items?.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0,
    );
    setCartCount(count || 0);
  };

  const loadWishlistCount = () => {
    const stored = localStorage.getItem("wishlist");
    if (!stored) {
      setWishlistCount(0);
      return;
    }
    try {
      const ids = JSON.parse(stored) as string[];
      setWishlistCount(ids.length);
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
    loadWishlistCount();
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      loadCartCount();
      loadWishlistCount();
      if (detail.open) {
        setDrawerOpen(true);
      }
      if (detail.redirect) {
        setTimeout(() => router.push("/cart"), 900);
      }
    };
    window.addEventListener("cart:updated", handler as EventListener);
    window.addEventListener("wishlist:updated", loadWishlistCount);
    window.addEventListener("storage", loadWishlistCount);
    return () => {
      window.removeEventListener("cart:updated", handler as EventListener);
      window.removeEventListener("wishlist:updated", loadWishlistCount);
      window.removeEventListener("storage", loadWishlistCount);
    };
  }, [router]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories/parents");
        if (!res.ok) return;
        const data: Array<{ name: string; slug: string }> = await res.json();
        const mapped = data.map((item) => ({
          label: item.name,
          href: `/category/${item.slug}`,
        }));
        setCategoryLinks([...baseLinks, ...mapped]);
      } catch {
        setCategoryLinks(baseLinks);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="sticky">
      <div className="w-full bg-[color:var(--brand)] text-white text-center text-xs py-2 font-medium">
        Mix, match, and save up to Rs. 40000 off on Spring-ready styles!
      </div>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto w-full px-4 md:px-8">
          <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </button>

              <Link
                href="/"
                className="text-2xl md:text-3xl font-bold tracking-tighter text-[color:var(--brand)] italic"
              >
                <img
                  src="https://dev.rajandraj.co/wp-content/uploads/2026/01/cropped-Logo3.png"
                  alt="Raj and Raj logo featuring a red bull head icon with white horns, accompanied by bold red text reading RAJ AND RAJ and a tagline stating Your trusted choice, representing a trusted brand choice"
                  width="220"
                  height="60"
                />
              </Link>
            </div>

            <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[15px] font-semibold capitalize text-[color:var(--ink)]">
              {categoryLinks.map((item) => (
                <Link key={item.href} href={item.href} className="nav-pill">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4 md:space-x-6">
              <Link
                href="/login"
                className="text-[color:var(--muted)] hover:text-black"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>

              <Link
                href="/wishlist"
                className="hidden md:block text-[color:var(--muted)] hover:text-black"
              >
                <span className="relative inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.8 4.6C20.3 4.1 19.7 3.7 19.1 3.4C18.4 3.1 17.7 3 17 3C16.2 3 15.5 3.1 14.8 3.4C14.2 3.7 13.6 4.1 13.1 4.6L12 5.7L10.9 4.6C9.9 3.6 8.5 3 7.1 3C5.6 3 4.2 3.6 3.2 4.6C2.1 5.6 1.5 7 1.5 8.5C1.5 10 2.1 11.4 3.2 12.4L4.2 13.4L12 21.2L19.8 13.4L20.8 12.4C21.8 11.4 22.5 10 22.5 8.5C22.5 7 21.8 5.6 20.8 4.6Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  {wishlistCount > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-[color:var(--brand)] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  ) : null}
                </span>
              </Link>

              <button
                className="relative text-[color:var(--muted)] hover:text-black"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6H22L20 14H8L6 3H3"
                    stroke="currentColor"
                    strokeWidth="1.5"
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
                  <span className="absolute -top-1 -right-1 bg-[color:var(--brand)] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div className="md:hidden bg-white/95 border-t border-black/5 p-4 space-y-3">
            {categoryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium uppercase"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>
      <MiniCartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
