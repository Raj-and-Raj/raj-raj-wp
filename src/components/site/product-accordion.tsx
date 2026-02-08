"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  title: string;
  body: string[];
};

type ProductAccordionProps = {
  sections: Section[];
};

export function ProductAccordion({ sections }: ProductAccordionProps) {
  const [openId, setOpenId] = useState(sections[0]?.id);

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isOpen = section.id === openId;
        return (
          <div
            key={section.id}
            className="rounded-2xl border border-black/10 bg-white/80"
          >
            <button
              onClick={() => setOpenId(isOpen ? "" : section.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold">{section.title}</span>
              <span
                className={cn(
                  "text-lg text-[color:var(--muted)] transition",
                  isOpen && "rotate-180"
                )}
              >
                ▾
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2 px-5 pb-5 text-sm text-[color:var(--muted)]">
                    {section.body.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}