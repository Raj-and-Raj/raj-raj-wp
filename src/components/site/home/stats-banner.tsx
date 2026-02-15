"use client";

import { motion } from "framer-motion";

export function StatsBanner() {
  return (
    <div className="relative left-1/2  w-screen -translate-x-1/2 bg-[#DD3333] py-16 md:py-24 text-white">
      <div className="mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-2 text-3xl font-bold md:text-4xl">
            Steel Furniture for Eastern India
          </h2>
          <p className="text-sm font-medium tracking-wide opacity-90 md:text-base">
            Built for strength, function, and modern spaces
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 gap-8 divide-y divide-white/20 text-center md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            className="px-4 py-4 md:py-0"
          >
            <div className="mb-2 text-5xl font-bold md:text-6xl">30+</div>
            <p className="text-sm font-medium opacity-90">
              Steel furniture products across storage, office, and home
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            className="px-4 py-4 md:py-0"
          >
            <div className="mb-2 text-5xl font-bold md:text-6xl">2+ States</div>
            <p className="text-sm font-medium opacity-90">
              Serving West Bengal, Odisha & Jharkhand
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            className="px-4 py-4 md:py-0"
          >
            <div className="mb-2 text-5xl font-bold md:text-6xl">1000+</div>
            <p className="text-sm font-medium opacity-90">
              By homes, offices, institutions, and industries
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
