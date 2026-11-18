import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const dashboardUrl = session?.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Kastuart</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/festival" className="text-muted-foreground hover:text-foreground transition-colors">
              Festival
            </Link>
            <Link href="/tentang" className="text-muted-foreground hover:text-foreground transition-colors">
              Tentang
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href={dashboardUrl}>
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/30 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Kastuart</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Kastuart. Platform Festival Komik Digital dengan Flipbook.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/festival" className="hover:text-foreground transition-colors">Festival</Link>
              <Link href="/tentang" className="hover:text-foreground transition-colors">Tentang</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
