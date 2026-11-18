"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { ImageUploadInput } from "@/components/ui/image-upload-input";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createFestivalAction, updateFestivalAction } from "@/app/(admin)/admin/festivals/actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
}

interface FestivalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  festival?: Festival | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        "Simpan"
      )}
    </Button>
  );
}

export default function FestivalFormDialog({
  open,
  onOpenChange,
  categories,
  festival,
}: FestivalFormDialogProps) {
  const router = useRouter();
  const isEdit = !!festival;
  const [posterUrl, setPosterUrl] = useState(festival?.poster || "");

  useEffect(() => {
    setPosterUrl(festival?.poster || "");
  }, [festival, open]);

  const actionWithId = isEdit
    ? updateFestivalAction.bind(null, festival.id)
    : createFestivalAction;

  const [state, formAction] = useActionState(actionWithId, {});
  const handledStateRef = useRef<any>(null);

  useEffect(() => {
    if (state && state !== handledStateRef.current) {
      if (state.success) {
        handledStateRef.current = state;
        toast.success(
          isEdit ? "Festival berhasil diperbarui!" : "Festival baru berhasil dibuat!"
        );
        onOpenChange(false);
        if (state.id) {
          router.push(`/admin/festivals/${state.id}`);
        } else {
          router.refresh();
        }
      } else if (state.error) {
        handledStateRef.current = state;
        toast.error(state.error);
      }
    }
  }, [state, isEdit, onOpenChange, router]);

  // Helper to format date for input field type="date"
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Festival" : "Buat Festival Baru"}</DialogTitle>
            <DialogDescription>
              Isi data festival. Festival baru akan dibuat sebagai status **Draft** dan mendapatkan 2 tahapan default.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Festival</Label>
              <Input
                id="title"
                name="title"
                defaultValue={festival?.title || ""}
                placeholder="Contoh: Festival Komik Nusantara 2026"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoryId">Kategori</Label>
              <Select name="categoryId" defaultValue={festival?.categoryId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="poster">Poster Festival (Gambar)</Label>
              <ImageUploadInput
                id="poster"
                name="poster"
                value={posterUrl}
                onChange={setPosterUrl}
                placeholder="Contoh: https://example.com/poster.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={festival?.description || ""}
                placeholder="Detail deskripsi mengenai kompetisi festival ini..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startRegistration">Mulai Pendaftaran</Label>
                <Input
                  id="startRegistration"
                  name="startRegistration"
                  type="date"
                  defaultValue={formatDateForInput(festival?.startRegistration || null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endRegistration">Selesai Pendaftaran</Label>
                <Input
                  id="endRegistration"
                  name="endRegistration"
                  type="date"
                  defaultValue={formatDateForInput(festival?.endRegistration || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startEvent">Event Dimulai</Label>
                <Input
                  id="startEvent"
                  name="startEvent"
                  type="date"
                  defaultValue={formatDateForInput(festival?.startEvent || null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endEvent">Event Berakhir</Label>
                <Input
                  id="endEvent"
                  name="endEvent"
                  type="date"
                  defaultValue={formatDateForInput(festival?.endEvent || null)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
