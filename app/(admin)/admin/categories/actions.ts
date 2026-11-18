"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export type CategoryFormState = {
  error?: string;
  success?: boolean;
};

export async function createCategoryAction(
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Nama kategori wajib diisi." };
  }

  const slug = slugify(name);

  try {
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: "Kategori dengan nama serupa sudah ada." };
    }

    await db.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category", error);
    return { error: "Terjadi kesalahan pada server saat membuat kategori." };
  }
}

export async function updateCategoryAction(
  id: string,
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Nama kategori wajib diisi." };
  }

  const slug = slugify(name);

  try {
    const existing = await db.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });
    if (existing) {
      return { error: "Kategori dengan nama serupa sudah ada." };
    }

    await db.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category", error);
    return { error: "Terjadi kesalahan pada server saat memperbarui kategori." };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string; success?: boolean }> {
  try {
    // Check if category is used in festivals
    const count = await db.festival.count({ where: { categoryId: id } });
    if (count > 0) {
      return { error: "Tidak dapat menghapus kategori yang sedang digunakan oleh festival." };
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category", error);
    return { error: "Terjadi kesalahan saat menghapus kategori." };
  }
}
