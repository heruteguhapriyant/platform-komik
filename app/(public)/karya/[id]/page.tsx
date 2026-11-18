import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, User, Calendar, ShieldAlert } from "lucide-react";
import FlipbookViewer from "@/components/public/dynamic-flipbook-viewer";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPublishedWork(id: string) {
  const work = await db.work.findUnique({
    where: { id },
    include: {
      publication: true,
      festivalParticipant: {
        include: {
          festival: true,
        },
      },
    },
  });

  return work;
}

export default async function PublicWorkDetailPage({ params }: PageProps) {
  const { id } = await params;

  let work = null;
  try {
    work = await getPublishedWork(id);
  } catch (error) {
    console.error("Failed to load work details", error);
  }

  // Enforce publication constraints for public reader
  if (!work || work.publication?.status !== "published") {
    notFound();
  }

  // Find the last approved submission which is the final work PDF
  // We can fetch submissions directly related to this work
  let pdfUrl = "";
  try {
    const finalSubmission = await db.submission.findFirst({
      where: {
        workId: work.id,
        status: "approved",
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
    pdfUrl = finalSubmission?.file || "";
  } catch (error) {
    console.error("Failed to load submission PDF", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1 flex flex-col">
      {/* Back to Festival */}
      <div>
        <Link href={`/festival/${work.festivalParticipant.festival.slug}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 pl-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Halaman Festival
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-4 items-start">
        {/* Flipbook Reader main column (Left/Center) */}
        <div className="lg:col-span-3 space-y-6">
          {pdfUrl ? (
            <FlipbookViewer fileUrl={pdfUrl} />
          ) : (
            <Card className="border-destructive/40 bg-destructive/5 p-8 text-center">
              <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-2" />
              <h3 className="font-bold text-sm text-destructive">Berkas Komik Kosong</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Karya ini terdaftar tetapi tidak ditemukan berkas PDF pendukung yang disetujui.
              </p>
            </Card>
          )}
        </div>

        {/* Comic detail metadata column (Right Side) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary shrink-0" /> Detail Komik
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <h1 className="text-lg font-extrabold text-foreground leading-tight">{work.title}</h1>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>Karya: {work.author}</span>
                </div>
                {work.publication.publishedAt && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Rilis: {formatDate(work.publication.publishedAt)}</span>
                  </div>
                )}
              </div>

              {work.description && (
                <div className="border-t pt-4 space-y-1 text-xs">
                  <span className="font-semibold text-muted-foreground block">Sinopsis:</span>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{work.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
