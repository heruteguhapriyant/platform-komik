import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/participant/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function ParticipantProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  let profile = null;
  let dbError = false;

  try {
    profile = await db.participantProfile.findUnique({
      where: { userId: session.user.id },
    });
  } catch (error) {
    console.error("Failed to load profile", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/5 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-destructive">Koneksi Database Gagal</CardTitle>
              <CardDescription>Koneksi database PostgreSQL tidak dapat dibangun.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pastikan server database PostgreSQL Anda telah diinstal dan sedang berjalan. 
              Periksa kembali kredensial database di file [`.env`](file:///d:/laragon/www/platform-komik/.env).
            </p>
            <div className="bg-muted p-3 rounded-md text-xs font-mono select-all overflow-x-auto">
              npx prisma db push
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProfileForm initialProfile={profile} userEmail={session.user.email ?? ""} />;
}
