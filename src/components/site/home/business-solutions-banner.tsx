"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function BusinessSolutionsBanner() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <div className="flex flex-col items-center gap-12 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-[#e46b5d]">
            Shop for your business
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl"
          >
            We enhance modern
            <br />
            businesses and working
            <br />
            environments
          </motion.h2>
          <p className="mb-8 leading-relaxed text-gray-600">
            Your workspace needs to foster collaboration and productivity. We
            design products and workspaces that do both.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/business"
              className="brand-cta"
            >
              Go to business <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 rounded border border-gray-800 bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-gray-900 transition-colors hover:bg-gray-50">
              Enquire now <Phone className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="h-[500px] w-full lg:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop"
            alt="Modern workspace"
            className="h-full w-full rounded-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
