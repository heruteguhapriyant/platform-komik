import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Shield, Award } from "lucide-react";

export default function PublicAboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12 flex-1 flex flex-col justify-center">
      <div className="text-center space-y-3">
        <BookOpen className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Tentang Kastuart</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          Kastuart adalah platform digital festival dan kompetisi komik digital nasional, 
          mempertemukan kreator berbakat dengan pencinta komik di Indonesia.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="text-center p-6 space-y-3">
          <Award className="h-8 w-8 text-primary mx-auto" />
          <CardTitle className="text-sm font-bold">Lomba Berjenjang</CardTitle>
          <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed">
            Peserta mengirimkan hasil karya mereka tahap demi tahap, mulai dari administrasi, storyboard, hingga pewarnaan.
          </CardContent>
        </Card>

        <Card className="text-center p-6 space-y-3">
          <Shield className="h-8 w-8 text-primary mx-auto" />
          <CardTitle className="text-sm font-bold">Kurasi & Validasi</CardTitle>
          <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed">
            Setiap unggahan ditinjau langsung secara ketat oleh dewan juri/admin demi menjaga kualitas karya.
          </CardContent>
        </Card>

        <Card className="text-center p-6 space-y-3">
          <BookOpen className="h-8 w-8 text-primary mx-auto" />
          <CardTitle className="text-sm font-bold">Flipbook Reader</CardTitle>
          <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed">
            Membaca hasil komik final dalam format lembar halaman digital interaktif yang nyata dan memukau.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
