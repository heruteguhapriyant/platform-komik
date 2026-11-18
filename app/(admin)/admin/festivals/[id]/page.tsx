import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import FestivalDetailTabs from "@/components/admin/festival-detail-tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFestivalDetailPage({ params }: PageProps) {
  const { id } = await params;

  let festival: any = null;
  let categories: { id: string; name: string }[] = [];

  try {
    [festival, categories] = await Promise.all([
      db.festival.findUnique({
        where: { id },
        include: {
          category: true,
          stages: {
            orderBy: { orderNumber: "asc" },
            include: {
              submissions: {
                orderBy: { submittedAt: "desc" },
                include: {
                  work: {
                    include: {
                      festivalParticipant: {
                        include: { user: true },
                      },
                    },
                  },
                },
              },
            },
          },
          participants: {
            orderBy: { joinedAt: "desc" },
            include: {
              user: {
                include: { profile: true },
              },
              proposal: true,
              work: {
                include: {
                  submissions: {
                    orderBy: { submittedAt: "desc" },
                    include: { festivalStage: true },
                  },
                  publication: true,
                },
              },
            },
          },
        },
      }),
      db.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("Failed to fetch festival detail", error);
  }

  if (!festival) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/festivals">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <span className="text-xs text-muted-foreground">Kelola Acara / Detail</span>
          <h1 className="text-2xl font-bold tracking-tight">{festival.title}</h1>
        </div>
      </div>

      <FestivalDetailTabs festival={festival} categories={categories} />
    </div>
  );
}
