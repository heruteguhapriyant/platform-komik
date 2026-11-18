"use client";

import Link from "next/link";
import { Zap, Shield, Sparkles, BookOpen, Flame, Compass } from "lucide-react";

interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  count?: number;
}

const FEATURED_CATEGORY_TILES = [
  {
    slug: "action-hero",
    name: "ACTION / HERO",
    style: "bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-500",
    badge: "MARVEL VIBE",
    icon: Zap,
    gridClass: "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 row-span-2",
    bgPattern: "radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)",
  },
  {
    slug: "manga",
    name: "MANGA",
    style: "bg-neutral-950 text-white border-neutral-800",
    badge: "JAPANESE STYLE",
    icon: Flame,
    gridClass: "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 row-span-1",
    bgPattern: "linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%)",
  },
  {
    slug: "indie-alt",
    name: "ALTERNATIVE / INDIE",
    style: "bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700",
    badge: "CREATIVE & UNIQUE",
    icon: Compass,
    gridClass: "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 row-span-2",
    bgPattern: "radial-gradient(#94a3b8 1px, transparent 1px)",
  },
  {
    slug: "fantasy-dark",
    name: "DARK HORSE & FANTASY",
    style: "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-purple-800",
    badge: "EPIC LORE",
    icon: Shield,
    gridClass: "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 row-span-1",
    bgPattern: "none",
  },
  {
    slug: "webtoon",
    name: "WEBTOON & DIGITAL",
    style: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500",
    badge: "FULL COLOR",
    icon: Sparkles,
    gridClass: "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 row-span-1",
    bgPattern: "none",
  },
  {
    slug: "romance-drama",
    name: "ROMANCE & DRAMA",
    style: "bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400",
    badge: "POPULAR STORY",
    icon: BookOpen,
    gridClass: "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 row-span-1",
    bgPattern: "none",
  },
];

export function CategoryMosaic({ categories }: { categories?: CategoryData[] }) {
  return (
    <section className="py-12 container mx-auto px-4">
      {/* Header with Comic-Style Line Accent */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-primary/20 pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            Popular Categories
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            Jelajahi berbagai genre komik favorit dari para kreator Kastuart
          </p>
        </div>
        <Link 
          href="/festival" 
          className="text-xs md:text-sm font-bold uppercase text-primary hover:underline flex items-center gap-1"
        >
          Lihat Semua Genre →
        </Link>
      </div>

      {/* Asymmetric Graphic Mosaic Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-[140px] md:auto-rows-[150px]">
        {FEATURED_CATEGORY_TILES.map((tile, idx) => {
          const Icon = tile.icon;
          // Match with dynamic categories from DB if slug/name matches
          const matchedDbCat = categories?.find(
            (c) => c.slug.toLowerCase().includes(tile.slug.toLowerCase()) || 
                   tile.slug.toLowerCase().includes(c.slug.toLowerCase())
          );
          const href = matchedDbCat ? `/festival?category=${matchedDbCat.slug}` : `/festival`;

          return (
            <Link
              key={idx}
              href={href}
              className={`${tile.gridClass} group relative overflow-hidden rounded-2xl border-2 ${tile.style} shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between p-5 cursor-pointer`}
            >
              {/* Halftone / Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity" 
                style={{
                  backgroundImage: tile.bgPattern,
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Top Row: Badge & Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/30 border border-white/20 backdrop-blur-md">
                  {tile.badge}
                </span>
                <Icon className="w-6 h-6 md:w-8 md:h-8 opacity-80 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              </div>

              {/* Bottom Row: Category Name */}
              <div className="relative z-10 mt-auto">
                <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none drop-shadow-sm group-hover:translate-x-1 transition-transform">
                  {matchedDbCat ? matchedDbCat.name : tile.name}
                </h3>
                <p className="text-[11px] font-bold opacity-75 mt-1 tracking-wider uppercase">
                  {matchedDbCat?.count ? `${matchedDbCat.count} Karya Dipublikasikan` : "Eksplorasi Komik →"}
                </p>
              </div>

              {/* Decorative Corner Glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all pointer-events-none" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
