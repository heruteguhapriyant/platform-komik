import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ParticipantSidebar from "@/components/participant/participant-sidebar";
import { Separator } from "@/components/ui/separator";

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "participant") {
    redirect("/admin/dashboard");
  }

  // Enforce profile completion check
  let profile = null;
  try {
    profile = await db.participantProfile.findUnique({
      where: { userId: session.user.id },
    });
  } catch (error) {
    console.error("Prisma error during profile validation check", error);
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ParticipantSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-6 justify-between bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <span className="text-sm font-medium text-muted-foreground">Panel Peserta</span>
            </div>
            <div className="flex items-center gap-4">
              {!profile && (
                <span className="hidden md:inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 animate-pulse border border-yellow-200">
                  Lengkapi Biodata Anda
                </span>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-foreground">{session.user.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{session.user.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                {session.user.name ? session.user.name[0].toUpperCase() : "P"}
              </div>
            </div>
          </header>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
