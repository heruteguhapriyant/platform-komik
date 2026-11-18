"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  LayoutDashboard,
  UserCircle,
  LogOut,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const participantNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profil & Biodata",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
];

export default function ParticipantSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 font-bold text-lg">
          <BookOpen className="h-6 w-6 text-primary shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Kastuart</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {participantNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                        isActive
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    />
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Keluar</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
