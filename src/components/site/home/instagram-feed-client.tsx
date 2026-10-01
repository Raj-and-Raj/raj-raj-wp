"use client";

import { motion } from "framer-motion";
import {
  Instagram,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeedPost = {
  id: string;
  imageUrl: string;
  href: string;
  alt: string;
  isVideo?: boolean;
  likes?: number;
  comments?: number;
};

const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function InstagramFeedClient({
  posts,
  handle,
  profileUrl,
}: {
  posts: FeedPost[];
  handle: string;
  profileUrl: string;
}) {
  return (
    <section className="py-10 overflow-hidden">
      <div className="mx-auto px-6">
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
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                @{handle}
              </span>
            </div>
            <h2 className="text-3xl md:text-3xl font-bold text-slate-900 leading-tight">
              Follow us on Instagram
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-lg">
              Join our growing community and stay updated with new steel
              furniture designs, factory insights, real installations, and
              product highlights from Raj & Raj.
            </p>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-[color:var(--brand)] transition-colors shadow-lg hover:shadow-xl"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.alt}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "group relative block aspect-square overflow-hidden rounded-xl bg-slate-100",
                index === 0 || index === 1
                  ? "col-span-2 row-span-2"
                  : "col-span-1 row-span-1",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {post.isVideo ? (
                <div className="absolute top-3 left-3 rounded-full bg-black/50 p-1.5">
                  <Play className="h-3 w-3 fill-white text-white" />
                </div>
              ) : null}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                {post.likes !== undefined || post.comments !== undefined ? (
                  <div className="flex items-center gap-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {post.likes !== undefined ? (
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        <Heart className="w-4 h-4 fill-white" />
                        <span>{compact.format(post.likes)}</span>
                      </div>
                    ) : null}
                    {post.comments !== undefined ? (
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>{compact.format(post.comments)}</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View on Instagram
                  </span>
                )}

                <div className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                  <Instagram className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
