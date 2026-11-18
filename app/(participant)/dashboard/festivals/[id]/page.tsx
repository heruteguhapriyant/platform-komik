import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EventPageClient from "@/components/participant/event-page-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ParticipantFestivalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let festival = null;
  let participant = null;
  let profile = null;
  let dbError = false;

  try {
    [festival, participant, profile] = await Promise.all([
      db.festival.findUnique({
        where: { id },
        include: {
          category: { select: { name: true } },
          stages: { orderBy: { orderNumber: "asc" } },
        },
      }),
      db.festivalParticipant.findFirst({
        where: { festivalId: id, userId: session.user.id },
        include: {
          proposal: true,
          work: {
            include: {
              submissions: { orderBy: { submittedAt: "desc" } },
              publication: true,
            },
          },
        },
      }),
      db.participantProfile.findUnique({
        where: { userId: session.user.id },
      }),
    ]);
  } catch (error) {
    console.error("Failed to load participant festival detail", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/5 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
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

  if (!festival) {
    notFound();
  }

  return (
    <EventPageClient
      festival={festival}
      participant={participant}
      profileComplete={!!profile}
    />
  );
}
