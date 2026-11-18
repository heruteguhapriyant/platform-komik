"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Festival {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  poster: string | null;
  status: string;
  startRegistration: Date | null;
  endRegistration: Date | null;
  category: { name: string; slug: string };
}

interface FestivalsCatalogProps {
  initialFestivals: Festival[];
  categories: Category[];
}

export default function FestivalsCatalog({ initialFestivals, categories }: FestivalsCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  const filtered = initialFestivals.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategorySlug ? f.category.slug === selectedCategorySlug : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 flex-1 flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daftar Festival Komik</h1>
        <p className="text-muted-foreground mt-1">
          Jelajahi dan ikuti berbagai festival komik digital yang sedang berlangsung atau yang telah selesai.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari festival..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={selectedCategorySlug === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategorySlug(null)}
            className="text-xs"
          >
            Semua Kategori
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategorySlug === cat.slug ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className="text-xs"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Festivals Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground flex-1 flex flex-col items-center justify-center">
          <Trophy className="h-12 w-12 opacity-20 mb-3" />
          <h3 className="font-semibold text-sm">Tidak Menemukan Festival</h3>
          <p className="text-xs mt-1">Silakan coba sesuaikan kata kunci pencarian atau kategori filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((festival) => (
            <Link key={festival.id} href={`/festival/${festival.slug}`}>
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative flex items-center justify-center border-b">
                    {festival.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={festival.poster}
                        alt={festival.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Trophy className="h-10 w-10 text-primary/40" />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {festival.category.name}
                      </Badge>
                      <FestivalStatusBadge status={festival.status} />
                    </div>
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {festival.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {festival.description || "Tidak ada rincian deskripsi."}
                    </p>
                  </CardContent>
                </div>
                <CardContent className="p-4 pt-0 border-t border-border/40 mt-4 bg-muted/10 text-xs text-muted-foreground">
                  {festival.endRegistration && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Registrasi s.d. {formatDate(festival.endRegistration)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FestivalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    published: { label: "Buka Pendaftaran", variant: "default" },
    registration_closed: { label: "Pendaftaran Tutup", variant: "secondary" },
    judging: { label: "Penilaian", variant: "outline" },
    finished: { label: "Selesai", variant: "secondary" },
    archived: { label: "Arsip", variant: "outline" },
  };
  const config = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant} className="text-[9px] uppercase font-bold">{config.label}</Badge>;
}
