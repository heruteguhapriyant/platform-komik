"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validations
  if (!name || !email || !password || !confirmPassword) {
    return { error: "Semua field wajib diisi." };
  }

  if (name.trim().length < 2) {
    return { error: "Nama minimal 2 karakter." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Password dan konfirmasi password tidak sama." };
  }

  // Check email uniqueness
  const existingUser = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "Email sudah terdaftar. Silakan gunakan email lain." };
  }

  // Create user
  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "participant",
      status: "active",
    },
  });

  redirect("/login?registered=true");
}
