import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ... sisanya tetap sama, tidak perlu diubah
  console.log("🌱 Seeding database...");

  // ─── Admin User ───────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kastuart.id" },
    update: {},
    create: {
      name: "Admin Kastuart",
      email: "admin@kastuart.id",
      password: adminPassword,
      role: "admin",
      status: "active",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ─── Demo Participant ──────────────────────────────────
  const participantPassword = await bcrypt.hash("peserta123", 12);
  const participant = await prisma.user.upsert({
    where: { email: "peserta@kastuart.id" },
    update: {},
    create: {
      name: "Demo Peserta",
      email: "peserta@kastuart.id",
      password: participantPassword,
      role: "participant",
      status: "active",
      profile: {
        create: {
          fullname: "Demo Peserta",
          nickname: "Demo",
          phone: "08123456789",
          bio: "Komikus muda yang penuh semangat.",
        },
      },
    },
  });
  console.log("✅ Participant created:", participant.email);

  // ─── Categories ───────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "komik-anak" },
      update: {},
      create: {
        name: "Komik Anak",
        slug: "komik-anak",
        description: "Festival komik untuk usia anak-anak (7–12 tahun)",
      },
    }),
    prisma.category.upsert({
      where: { slug: "komik-remaja" },
      update: {},
      create: {
        name: "Komik Remaja",
        slug: "komik-remaja",
        description: "Festival komik untuk usia remaja (13–18 tahun)",
      },
    }),
    prisma.category.upsert({
      where: { slug: "komik-umum" },
      update: {},
      create: {
        name: "Komik Umum",
        slug: "komik-umum",
        description: "Festival komik terbuka untuk semua usia",
      },
    }),
    prisma.category.upsert({
      where: { slug: "komik-webtoon" },
      update: {},
      create: {
        name: "Webtoon",
        slug: "komik-webtoon",
        description: "Festival khusus format webtoon/scroll komik",
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // ─── Demo Festival ────────────────────────────────────
  const festival = await prisma.festival.upsert({
    where: { slug: "festival-komik-nasional-2026" },
    update: {},
    create: {
      title: "Festival Komik Nasional 2026",
      slug: "festival-komik-nasional-2026",
      categoryId: categories[2].id, // Komik Umum
      description:
        "Festival komik digital nasional tahunan yang terbuka untuk seluruh komikus Indonesia. Tunjukkan kreativitasmu dan raih hadiah menarik!",
      status: "published",
      startRegistration: new Date("2026-07-01"),
      endRegistration: new Date("2026-08-01"),
      startEvent: new Date("2026-08-05"),
      endEvent: new Date("2026-10-31"),
      createdById: admin.id,
      stages: {
        create: [
          {
            title: "Administrasi",
            description: "Kelengkapan berkas dan verifikasi identitas peserta",
            orderNumber: 1,
            deadline: new Date("2026-08-15"),
          },
          {
            title: "Sketch",
            description: "Upload sketch/storyboard komik",
            orderNumber: 2,
            deadline: new Date("2026-09-01"),
          },
          {
            title: "Line Art",
            description: "Upload hasil line art komik",
            orderNumber: 3,
            deadline: new Date("2026-09-15"),
          },
          {
            title: "Coloring",
            description: "Upload hasil pewarnaan komik",
            orderNumber: 4,
            deadline: new Date("2026-10-01"),
          },
          {
            title: "Finishing",
            description: "Upload karya final komik dalam format PDF",
            orderNumber: 5,
            deadline: new Date("2026-10-20"),
          },
        ],
      },
    },
  });
  console.log("✅ Demo festival created:", festival.title);

  console.log("\n🎉 Seeding completed!");
  console.log("─────────────────────────────────────");
  console.log("Admin login: admin@kastuart.id / admin123");
  console.log("Peserta login: peserta@kastuart.id / peserta123");
  console.log("─────────────────────────────────────");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
