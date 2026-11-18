"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  BookOpen,
  Eye,
  Sparkles,
} from "lucide-react";

export interface ComicItem {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  category?: string;
  tag?: string; // e.g. "NEW", "HOT", "TERFAVORIT", "POPULAR"
  badgeText?: string; // e.g. "BACA", "GRATIS"
  likesCount?: number;
  viewsCount?: number;
}

interface ComicShowcaseProps {
  title: string;
  subtitle?: string;
  items: ComicItem[];
  viewAllLink?: string;
}

export function ComicShowcaseSection({
  title,
  subtitle,
  items,
  viewAllLink = "/festival",
}: ComicShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-10 container mx-auto px-4">
      {/* Section Header with Carousel Navigation Arrows */}
      <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-xs md:text-sm font-bold text-primary hover:underline hidden sm:block uppercase tracking-wider"
            >
              Lihat Semua →
            </Link>
          )}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll("left")}
              className="h-8 w-8 rounded-full border-muted-foreground/30 hover:bg-primary/10 hover:border-primary"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll("right")}
              className="h-8 w-8 rounded-full border-muted-foreground/30 hover:bg-primary/10 hover:border-primary"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Horizontal Comic Card Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((comic) => {
          const isLiked = !!likedMap[comic.id];

          return (
            <div
              key={comic.id}
              className="min-w-[210px] sm:min-w-[230px] max-w-[240px] snap-start flex-shrink-0"
            >
              <Card className="group h-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between">
                {/* Comic Book Cover Frame */}
                <Link href={`/karya/${comic.id}`} className="block relative">
                  <div className="relative aspect-[3/4] overflow-hidden bg-zinc-200 dark:bg-zinc-950 flex items-center justify-center">
                    {comic.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comic.cover}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                        <BookOpen className="w-12 h-12 mb-2 opacity-30" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Komik Digital
                        </span>
                      </div>
                    )}

                    {/* Top Right Ribbon / Sticker Tag */}
                    {comic.tag && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="relative flex items-center gap-1 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-lg tracking-wider border border-white/20 transform rotate-2 group-hover:rotate-0 transition-transform">
                          <Sparkles className="w-3 h-3" />
                          {comic.tag}
                        </span>
                      </div>
                    )}

                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> Baca Flipbook
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Comic Card Content */}
                <CardContent className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                      {comic.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">
                      {comic.author}
                    </p>
                  </div>

                  {/* Clean Action Bar: Single Main "BACA" CTA + Heart Wishlist */}
                  <div className="mt-4 pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2">
                    <Link href={`/karya/${comic.id}`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-md gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> BACA
                      </Button>
                    </Link>

                    {/* Wishlist / Like Heart Button */}
                    <button
                      onClick={(e) => toggleLike(e, comic.id)}
                      aria-label="Favorite comic"
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 flex-shrink-0 ${
                        isLiked
                          ? "bg-rose-500 text-white border-rose-500 shadow-md"
                          : "bg-white dark:bg-zinc-800 text-rose-500 border-rose-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
}
