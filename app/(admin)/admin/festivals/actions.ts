"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { FestivalStatus, ProposalStatus, SubmissionStatus, PublicationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import { join } from "path";

export type FestivalFormState = {
  error?: string;
  success?: boolean;
  id?: string;
};

// ─── FESTIVAL CRUD ──────────────────────────────────────────

export async function createFestivalAction(
  prevState: FestivalFormState,
  formData: FormData
): Promise<FestivalFormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  const title = formData.get("title") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const poster = formData.get("poster") as string;
  const startRegistration = formData.get("startRegistration") as string;
  const endRegistration = formData.get("endRegistration") as string;
  const startEvent = formData.get("startEvent") as string;
  const endEvent = formData.get("endEvent") as string;

  if (!title || !categoryId) {
    return { error: "Judul dan kategori wajib diisi." };
  }

  const slug = slugify(title);

  try {
    const existing = await db.festival.findUnique({ where: { slug } });
    if (existing) {
      return { error: "Festival dengan judul serupa sudah ada." };
    }

    const festival = await db.festival.create({
      data: {
        title: title.trim(),
        slug,
        categoryId,
        description: description?.trim() || null,
        poster: poster?.trim() || null,
        startRegistration: startRegistration ? new Date(startRegistration) : null,
        endRegistration: endRegistration ? new Date(endRegistration) : null,
        startEvent: startEvent ? new Date(startEvent) : null,
        endEvent: endEvent ? new Date(endEvent) : null,
        status: "draft",
        createdById: session.user.id,
      },
    });

    // Create default stages as a helper
    await db.festivalStage.createMany({
      data: [
        { festivalId: festival.id, title: "Administrasi", orderNumber: 1, description: "Pengumpulan berkas" },
        { festivalId: festival.id, title: "Finishing", orderNumber: 2, description: "Karya Akhir (PDF)" },
      ],
    });

    revalidatePath("/admin/festivals");
    return { success: true, id: festival.id };
  } catch (error) {
    console.error("Failed to create festival", error);
    return { error: "Gagal membuat festival baru." };
  }
}

export async function updateFestivalAction(
  id: string,
  prevState: FestivalFormState,
  formData: FormData
): Promise<FestivalFormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  const title = formData.get("title") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const poster = formData.get("poster") as string;
  const startRegistration = formData.get("startRegistration") as string;
  const endRegistration = formData.get("endRegistration") as string;
  const startEvent = formData.get("startEvent") as string;
  const endEvent = formData.get("endEvent") as string;

  if (!title || !categoryId) {
    return { error: "Judul dan kategori wajib diisi." };
  }

  const slug = slugify(title);

  try {
    const existing = await db.festival.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return { error: "Festival dengan judul serupa sudah ada." };
    }

    await db.festival.update({
      where: { id },
      data: {
        title: title.trim(),
        slug,
        categoryId,
        description: description?.trim() || null,
        poster: poster?.trim() || null,
        startRegistration: startRegistration ? new Date(startRegistration) : null,
        endRegistration: endRegistration ? new Date(endRegistration) : null,
        startEvent: startEvent ? new Date(startEvent) : null,
        endEvent: endEvent ? new Date(endEvent) : null,
      },
    });

    revalidatePath(`/admin/festivals/${id}`);
    revalidatePath("/admin/festivals");
    return { success: true };
  } catch (error) {
    console.error("Failed to update festival", error);
    return { error: "Gagal memperbarui data festival." };
  }
}

export async function updateFestivalStatusAction(
  id: string,
  status: FestivalStatus
): Promise<{ success?: boolean; error?: string }> {
  try {
    await db.festival.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/admin/festivals/${id}`);
    revalidatePath("/admin/festivals");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status", error);
    return { error: "Gagal memperbarui status festival." };
  }
}

export async function deleteFestivalAction(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  try {
    const festival = await db.festival.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            work: {
              include: {
                submissions: true,
                publication: true,
              },
            },
            proposal: true,
          },
        },
        stages: true,
      },
    });

    if (!festival) {
      return { error: "Festival tidak ditemukan." };
    }

    // Clean up related sub-records safely
    for (const p of festival.participants) {
      if (p.work) {
        if (p.work.publication) {
          await db.publication.delete({ where: { id: p.work.publication.id } }).catch(() => {});
        }
        await db.submission.deleteMany({ where: { workId: p.work.id } }).catch(() => {});
        await db.work.delete({ where: { id: p.work.id } }).catch(() => {});
      }
      if (p.proposal) {
        await db.proposal.delete({ where: { id: p.proposal.id } }).catch(() => {});
      }
    }

    await db.festivalParticipant.deleteMany({ where: { festivalId: id } }).catch(() => {});
    await db.festivalStage.deleteMany({ where: { festivalId: id } }).catch(() => {});
    await db.festival.delete({ where: { id } });

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    revalidatePath("/festival");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete festival", error);
    return { error: "Gagal menghapus festival." };
  }
}

// ─── STAGE CRUD ─────────────────────────────────────────────

export async function manageStagesAction(
  festivalId: string,
  stages: { id?: string; title: string; description?: string; orderNumber: number; deadline?: string }[]
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Delete stages not present in the new list
    const incomingIds = stages.filter(s => s.id).map(s => s.id as string);
    await db.festivalStage.deleteMany({
      where: {
        festivalId,
        id: { notIn: incomingIds },
      },
    });

    // Upsert remaining stages
    for (const stage of stages) {
      if (stage.id) {
        await db.festivalStage.update({
          where: { id: stage.id },
          data: {
            title: stage.title,
            description: stage.description || null,
            orderNumber: stage.orderNumber,
            deadline: stage.deadline ? new Date(stage.deadline) : null,
          },
        });
      } else {
        await db.festivalStage.create({
          data: {
            festivalId,
            title: stage.title,
            description: stage.description || null,
            orderNumber: stage.orderNumber,
            deadline: stage.deadline ? new Date(stage.deadline) : null,
          },
        });
      }
    }

    revalidatePath(`/admin/festivals/${festivalId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to manage stages", error);
    return { error: "Gagal memperbarui tahapan festival." };
  }
}

// ─── PROPOSAL REVIEW ────────────────────────────────────────

export async function reviewProposalAction(
  proposalId: string,
  status: ProposalStatus,
  reviewNote?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const proposal = await db.proposal.update({
      where: { id: proposalId },
      data: {
        status,
        reviewNote: reviewNote || null,
        approvedAt: status === "approved" ? new Date() : null,
      },
      include: {
        festivalParticipant: {
          include: { user: true, festival: true },
        },
      },
    });

    const participant = proposal.festivalParticipant;

    if (status === "approved") {
      // 1. Update participant status to active
      await db.festivalParticipant.update({
        where: { id: participant.id },
        data: { status: "active" },
      });

      // 2. Create the work item automatically
      await db.work.upsert({
        where: { festivalParticipantId: participant.id },
        update: {},
        create: {
          festivalParticipantId: participant.id,
          title: proposal.title,
          author: participant.user.name,
          description: proposal.synopsis,
          cover: proposal.cover,
          status: "ongoing",
        },
      });
    } else if (status === "rejected") {
      // Set participant status back to proposal_review or registered
      await db.festivalParticipant.update({
        where: { id: participant.id },
        data: { status: "proposal_review" }, // Can revise proposal
      });
    }

    revalidatePath(`/admin/festivals/${participant.festivalId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to review proposal", error);
    return { error: "Gagal mengirim ulasan proposal." };
  }
}

// ─── SUBMISSION REVIEW ──────────────────────────────────────

export async function reviewSubmissionAction(
  submissionId: string,
  status: SubmissionStatus,
  reviewNote?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Tidak terautentikasi." };

  try {
    const submission = await db.submission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
      include: {
        work: {
          include: {
            festivalParticipant: {
              include: { festival: { include: { stages: true } } },
            },
          },
        },
        festivalStage: true,
      },
    });

    const work = submission.work;
    const stages = work.festivalParticipant.festival.stages.sort((a, b) => a.orderNumber - b.orderNumber);
    const finalStage = stages[stages.length - 1];

    if (status === "approved") {
      // If it was the final stage (Finishing), complete the work
      if (submission.festivalStageId === finalStage.id) {
        await db.work.update({
          where: { id: work.id },
          data: { status: "finished" },
        });

        await db.festivalParticipant.update({
          where: { id: work.festivalParticipantId },
          data: { status: "completed" },
        });

        // Initialize publication record automatically as unpublished
        await db.publication.upsert({
          where: { workId: work.id },
          update: {},
          create: {
            workId: work.id,
            status: "unpublished",
          },
        });
      }
    }

    revalidatePath(`/admin/festivals/${work.festivalParticipant.festivalId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to review submission", error);
    return { error: "Gagal mengirim ulasan submission." };
  }
}

// ─── PUBLICATION MANAGEMENT ─────────────────────────────────

export async function managePublicationAction(
  workId: string,
  status: PublicationStatus
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  try {
    await db.publication.update({
      where: { workId },
      data: {
        status,
        publishedAt: status === "published" ? new Date() : null,
        publishedById: status === "published" ? session.user.id : null,
      },
      include: {
        work: {
          include: { festivalParticipant: true },
        },
      },
    });

    // Revalidate paths
    const pub = await db.publication.findUnique({
      where: { workId },
      include: { work: { include: { festivalParticipant: true } } },
    });

    if (pub) {
      revalidatePath(`/admin/festivals/${pub.work.festivalParticipant.festivalId}`);
      revalidatePath(`/karya/${workId}`);
    }

    revalidatePath("/");
    revalidatePath("/festival");
    return { success: true };
  } catch (error) {
    console.error("Failed to manage publication", error);
    return { error: "Gagal mengelola publikasi karya." };
  }
}

// ─── DRAFT CLEANUP MANAGEMENT ───────────────────────────────

export async function cleanupDraftSubmissionsAction(
  festivalId: string
): Promise<{ success?: boolean; error?: string; deletedCount?: number }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Tidak memiliki hak akses." };
  }

  try {
    const festival = await db.festival.findUnique({
      where: { id: festivalId },
      include: {
        stages: {
          orderBy: { orderNumber: "asc" },
        },
        participants: {
          include: {
            work: {
              include: {
                submissions: {
                  include: { festivalStage: true },
                },
              },
            },
          },
        },
      },
    });

    if (!festival || festival.stages.length === 0) {
      return { error: "Festival atau tahapan tidak ditemukan." };
    }

    // Maximum orderNumber is the final stage
    const maxOrderNumber = Math.max(...festival.stages.map((s) => s.orderNumber));
    let deletedCount = 0;

    for (const p of festival.participants) {
      if (!p.work) continue;
      for (const sub of p.work.submissions) {
        // If submission belongs to a stage BEFORE the final stage
        if (sub.festivalStage.orderNumber < maxOrderNumber) {
          if (sub.file && sub.file.startsWith("/uploads/")) {
            const relativePath = sub.file.replace(/^\//, "");
            const fullPath = join(process.cwd(), "public", relativePath);
            try {
              await unlink(fullPath);
            } catch (err) {
              console.warn("Could not delete file at path:", fullPath, err);
            }
          }

          // Clear file path reference in DB
          await db.submission.update({
            where: { id: sub.id },
            data: {
              file: "",
              fileName: sub.fileName.includes("(Dibersihkan)")
                ? sub.fileName
                : `${sub.fileName} (Dibersihkan)`,
            },
          });

          deletedCount++;
        }
      }
    }

    revalidatePath(`/admin/festivals/${festivalId}`);
    return { success: true, deletedCount };
  } catch (error) {
    console.error("Failed to cleanup draft submissions", error);
    return { error: "Gagal membersihkan berkas draf." };
  }
}

