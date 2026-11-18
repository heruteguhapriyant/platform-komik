import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: [{ orderNumber: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("GET /api/admin/banners error:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    if (!title) {
      return NextResponse.json({ error: "Judul banner wajib diisi" }, { status: 400 });
    }

    const newBanner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        tag: tag || null,
        sponsorName: sponsorName || null,
        isSponsor: Boolean(isSponsor),
        imageUrl: imageUrl || null,
        ctaText: ctaText || "BACA SEKARANG",
        ctaLink: ctaLink || "/festival",
        bgGradient: bgGradient || "from-slate-900 via-indigo-950 to-slate-900",
        accentColor: accentColor || "from-cyan-400 to-blue-600",
        orderNumber: Number(orderNumber) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/banners error:", error);
    return NextResponse.json({ error: "Gagal membuat banner" }, { status: 500 });
  }
}
