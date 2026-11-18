import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      tag,
      sponsorName,
      isSponsor,
      imageUrl,
      ctaText,
      ctaLink,
      bgGradient,
      accentColor,
      orderNumber,
      isActive,
    } = body;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    const updated = await db.banner.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        description: description !== undefined ? description : existing.description,
        tag: tag !== undefined ? tag : existing.tag,
        sponsorName: sponsorName !== undefined ? sponsorName : existing.sponsorName,
        isSponsor: isSponsor !== undefined ? Boolean(isSponsor) : existing.isSponsor,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        ctaText: ctaText !== undefined ? ctaText : existing.ctaText,
        ctaLink: ctaLink !== undefined ? ctaLink : existing.ctaLink,
        bgGradient: bgGradient !== undefined ? bgGradient : existing.bgGradient,
        accentColor: accentColor !== undefined ? accentColor : existing.accentColor,
        orderNumber: orderNumber !== undefined ? Number(orderNumber) : existing.orderNumber,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/banners/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengbarui banner" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/banners/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus banner" }, { status: 500 });
  }
}
