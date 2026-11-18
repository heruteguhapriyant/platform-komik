import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  FolderOpen,
  FileText,
  FileCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getDashboardStats() {
  const [
    totalCategories,
    totalFestivals,
    totalParticipants,
    pendingProposals,
    pendingSubmissions,
    activeFestivalsList,
    recentActivity,
  ] = await db.$transaction([
    db.category.count(),
    db.festival.count(),
    db.festivalParticipant.count(),
    db.proposal.count({ where: { status: "pending" } }),
    db.submission.count({ where: { status: "pending" } }),
    db.festival.findMany({
      where: { status: { in: ["published", "registration_closed", "judging"] } },
      include: {
        category: true,
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalCategories,
    totalFestivals,
    totalParticipants,
    pendingProposals,
    pendingSubmissions,
    activeFestivalsList,
    recentActivity,
  };
}

export default async function AdminDashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    // If DB is not migrated/ready yet, fallback to dummy data gracefully
    console.error("Database connection failed, showing empty state", error);
    stats = {
      totalCategories: 0,
      totalFestivals: 0,
      totalParticipants: 0,
      pendingProposals: 0,
      pendingSubmissions: 0,
      activeFestivalsList: [],
      recentActivity: [],
    };
  }

  const statCards = [
    {
      title: "Total Kategori",
      value: stats.totalCategories,
      desc: "Kategori lomba aktif",
      icon: FolderOpen,
      color: "text-blue-500 bg-blue-500/10",
      href: "/admin/categories",
    },
    {
      title: "Total Acara/Festival",
      value: stats.totalFestivals,
      desc: "Festival komik yang dibuat",
      icon: Trophy,
      color: "text-yellow-500 bg-yellow-500/10",
      href: "/admin/festivals",
    },
    {
      title: "Total Peserta",
      value: stats.totalParticipants,
      desc: "Pendaftaran akun peserta",
      icon: Users,
      color: "text-green-500 bg-green-500/10",
      href: "/admin/users",
    },
    {
      title: "Proposal Menunggu",
      value: stats.pendingProposals,
      desc: "Butuh persetujuan admin",
      icon: FileText,
      color: "text-purple-500 bg-purple-500/10",
      href: "/admin/festivals", // Will navigate to detail via festival list
    },
    {
      title: "Submission Menunggu",
      value: stats.pendingSubmissions,
      desc: "Upload tahapan baru",
      icon: FileCheck,
      color: "text-orange-500 bg-orange-500/10",
      href: "/admin/festivals",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-muted-foreground mt-1">
          Monitor status pendaftaran, progress peserta, dan publikasi karya secara real-time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Festivals */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Acara Sedang Berlangsung</CardTitle>
              <CardDescription>Festival aktif saat ini</CardDescription>
            </div>
            <Link href="/admin/festivals">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Semua Acara <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.activeFestivalsList.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Belum ada festival yang aktif atau database belum siap.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.activeFestivalsList.map((festival) => (
                  <div
                    key={festival.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/festivals/${festival.id}`}
                          className="font-semibold text-sm hover:underline hover:text-primary transition-colors line-clamp-1"
                        >
                          {festival.title}
                        </Link>
                        <Badge variant="secondary" className="text-[10px]">
                          {festival.category.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Status: </span>
                        <span className="capitalize font-medium text-foreground">
                          {festival.status.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span>{festival._count.participants} Peserta</span>
                      </p>
                    </div>
                    <Link href={`/admin/festivals/${festival.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Kelola
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            <CardDescription>Log tindakan pengguna dalam sistem</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Belum ada log aktivitas atau database belum siap.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold">{log.user.name}</p>
                      <p className="text-xs text-muted-foreground">{log.activity}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
