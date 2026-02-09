"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { uploadsUrl } from "@/lib/uploads";

export function StoreLocatorBanner() {
  return (
    <div className="relative left-1/2 mb-20 py-20 h-[500px] w-screen -translate-x-1/2">
      <div className="absolute inset-0">
        <img
          src={uploadsUrl("2026/02/3d-rendering-loft-luxury-living-room-with-bookshelf-with-pouf-scaled.jpg")}
          alt="Store interior"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl rounded-lg border border-white/10 bg-black/60 p-8 text-center text-white backdrop-blur-sm md:p-12"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Find a store near you
          </h2>
          <p className="mb-8 text-base leading-relaxed opacity-90 md:text-lg">
            Experience it in person Visit our stores to explore Raj & Raj's
            steel furniture up close and experience the quality firsthand. Our
            team is ready to help you choose the right solution for your space.
          </p>
          <button className="inline-flex items-center gap-2  rounded bg-[#DD3333] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#d15b4d]">
            Find a store near you <MapPin className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
