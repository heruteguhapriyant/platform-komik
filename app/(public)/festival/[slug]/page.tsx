import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  Trophy,
  ArrowLeft,
  BookOpen,
  ArrowRight,
  Info,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getFestivalBySlug(slug: string) {
  const festival = await db.festival.findUnique({
    where: { slug },
    include: {
      category: true,
      stages: { orderBy: { orderNumber: "asc" } },
      participants: {
        where: {
          work: {
            publication: { status: "published" },
          },
        },
        include: {
          work: {
            include: { publication: true },
          },
          user: true,
        },
      },
    },
  });

  return festival;
}

export default async function PublicFestivalDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let festival = null;
  try {
    festival = await getFestivalBySlug(slug);
  } catch (error) {
    console.error("Failed to load festival details", error);
  }

  if (!festival || festival.status === "draft") {
    notFound();
  }

  const publishedWorks = festival.participants
    .map((p) => p.work)
    .filter((w): w is NonNullable<typeof w> => w !== null);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1 flex flex-col">
      {/* Back button */}
      <div>
        <Link href="/festival">
          <Button variant="ghost" size="sm" className="gap-1.5 pl-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Festival
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Details (Left/Center) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{festival.category.name}</Badge>
              <FestivalStatusBadge status={festival.status} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{festival.title}</h1>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
              {festival.description || "Tidak ada detail deskripsi mengenai festival ini."}
            </p>
          </div>

          {/* Published Works Gallery */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Karya Komik Peserta</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Baca komik hasil kolaborasi festival ini</p>
            </div>

            {publishedWorks.length === 0 ? (
              <Card className="p-8 text-center bg-muted/10">
                <BookOpen className="h-10 w-10 text-muted-foreground/35 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Belum Ada Karya Rilis</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Belum ada komik peserta festival ini yang dirilis secara publik oleh kurator admin.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {publishedWorks.map((work) => (
                  <Link key={work.id} href={`/karya/${work.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-secondary/10 relative flex items-center justify-center border-b">
                        {work.cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={work.cover}
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors">
                          {work.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{work.author}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info (Right Column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" /> Timeline & Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-3">
                {festival.startRegistration && festival.endRegistration && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Pendaftaran</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {formatDate(festival.startRegistration)} - {formatDate(festival.endRegistration)}
                    </span>
                  </div>
                )}
                {festival.startEvent && festival.endEvent && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Pelaksanaan Lomba</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {formatDate(festival.startEvent)} - {formatDate(festival.endEvent)}
                    </span>
                  </div>
                )}
              </div>

              {festival.stages.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <span className="text-muted-foreground font-semibold block">Rencana Tahapan:</span>
                  <div className="relative border-l pl-3 border-border space-y-3 ml-1.5">
                    {festival.stages.map((stage) => (
                      <div key={stage.id} className="relative">
                        <div className="absolute -left-[17px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-muted border border-border text-[7px] font-bold">
                          {stage.orderNumber}
                        </div>
                        <span className="font-semibold text-foreground block">{stage.title}</span>
                        {stage.deadline && (
                          <span className="text-[10px] text-muted-foreground">
                            Batas: {formatDate(stage.deadline)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FestivalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    published: { label: "Pendaftaran Buka", variant: "default" },
    registration_closed: { label: "Pendaftaran Tutup", variant: "secondary" },
    judging: { label: "Penilaian Juri", variant: "outline" },
    finished: { label: "Selesai", variant: "secondary" },
    archived: { label: "Arsip", variant: "outline" },
  };
  const config = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant} className="text-[9px] uppercase font-bold">{config.label}</Badge>;
}
