import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getParticipantDashboardData(userId: string) {
  const [joined, available, profile] = await Promise.all([
    db.festivalParticipant.findMany({
      where: { userId },
      include: {
        festival: {
          include: { category: true, stages: { orderBy: { orderNumber: "asc" } } },
        },
        proposal: true,
        work: {
          include: {
            submissions: { orderBy: { submittedAt: "desc" } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    db.festival.findMany({
      where: {
        status: "published",
        participants: { none: { userId } },
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.participantProfile.findUnique({
      where: { userId },
    }),
  ]);

  return { joined, available, profile };
}

export default async function ParticipantDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  let data: { joined: any[]; available: any[]; profile: any } = {
    joined: [],
    available: [],
    profile: null,
  };
  let dbError = false;

  try {
    data = await getParticipantDashboardData(session.user.id);
  } catch (error) {
    console.error("Failed to load participant dashboard data", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/5 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-destructive">Koneksi Database Gagal</CardTitle>
              <CardDescription>Koneksi database PostgreSQL tidak dapat dibangun.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pastikan server database PostgreSQL Anda telah diinstal dan sedang berjalan. 
              Periksa kembali kredensial database di file [`.env`](file:///d:/laragon/www/platform-komik/.env).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { joined, available, profile } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border bg-gradient-to-r from-primary/5 via-background to-secondary/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Halo, {session.user.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di panel Kastuart. Ikuti festival, kembangkan karya komik terbaik Anda.
          </p>
        </div>
        {!profile && (
          <Link href="/dashboard/profile">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 gap-2 shrink-0 animate-pulse border-yellow-400">
              <AlertTriangle className="h-4 w-4" /> Lengkapi Biodata Wajib
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Joined Festivals */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Festival yang Anda Ikuti</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Pantau status proposal dan submission Anda</p>
          </div>

          {joined.length === 0 ? (
            <Card className="p-8 text-center bg-muted/20">
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-sm">Belum Mengikuti Festival</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Silakan pilih salah satu festival yang tersedia di kolom sebelah kanan untuk mendaftar dan mengirim proposal karya.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {joined.map((p: any) => {
                const currentStageIndex = p.work?.submissions.filter((s: any) => s.status === "approved").length || 0;
                const totalStages = p.festival.stages.length;
                const progressPercent = totalStages > 0 ? (currentStageIndex / totalStages) * 100 : 0;

                return (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base">{p.festival.title}</h3>
                            <Badge variant="secondary" className="text-[10px]">
                              {p.festival.category.name}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Terdaftar sejak {formatDate(p.joinedAt)}
                          </p>
                        </div>
                        <Link href={`/dashboard/festivals/${p.festival.id}`}>
                          <Button size="sm" className="gap-1.5 self-start">
                            Buka Halaman <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>

                      {/* Status Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-4 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">Status Proposal</span>
                          {p.proposal ? (
                            <Badge className="mt-1 capitalize text-[10px]" variant={
                              p.proposal.status === "approved" ? "secondary" :
                              p.proposal.status === "pending" ? "default" : "destructive"
                            }>
                              {p.proposal.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-1 text-[10px]">Draft</Badge>
                          )}
                        </div>

                        {p.work && (
                          <>
                            <div>
                              <span className="text-xs text-muted-foreground block">Karya Komik</span>
                              <span className="font-semibold text-xs mt-1 block truncate max-w-[150px]">
                                {p.work.title}
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-xs text-muted-foreground block">Progress Tahapan</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-2 w-20 bg-muted rounded-full overflow-hidden shrink-0">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold shrink-0">
                                  {currentStageIndex}/{totalStages}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Festivals */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Pendaftaran Buka</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Festival aktif yang dapat diikuti</p>
          </div>

          {available.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground text-xs bg-muted/10">
              Saat ini belum ada festival baru yang membuka pendaftaran.
            </Card>
          ) : (
            <div className="space-y-4">
              {available.map((festival: any) => (
                <Card key={festival.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {festival.poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={festival.poster}
                      alt={festival.title}
                      className="w-full h-32 object-cover border-b"
                    />
                  )}
                  <CardHeader className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        {festival.category.name}
                      </Badge>
                      {festival.endRegistration && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Hingga {formatDate(festival.endRegistration)}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm font-bold line-clamp-1">{festival.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {festival.description || "Tidak ada deskripsi."}
                    </p>
                    {profile ? (
                      <Link href={`/dashboard/festivals/${festival.id}`} className="w-full block">
                        <Button size="sm" className="w-full gap-1.5 text-xs font-semibold">
                          Daftar & Ikuti <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard/profile" className="w-full block">
                        <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs text-yellow-700 bg-yellow-500/10 border-yellow-200">
                          Lengkapi Profil untuk Ikut
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
