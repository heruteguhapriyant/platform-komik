import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Website</h1>
        <p className="text-muted-foreground mt-1">
          Konfigurasi logo, nama website, branding, dan preferensi umum.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Identitas & Branding</CardTitle>
            <CardDescription>Sesuaikan tampilan visual publik platform festival komik Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Nama Platform</Label>
              <Input id="siteName" defaultValue="Kastuart" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteDesc">Slogan Platform</Label>
              <Input id="siteDesc" defaultValue="Platform Festival Komik Digital dengan Flipbook" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteBranding">Logo Text</Label>
              <div className="flex gap-2 items-center">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Kastuart</span>
              </div>
            </div>
            <Button className="w-full">Simpan Pengaturan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
