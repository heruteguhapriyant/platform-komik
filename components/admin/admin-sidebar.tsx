"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  Trophy,
  Users,
  Settings,
  LogOut,
  Menu,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Kategori",
    href: "/admin/categories",
    icon: FolderKanban,
  },
  {
    title: "Acara / Festival",
    href: "/admin/festivals",
    icon: Trophy,
  },
  {
    title: "Pengguna / User",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Banner & Sponsor",
    href: "/admin/banners",
    icon: BookOpen,
  },
  {
    title: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-2 font-bold text-lg">
          <BookOpen className="h-6 w-6 text-primary shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Kastuart Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {adminNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
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
