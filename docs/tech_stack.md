# Tech Stack — Platform Komik (Kastuart)

Dokumen ini berisi rincian teknologi (Tech Stack) yang digunakan dalam pengembangan platform **Kastuart — Platform Festival Komik Digital**.

---

## 1. Core Framework & Bahasa
* **[Next.js 16](https://nextjs.org/)** — React Framework (App Router, React Server Components & Server Actions)
* **[React 19](https://react.dev/)** — UI Library
* **[TypeScript 5](https://www.typescriptlang.org/)** — Type safety & Developer Experience

---

## 2. Database & ORM
* **[PostgreSQL](https://www.postgresql.org/)** — Database relasional utama
* **[Prisma ORM v6](https://www.prisma.io/)** — Object-Relational Mapping (ORM) untuk query database & migrasi schema (`@prisma/client`, `@prisma/adapter-pg`, dan `pg` driver)
* **`tsx`** — TypeScript execute engine untuk menjalankan script database seed (`prisma/seed.ts`)

---

## 3. Autentikasi & Keamanan
* **[NextAuth.js v5 (Auth.js)](https://authjs.dev/)** — Manajemen autentikasi session, role-based access, & provider token
* **[bcryptjs](https://github.com/dherault/bcryptjs)** — Enkripsi & hashing password user

---

## 4. Tampilan & UI (Design System)
* **[Tailwind CSS v4](https://tailwindcss.com/)** (`@tailwindcss/postcss`) — Utility-first CSS framework
* **[shadcn/ui](https://ui.shadcn.com/)** (berbasis `@base-ui/react`) — Component library untuk UI (Dialog, Button, Form, Modal, dll)
* **[Lucide React](https://lucide.dev/)** — Icon set modern
* **[Sonner](https://sonner.emilkowal.ski/)** — Toast notification system
* **[next-themes](https://github.com/pacocoursey/next-themes)** — Manajemen tema (Dark Mode / Light Mode)
* **Utility Styling**: `clsx`, `tailwind-merge`, `class-variance-authority` (cva), dan `tw-animate-css`

---

## 5. Komik Viewer & Pembaca Digital
* **[react-pageflip](https://github.com/NodirIrgashev/react-pageflip)** — Efek *flipbook* / membalik halaman komik interaktif
* **[react-pdf](https://github.com/wojtekmaj/react-pdf)** & **`pdfjs-dist`** — Rendering & pembaca file PDF berkas komik

---

## 6. Development & Quality Assurance
* **[ESLint 9](https://eslint.org/)** (`eslint-config-next`) — Code linting & static analysis
* **[dotenv](https://github.com/motdotla/dotenv)** — Pengelolaan environment variables
