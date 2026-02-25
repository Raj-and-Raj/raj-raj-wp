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
            Engineered for strength, precision, and long-lasting performance
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
            <div className="mb-2 text-3xl font-bold md:text-4xl">
              30+ Products
            </div>
            <p className="text-sm font-medium opacity-90">
              Premium steel furniture across storage, office, institutional, and
              industrial needs — designed for durability and daily use.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            className="px-4 py-4 md:py-0"
          >
            <div className="mb-2 text-3xl font-bold md:text-4xl">2+ States</div>
            <p className="text-sm font-medium opacity-90">
              Proudly serving West Bengal and Jharkhand with reliable
              manufacturing and timely delivery.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            className="px-4 py-4 md:py-0"
          >
            <div className="mb-2 text-3xl font-bold md:text-4xl">
              10,000+ Customers
            </div>
            <p className="text-sm font-medium opacity-90">
              Trusted by homes, offices, schools, hospitals, warehouses, and
              industries for quality steel solutions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
