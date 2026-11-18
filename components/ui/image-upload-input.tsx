"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  disabled?: boolean;
  aspectHint?: string;
}

export function ImageUploadInput({
  id,
  name,
  value,
  onChange,
  placeholder = "Unggah gambar atau tempelkan URL",
  disabled = false,
  aspectHint = "Rasio disarankan 3:4 Portrait (contoh: 600x800 px) agar tampilan tidak terpotong",
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP, GIF).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        toast.success("Gambar berhasil diunggah!");
      } else {
        toast.error(data.error || "Gagal mengunggah gambar.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden input to pass value in FormData if used inside traditional form */}
      {name && <input type="hidden" id={id} name={name} value={value} />}

      {value ? (
        /* Image Preview Box */
        <div className="relative group rounded-lg border bg-muted/30 p-2 flex items-center gap-3">
          <div className="relative h-20 w-16 bg-muted rounded overflow-hidden shrink-0 border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 text-xs space-y-1">
            <p className="font-medium text-foreground truncate">{value}</p>
            <p className="text-muted-foreground">Gambar Siap Terpasang</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Ganti
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={disabled || isUploading}
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div className="space-y-2">
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              disabled || isUploading
                ? "opacity-50 cursor-not-allowed bg-muted/10 border-border"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengunggah gambar...
              </div>
            ) : (
              <div className="space-y-1 py-1">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto opacity-60" />
                <p className="text-xs font-medium text-foreground">
                  Pilih file gambar dari komputer
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Format: PNG, JPG, JPEG, WebP (Maksimal 5MB)
                </p>
                {aspectHint && (
                  <p className="text-[10px] text-primary/80 font-medium pt-0.5">
                    💡 {aspectHint}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <button
              type="button"
              className="hover:underline flex items-center gap-1"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <LinkIcon className="h-3 w-3" />
              {showUrlInput ? "Sembunyikan Input Link URL" : "Atau masukkan Link URL secara manual"}
            </button>
          </div>

          {showUrlInput && (
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || isUploading}
              className="text-xs"
            />
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
