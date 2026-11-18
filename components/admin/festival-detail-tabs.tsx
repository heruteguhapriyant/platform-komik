"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateFestivalAction, updateFestivalStatusAction, manageStagesAction, reviewProposalAction, reviewSubmissionAction, managePublicationAction, cleanupDraftSubmissionsAction } from "@/app/(admin)/admin/festivals/actions";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { toast } from "sonner";
import { formatDate, formatFileSize } from "@/lib/utils";
import {
  Calendar,
  Layers,
  FileCheck,
  BookOpen,
  Plus,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

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
  workId: string;
  festivalStageId: string;
  file: string;
  fileName: string;
  fileSize: number;
  status: string;
  reviewNote: string | null;
  submittedAt: Date;
}

interface Work {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover: string | null;
  status: string;
  submissions: (Submission & { festivalStage: Stage })[];
  publication: { status: string } | null;
}

interface Participant {
  id: string;
  joinedAt: Date;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile: {
      fullname: string;
      phone: string | null;
      bio: string | null;
    } | null;
  };
  proposal: Proposal | null;
  work: Work | null;
}

interface Festival {
  id: string;
  title: string;
  categoryId: string;
  description: string | null;
  poster: string | null;
  status: string;
  startRegistration: Date | null;
  endRegistration: Date | null;
  startEvent: Date | null;
  endEvent: Date | null;
  category: Category;
  stages: (Stage & { submissions: any[] })[];
  participants: Participant[];
}

interface FestivalDetailTabsProps {
  festival: Festival;
  categories: Category[];
}

export default function FestivalDetailTabs({ festival, categories }: FestivalDetailTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [posterUrl, setPosterUrl] = useState(festival.poster || "");

  // ─── INFO STATE & HANDLERS ─────────────────────────
  const [status, setStatus] = useState(festival.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateFestivalStatusAction(festival.id, newStatus as any);
      if (res.success) {
        setStatus(newStatus);
        toast.success("Status festival berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui status.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateFestivalAction(festival.id, {}, formData);
      if (res.success) {
        toast.success("Informasi festival diperbarui!");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui.");
      }
    } catch {
      toast.error("Terjadi kesalahan server.");
    }
  };

  // ─── STAGES STATE & HANDLERS ───────────────────────
  const [stagesList, setStagesList] = useState<{
    id?: string;
    title: string;
    description: string;
    orderNumber: number;
    deadline: string;
  }[]>(
    festival.stages.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || "",
      orderNumber: s.orderNumber,
      deadline: s.deadline ? new Date(s.deadline).toISOString().split("T")[0] : "",
    }))
  );

  const handleAddStage = () => {
    const nextOrder = stagesList.length > 0 ? Math.max(...stagesList.map(s => s.orderNumber)) + 1 : 1;
    setStagesList([
      ...stagesList,
      { title: "", description: "", orderNumber: nextOrder, deadline: "" },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    setStagesList(stagesList.filter((_, i) => i !== index));
  };

  const handleStageFieldChange = (index: number, field: string, value: any) => {
    const updated = [...stagesList];
    updated[index] = { ...updated[index], [field]: value };
    setStagesList(updated);
  };

  const handleSaveStages = async () => {
    // Validate empty titles
    if (stagesList.some(s => !s.title.trim())) {
      toast.error("Semua nama tahapan wajib diisi.");
      return;
    }

    try {
      const res = await manageStagesAction(festival.id, stagesList);
      if (res.success) {
        toast.success("Tahapan festival berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui tahapan.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    }
  };

  // ─── PROPOSAL REVIEW STATE & HANDLERS ───────────────
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [reviewProposalItem, setReviewProposalItem] = useState<{
    id: string;
    title: string;
    synopsis: string;
    story: string;
    cover: string | null;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmittingProposalReview, setIsSubmittingProposalReview] = useState(false);

  const openProposalReview = (prop: Proposal) => {
    setReviewProposalItem(prop);
    setReviewNote("");
    setProposalModalOpen(true);
  };

  const handleProposalReview = async (status: "approved" | "rejected") => {
    if (!reviewProposalItem) return;
    setIsSubmittingProposalReview(true);
    try {
      const res = await reviewProposalAction(reviewProposalItem.id, status, reviewNote);
      if (res.success) {
        toast.success(`Proposal berhasil di-${status === "approved" ? "setujui" : "tolak"}!`);
        setProposalModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal meninjau proposal.");
      }
    } catch {
      toast.error("Terjadi kesalahan server.");
    } finally {
      setIsSubmittingProposalReview(false);
    }
  };

  // ─── SUBMISSION REVIEW STATE & HANDLERS ─────────────
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [reviewSubmissionItem, setReviewSubmissionItem] = useState<{
    id: string;
    stageTitle: string;
    participantName: string;
    file: string;
    fileName: string;
    fileSize: number;
    submittedAt: Date;
  } | null>(null);
  const [subReviewNote, setSubReviewNote] = useState("");
  const [isSubmittingSubReview, setIsSubmittingSubReview] = useState(false);

  const openSubmissionReview = (sub: Submission, stageTitle: string, participantName: string) => {
    setReviewSubmissionItem({
      id: sub.id,
      stageTitle,
      participantName,
      file: sub.file,
      fileName: sub.fileName,
      fileSize: sub.fileSize,
      submittedAt: sub.submittedAt,
    });
    setSubReviewNote("");
    setSubmissionModalOpen(true);
  };

  const handleSubmissionReview = async (status: "approved" | "revision") => {
    if (!reviewSubmissionItem) return;
    setIsSubmittingSubReview(true);
    try {
      const res = await reviewSubmissionAction(reviewSubmissionItem.id, status, subReviewNote);
      if (res.success) {
        toast.success(`Karya submission di-${status === "approved" ? "setujui" : "minta revisi"}!`);
        setSubmissionModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengulas submission.");
      }
    } catch {
      toast.error("Terjadi kesalahan server.");
    } finally {
      setIsSubmittingSubReview(false);
    }
  };

  // ─── PUBLICATION HANDLERS ─────────────────────────
  const handlePublishToggle = async (workId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "withdrawn" : "published";
    try {
      const res = await managePublicationAction(workId, nextStatus);
      if (res.success) {
        toast.success(`Publikasi karya berhasil ${nextStatus === "published" ? "diterbitkan" : "ditarik"}!`);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengelola publikasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    }
  };

  // ─── DRAFT CLEANUP HANDLER ─────────────────────────
  const [isCleaningDrafts, setIsCleaningDrafts] = useState(false);

  const handleCleanupDrafts = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus seluruh berkas PDF draf tahapan awal (sebelum tahap akhir) dari server? Berkas PDF Tahap Akhir dan Cover Komik akan tetap aman. Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    setIsCleaningDrafts(true);
    try {
      const res = await cleanupDraftSubmissionsAction(festival.id);
      if (res.success) {
        toast.success(
          res.deletedCount && res.deletedCount > 0
            ? `Berhasil membersihkan ${res.deletedCount} berkas PDF draf awal!`
            : "Tidak ada berkas draf awal yang perlu dibersihkan."
        );
        router.refresh();
      } else {
        toast.error(res.error || "Gagal membersihkan berkas draf.");
      }
    } catch {
      toast.error("Terjadi kesalahan server saat membersihkan berkas.");
    } finally {
      setIsCleaningDrafts(false);
    }
  };

  return (
    <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="bg-muted w-full justify-start overflow-x-auto h-auto p-1 gap-1">
        <TabsTrigger value="info" className="py-2 px-3 text-xs gap-1.5"><Settings2 className="h-3.5 w-3.5" /> Informasi</TabsTrigger>
        <TabsTrigger value="stages" className="py-2 px-3 text-xs gap-1.5"><Layers className="h-3.5 w-3.5" /> Tahapan</TabsTrigger>
        <TabsTrigger value="participants" className="py-2 px-3 text-xs gap-1.5"><FileCheck className="h-3.5 w-3.5" /> Peserta & Proposal</TabsTrigger>
        <TabsTrigger value="publications" className="py-2 px-3 text-xs gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Publikasi Karya</TabsTrigger>
      </TabsList>

      {/* ─── TAB 1: INFORMASI FESTIVAL ───────────────────────── */}
      <TabsContent value="info">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Informasi Festival</CardTitle>
              <CardDescription>Sesuaikan detail utama acara festival komik Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Festival</Label>
                  <Input id="title" name="title" defaultValue={festival.title} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Kategori</Label>
                  <Select name="categoryId" defaultValue={festival.categoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="poster">Poster Festival (Gambar)</Label>
                  <ImageUploadInput id="poster" name="poster" value={posterUrl} onChange={setPosterUrl} placeholder="https://example.com/poster.jpg" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" name="description" defaultValue={festival.description || ""} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startRegistration">Pendaftaran Dimulai</Label>
                    <Input id="startRegistration" name="startRegistration" type="date" defaultValue={festival.startRegistration ? new Date(festival.startRegistration).toISOString().split("T")[0] : ""} />
                  </div>
                  <div>
                    <Label htmlFor="endRegistration">Pendaftaran Berakhir</Label>
                    <Input id="endRegistration" name="endRegistration" type="date" defaultValue={festival.endRegistration ? new Date(festival.endRegistration).toISOString().split("T")[0] : ""} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startEvent">Event Dimulai</Label>
                    <Input id="startEvent" name="startEvent" type="date" defaultValue={festival.startEvent ? new Date(festival.startEvent).toISOString().split("T")[0] : ""} />
                  </div>
                  <div>
                    <Label htmlFor="endEvent">Event Berakhir</Label>
                    <Input id="endEvent" name="endEvent" type="date" defaultValue={festival.endEvent ? new Date(festival.endEvent).toISOString().split("T")[0] : ""} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Simpan Perubahan</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Status Lifecycle Card */}
            <Card>
              <CardHeader>
                <CardTitle>Siklus Festival</CardTitle>
                <CardDescription>Status menentukan aksesibilitas bagi peserta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Status Saat Ini</Label>
                  <Select value={status} onValueChange={(val) => handleStatusChange(val)} disabled={isUpdatingStatus}>
                    <SelectTrigger className="w-full font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Konfigurasi Admin)</SelectItem>
                      <SelectItem value="published">Published (Pendaftaran Buka)</SelectItem>
                      <SelectItem value="registration_closed">Registration Closed (Tutup)</SelectItem>
                      <SelectItem value="judging">Judging (Penilaian Juri)</SelectItem>
                      <SelectItem value="finished">Finished (Selesai/Bisa Publish)</SelectItem>
                      <SelectItem value="archived">Archived (Arsip)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1.5 text-muted-foreground">
                  <p>🔔 <strong>Published</strong>: Peserta mulai mendaftar & submit proposal.</p>
                  <p>🔔 <strong>Finished</strong>: Seluruh tahapan ditutup, admin bisa mempublikasikan karya final.</p>
                </div>
              </CardContent>
            </Card>

            {/* Poster Preview */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
                {posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">Tidak ada poster</span>
                )}
              </div>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* ─── TAB 2: TAHAPAN FESTIVAL ─────────────────────────── */}
      <TabsContent value="stages">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tahapan Dinamis</CardTitle>
              <CardDescription>Konfigurasi alur progres yang wajib dilalui peserta secara berurutan.</CardDescription>
            </div>
            <Button onClick={handleAddStage} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Tambah Tahap</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {stagesList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Belum ada tahapan. Klik &quot;Tambah Tahap&quot; untuk membuat tahapan.
              </div>
            ) : (
              <div className="space-y-4">
                {stagesList.map((stage, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border rounded-lg bg-muted/20 items-start relative group">
                    <div className="flex flex-col items-center justify-center h-10 w-10 bg-primary/10 rounded-md font-bold text-primary shrink-0 text-sm">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 grid gap-4 md:grid-cols-3">
                      <div className="grid gap-1">
                        <Label className="text-xs">Nama Tahapan</Label>
                        <Input value={stage.title} onChange={e => handleStageFieldChange(idx, "title", e.target.value)} placeholder="Contoh: Sketch, Line Art, Finishing" required />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Deskripsi</Label>
                        <Input value={stage.description} onChange={e => handleStageFieldChange(idx, "description", e.target.value)} placeholder="Instruksi singkat..." />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Batas Waktu (Deadline)</Label>
                        <Input type="date" value={stage.deadline} onChange={e => handleStageFieldChange(idx, "deadline", e.target.value)} />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 self-center" onClick={() => handleRemoveStage(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setStagesList(festival.stages.map(s => ({
                    id: s.id,
                    title: s.title,
                    description: s.description || "",
                    orderNumber: s.orderNumber,
                    deadline: s.deadline ? new Date(s.deadline).toISOString().split("T")[0] : "",
                  })))}>Reset</Button>
                  <Button onClick={handleSaveStages}>Simpan Konfigurasi</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ─── TAB 3: PESERTA & PROPOSAL ──────────────────────── */}
      <TabsContent value="participants">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pendaftar & Progress Karya</CardTitle>
            <CardDescription>Tinjau kelayakan proposal peserta dan validasi berkas tahapan berjalan mereka.</CardDescription>
          </CardHeader>
          <CardContent>
            {festival.participants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Belum ada peserta yang mendaftar pada festival ini.
              </div>
            ) : (
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Peserta</TableHead>
                      <TableHead>Status Partisipasi</TableHead>
                      <TableHead>Proposal</TableHead>
                      <TableHead>Progress Tahapan</TableHead>
                      <TableHead className="text-right">Tinjauan Berkas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {festival.participants.map((p) => {
                      // Find pending submission for this user
                      const pendingSub = p.work?.submissions.find(s => s.status === "pending");
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="font-semibold text-sm">{p.user.profile?.fullname || p.user.name}</div>
                            <div className="text-xs text-muted-foreground">{p.user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="text-[10px] capitalize" variant={
                              p.status === "active" ? "default" :
                              p.status === "completed" ? "secondary" : "outline"
                            }>
                              {p.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.proposal ? (
                              <div className="flex items-center gap-2">
                                <Badge className="text-[10px] uppercase font-bold" variant={
                                  p.proposal.status === "approved" ? "secondary" :
                                  p.proposal.status === "pending" ? "default" : "destructive"
                                }>
                                  {p.proposal.status}
                                </Badge>
                                {p.proposal.status === "pending" && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1" onClick={() => openProposalReview(p.proposal!)}>
                                    Tinjau
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Belum dikirim</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.work ? (
                              <div className="space-y-1">
                                <div className="text-xs font-semibold">{p.work.title}</div>
                                <div className="flex flex-wrap gap-1">
                                  {festival.stages.map((stage) => {
                                    const sub = p.work?.submissions.find(s => s.festivalStageId === stage.id);
                                    let color = "bg-muted text-muted-foreground";
                                    let icon = <Clock className="h-3 w-3 shrink-0" />;

                                    if (sub) {
                                      if (sub.status === "approved") {
                                        color = "bg-green-500/10 text-green-700 border-green-200/50";
                                        icon = <CheckCircle2 className="h-3 w-3 shrink-0" />;
                                      } else if (sub.status === "revision") {
                                        color = "bg-destructive/10 text-destructive border-destructive/20";
                                        icon = <XCircle className="h-3 w-3 shrink-0" />;
                                      } else if (sub.status === "pending") {
                                        color = "bg-yellow-500/10 text-yellow-700 border-yellow-200/50 animate-pulse";
                                        icon = <AlertTriangle className="h-3 w-3 shrink-0" />;
                                      }
                                    }

                                    return (
                                      <Badge
                                        key={stage.id}
                                        variant="outline"
                                        className={`text-[9px] gap-1 px-1.5 py-0.5 font-medium ${color} ${sub ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                                        onClick={() => {
                                          if (sub) {
                                            openSubmissionReview(sub, stage.title, p.user.profile?.fullname || p.user.name);
                                          }
                                        }}
                                      >
                                        {icon}
                                        <span>{stage.title}</span>
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {pendingSub ? (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs px-2 gap-1 bg-yellow-500 text-yellow-950 hover:bg-yellow-600"
                                onClick={() => {
                                  const stage = festival.stages.find(s => s.id === pendingSub.festivalStageId);
                                  openSubmissionReview(
                                    pendingSub,
                                    stage?.title || "Tahapan",
                                    p.user.profile?.fullname || p.user.name
                                  );
                                }}
                              >
                                Tinjau Hasil
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Tidak ada antrian</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── MODAL PROPOSAL REVIEW ────────────────────────── */}
        <Dialog open={proposalModalOpen} onOpenChange={setProposalModalOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
            {reviewProposalItem && (
              <>
                <DialogHeader>
                  <DialogTitle>Tinjau Proposal Karya</DialogTitle>
                  <DialogDescription>
                    Periksa kelayakan sinopsis, ide cerita, dan visual cover awal peserta.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4 md:grid-cols-3">
                  <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden border">
                    {reviewProposalItem.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={reviewProposalItem.cover} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Cover karya</div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Judul Komik</h3>
                      <p className="text-base font-bold mt-0.5">{reviewProposalItem.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Sinopsis</h3>
                      <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed text-foreground">{reviewProposalItem.synopsis}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Konsep Cerita</h3>
                      <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed text-foreground">{reviewProposalItem.story}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="reviewNote" className="text-xs font-semibold">Catatan Reviewer (Wajib diisi jika ditolak)</Label>
                  <Textarea
                    id="reviewNote"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Masukkan umpan balik, alasan penolakan, atau instruksi revisi..."
                    rows={3}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={isSubmittingProposalReview}
                    onClick={() => {
                      if (!reviewNote.trim()) {
                        toast.error("Wajib mengisi Catatan Reviewer jika menolak proposal.");
                        return;
                      }
                      handleProposalReview("rejected");
                    }}
                  >
                    Tolak Proposal
                  </Button>
                  <Button
                    disabled={isSubmittingProposalReview}
                    onClick={() => handleProposalReview("approved")}
                  >
                    Setujui Proposal
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ─── MODAL SUBMISSION REVIEW ──────────────────────── */}
        <Dialog open={submissionModalOpen} onOpenChange={setSubmissionModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {reviewSubmissionItem && (
              <>
                <DialogHeader>
                  <DialogTitle>Tinjau Hasil Tahap: {reviewSubmissionItem.stageTitle}</DialogTitle>
                  <DialogDescription>
                    Peserta: <strong className="text-foreground">{reviewSubmissionItem.participantName}</strong>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="p-4 border rounded-lg bg-muted/40 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama File:</span>
                      <span className="font-semibold max-w-[250px] truncate">{reviewSubmissionItem.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ukuran:</span>
                      <span className="font-semibold">{formatFileSize(reviewSubmissionItem.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waktu Upload:</span>
                      <span className="font-semibold">{formatDate(reviewSubmissionItem.submittedAt)}</span>
                    </div>
                  </div>

                  <a href={reviewSubmissionItem.file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors font-medium text-primary text-sm">
                    <ExternalLink className="h-4 w-4" /> Buka / Unduh Berkas PDF
                  </a>

                  <div className="space-y-2">
                    <Label htmlFor="subReviewNote" className="text-xs font-semibold">Catatan Validasi / Revisi</Label>
                    <Textarea
                      id="subReviewNote"
                      value={subReviewNote}
                      onChange={(e) => setSubReviewNote(e.target.value)}
                      placeholder="Tuliskan umpan balik atau revisi jika berkas tidak disetujui..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={isSubmittingSubReview}
                    onClick={() => {
                      if (!subReviewNote.trim()) {
                        toast.error("Wajib mengisi Catatan Validasi jika meminta revisi.");
                        return;
                      }
                      handleSubmissionReview("revision");
                    }}
                  >
                    Minta Revisi
                  </Button>
                  <Button
                    disabled={isSubmittingSubReview}
                    onClick={() => handleSubmissionReview("approved")}
                  >
                    Setujui & Loloskan
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* ─── TAB 4: PUBLIKASI KARYA ─────────────────────────── */}
      <TabsContent value="publications">
        <Card>
          <CardHeader>
            <CardTitle>Galeri Publikasi Karya Final</CardTitle>
            <CardDescription>Karya yang telah lolos tahap akhir (Finishing) dapat dipublikasikan untuk dibaca oleh masyarakat.</CardDescription>
          </CardHeader>
          <CardContent>
            {festival.participants.filter(p => p.work && p.work.status === "finished").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Belum ada karya peserta yang menyelesaikan seluruh tahapan (Finishing).
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {festival.participants
                  .filter(p => p.work && p.work.status === "finished")
                  .map((p) => {
                    const work = p.work!;
                    const pub = work.publication;
                    const isPublished = pub?.status === "published";

                    return (
                      <div key={work.id} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm items-start">
                        <div className="w-20 aspect-[3/4] bg-muted rounded border overflow-hidden shrink-0">
                          {work.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={work.cover} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">Karya</div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div>
                            <h3 className="font-bold text-sm truncate">{work.title}</h3>
                            <p className="text-xs text-muted-foreground">Karya: {work.author}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px]" variant={isPublished ? "default" : "secondary"}>
                              {isPublished ? "Dipublikasikan" : pub?.status === "withdrawn" ? "Ditarik" : "Belum Rilis"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="h-8 text-xs font-semibold w-full" variant={isPublished ? "outline" : "default"} onClick={() => handlePublishToggle(work.id, pub?.status || "unpublished")}>
                              {isPublished ? "Tarik Publikasi" : "Publikasikan"}
                            </Button>
                            {isPublished && (
                              <a href={`/karya/${work.id}`} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="secondary" className="h-8 w-8 p-0" title="Buka Pembaca Flipbook">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── DRAFT FILES CLEANUP CARD ─────────────────────────── */}
        <Card className="border-destructive/20 bg-destructive/5 mt-6">
          <CardHeader className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" /> Pembersihan Berkas Draf Tahapan
                </CardTitle>
                <CardDescription className="text-xs">
                  Hapus seluruh file PDF draf tahapan awal (sebelum tahap akhir) dari server untuk menghemat kapasitas disk storage. Berkas PDF Tahap Akhir & Cover Komik akan tetap disimpan dan aman.
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={isCleaningDrafts}
                onClick={handleCleanupDrafts}
                className="shrink-0 font-bold"
              >
                {isCleaningDrafts ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membersihkan...
                  </>
                ) : (
                  "Hapus PDF Draf Awal"
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
