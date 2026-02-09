"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { uploadsUrl } from "@/lib/uploads";

const slides = [
  {
    id: 1,
    title: "Designed to Last",
    subtitle: "High-quality steel furniture with a professional finish.",
    image: uploadsUrl("2026/02/Main-banner-3.jpg.jpeg"),
    link: "/products",
  },
  {
    id: 2,
    title: "Built in Steel",
    subtitle: "Strong, reliable furniture for everyday use.",
    image: uploadsUrl("2026/02/Main-banner-2.jpg.jpeg"),
    link: "/products",
  },
  {
    id: 3,
    title: "Premium Steel Furniture",
    subtitle: "Crafted for durability and modern spaces.",
    image: uploadsUrl("2026/02/Main-banner.jpg-1.jpeg"),
    link: "/products",
  },
  {
    id: 4,
    title: "Industrial. Minimal. Strong.",
    subtitle: "Premium steel furniture for homes and offices.",
    image: uploadsUrl("2026/02/Main-banner-4.jpg.jpeg"),
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
    }, 50000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative left-1/2 mb-16 mt-6 h-[320px] md:h-[720px] w-screen -translate-x-1/2 overflow-hidden bg-gray-100">
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

          <div className="absolute left-12 top-30 md:top-65 z-10 md:left-20">
            <h2 className="mb-2 text-xl font-bold text-white opacity-90  tracking-tight md:text-6xl">
              {slides[current].title}
            </h2>
            <p className="text-base font-medium w-75 md:w-full md:pt-4 text-white opacity-60 md:text-xl">
              {slides[current].subtitle}
            </p>
            <a
              href={slides[current].link}
              className="inline-flex items-center  md:mt-10 mt-4 px-2 py-1 bg-white gap-2 rounded-md  md:px-5 md:py-3 text-xs md:text-sm font-bold text-dark transition hover:bg-white"
            >
              Explore collection <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-2 md:left-5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-sm transition-all hover:bg-white"
      >
        <ChevronLeft className="h-3 w-3 text-gray-800" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 md:right-5  top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-sm transition-all hover:bg-white"
      >
        <ChevronRight className="h-3 w-3 text-gray-800" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 w-2 rounded-full transition-all ${
              index === current ? "scale-125 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
