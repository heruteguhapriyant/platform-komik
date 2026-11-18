import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Layers,
  Trophy,
  Users,
  Award,
} from "lucide-react";
import { PromoBanner } from "@/components/public/promo-banner";
import { CategoryMosaic } from "@/components/public/category-mosaic";
import { ComicShowcaseSection, ComicItem } from "@/components/public/comic-showcase-section";

async function getHomeData() {
  const [activeFestivals, latestWorks, categories, dbBanners, totalStats] = await Promise.all([
    db.festival.findMany({
      where: { status: { in: ["published", "registration_closed", "judging"] } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.work.findMany({
      where: {
        publication: { status: "published" },
      },
      include: {
        publication: true,
        festivalParticipant: {
          include: {
            festival: { include: { category: true } },
            user: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    db.category.findMany({
      take: 6,
    }),
    (db as any).banner.findMany({
      where: { isActive: true },
      orderBy: { orderNumber: "asc" },
    }).catch(() => []),
    db.$transaction([
      db.festival.count(),
      db.user.count({ where: { role: "participant" } }),
      db.work.count({ where: { publication: { status: "published" } } }),
    ]),
  ]);

  return { activeFestivals, latestWorks, categories, dbBanners, totalStats };
}

export default async function HomePage() {
  let activeFestivals: any[] = [];
  let latestWorks: any[] = [];
  let categories: any[] = [];
  let customBanners: any[] = [];
  let totalFestivals = 0;
  let totalParticipants = 0;
  let totalWorks = 0;

  try {
    const data = await getHomeData();
    activeFestivals = data.activeFestivals;
    latestWorks = data.latestWorks;
    categories = data.categories;
    customBanners = data.dbBanners || [];
    const [tf, tp, tw] = data.totalStats;
    totalFestivals = tf;
    totalParticipants = tp;
    totalWorks = tw;
  } catch (error) {
    console.error("Database connection failed, displaying empty homepage state", error);
  }

  // Format real DB works or fallback mock comic releases
  const newReleaseComics: ComicItem[] = latestWorks.length > 0
    ? latestWorks.map((work, idx) => ({
        id: work.id,
        title: work.title,
        author: work.author || work.festivalParticipant?.user?.name || "Kreator Kastuart",
        cover: work.cover,
        category: work.festivalParticipant?.festival?.category?.name || "Komik Digital",
        tag: idx === 0 ? "BARU" : idx % 3 === 0 ? "POPULER" : undefined,
      }))
    : [
        {
          id: "demo-1",
          title: "Uncanny X-Men #1",
          author: "Stan Lee & Jack Kirby",
          cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
          category: "Action",
          tag: "BARU",
        },
        {
          id: "demo-2",
          title: "Infinity Wars: Iron Hammer",
          author: "Gerry Duggan",
          cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
          category: "Fantasy",
          tag: "HOT",
        },
        {
          id: "demo-3",
          title: "Adventureman #4",
          author: "Matt Fraction",
          cover: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80",
          category: "Alternative",
        },
        {
          id: "demo-4",
          title: "American Vampire 1976 #1",
          author: "Scott Snyder",
          cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
          category: "Horror",
          tag: "RATING TINGGI",
        },
        {
          id: "demo-5",
          title: "Alien: Covenant Issue #1",
          author: "Dan O'Bannon",
          cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
          category: "Sci-Fi",
        },
      ];

  const bestSellerComics: ComicItem[] = latestWorks.length > 0
    ? [...latestWorks].reverse().map((work, idx) => ({
        id: work.id,
        title: work.title,
        author: work.author || "Kreator Pilihan",
        cover: work.cover,
        category: "Festival Favorite",
        tag: idx === 0 ? "TERFAVORIT" : "TOP",
      }))
    : [
        {
          id: "best-1",
          title: "Annihilation: Silver Surfer #4",
          author: "Keith Giffen",
          cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
          category: "Sci-Fi",
          tag: "TERFAVORIT",
        },
        {
          id: "best-2",
          title: "Dark Nights: Rise of New God",
          author: "James Tynion IV",
          cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
          category: "Fantasy",
        },
        {
          id: "best-3",
          title: "The Amazing Spider-Man #51",
          author: "Nick Spencer",
          cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
          category: "Action",
          tag: "HOT",
        },
        {
          id: "best-4",
          title: "Spawn #311 - Cult of Omega",
          author: "Todd McFarlane",
          cover: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80",
          category: "Dark Fantasy",
        },
        {
          id: "best-5",
          title: "Maus 40th Anniversary Boxed Set",
          author: "Art Spiegelman",
          cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
          category: "Indie",
        },
      ];

  return (
    <div className="flex-1 bg-background flex flex-col min-h-screen">
      {/* Top Header Hero / Sub-Navbar */}
      <section className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-b border-border/40 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-rose-600 text-white font-extrabold uppercase px-3 py-1 tracking-wider">
              ✨ Kastuart Digital
            </Badge>
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">
              Platform Festival & Galeri Komik Digital Terdepan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/festival">
              <Button size="sm" className="font-bold gap-1 rounded-xl">
                Jelajahi Festival <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="outline" className="font-bold rounded-xl">
                Daftar Peserta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 1. Promotional & Sponsor Banner */}
      <PromoBanner customBanners={customBanners} />

      {/* 2. Popular Categories Mosaic Grid */}
      <CategoryMosaic categories={categories} />

      {/* 3. New Releases Showcase (Rilisan Terbaru) */}
      <ComicShowcaseSection
        title="Rilisan Terbaru"
        subtitle="Rilisan edisi komik gratis terbaru dari para peserta festival Kastuart"
        items={newReleaseComics}
        viewAllLink="/festival"
      />

      {/* 4. Highlight Promotional Banner Section */}
      <section className="my-10 container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-8 md:p-14 border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl z-10">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/40 text-xs px-3 py-1 font-bold uppercase tracking-widest mb-4">
              SPONSOR SPOTLIGHT
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-4">
              Kastuart Grand Prix <span className="text-cyan-400">2026</span>
            </h2>
            <p className="text-sm md:text-base text-zinc-300 mb-6 leading-relaxed">
              Dukung komikus favoritmu dan jadilah saksi karya terbaik pemenang festival tahunan nasional. Baca dalam tampilan Flipbook interaktif definisi tinggi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/festival">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider rounded-xl shadow-lg">
                  BACA KOMIK PEMENANG
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl animate-pulse">
              <Trophy className="w-24 h-24 text-cyan-300" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers / Karya Terfavorit Showcase */}
      <ComicShowcaseSection
        title="Karya Terfavorit"
        subtitle="Karya komik dengan pembaca dan apresiasi tertinggi bulan ini"
        items={bestSellerComics}
        viewAllLink="/festival"
      />

      {/* 6. Active Festivals Section */}
      <section className="py-16 container mx-auto px-4 border-t border-border/40">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
              Festival Berlangsung
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Ikuti kompetisi festival komik digital dan submit karya terbaikmu
            </p>
          </div>
          <Link href="/festival">
            <Button variant="outline" size="sm" className="font-bold gap-1 rounded-xl">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {activeFestivals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
            Belum ada festival yang berlangsung saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFestivals.map((festival) => (
              <Link key={festival.id} href={`/festival/${festival.slug}`}>
                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group rounded-2xl overflow-hidden border border-border/60">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-2xl flex items-center justify-center overflow-hidden relative">
                    {festival.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={festival.poster}
                        alt={festival.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Trophy className="h-12 w-12 text-primary/40" />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-bold uppercase">
                        {festival.category.name}
                      </Badge>
                      <FestivalStatusBadge status={festival.status} />
                    </div>
                    <h3 className="font-extrabold text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {festival.title}
                    </h3>
                    {festival.endRegistration && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>Batas Pendaftaran: {formatDate(festival.endRegistration)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 7. Platform Stats Bar */}
      <section className="border-y border-border/40 bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-black text-primary">{totalFestivals}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Festival Komik</div>
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-x border-border/40">
              <div className="text-4xl font-black text-primary">{totalParticipants}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Komikus & Peserta Terdaftar</div>
            </div>
            <div className="p-4 border-t md:border-t-0 border-border/40">
              <div className="text-4xl font-black text-primary">{totalWorks}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Karya Dipublikasikan</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Feature Callouts */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black uppercase tracking-wider">Mengapa Kastuart?</h2>
          <p className="text-muted-foreground mt-2 font-medium">Ekosistem lengkap untuk festival dan publikasi komik digital</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Layers className="h-7 w-7 text-primary" />,
              title: "Tahapan Kompetisi Dinamis",
              desc: "Proses seleksi transparan dari sinopsis, sketsa hingga karya final dengan peninjauan admin bertahap.",
            },
            {
              icon: <Award className="h-7 w-7 text-primary" />,
              title: "Sponsor & Festival Resmi",
              desc: "Kesempatan emas berkolaborasi dengan sponsor penerbit komik ternama dan memenangkan hadiah.",
            },
            {
              icon: <BookOpen className="h-7 w-7 text-primary" />,
              title: "Interactive Flipbook Reader",
              desc: "Pengalaman membaca karya komik digital yang realistis dengan efek membalik halaman mulus.",
            },
          ].map((f, i) => (
            <Card key={i} className="p-6 text-center hover:shadow-xl transition-all border border-border/60 rounded-2xl">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                {f.icon}
              </div>
              <h3 className="font-extrabold text-lg mb-2 uppercase tracking-wide">{f.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function FestivalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    published: { label: "Buka Pendaftaran", variant: "default" },
    registration_closed: { label: "Pendaftaran Ditutup", variant: "secondary" },
    judging: { label: "Penilaian", variant: "outline" },
    finished: { label: "Selesai", variant: "secondary" },
  };
  const config = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant} className="text-xs font-semibold">{config.label}</Badge>;
}
