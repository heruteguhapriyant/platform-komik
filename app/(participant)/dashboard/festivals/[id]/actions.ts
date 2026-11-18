"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// ─── JOIN FESTIVAL ──────────────────────────────────────────

export async function joinFestivalAction(
  festivalId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Tidak terautentikasi." };

  try {
    // Check profile
    const profile = await db.participantProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return { error: "Harap lengkapi biodata Anda terlebih dahulu sebelum mengikuti festival." };
    }

    // Check existing
    const existing = await db.festivalParticipant.findUnique({
      where: {
        festivalId_userId: { festivalId, userId: session.user.id },
      },
    });

    if (existing) {
      return { error: "Anda sudah terdaftar dalam festival ini." };
    }

    // Create participation
    await db.festivalParticipant.create({
      data: {
        festivalId,
        userId: session.user.id,
        status: "registered",
      },
    });

    revalidatePath(`/dashboard/festivals/${festivalId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to join festival", error);
    return { error: "Gagal mengikuti festival." };
  }
}

// ─── SUBMIT PROPOSAL ────────────────────────────────────────

export async function submitProposalAction(
  participantId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const title = formData.get("title") as string;
  const synopsis = formData.get("synopsis") as string;
  const story = formData.get("story") as string;
  const cover = formData.get("cover") as string;

  if (!title || !synopsis || !story) {
    return { error: "Judul, sinopsis, dan cerita wajib diisi." };
  }

  try {
    const participant = await db.festivalParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant) return { error: "Peserta tidak ditemukan." };

    // Upsert proposal
    await db.proposal.upsert({
      where: { festivalParticipantId: participantId },
      update: {
        title: title.trim(),
        synopsis: synopsis.trim(),
        story: story.trim(),
        cover: cover || null,
        status: "pending",
        reviewNote: null,
      },
      create: {
        festivalParticipantId: participantId,
        title: title.trim(),
        synopsis: synopsis.trim(),
        story: story.trim(),
        cover: cover || null,
        status: "pending",
      },
    });

    // Update participant status
    await db.festivalParticipant.update({
      where: { id: participantId },
      data: { status: "proposal_review" },
    });

    revalidatePath(`/dashboard/festivals/${participant.festivalId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit proposal", error);
    return { error: "Gagal mengirim proposal." };
  }
}

// ─── SUBMIT SUBMISSION ──────────────────────────────────────

export async function submitStageSubmissionAction(
  workId: string,
  stageId: string,
  fileUrl: string,
  fileName: string,
  fileSize: number
): Promise<{ success?: boolean; error?: string }> {
  if (!fileUrl) return { error: "Berkas wajib diunggah." };

  try {
    const work = await db.work.findUnique({
      where: { id: workId },
      include: { festivalParticipant: true },
    });

    if (!work) return { error: "Karya tidak ditemukan." };

    // Upsert submission
    await db.submission.create({
      data: {
        workId,
        festivalStageId: stageId,
        file: fileUrl,
        fileName,
        fileSize,
        status: "pending",
        reviewNote: null,
      },
    });

    revalidatePath(`/dashboard/festivals/${work.festivalParticipant.festivalId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit stage files", error);
    return { error: "Gagal mengirim berkas tahapan." };
  }
}
