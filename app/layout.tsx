import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Kastuart — Platform Festival Komik Digital",
    template: "%s | Kastuart",
  },
  description:
    "Platform festival dan lomba komik digital. Ikuti festival, kirim karya, dan baca komik dalam bentuk flipbook.",
  keywords: ["komik", "festival", "lomba", "digital", "flipbook"],
  openGraph: {
    title: "Kastuart — Platform Festival Komik Digital",
    description: "Platform festival dan lomba komik digital dengan flipbook.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
