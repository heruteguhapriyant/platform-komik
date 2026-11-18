"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Role, UserStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function updateUserRoleAction(
  id: string,
  role: Role
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  // Prevent self role change
  if (session.user.id === id) {
    return { error: "Anda tidak dapat mengubah role Anda sendiri." };
  }

  try {
    await db.user.update({
      where: { id },
      data: { role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role", error);
    return { error: "Gagal memperbarui role pengguna." };
  }
}

export async function updateUserStatusAction(
  id: string,
  status: UserStatus
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  // Prevent self ban
  if (session.user.id === id) {
    return { error: "Anda tidak dapat memblokir akun Anda sendiri." };
  }

  try {
    await db.user.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status", error);
    return { error: "Gagal memperbarui status pengguna." };
  }
}
