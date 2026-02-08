"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const collections = [
  {
    id: 1,
    title: "Dining Collection",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2532&auto=format&fit=crop",
    link: "/products",
    buttonText: "View Collection",
  },
  {
    id: 2,
    title: "Tycoon Sofa Set",
    image:
      "https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=2670&auto=format&fit=crop",
    link: "/products",
    hotspots: [
      { top: 40, left: 30 },
      { top: 50, left: 60 },
    ],
  },
  {
    id: 3,
    title: "Modern Workspace",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
    link: "/products",
    buttonText: "Shop Office",
  },
  {
    id: 4,
    title: "Minimalist Bedroom",
    image:
      "https://images.unsplash.com/photo-1595515106968-30c1e457f722?q=80&w=2670&auto=format&fit=crop",
    link: "/products",
    buttonText: "Shop Bedroom",
  },
];

function Hotspot({ top, left }: { top: number; left: number }) {
  return (
    <div
      className="absolute z-10 flex h-8 w-8 cursor-pointer items-center justify-center group"
      style={{ top: `${top}%`, left: `${left}%` }}
    >
      <div className="absolute inset-0 animate-ping rounded-full bg-white opacity-40" />
      <div className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-md transition-transform group-hover:scale-125">
        <div className="h-1.5 w-1.5 rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

export function ShopByCollection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto relative mb-20 bg-white px-4 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Shop by collection</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="rounded-full border p-2 transition-colors hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full border p-2 transition-colors hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8"
      >
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="group relative h-[500px] min-w-[85vw] flex-shrink-0 snap-start overflow-hidden rounded-lg md:min-w-[45vw] lg:min-w-[400px]"
          >
            <img
              src={collection.image}
              alt={collection.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute bottom-8 left-8 z-20 text-white">
              <h3 className="mb-4 text-2xl font-bold tracking-wide">
                {collection.title}
              </h3>
              <Link
                href={collection.link}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:underline"
              >
                {collection.buttonText || "View Collection"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {collection.hotspots
              ? collection.hotspots.map((spot, index) => (
                  <Hotspot key={index} top={spot.top} left={spot.left} />
                ))
              : null}
          </div>
        ))}
      </div>
    </div>
  );
}
