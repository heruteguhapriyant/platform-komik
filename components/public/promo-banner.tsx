"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Flame, ShieldAlert } from "lucide-react";

interface BannerItem {
  id: string;
  tag: string;
  sponsorName?: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  accentColor: string;
  imageUrl?: string;
  isSponsor?: boolean;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: "surfer-promo",
    tag: "SPECIAL FEATURED RELEASE",
    title: "SILVER SURFER: NEW RELEASES",
    subtitle: "Edisi Spesial Festival Komik Digital Kastuart 2026",
    description: "Jelajahi petualangan kosmik tanpa batas dari karya kreator terbaik festival tahun ini.",
    ctaText: "BACA KARYA SEKARANG",
    ctaLink: "/festival",
    bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
    accentColor: "from-cyan-400 to-blue-600",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
    isSponsor: false,
  },
  {
    id: "sponsor-wacom",
    tag: "OFFICIAL FESTIVAL SPONSOR",
    sponsorName: "WACOM & KASTUART COLLAB",
    title: "SPONSORED BY WACOM INDONESIA",
    subtitle: "Dukung Kreator Komik Indonesia Menuju Panggung Dunia",
    description: "Menangkan pen tablet professional dan paket pendanaan penerbitan komik total 50 Juta Rupiah!",
    ctaText: "DAFTAR FESTIVAL & MENANGKAN",
    ctaLink: "/register",
    bgGradient: "from-rose-950 via-purple-950 to-slate-950",
    accentColor: "from-rose-500 to-amber-500",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    isSponsor: true,
  },
  {
    id: "dark-fantasy-promo",
    tag: "MUST READ THIS WEEK",
    title: "DARK METAL: RISE OF THE GODS",
    subtitle: "Pemenang Kategori Best Fantasy & Dark Graphic Novel",
    description: "Pertempuran kegelapan yang digambar dengan detail luar biasa dalam format Flipbook interaktif.",
    ctaText: "LIHAT DETAIL KOMIK",
    ctaLink: "/festival",
    bgGradient: "from-neutral-950 via-red-950 to-neutral-900",
    accentColor: "from-red-600 to-orange-500",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    isSponsor: false,
  },
];

export function PromoBanner({ customBanners }: { customBanners?: BannerItem[] }) {
  const banners = customBanners && customBanners.length > 0 ? customBanners : DEFAULT_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="my-10 container mx-auto px-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-500">
        {/* Background Layer with Glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${activeBanner.bgGradient} transition-all duration-700`} />
        
        {/* Comic halftone overlay design */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px"
          }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 min-h-[320px] md:min-h-[380px] items-center">
          {/* Left Text Content */}
          <div className="md:col-span-7 p-6 md:p-12 flex flex-col justify-center text-white">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {activeBanner.isSponsor ? (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-xs px-3 py-1 font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" /> Sponsor Resmi
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-300 border-red-400/40 text-xs px-3 py-1 font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <Flame className="w-3.5 h-3.5" /> Spotlight Promo
                </Badge>
              )}
              {activeBanner.sponsorName && (
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                  • {activeBanner.sponsorName}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none mb-3 drop-shadow-md">
              <span className={`bg-gradient-to-r ${activeBanner.accentColor} bg-clip-text text-transparent`}>
                {activeBanner.title}
              </span>
            </h2>

            <p className="text-sm sm:text-base font-semibold text-zinc-300 mb-2">
              {activeBanner.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mb-6 line-clamp-2 leading-relaxed">
              {activeBanner.description}
            </p>

            <div className="flex items-center gap-4">
              <Link href={activeBanner.ctaLink}>
                <Button 
                  size="lg" 
                  className={`bg-gradient-to-r ${activeBanner.accentColor} text-white hover:opacity-90 font-extrabold tracking-wide uppercase shadow-lg shadow-black/50 border-0 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 gap-2`}
                >
                  {activeBanner.ctaText}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image Graphic Cutout */}
          <div className="md:col-span-5 relative h-48 md:h-full min-h-[220px] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />
            
            {activeBanner.imageUrl ? (
              <div className="relative w-full h-full max-h-[300px] flex items-center justify-center">
                {/* Comic style frame shadow */}
                <div className="absolute inset-2 rounded-2xl bg-black/40 blur-md transform translate-y-2 -translate-x-2" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeBanner.imageUrl}
                  alt={activeBanner.title}
                  className="relative z-10 max-h-[280px] w-auto object-cover rounded-xl border-2 border-white/20 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-white/20 rounded-2xl">
                <span className="text-4xl font-black tracking-widest opacity-30">PROMO BANNER</span>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Controls & Pagination Dots */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous Banner"
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1.5 px-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next Banner"
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
