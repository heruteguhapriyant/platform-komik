"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus, Search, Calendar, FolderOpen, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { deleteFestivalAction } from "@/app/(admin)/admin/festivals/actions";
import { toast } from "sonner";
import FestivalFormDialog from "./festival-form-dialog";

interface Category {
  id: string;
  name: string;
}

interface Festival {
  id: string;
  title: string;
  categoryId: string;
  description: string | null;
  poster: string | null;
  startRegistration: Date | null;
  endRegistration: Date | null;
  startEvent: Date | null;
  endEvent: Date | null;
  status: string;
  createdAt: Date;
  category: { name: string };
  _count: { participants: number };
}

interface FestivalsListProps {
  initialFestivals: Festival[];
  categories: Category[];
}

export default function FestivalsList({ initialFestivals, categories }: FestivalsListProps) {
  const [festivals, setFestivals] = useState<Festival[]>(initialFestivals);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  // Sync state if initial changes
  useEffect(() => {
    setFestivals(initialFestivals);
  }, [initialFestivals]);

  const handleEdit = (festival: Festival, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFestival(festival);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setSelectedFestival(null);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus festival ini? Semua data relasi (tahapan, peserta, submission) juga akan terhapus.")) return;

    try {
      const res = await deleteFestivalAction(id);
      if (res.success) {
        toast.success("Festival berhasil dihapus!");
        setFestivals(festivals.filter((f) => f.id !== id));
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus festival.");
    }
  };

  const filteredFestivals = festivals.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acara / Festival</h1>
          <p className="text-muted-foreground mt-1">
            Buat, edit, dan pantau seluruh siklus acara festival komik digital.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Buat Festival
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari festival..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Acara</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Peserta</TableHead>
              <TableHead>Pendaftaran</TableHead>
              <TableHead className="text-right w-40">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFestivals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto opacity-30 mb-2" />
                  Belum ada festival yang dibuat.
                </TableCell>
              </TableRow>
            ) : (
              filteredFestivals.map((festival) => (
                <TableRow key={festival.id} className="group cursor-pointer hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold">
                    <Link href={`/admin/festivals/${festival.id}`} className="hover:underline hover:text-primary block">
                      {festival.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{festival.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <FestivalStatusBadge status={festival.status} />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {festival._count.participants}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {festival.startRegistration && festival.endRegistration ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {formatDate(festival.startRegistration)} - {formatDate(festival.endRegistration)}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/festivals/${festival.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEdit(festival, e)}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(festival.id, e)}
                        title="Hapus Festival"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FestivalFormDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSelectedFestival(null);
        }}
        categories={categories}
        festival={selectedFestival}
      />
    </div>
  );
}

function FestivalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "link" }> = {
    draft: { label: "Draft", variant: "outline" },
    published: { label: "Published", variant: "default" },
    registration_closed: { label: "Reg closed", variant: "secondary" },
    judging: { label: "Judging", variant: "outline" },
    finished: { label: "Finished", variant: "secondary" },
    archived: { label: "Archived", variant: "secondary" },
  };
  const config = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant} className="text-[10px] uppercase font-bold">{config.label}</Badge>;
}
