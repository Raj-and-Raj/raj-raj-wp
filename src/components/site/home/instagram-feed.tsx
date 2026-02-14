"use client";

import { motion } from "framer-motion";
import { Instagram, ArrowUpRight, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const posts = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1505693416388-b0346efee539?q=80&w=1200&auto=format&fit=crop",
    likes: "2.4k",
    comments: "45",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
    likes: "1.8k",
    comments: "32",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200&auto=format&fit=crop",
    likes: "3.2k",
    comments: "128",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    likes: "956",
    comments: "24",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop",
    likes: "4.1k",
    comments: "210",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    likes: "1.5k",
    comments: "56",
  },
];

export function InstagramFeed() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
               <div className="p-1.5 bg-pink-50 rounded-full text-pink-600">
                  <Instagram className="w-4 h-4" />
               </div>
               <span className="text-xs font-bold tracking-wider uppercase text-slate-500">@rajandraj_official</span>
            </div>
            <h2 className="text-3xl md:text-3xl font-bold text-slate-900 leading-tight">
              Follow us on Instagram
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-lg">
              Join our community of design enthusiasts. Get inspired by our latest projects, behind-the-scenes content, and styling tips.
            </p>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-[color:var(--brand)] transition-colors shadow-lg hover:shadow-xl"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                  "group relative aspect-square overflow-hidden rounded-xl bg-slate-50 cursor-pointer",
                  index === 0 || index === 1 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
              )}
            >
              <img
                src={post.src}
                alt={`Instagram post ${post.id}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                 <div className="flex items-center gap-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                       <Heart className="w-4 h-4 fill-white" />
                       <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                       <MessageCircle className="w-4 h-4 fill-white" />
                       <span>{post.comments}</span>
                    </div>
                 </div>
                 
                 <div className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                    <Instagram className="w-3 h-3 text-white" />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

