"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Wardrobe Collection",
    subtitle: "By Raj & Raj",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=2574&auto=format&fit=crop",
    link: "/products",
  },
  {
    id: 2,
    title: "Dining Room Collection",
    subtitle: "By Kaave Home",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=2632&auto=format&fit=crop",
    link: "/products",
  },
  {
    id: 3,
    title: "Modern Living",
    subtitle: "By Luxe Interiors",
    image:
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2574&auto=format&fit=crop",
    link: "/products",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative left-1/2 mb-16 h-[600px] w-screen -translate-x-1/2 overflow-hidden bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-10 top-20 z-10 text-white md:left-20">
            <h2 className="mb-2 text-4xl font-bold tracking-tight md:text-6xl">
              {slides[current].title}
            </h2>
            <p className="text-sm font-medium uppercase tracking-wider opacity-90 md:text-base">
              / {slides[current].subtitle}
            </p>
            <a
              href={slides[current].link}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[color:var(--ink)] transition hover:bg-white"
            >
              Explore collection <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white"
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-3 w-3 rounded-full transition-all ${
              index === current ? "scale-125 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
