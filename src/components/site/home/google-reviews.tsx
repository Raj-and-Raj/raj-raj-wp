"use client";

import { useRef } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Prabha Shenoy",
    date: "1 month ago",
    rating: 4,
    text: "Congratulations on great work. Helpful staff and responsive service throughout the process.",
    initial: "P",
    bg: "bg-slate-500",
  },
  {
    id: 2,
    name: "Anitha Rajagopal",
    date: "1 month ago",
    rating: 5,
    text: "Very good service and on-time delivery. Great support from the team.",
    initial: "A",
    bg: "bg-red-800",
  },
  {
    id: 3,
    name: "Mahesh B M",
    date: "2 months ago",
    rating: 5,
    text: "Good service and good infrastructure.",
    initial: "M",
    bg: "bg-purple-700",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    date: "1 week ago",
    rating: 5,
    text: "The best furniture store in town. Innovative designs and durable builds.",
    initial: "S",
    bg: "bg-green-600",
  },
  {
    id: 5,
    name: "Rahul Verma",
    rating: 5,
    date: "1 month ago",
    text: "Great experience shopping with Raj & Raj. Premium quality and sturdy finishing.",
    initial: "R",
    bg: "bg-orange-500",
  },
];

export function GoogleReviews() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 350;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-20 py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-2xl font-bold uppercase tracking-widest text-gray-900">
            Excellent
          </h2>

          <div className="mb-2 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative h-8 w-8">
                <Star fill="#facc15" stroke="none" className="h-full w-full" />
              </div>
            ))}
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Based on <span className="font-bold text-black">55 reviews</span>
          </p>

          <div className="flex items-center justify-center gap-0.5">
            <span className="text-2xl font-bold text-[#4285F4]">G</span>
            <span className="text-2xl font-bold text-[#EA4335]">o</span>
            <span className="text-2xl font-bold text-[#FBBC05]">o</span>
            <span className="text-2xl font-bold text-[#4285F4]">g</span>
            <span className="text-2xl font-bold text-[#34A853]">l</span>
            <span className="text-2xl font-bold text-[#EA4335]">e</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 px-4"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="relative min-w-[25vw] flex-shrink-0 snap-center rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg md:min-w-[calc(33.333%-16px)]"
              >
                <div className="absolute right-6 top-6 opacity-80">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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

                <div className="mb-4 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-medium text-white ${review.bg}`}
                  >
                    {review.initial}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight text-gray-900">
                      {review.name}
                    </h4>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        fill={i < review.rating ? "#facc15" : "#e5e7eb"}
                        stroke="none"
                        className="h-4 w-4"
                      />
                    ))}
                  </div>
                  <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                    <CheckCircle className="h-4 w-4 stroke-[3px] text-white" />
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-gray-600">
                  {review.text}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("left")}
            aria-label="Scroll reviews left"
            className="absolute -left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-600 shadow-lg transition-colors hover:bg-gray-50 hover:text-black md:-left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll reviews right"
            className="absolute -right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-600 shadow-lg transition-colors hover:bg-gray-50 hover:text-black md:-right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
