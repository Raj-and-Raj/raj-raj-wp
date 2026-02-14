"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { uploadsUrl } from "@/lib/uploads";

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

let cartCountCache: { value: number; ts: number } | null = null;
let cartCountInflight: Promise<number> | null = null;
const CART_COUNT_TTL_MS = 1500;

let authCache: { value: boolean; ts: number } | null = null;
let authInflight: Promise<boolean> | null = null;
const AUTH_TTL_MS = 5000;

let categoriesCache:
  | { value: Array<{ label: string; href: string }>; ts: number }
  | null = null;
let categoriesInflight: Promise<Array<{ label: string; href: string }>> | null =
  null;
const CATEGORIES_TTL_MS = 5 * 60 * 1000;

const fetchCartCount = async (force = false) => {
  const now = Date.now();
  if (!force && cartCountCache && now - cartCountCache.ts < CART_COUNT_TTL_MS) {
    return cartCountCache.value;
  }
  if (cartCountInflight) return cartCountInflight;
  cartCountInflight = fetch("/api/cart")
    .then(async (res) => {
      if (!res.ok) return 0;
      const data: CartSummary = await res.json();
      const count =
        data?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
      return count;
    })
    .catch(() => 0)
    .finally(() => {
      cartCountInflight = null;
    });
  const value = await cartCountInflight;
  cartCountCache = { value, ts: now };
  return value;
};

const fetchAuthStatus = async (force = false) => {
  const now = Date.now();
  if (!force && authCache && now - authCache.ts < AUTH_TTL_MS) {
    return authCache.value;
  }
  if (authInflight) return authInflight;
  authInflight = fetch("/api/auth/me")
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      authInflight = null;
    });
  const value = await authInflight;
  authCache = { value, ts: now };
  return value;
};

const fetchCategories = async (force = false) => {
  const now = Date.now();
  if (!force && categoriesCache && now - categoriesCache.ts < CATEGORIES_TTL_MS) {
    return categoriesCache.value;
  }
  if (categoriesInflight) return categoriesInflight;
  categoriesInflight = fetch("/api/categories/parents")
    .then(async (res) => {
      if (!res.ok) return baseLinks;
      const data: Array<{ name: string; slug: string }> = await res.json();
      return [
        ...baseLinks,
        ...data.map((item) => ({
          label: item.name,
          href: `/category/${item.slug}`,
        })),
      ];
    })
    .catch(() => baseLinks)
    .finally(() => {
      categoriesInflight = null;
    });
  const value = await categoriesInflight;
  categoriesCache = { value, ts: now };
  return value;
};

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoryLinks, setCategoryLinks] =
    useState<Array<{ label: string; href: string }>>(baseLinks);

  const loadCartCount = async () => {
    const count = await fetchCartCount();
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

  const loadAuthStatus = async () => {
    const authed = await fetchAuthStatus();
    setIsAuthed(authed);
  };

  useEffect(() => {
    loadCartCount();
    loadWishlistCount();
    loadAuthStatus();
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      fetchCartCount(true).then((count) => setCartCount(count || 0));
      loadWishlistCount();
      if (detail.redirect) {
        setTimeout(() => router.push("/cart"), 900);
      }
    };
    const authHandler = () => {
      fetchAuthStatus(true).then((authed) => setIsAuthed(authed));
    };
    window.addEventListener("cart:updated", handler as EventListener);
    window.addEventListener("wishlist:updated", loadWishlistCount);
    window.addEventListener("auth:updated", authHandler as EventListener);
    window.addEventListener("storage", loadWishlistCount);
    return () => {
      window.removeEventListener("cart:updated", handler as EventListener);
      window.removeEventListener("wishlist:updated", loadWishlistCount);
      window.removeEventListener("auth:updated", authHandler as EventListener);
      window.removeEventListener("storage", loadWishlistCount);
    };
  }, [router]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    const loadCategories = async () => {
      const mapped = await fetchCategories();
      setCategoryLinks(mapped);
    };
    loadCategories();
  }, []);

  return (
    <div className="fixed w-full bg-transparent z-[99999999999]">
      <div className="w-full bg-[color:var(--brand)] text-white text-center text-xs py-2 font-medium">
        Mix, match, and save up to Rs. 40000 off on Spring-ready styles!
      </div>
      <header
        data-home={isHome && !scrolled}
        className={`sticky top-0 z-30 backdrop-blur-2xl transition-colors duration-300 ${
          isHome && !scrolled
            ? "border-transparent bg-transparent text-white"
            : "border-b border-black/5 bg-white/85 text-[color:var(--ink)]"
        }`}
      >
        <div className="mx-auto w-full px-4 md:px-12">
          <div className="grid h-15 grid-cols-[auto_1fr_auto] items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                className={`md:hidden p-2 ${isHome && !scrolled ? "text-white" : ""}`}
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
                className={`text-2xl md:text-3xl font-bold tracking-tighter italic ${
                  isHome && !scrolled ? "text-white" : "text-[color:var(--brand)]"
                }`}
              >
                <img
                  src={uploadsUrl("2026/01/cropped-Logo3.png")}
                  alt="Raj and Raj logo featuring a red bull head icon with white horns, accompanied by bold red text reading RAJ AND RAJ and a tagline stating Your trusted choice, representing a trusted brand choice"
                  width="180"
                  height="50"
                  className={isHome && !scrolled ? "brightness-0 invert" : ""}
                />
              </Link>
            </div>

            <nav
              className={`hidden md:flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[15px] capitalize ${
                isHome && !scrolled ? "text-white/90" : "text-[color:var(--ink)]"
              }`}
            >
              {categoryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-pill ${
                    isHome && !scrolled
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4 md:space-x-6">
              <Link
                href={isAuthed ? "/account" : "/login"}
                className={`hover:text-black ${
                  isHome && !scrolled
                    ? "text-white/80 hover:text-white"
                    : "text-[color:var(--muted)]"
                }`}
                aria-label={isAuthed ? "Account" : "Login"}
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
                className={`hidden md:block hover:text-black ${
                  isHome && !scrolled
                    ? "text-white/80 hover:text-white"
                    : "text-[color:var(--muted)]"
                }`}
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

              <Link
                href="/cart"
                className={`relative hover:text-black ${
                  isHome && !scrolled
                    ? "text-white/80 hover:text-white"
                    : "text-[color:var(--muted)]"
                }`}
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
              </Link>
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
    </div>
  );
}
