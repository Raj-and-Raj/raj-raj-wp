"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { uploadsUrl } from "@/lib/uploads";

type CategoryCardProps = {
  subtitle: string;
  title: string;
  body: string;
  image: string;
  bgColor: string;
  className?: string;
  textColor?: string;
  bodyColor?: string;
  productLink?: string;
  subTitleColor?: string;
  showButton?: boolean;
};

function CategoryCard({
  subtitle,
  title,
  body,
  image,
  bgColor,
  className = "",
  subTitleColor = "",
  bodyColor = "",
  productLink = "#",
  textColor = "text-gray-900",
  showButton = false,
}: CategoryCardProps) {
  return (
    <div
      className={`${bgColor} ${className} group rounded-lg relative h-full min-h-[280px] overflow-hidden p-8 transition-transform duration-300 hover:-translate-y-1`}
    >
      <div className="relative z-10 flex h-full flex-col items-start">
        <span
          className={`mb-2 text-xs font-semibold uppercase ${subTitleColor}`}
        >
          {subtitle}
        </span>
        <h3 className={`mb-3 text-2xl font-bold ${textColor}`}>{title}</h3>
        {/* <p className={`max-w-xs text-sm text-white/80 ${bodyColor}"`}>{body}</p> */}

        {showButton ? (
          <Link
            href={`${productLink}`}
            className="mt-auto inline-flex items-center gap-1 rounded bg-(--link) text-sm font-medium  text-white"
          >
            Shop Now <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      <div className="absolute -bottom-2 -right-5 top-4 w-3/4 transition-transform duration-500 group-hover:scale-[1.03]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-contain object-right drop-shadow-2xl"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/20" />
    </div>
  );
}

export function PopularCategories() {
  return (
    <div className=" mx-auto mb-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-12 flex flex-col gap-2 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900">Product Category</h2>
        <p className="text-sm text-gray-500">
          Explore durable, well-crafted steel furniture designed for modern
          homes and professional spaces.
        </p>
      </motion.div>

      <motion.div
        initial="show"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
        }}
        className="bento-grid"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-a"
        >
          <CategoryCard
            subtitle="STORAGE SOLUTIONS"
            title="Wardrobes"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Product-Category-4.png")}
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#7B3F00)]"
            textColor="text-white"
            subTitleColor="text-[#7B3F00]"
            bodyColor="text-[#7B3F00]"
            productLink="/category/file-cabinets"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-b"
        >
          <CategoryCard
            subtitle="HOME & LIVING"
            title="Dressing Tables"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Product-Category-3.png")}
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#4B2E2A)]"
            textColor="text-[#fff]"
            subTitleColor="text-[#4B2E2A]"
            productLink="/category/file-cabinets"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-c"
        >
          <CategoryCard
            subtitle="HOME ORGANIZATION"
            title="Shoe Racks"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Product-Category-4-1.png")}
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#4B0082)]"
            textColor="text-[#fff]"
            subTitleColor="text-[#4B0082]"
            productLink="/category/file-cabinets"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-d"
        >
          <CategoryCard
            subtitle="OFFICE & STUDY"
            title="Office Work Tables"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Table.png")}
            bgColor="bg-[linear-gradient(135deg,#007FD520,#007FD5)]"
            textColor="text-[#fff]"
            subTitleColor="text-[#007FD5]"
            productLink="/category/dressing-tables"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-e"
        >
          <CategoryCard
            subtitle="SAFETY & UTILITY"
            title="First Aid Box"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Product-Category-4-2.png")}
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#9b214e)]"
            textColor="text-[#fff]"
            subTitleColor="text-[#9b214e]"
            productLink="/category/file-cabinets"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-f"
        >
          <CategoryCard
            subtitle="INDUSTRIAL STORAGE"
            title="Lockers"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Product-Category-4-3.png")}
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#da4a7f)]"
            textColor="text-[#fff]"
            subTitleColor="text-[#da4a7f]"
            productLink="/category/file-cabinets"
            showButton
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="bento-g"
        >
          <CategoryCard
            subtitle="OFFICE & STUDY"
            title="File Cabinets"
            body="Curated steel wardrobes designed for clean lines, spacious storage, and long-lasting durability."
            image={uploadsUrl("2026/02/Product-Category-4-4.png")}
            bgColor="bg-[linear-gradient(135deg,#ffd7d2,#686A6C)]"
            textColor="text-[#fff]"
            subTitleColor="text-[#686A6C]"
            productLink="/category/file-cabinets"
            showButton
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
