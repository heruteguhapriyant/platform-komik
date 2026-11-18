import { db } from "@/lib/db";
import FestivalsCatalog from "@/components/public/festivals-catalog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function PublicFestivalsPage() {
  let festivals: any[] = [];
  let categories: any[] = [];
  let dbError = false;

  try {
    [festivals, categories] = await Promise.all([
      db.festival.findMany({
        where: {
          status: { not: "draft" },
        },
        include: {
          category: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("Failed to load public festivals list", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/5 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-destructive">Layanan Terganggu</CardTitle>
              <CardDescription>Sistem database sedang offline sementara waktu.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mohon maaf atas ketidaknyamanan ini. Kami sedang melakukan pemeliharaan server database. 
              Silakan coba muat ulang halaman beberapa saat lagi.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <FestivalsCatalog initialFestivals={festivals} categories={categories} />;
}
