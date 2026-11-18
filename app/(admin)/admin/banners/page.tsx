"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Flame,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { ImageUploadInput } from "@/components/ui/image-upload-input";

interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  tag: string | null;
  sponsorName: string | null;
  isSponsor: boolean;
  imageUrl: string | null;
  ctaText: string;
  ctaLink: string;
  bgGradient: string | null;
  accentColor: string | null;
  orderNumber: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Editing state
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    tag: "SPECIAL FEATURED",
    sponsorName: "",
    isSponsor: false,
    imageUrl: "",
    ctaText: "BACA SEKARANG",
    ctaLink: "/festival",
    bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
    accentColor: "from-cyan-400 to-blue-600",
    orderNumber: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error("Fetch banners error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      tag: "SPOTLIGHT PROMO",
      sponsorName: "",
      isSponsor: false,
      imageUrl: "",
      ctaText: "BACA SEKARANG",
      ctaLink: "/festival",
      bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
      accentColor: "from-cyan-400 to-blue-600",
      orderNumber: banners.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      tag: banner.tag || "",
      sponsorName: banner.sponsorName || "",
      isSponsor: banner.isSponsor,
      imageUrl: banner.imageUrl || "",
      ctaText: banner.ctaText || "BACA SEKARANG",
      ctaLink: banner.ctaLink || "/festival",
      bgGradient: banner.bgGradient || "from-slate-900 via-indigo-950 to-slate-900",
      accentColor: banner.accentColor || "from-cyan-400 to-blue-600",
      orderNumber: banner.orderNumber,
      isActive: banner.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : "/api/admin/banners";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchBanners();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menyimpan banner");
      }
    } catch (err) {
      console.error("Submit banner error:", err);
      alert("Terjadi kesalahan saat menyimpan banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error("Delete banner error:", err);
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Manajemen Banner & Sponsor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola banner promosi komik, event spotlight, dan logo sponsor yang tampil di halaman utama.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Tambah Banner / Sponsor
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Belum Ada Banner Kostum</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            Halaman utama saat ini menggunakan banner sampel bawaan. Klik tombol di bawah untuk menambah banner atau sponsor resmi pertama Anda.
          </p>
          <Button onClick={handleOpenAdd} className="gap-2 font-bold rounded-xl">
            <Plus className="w-4 h-4" /> Tambah Banner Pertama
          </Button>
        </Card>
      ) : (
        /* Banner List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                {/* Preview Header */}
                <div className={`relative p-6 bg-gradient-to-r ${banner.bgGradient || "from-slate-900 to-indigo-950"} text-white min-h-[160px] flex flex-col justify-between`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {banner.isSponsor ? (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Sponsor
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-400/40 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Promo
                        </Badge>
                      )}
                      {banner.tag && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {banner.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60 font-semibold">Urutan: #{banner.orderNumber}</span>
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => handleToggleActive(banner)}
                        aria-label="Toggle active status"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-extrabold uppercase line-clamp-1">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5 font-medium">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Content & Details */}
                <CardContent className="p-4 text-xs space-y-2">
                  {banner.sponsorName && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-semibold">Sponsor:</span>
                      <span className="font-bold text-foreground">{banner.sponsorName}</span>
                    </div>
                  )}

                  {banner.description && (
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                      {banner.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 text-muted-foreground border-t border-border/40">
                    <span className="font-semibold">CTA Button:</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      {banner.ctaText} ({banner.ctaLink}) <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${banner.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-500/10 text-zinc-500"}`}>
                  {banner.isActive ? "● Aktif" : "○ Non-Aktif"}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(banner)}
                    className="h-8 gap-1 font-bold text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(banner.id)}
                    className="h-8 gap-1 font-bold text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingBanner ? "Edit Banner / Sponsor" : "Tambah Banner / Sponsor Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">Judul Banner *</label>
                <Input
                  required
                  placeholder="Misal: WACOM FESTIVAL SPONSOR"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Sub-Judul</label>
                <Input
                  placeholder="Misal: Dukung Komikus Lokal Indonesia"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
            </div>

            {/* Tag Sticker & Sponsor Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">Tag Sticker Banner</label>
                <Input
                  placeholder="Misal: OFFICIAL SPONSOR, SPOTLIGHT PROMO"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/20">
                <div>
                  <span className="text-xs font-bold block">Status Sponsor</span>
                  <span className="text-[10px] text-muted-foreground">Tandai jika banner ini adalah logo/promo sponsor</span>
                </div>
                <Switch
                  checked={formData.isSponsor}
                  onCheckedChange={(val: boolean) => setFormData({ ...formData, isSponsor: val })}
                />
              </div>
            </div>

            {/* Nama Sponsor jika isSponsor */}
            {formData.isSponsor && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold">Nama Perusahaan / Brand Sponsor</label>
                <Input
                  placeholder="Misal: WACOM INDONESIA"
                  value={formData.sponsorName}
                  onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                />
              </div>
            )}

            {/* Deskripsi Singkat */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold">Deskripsi Banner</label>
              <Textarea
                rows={2}
                placeholder="Penjelasan singkat mengenai event promo atau penawaran sponsor..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Upload Gambar Banner */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold">Gambar Banner / Poster Promo</label>
              <ImageUploadInput
                value={formData.imageUrl}
                onChange={(url: string) => setFormData({ ...formData, imageUrl: url })}
                aspectHint="Unggah Poster Banner atau Logo Sponsor (Ukuran disarankan 800x400 px)"
              />
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">Teks Tombol Aksi (CTA)</label>
                <Input
                  placeholder="Misal: BACA SEKARANG, DAFTAR FESTIVAL"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Link Tujuan Tombol</label>
                <Input
                  placeholder="Misal: /festival atau https://..."
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                />
              </div>
            </div>

            {/* Gradient Background Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">Urutan Tampil (Order Number)</label>
                <Input
                  type="number"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/20">
                <div>
                  <span className="text-xs font-bold block">Status Publikasi</span>
                  <span className="text-[10px] text-muted-foreground">Tampilkan banner di Halaman Utama</span>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val: boolean) => setFormData({ ...formData, isActive: val })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="font-bold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
