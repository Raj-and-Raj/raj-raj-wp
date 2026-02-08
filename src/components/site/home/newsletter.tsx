"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";

export function Newsletter() {
  return (
    <div className="container mx-auto mb-20 overflow-hidden px-4 md:px-8">
      <div className="relative rounded-3xl bg-black p-8 text-white md:p-20">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white opacity-10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#e46b5d] opacity-10 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-6 text-3xl font-bold md:text-5xl"
          >
            Join our family
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-10 text-lg text-gray-400"
          >
            Subscribe to our newsletter to receive exclusive offers, latest news
            and updates about our products.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-white placeholder-gray-500 transition-colors focus:border-white focus:outline-none"
            />
            <button className="group flex items-center justify-center gap-2 rounded-full bg-[#e46b5d] px-8 py-4 font-bold uppercase tracking-wide text-white transition-all hover:bg-[#d15b4d]">
              Subscribe
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
