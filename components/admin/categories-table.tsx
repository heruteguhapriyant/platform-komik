"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus, FolderOpen } from "lucide-react";
import { deleteCategoryAction } from "@/app/(admin)/admin/categories/actions";
import { toast } from "sonner";
import CategoryFormDialog from "./category-form-dialog";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    festivals: number;
  };
}

interface CategoriesTableProps {
  initialCategories: Category[];
}

export default function CategoriesTable({ initialCategories }: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Sync state if initial changes (e.g. from server action revalidation)
  if (initialCategories.length !== categories.length) {
    setCategories(initialCategories);
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        toast.success("Kategori berhasil dihapus!");
        setCategories(categories.filter((c) => c.id !== id));
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus kategori.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground mt-1">
            Kelola kategori untuk pengelompokan festival komik.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-center w-32">Total Festival</TableHead>
              <TableHead className="text-right w-32">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto opacity-30 mb-2" />
                  Belum ada kategori yang dibuat.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {category._count?.festivals || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            // Re-sync with actual data on closure
            setSelectedCategory(null);
          }
        }}
        category={selectedCategory}
      />
    </div>
  );
}
