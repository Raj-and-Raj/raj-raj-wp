import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[color:var(--charcoal)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-[color:var(--champagne)]">
            RAJ & RAJ
          </p>
          <p className="mt-4 text-sm text-white/70">
            Modern interiors crafted for calm, high-impact spaces. Visit our
            experience studio or shop curated collections online.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-white/70">
            <Link href="/products">Products</Link>
            <Link href="/category/seating">Categories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Studio</p>
          <div className="mt-3 flex flex-col gap-2 text-white/70">
            <span>Raj & Raj Interiors</span>
            <span>Studio visits by appointment</span>
            <span>hello@rajandraj.co</span>
          </div>
        </div>
      </div>
    </footer>
  );
}