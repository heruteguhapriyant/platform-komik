"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { joinFestivalAction, submitProposalAction, submitStageSubmissionAction } from "@/app/(participant)/dashboard/festivals/[id]/actions";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { toast } from "sonner";
import { formatDate, formatFileSize } from "@/lib/utils";
import {
  Trophy,
  Calendar,
  Lock,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Book,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stage {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  deadline: Date | null;
}

interface Proposal {
  id: string;
  title: string;
  synopsis: string;
  story: string;
  cover: string | null;
  status: string;
  reviewNote: string | null;
}

interface Submission {
  id: string;
  file: string;
  fileName: string;
  fileSize: number;
  status: string;
  reviewNote: string | null;
  festivalStageId: string;
}

interface Work {
  id: string;
  title: string;
  submissions: Submission[];
  status: string;
  publication: { status: string } | null;
}

interface Participant {
  id: string;
  status: string;
  proposal: Proposal | null;
  work: Work | null;
}

interface Festival {
  id: string;
  title: string;
  description: string | null;
  poster: string | null;
  status: string;
  startRegistration: Date | null;
  endRegistration: Date | null;
  startEvent: Date | null;
  endEvent: Date | null;
  category: { name: string };
  stages: Stage[];
}

interface EventPageClientProps {
  festival: Festival;
  participant: Participant | null;
  profileComplete: boolean;
}

export default function EventPageClient({ festival, participant, profileComplete }: EventPageClientProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Form local values for proposal
  const [coverUrl, setCoverUrl] = useState(participant?.proposal?.cover || "");
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await joinFestivalAction(festival.id);
      if (res.success) {
        toast.success("Berhasil mengikuti festival! Silakan kirim proposal karya.");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengikuti festival.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!participant) return;
    setIsSubmittingProposal(true);

    const formData = new FormData(e.currentTarget);
    formData.append("cover", coverUrl);

    try {
      const res = await submitProposalAction(participant.id, formData);
      if (res.success) {
        toast.success("Proposal berhasil dikirim untuk ditinjau!");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengirim proposal.");
      }
    } catch {
      toast.error("Terjadi kesalahan server.");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Upload handler for submission PDF files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, stageId: string) => {
    const file = e.target.files?.[0];
    if (!file || !participant?.work) return;

    if (file.type !== "application/pdf") {
      toast.error("Wajib mengunggah berkas berformat PDF.");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Mengompresi & mengunggah berkas...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const resJson = await response.json();

      if (resJson.success) {
        setUploadProgress("Menyimpan status berkas...");
        const saveRes = await submitStageSubmissionAction(
          participant.work.id,
          stageId,
          resJson.url,
          resJson.fileName,
          resJson.fileSize
        );

        if (saveRes.success) {
          toast.success("Berkas tahapan berhasil diunggah!");
          router.refresh();
        } else {
          toast.error(saveRes.error || "Gagal menyimpan berkas.");
        }
      } else {
        toast.error(resJson.error || "Gagal mengunggah.");
      }
    } catch {
      toast.error("Koneksi gagal saat mengunggah berkas.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  // Check which stage is currently active
  const getActiveStage = () => {
    if (!participant?.work || participant.status !== "active") return null;
    const stages = [...festival.stages].sort((a, b) => a.orderNumber - b.orderNumber);

    for (const stage of stages) {
      const sub = participant.work.submissions.find(s => s.festivalStageId === stage.id);
      if (!sub || sub.status !== "approved") {
        return stage; // This is the first unapproved stage
      }
    }
    return null;
  };

  const activeStage = getActiveStage();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border bg-card items-start md:items-center">
        {festival.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={festival.poster} alt="Poster" className="w-24 aspect-[3/4] object-cover rounded border shrink-0" />
        )}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <span className="text-muted-foreground">/</span>
            <Badge variant="secondary">{festival.category.name}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{festival.title}</h1>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {festival.description}
          </p>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          STATE 1: BELUM MENGIKUTI FESTIVAL
          ──────────────────────────────────────────────────────── */}
      {!participant && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <CardTitle>Gabung Festival Komik Ini</CardTitle>
            <CardDescription>Daftarkan diri Anda untuk mulai mengirimkan karya komik digital.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            {profileComplete ? (
              <Button onClick={handleJoin} size="lg" disabled={isJoining} className="px-8 font-bold">
                {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ikuti Festival"}
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-yellow-700 font-semibold bg-yellow-500/10 p-3 rounded-lg border border-yellow-200">
                  ⚠️ Anda wajib melengkapi biodata profil sebelum mendaftar ke festival.
                </p>
                <Link href="/dashboard/profile">
                  <Button size="sm">Lengkapi Biodata Sekarang</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ────────────────────────────────────────────────────────
          STATE 2: MENDAFTAR & KIRIM PROPOSAL (registered/proposal_review)
          ──────────────────────────────────────────────────────── */}
      {participant && (participant.status === "registered" || participant.status === "proposal_review") && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {participant.proposal ? "Proposal Karya Anda" : "Kirim Proposal Karya"}
                </CardTitle>
                <CardDescription>
                  Masukkan ide cerita, sinopsis, dan draft cover komik yang akan Anda ikutkan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participant.proposal && participant.proposal.status === "pending" ? (
                  // Review Pending State
                  <div className="py-8 text-center space-y-3 bg-muted/20 rounded-lg">
                    <Clock className="h-12 w-12 text-yellow-500 mx-auto animate-pulse" />
                    <h3 className="font-bold text-base">Proposal Sedang Ditinjau</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Proposal Anda (&quot;{participant.proposal.title}&quot;) telah kami terima dan sedang di-review oleh admin. 
                      Anda akan masuk ke tahapan kompetisi setelah disetujui.
                    </p>
                  </div>
                ) : (
                  // Create/Edit form
                  <form onSubmit={handleProposalSubmit} className="space-y-4">
                    {participant.proposal?.status === "rejected" && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm space-y-1">
                        <p className="font-bold text-destructive flex items-center gap-1.5">
                          <XCircle className="h-4 w-4" /> Proposal Ditolak / Butuh Revisi
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Catatan Admin: <strong className="text-foreground">{participant.proposal.reviewNote}</strong>
                        </p>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="title">Judul Calon Komik</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={participant.proposal?.title || ""}
                        placeholder="Masukkan judul komik Anda"
                        required
                        disabled={isSubmittingProposal}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cover">Poster/Cover Awal Komik (Opsional)</Label>
                      <ImageUploadInput
                        id="cover"
                        value={coverUrl}
                        onChange={setCoverUrl}
                        placeholder="https://example.com/cover-komik.jpg"
                        disabled={isSubmittingProposal}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="synopsis">Sinopsis Komik</Label>
                      <Textarea
                        id="synopsis"
                        name="synopsis"
                        defaultValue={participant.proposal?.synopsis || ""}
                        placeholder="Ringkasan cerita singkat komik..."
                        rows={3}
                        required
                        disabled={isSubmittingProposal}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="story">Rincian Cerita / Alur Bab</Label>
                      <Textarea
                        id="story"
                        name="story"
                        defaultValue={participant.proposal?.story || ""}
                        placeholder="Konsep rincian cerita secara umum..."
                        rows={4}
                        required
                        disabled={isSubmittingProposal}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmittingProposal}>
                      {isSubmittingProposal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kirim Proposal"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alur Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                <p>1. Daftar & ikut serta dalam festival.</p>
                <p>2. Kirim detail proposal komik (Judul, Sinopsis, Cerita).</p>
                <p>3. Tunggu persetujuan dari dewan admin Kastuart.</p>
                <p>4. Jika disetujui, Anda akan otomatis masuk ke **Tahap 1** dan file karya mulai dikerjakan.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          STATE 3: TAHAPAN AKTIF & SUBMISSION TIMELINE (active/completed)
          ──────────────────────────────────────────────────────── */}
      {participant && (participant.status === "active" || participant.status === "completed") && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Workspace (Left Column) */}
          <div className="md:col-span-2 space-y-6">
            {participant.status === "completed" ? (
              // All Stages Completed State
              <Card className="border-green-200 bg-green-500/5">
                <CardHeader className="text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                  <CardTitle className="text-green-800">Semua Tahapan Selesai! 🎉</CardTitle>
                  <CardDescription>
                    Anda telah berhasil menyelesaikan seluruh tahapan festival komik digital ini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {participant.work?.publication?.status === "published" ? (
                    <div className="space-y-2">
                      <p className="text-sm">Karya Anda telah dipublikasikan dan dapat dibaca oleh umum.</p>
                      <a href={`/karya/${participant.work.id}`} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2">
                          <Book className="h-4 w-4" /> Buka Flipbook Karya <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Karya Anda sedang dalam antrean publikasi oleh admin. Mohon ditunggu.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : activeStage ? (
              // Active Submission Form Page
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" /> Kirim Hasil Tahap: {activeStage.title}
                  </CardTitle>
                  <CardDescription>
                    Kirimkan hasil karya Anda untuk tahapan aktif saat ini. Batas waktu pengerjaan tercantum di timeline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeStage.description && (
                    <p className="text-sm p-3 bg-muted/40 rounded-lg text-muted-foreground">
                      💡 <strong>Instruksi:</strong> {activeStage.description}
                    </p>
                  )}

                  {/* Submission detail state if already submitted */}
                  {(() => {
                    const sub = participant.work?.submissions.find(s => s.festivalStageId === activeStage.id);
                    if (sub) {
                      if (sub.status === "pending") {
                        return (
                          <div className="py-6 text-center space-y-2 border border-yellow-200/60 bg-yellow-500/5 rounded-lg">
                            <Clock className="h-10 w-10 text-yellow-500 mx-auto animate-pulse" />
                            <h4 className="font-bold text-sm text-yellow-800">Menunggu Validasi Admin</h4>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                              Berkas &ldquo;{sub.fileName}&rdquo; ({formatFileSize(sub.fileSize)}) sedang direview. 
                              Tahap berikutnya akan terbuka setelah disetujui.
                            </p>
                          </div>
                        );
                      } else if (sub.status === "revision") {
                        return (
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm space-y-1">
                              <p className="font-bold text-destructive flex items-center gap-1.5">
                                <XCircle className="h-4 w-4" /> Butuh Revisi / Perbaikan
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Catatan Admin: <strong className="text-foreground">{sub.reviewNote}</strong>
                              </p>
                            </div>
                            <div className="border-2 border-dashed border-border/80 rounded-lg p-6 text-center hover:bg-muted/10 transition-colors">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileUpload(e, activeStage.id)}
                                className="hidden"
                                id="stage-re-upload"
                                disabled={isUploading}
                              />
                              <label htmlFor="stage-re-upload" className="cursor-pointer space-y-2 block">
                                <Upload className="h-8 w-8 text-primary mx-auto opacity-75" />
                                <span className="text-xs font-semibold block text-primary hover:underline">Unggah Ulang File PDF Baru</span>
                                <span className="text-[10px] text-muted-foreground block">Maksimal 20MB (Format PDF wajib)</span>
                              </label>
                            </div>
                          </div>
                        );
                      }
                    }

                    // Default Upload Form
                    return (
                      <div className="border-2 border-dashed border-border/80 rounded-lg p-8 text-center hover:bg-muted/10 transition-colors">
                        {isUploading ? (
                          <div className="space-y-3">
                            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                            <p className="text-xs font-semibold text-primary">{uploadProgress}</p>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(e, activeStage.id)}
                              className="hidden"
                              id="stage-upload"
                              disabled={isUploading}
                            />
                            <label htmlFor="stage-upload" className="cursor-pointer space-y-2 block">
                              <Upload className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
                              <span className="text-sm font-semibold block text-primary hover:underline">Unggah File PDF Karya</span>
                              <span className="text-xs text-muted-foreground block">Format wajib PDF (Maksimal 20MB)</span>
                            </label>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Timeline View (Right Column) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Timeline Progres</CardTitle>
                <CardDescription className="text-[10px]">Urutan pengerjaan tahap demi tahap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative border-l pl-4 space-y-6 border-border ml-2 text-xs">
                  {festival.stages
                    .sort((a, b) => a.orderNumber - b.orderNumber)
                    .map((stage) => {
                      const sub = participant.work?.submissions.find(s => s.festivalStageId === stage.id);
                      const isApproved = sub?.status === "approved";
                      const isPending = sub?.status === "pending";
                      const isRevision = sub?.status === "revision";
                      const isActive = activeStage?.id === stage.id;
                      const isLocked = !isApproved && !isActive && !isPending && !isRevision && (activeStage ? stage.orderNumber > activeStage.orderNumber : false);

                      let dotClass = "bg-muted border-border text-muted-foreground";
                      let labelClass = "text-muted-foreground";

                      if (isApproved) {
                        dotClass = "bg-green-500 border-green-600 text-white";
                        labelClass = "text-foreground font-semibold";
                      } else if (isPending) {
                        dotClass = "bg-yellow-500 border-yellow-600 text-yellow-950 animate-pulse";
                        labelClass = "text-yellow-800 font-semibold";
                      } else if (isRevision) {
                        dotClass = "bg-destructive border-destructive text-white";
                        labelClass = "text-destructive font-semibold";
                      } else if (isActive) {
                        dotClass = "bg-primary border-primary text-primary-foreground font-bold scale-110";
                        labelClass = "text-foreground font-extrabold";
                      }

                      return (
                        <div key={stage.id} className="relative">
                          <div className={`absolute -left-[23px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border text-[8px] font-bold ${dotClass}`}>
                            {isApproved ? "✓" : isLocked ? <Lock className="h-2 w-2" /> : stage.orderNumber}
                          </div>
                          <div className="space-y-1">
                            <p className={labelClass}>{stage.title}</p>
                            {stage.deadline && (
                              <p className="text-[10px] text-muted-foreground">
                                Batas: {formatDate(stage.deadline)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
