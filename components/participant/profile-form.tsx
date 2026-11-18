"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveProfileAction } from "@/app/(participant)/dashboard/profile/actions";
import { toast } from "sonner";
import { Loader2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
  fullname: string;
  nickname: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: Date | null;
  address: string | null;
  bio: string | null;
}

interface ProfileFormProps {
  initialProfile: Profile | null;
  userEmail: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} id="btn-save-profile">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menyimpan Profil...
        </>
      ) : (
        "Simpan Perubahan"
      )}
    </Button>
  );
}

export default function ProfileForm({ initialProfile, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveProfileAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("Profil Anda berhasil diperbarui!");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biodata Profil</h1>
        <p className="text-muted-foreground mt-1">
          Lengkapi biodata diri Anda. Profil lengkap merupakan syarat wajib untuk mengikuti festival.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Informasi Pribadi
          </CardTitle>
          <CardDescription>Detail ini digunakan untuk keperluan administrasi dan pencetakan sertifikat/karya.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Akun)</Label>
              <Input id="email" value={userEmail} disabled className="bg-muted/50" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullname">Nama Lengkap (Sesuai KTP/Identitas)</Label>
              <Input
                id="fullname"
                name="fullname"
                defaultValue={initialProfile?.fullname || ""}
                placeholder="Nama lengkap Anda"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nickname">Nama Panggilan / Penulis</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  defaultValue={initialProfile?.nickname || ""}
                  placeholder="Contoh: KastuArt"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={initialProfile?.phone || ""}
                  placeholder="Contoh: 0812345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select name="gender" defaultValue={initialProfile?.gender || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={formatDateForInput(initialProfile?.birthDate || null)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Alamat Domisili</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={initialProfile?.address || ""}
                placeholder="Alamat lengkap tempat tinggal saat ini..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio Singkat / Deskripsi Diri</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={initialProfile?.bio || ""}
                placeholder="Ceritakan sedikit tentang ketertarikan Anda pada komik..."
                rows={3}
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
