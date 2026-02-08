import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { HeroSlider } from "@/components/site/hero-slider";
import { getCategories, getFeaturedProducts } from "@/lib/products";

export default async function Home() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-24">
      <HeroSlider />

      <section className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--muted)]">
            Raj & Raj Interiors
          </p>
          <h2 className="mt-5 text-4xl font-semibold text-[color:var(--ink)] md:text-5xl">
            Curated for premium, contemporary living.
          </h2>
          <p className="mt-6 max-w-xl text-base text-[color:var(--muted)]">
            Discover bespoke furniture, refined textures, and artisan finishes
            designed for luxury interiors and modern homes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products">Browse collection</ButtonLink>
            <ButtonLink href="/about" variant="outline">
              Our studio
            </ButtonLink>
          </div>
        </FadeIn>
        <FadeIn className="relative">
          <div className="rounded-[32px] border border-black/5 bg-white/90 p-8 shadow-xl">
            <div className="rounded-3xl bg-[linear-gradient(135deg,_rgba(221,51,51,0.22),_transparent)] p-8">
              <p className="text-sm font-semibold text-[color:var(--brand)]">
                Signature Drop
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                A refined palette of calm, crafted pieces.
              </h3>
              <p className="mt-4 text-sm text-[color:var(--muted)]">
                Shop sculptural seating, minimalist dining, and warm lighting
                pieces that anchor every room.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex text-sm font-semibold text-[color:var(--brand)]"
              >
                View the drop →
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <section>
        <SectionHeading
          eyebrow="Highlights"
          title="Featured pieces"
          description="Every hero product is tuned for clean lines, tactile materials, and easy layering."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <FadeIn>
          <SectionHeading
            eyebrow="Collection"
            title="Build a room with intention"
            description="Mix modular seating, layered lighting, and refined storage to create cohesive, modern spaces."
          />
        </FadeIn>
        <Stagger className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group rounded-2xl border border-black/5 bg-white/80 p-5"
            >
              <div className="flex h-24 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,_rgba(221,51,51,0.2),_transparent_65%)] text-sm font-semibold text-[color:var(--muted)]">
                {category.name}
              </div>
              <p className="mt-4 text-sm font-semibold text-[color:var(--ink)]">
                {category.name}
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Explore modern {category.name.toLowerCase()}
              </p>
            </Link>
          ))}
        </Stagger>
      </section>

      <section className="rounded-[36px] border border-black/5 bg-white/80 p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <FadeIn>
            <SectionHeading
              eyebrow="Studio"
              title="Where craftsmanship meets calm"
              description="We work with artisan workshops across India to craft long-lasting pieces with rich materials and clean silhouettes."
            />
          </FadeIn>
          <FadeIn className="rounded-3xl bg-[linear-gradient(140deg,_rgba(20,20,20,0.12),_transparent)] p-6">
            <ul className="space-y-4 text-sm text-[color:var(--muted)]">
              <li>Made-to-order finishes</li>
              <li>White-glove delivery</li>
              <li>Design consultation</li>
              <li>Secure Razorpay checkout</li>
            </ul>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}