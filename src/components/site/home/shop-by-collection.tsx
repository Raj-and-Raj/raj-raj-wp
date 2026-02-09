"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { uploadsUrl } from "@/lib/uploads";

const collections = [
  {
    id: 1,
    title: "Dressing Table Collection",
    image: uploadsUrl("2026/02/shop-by-collection_1.jpeg"),
    link: "/products",
    buttonText: "View Collection",
  },
  {
    id: 2,
    title: "Shoe Rack Collection",
    image: uploadsUrl("2026/02/Shop-by-collection_2.jpeg"),
    link: "/products",
    hotspots: [
      { top: 40, left: 30 },
      { top: 50, left: 60 },
    ],
  },
  {
    id: 3,
    title: "Wordrobe Collection",
    image: uploadsUrl("2026/02/Featured-Brands_2.jpg.jpeg"),
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
    <div className="container mx-auto relative mb-20 px-4 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Shop by collection
          </h2>
          <p className="text-sm mt-2 text-gray-500">
            Discover premium steel furniture collections built for everyday use.
          </p>
        </div>

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

      <motion.div
        ref={scrollRef}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
        }}
        className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto pb-8"
      >
        {collections.map((collection) => (
          <motion.div
            key={collection.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            className="group relative h-[500px] min-w-[85vw] flex-shrink-0 snap-start overflow-hidden rounded-lg md:min-w-[45vw] lg:min-w-[400px]"
          >
            <img
              src={collection.image}
              alt={collection.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute bottom-8 left-8 z-20 text-white">
              <h3 className="mb-4 text-2xl font-medium">{collection.title}</h3>
              <Link
                href={collection.link}
                className="inline-flex items-center gap-2 text-sm font-medium uppercase hover:underline"
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
