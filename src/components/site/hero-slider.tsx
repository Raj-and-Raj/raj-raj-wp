"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";

const heroSlides = [
  {
    id: "signature",
    title: "Luxury interiors, sculpted for quiet confidence.",
    subtitle: "Signature collection",
    description:
      "Tailored furniture, artisanal textures, and warm neutrals curated for premium living.",
    image:
      "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg",
  },
  {
    id: "atelier",
    title: "An atelier approach to modern furniture.",
    subtitle: "Craft & detail",
    description:
      "Minimal silhouettes, elevated materials, and a calm palette that feels timeless.",
    image:
      "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg",
  },
  {
    id: "bespoke",
    title: "Designed to anchor the most refined spaces.",
    subtitle: "Bespoke living",
    description:
      "Made-to-order finishes, white-glove delivery, and a seamless, premium experience.",
    image:
      "https://dev.rajandraj.co/wp-content/uploads/2026/02/Popular-categories.jpg.jpeg",
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const active = heroSlides[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const markers = useMemo(() => heroSlides.map((slide) => slide.id), []);

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[color:var(--charcoal)]">
      <div className="grid gap-10 px-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-14">
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--champagne)]">
                {active.subtitle}
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-6xl">
                {active.title}
              </h1>
              <p className="mt-6 max-w-xl text-base text-white/70">
                {active.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/products">Explore collection</ButtonLink>
                <ButtonLink href="/about" variant="outline">
                  Our atelier
                </ButtonLink>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-10 flex items-center gap-2">
            {markers.map((marker, markerIndex) => (
              <button
                key={marker}
                onClick={() => setIndex(markerIndex)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  markerIndex === index
                    ? "bg-[color:var(--brand)]"
                    : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-10 top-0 h-64 w-64 rounded-full bg-[color:var(--brand)] opacity-30 blur-[120px]" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative h-[320px] w-full md:h-[420px]"
              >
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}