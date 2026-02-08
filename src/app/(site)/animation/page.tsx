"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/site/section-heading";

const tiles = Array.from({ length: 9 }, (_, index) => index + 1);

export default function AnimationPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Animation"
        title="Interactive motion studies"
        description="Framer Motion layered with subtle hover states and scroll reveals."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {tiles.map((tile) => (
          <motion.div
            key={tile}
            whileHover={{ scale: 1.02, rotate: 0.3 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: tile * 0.05 }}
            className="rounded-[28px] border border-black/5 bg-white/80 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Motion {tile}
            </p>
            <p className="mt-4 text-lg font-semibold">
              Fluid grid interaction
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Each tile responds to hover and tap, hinting at tactile depth.
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
