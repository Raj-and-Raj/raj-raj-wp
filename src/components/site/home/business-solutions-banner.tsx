"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { uploadsUrl } from "@/lib/uploads";

export function BusinessSolutionsBanner() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <div className="flex flex-col items-center gap-12 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-[#DD3333]">
            Shop for your business
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl"
          >
            Steel furniture for modern businesses <br />
            in Eastern India
          </motion.h2>
          <p className="mb-8 leading-relaxed text-gray-600">
            We design and supply durable steel furniture solutions for offices,
            institutions, and commercial spaces across West Bengal, Odisha, and
            Jharkhand—built for performance, reliability, and everyday use.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/business" className="brand-cta">
              Go to business <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="h-[500px] w-full lg:w-1/2">
          <img
            src={uploadsUrl("2026/02/005-scaled.jpg")}
            alt="Modern workspace"
            className="h-full w-full rounded-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
