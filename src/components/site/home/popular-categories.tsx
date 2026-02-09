"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type CategoryCardProps = {
  subtitle: string;
  title: string;
  image: string;
  bgColor: string;
  className?: string;
  textColor?: string;
  showButton?: boolean;
};

function CategoryCard({
  subtitle,
  title,
  image,
  bgColor,
  className = "",
  textColor = "text-gray-900",
  showButton = false,
}: CategoryCardProps) {
  return (
    <div
      className={`${bgColor} ${className} group rounded-lg relative h-full min-h-[220px] overflow-hidden p-8 transition-transform duration-300 hover:-translate-y-1`}
    >
      <div className="relative z-10 flex h-full flex-col items-start">
        <span className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
          {subtitle}
        </span>
        <h3 className={`mb-3 text-3xl font-bold ${textColor}`}>{title}</h3>
        <p className="max-w-xs text-sm text-white/80">
          Curated pieces designed for clean lines, strong storage, and warm
          tones.
        </p>

        {showButton ? (
          <Link
            href="/products"
            className="mt-auto inline-flex items-center gap-2 rounded bg-(--link) px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors"
          >
            Shop Now <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      <div className="absolute -bottom-6 -right-6 top-10 w-2/3 transition-transform duration-500 group-hover:scale-[1.03]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-contain object-bottom drop-shadow-2xl"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/20" />
    </div>
  );
}

export function PopularCategories() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900">Product Categories</h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
        }}
        className="bento-grid"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-a"
        >
          <CategoryCard
            subtitle="Home & Living"
            title="Sofa"
            image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#e9dff7,#bfa4f3)]"
            textColor="text-[#3c2a6e]"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-b"
        >
          <CategoryCard
            subtitle="Office & Study"
            title="Chairs"
            image="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1974&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#ff9f8f)]"
            textColor="text-[#5a1f1a]"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-c"
        >
          <CategoryCard
            subtitle="Kids & Storage"
            title="Cabinets"
            image="https://images.unsplash.com/photo-1595515106968-30c1e457f722?q=80&w=2670&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#d4f3e0,#a7e2c0)]"
            textColor="text-[#1e4d35]"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-d"
        >
          <CategoryCard
            subtitle="Decor & Art"
            title="Frames"
            image="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#fff0c8,#f4d88b)]"
            textColor="text-[#4a3c1f]"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-e"
        >
          <CategoryCard
            subtitle="Accessories"
            title="Lamps"
            image="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1974&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#d9e6ff,#9cb4ff)]"
            textColor="text-[#1f2d6a]"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-f"
        >
          <CategoryCard
            subtitle="Bedroom Luxury"
            title="Beds"
            image="https://images.unsplash.com/photo-1505693416388-b0346efee539?q=80&w=2670&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#ffe3e3,#ffb8b8)]"
            textColor="text-[#7a1f1f]"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-g"
        >
          <CategoryCard
            subtitle="Storage & Utility"
            title="Wardrobes"
            image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
            bgColor="bg-[linear-gradient(135deg,#e6f3ff,#b5d7ff)]"
            textColor="text-[#1f3a5f]"
            showButton
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
