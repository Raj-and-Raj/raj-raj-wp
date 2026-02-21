"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const reviews = [
  {
    id: 1,
    name: "Prabha Shenoy",
    date: "1 month ago",
    rating: 5,
    text: "Congratulations on great work. Helpful staff and responsive service throughout the process. The finish is exactly what we were looking for.",
    initial: "P",
    bg: "bg-emerald-600",
  },
  {
    id: 2,
    name: "Anitha Rajagopal",
    date: "1 month ago",
    rating: 5,
    text: "Very good service and on-time delivery. Great support from the team. The attention to detail in the craftsmanship is truly commendable.",
    initial: "A",
    bg: "bg-rose-600",
  },
  {
    id: 3,
    name: "Mahesh B M",
    date: "2 months ago",
    rating: 5,
    text: "Good service and good infrastructure. I was impressed by the wide variety of options available and the knowledgeable staff.",
    initial: "M",
    bg: "bg-violet-600",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    date: "1 week ago",
    rating: 4,
    text: "The best furniture store in town. Innovative designs and durable builds. Highly recommended for anyone looking for premium furniture.",
    initial: "S",
    bg: "bg-amber-600",
  },
  {
    id: 5,
    name: "Rahul Verma",
    rating: 5,
    date: "1 month ago",
    text: "Great experience shopping with Raj & Raj. Premium quality and sturdy finishing. Will definitely visit again for more purchases.",
    initial: "R",
    bg: "bg-blue-600",
  },
  {
    id: 6,
    name: "Vikram Singh",
    rating: 5,
    date: "3 weeks ago",
    text: "Exceptional quality and service. The team went above and beyond to ensure our requirements were met. Fantastic experience!",
    initial: "V",
    bg: "bg-indigo-600",
  },
];

export function GoogleReviews() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 500);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background Decorative Elements */}
      {/* <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/5 to-transparent"></div> */}
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-[color:var(--brand)]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-[color:var(--brand)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm text-xs font-medium text-[color:var(--brand)] mb-4">
              <Star className="w-3 h-3 fill-current" />
              <span>Trusted by our customers</span>
            </div>
            <h2 className="text-3xl md:text-3xl font-bold text-slate-900 leading-tight mb-4">
              Loved by{" "}
              <span className="text-[color:var(--brand)] relative inline-block">
                Thousands
                <svg
                  className="absolute w-full h-2 -bottom-1 left-0 text-[color:var(--brand)]/20"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                  />
                </svg>
              </span>
            </h2>
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-slate-900">4.9</span>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <span className="w-px h-4 bg-slate-200"></span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">
                  Google Reviews
                </span>
                <span className="text-xs text-slate-400">(1128+ Reviews)</span>
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-500 hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-500 hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reviews Horizontal Scroll */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-4 pb-12 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="min-w-[85vw] md:min-w-[360px] snap-center"
            >
              <div className="h-full p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative group">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[color:var(--brand)]/5 group-hover:text-[color:var(--brand)]/10 transition-colors" />

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                      review.bg,
                    )}
                  >
                    {review.initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {review.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                      {review.date}
                    </p>
                  </div>
                </div>

                <div className="flex mb-3 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < review.rating ? "fill-current" : "text-gray-100",
                      )}
                    />
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed text-sm line-clamp-4">
                  "{review.text}"
                </p>

                <div className="mt-4 flex items-center gap-1.5 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                  <div className="w-4 h-4 bg-white border border-slate-100 rounded-full flex items-center justify-center p-0.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Verified Review
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
