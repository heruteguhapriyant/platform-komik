"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export type ProfileFormState = {
  error?: string;
  success?: boolean;
};

export async function saveProfileAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Tidak terautentikasi." };
  }

  const fullname = formData.get("fullname") as string;
  const nickname = formData.get("nickname") as string;
  const phone = formData.get("phone") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birthDate") as string;
  const address = formData.get("address") as string;
  const bio = formData.get("bio") as string;

  if (!fullname) {
    return { error: "Nama lengkap wajib diisi." };
  }

  try {
    await db.participantProfile.upsert({
      where: { userId: session.user.id },
      update: {
        fullname: fullname.trim(),
        nickname: nickname?.trim() || null,
        phone: phone?.trim() || null,
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address?.trim() || null,
        bio: bio?.trim() || null,
      },
      create: {
        userId: session.user.id,
        fullname: fullname.trim(),
        nickname: nickname?.trim() || null,
        phone: phone?.trim() || null,
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address?.trim() || null,
        bio: bio?.trim() || null,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to save profile", error);
    return { error: "Terjadi kesalahan saat menyimpan profil." };
  }
}
