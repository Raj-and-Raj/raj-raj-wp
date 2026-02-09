"use client";

import { motion } from "framer-motion";

const posts = [
  "https://images.unsplash.com/photo-1505693416388-b0346efee539?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
];

export function InstagramFeed() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
            Follow us
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[color:var(--ink)]">
            Instagram feed
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            See our latest installs, styling tips, and behind-the-scenes.
          </p>
        </div>
        <a
          href="https://instagram.com"
          className="brand-cta-outline"
          target="_blank"
          rel="noreferrer"
        >
          Visit Instagram
        </a>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {posts.map((src, index) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-[#f1ece4]"
          >
            <img
              src={src}
              alt="Instagram post"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
