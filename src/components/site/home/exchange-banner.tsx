"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { uploadsUrl } from "@/lib/uploads";

export function ExchangeBanner() {
  return (
    <div className="mx-auto mb-20 px-4 md:px-8">
      <div className="flex flex-col bg-[#fdf8f5] md:flex-row">
        <div className="relative h-[400px] w-full overflow-hidden md:h-auto md:w-1/2">
          <img
            src={uploadsUrl(
              "2026/02/realistic-interior-design-with-furniture-scaled.jpg",
            )}
            alt="Bedroom furniture"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col items-start justify-center p-8 md:w-1/2 md:p-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-4 text-3xl font-bold leading-tight text-gray-800 md:text-4xl"
          >
            Upgrade your space,
            <br />
            Built in steel.
          </motion.h2>
          <p className="mb-8 font-medium text-gray-600">
            Discover durable, modern furniture designed for everyday
            performance.
          </p>

          <Link href="/products" className="brand-cta">
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
}
