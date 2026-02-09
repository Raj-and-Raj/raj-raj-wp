"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturedBrands() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-10 text-center md:text-left"
      >
        <h2 className="mb-2 text-3xl font-bold text-gray-900">
          Featured Products
        </h2>
        <p className="text-sm text-gray-500">
          Trusted Storage & Office Furniture by Raj & Raj
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-8">
        <motion.div
          variants={item}
          className="group relative h-[400px] md:col-span-2 overflow-hidden bg-white/70"
        >
          <div className="absolute left-6 top-6 z-10">
            <h3 className="text-lg text-gray-900 mb-1 leading-tight">
              Raj Multi-storage Locker
            </h3>
            <p className="text-xs text-gray-500">
              Smart. Secure. Built to Last.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-[300px] items-end justify-center">
            <img
              src="https://dev.rajandraj.co/wp-content/uploads/2026/02/Featured-Brands_3.jpg.jpeg"
              alt="Raj Multi-storage Locker"
              className="h-full object-cover w-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="group relative h-[400px] md:col-span-4 justify-between overflow-hidden bg-white/60 p-6"
        >
          <div>
            <h3 className="text-lg text-gray-900">3 Door Wardrobe</h3>
          </div>

          <div className="mt-4 flex justify-between">
            <div className="relative mt-40 h-full items-start z-10 w-1/2">
              <h4 className="text-2xl font-uppercase leading-tight text-gray-800 md:text-3xl">
                Spacious Storage with a Clean, Modern Look
              </h4>
            </div>
            <div className="flex h-full w-1/2 items-end justify-end">
              <img
                src="https://dev.rajandraj.co/wp-content/uploads/2026/02/png-almirah.png"
                alt="3 Door Wardrobe"
                className="w-full object-contain transition-transform duration-500 group-hover:rotate-6"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="group relative h-[400px] md:col-span-2 overflow-hidden bg-gray-50"
        >
          <div className="absolute left-6 top-6 z-10">
            <h3 className="text-lg text-gray-900 mb-1 leading-tight">
              Raj Office Work Table
            </h3>
            <p className="text-xs text-gray-500">
              Designed for Professional Spaces
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-[300px] items-end justify-center">
            <img
              src="https://dev.rajandraj.co/wp-content/uploads/2026/02/Featured-Brands_1.jpg.jpeg"
              alt="Raj Office Work Table"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
