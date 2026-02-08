"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fallbackSlides = [
  {
    id: "texture",
    label: "Material texture",
    gradient:
      "radial-gradient(circle at 30% 20%, rgba(221,51,51,0.25), transparent 55%), linear-gradient(135deg, #f6f1ea, #efe7dc)",
  },
  {
    id: "detail",
    label: "Joinery detail",
    gradient:
      "radial-gradient(circle at 70% 10%, rgba(20,20,20,0.12), transparent 60%), linear-gradient(140deg, #f7f3ec, #e7dfd2)",
  },
  {
    id: "room",
    label: "Styled room",
    gradient:
      "radial-gradient(circle at 20% 80%, rgba(221,51,51,0.18), transparent 55%), linear-gradient(135deg, #f3eee6, #e9e1d4)",
  },
];

type ProductGalleryProps = {
  name: string;
  images?: string[];
};

export function ProductGallery({ name, images = [] }: ProductGalleryProps) {
  const slides = useMemo(() => {
    if (images.length > 0) {
      return images.map((src, index) => ({
        id: `${name}-${index}`,
        src,
        label: `Image ${index + 1}`,
      }));
    }
    return fallbackSlides;
  }, [images, name]);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex];

  return (
    <div className="grid gap-4 lg:grid-cols-[72px_1fr]">
      <div className="flex max-h-[520px] flex-row gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative h-16 w-16 shrink-0 rounded-2xl border border-black/10 bg-white/80",
              index === activeIndex && "border-[color:var(--brand)]"
            )}
          >
            {"src" in slide ? (
              <Image
                src={slide.src}
                alt={name}
                width={128}
                height={128}
                unoptimized
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <span
                className="absolute inset-0 rounded-2xl"
                style={{ background: slide.gradient }}
              />
            )}
          </button>
        ))}
      </div>
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-[32px] border border-black/5 bg-white/90 p-6"
      >
        <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(221,51,51,0.12),_transparent_60%)] text-sm font-medium text-[color:var(--muted)]">
          {"src" in active ? (
            <Image
              src={active.src}
              alt={name}
              width={900}
              height={900}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: active.gradient }}
            />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>{active.label}</span>
          <span>
            {activeIndex + 1} / {slides.length}
          </span>
        </div>
      </motion.div>
    </div>
  );
}