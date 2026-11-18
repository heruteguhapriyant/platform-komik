"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCategoryAction, updateCategoryAction } from "@/app/(admin)/admin/categories/actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
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

export default function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEdit = !!category;

  const actionWithId = isEdit
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;

  const [state, formAction] = useActionState(actionWithId, {});
  const handledStateRef = useRef<any>(null);

  useEffect(() => {
    if (state && state !== handledStateRef.current) {
      if (state.success) {
        handledStateRef.current = state;
        toast.success(
          isEdit ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!"
        );
        onOpenChange(false);
      } else if (state.error) {
        handledStateRef.current = state;
        toast.error(state.error);
      }
    }
  }, [state, isEdit, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Perbarui informasi kategori festival komik digital ini."
                : "Buat kategori baru untuk mengelompokkan festival komik digital."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category?.name || ""}
                placeholder="Contoh: Komik Remaja"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={category?.description || ""}
                placeholder="Penjelasan singkat mengenai kategori ini..."
                rows={3}
              />
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
