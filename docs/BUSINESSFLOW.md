# Business Flow

## Kastuart

Business Flow menjelaskan bagaimana data bergerak di dalam sistem Kastuart, mulai dari admin membuat festival hingga karya dipublikasikan kepada masyarakat.

---

# 1. Festival Lifecycle

Festival merupakan pusat dari seluruh sistem.

Seluruh proses bisnis dimulai dari Festival.

```text
Draft
    │
    ▼
Published
    │
    ▼
Registration Closed
    │
    ▼
Judging
    │
    ▼
Finished
    │
    ▼
Archived
```

### Keterangan

**Draft**

Festival masih disusun oleh admin.

- Informasi dapat diubah.
- Tahapan dapat ditambah atau diubah.
- Belum dapat diikuti peserta.

**Published**

Festival telah dipublikasikan.

- Peserta dapat melihat informasi.
- Peserta dapat mengikuti festival.
- Proposal dapat dikirim.

**Registration Closed**

Pendaftaran ditutup.

- Tidak menerima peserta baru.
- Proposal baru tidak dapat dikirim.

**Judging**

Festival memasuki proses penilaian.

- Admin melakukan review.
- Peserta hanya dapat mengikuti tahapan yang tersedia.

**Finished**

Festival telah selesai.

- Seluruh tahapan telah berakhir.
- Admin dapat melakukan publikasi karya.

**Archived**

Festival menjadi arsip.

- Tidak dapat diubah.
- Tetap dapat dilihat oleh public.

---

# 2. Proposal Flow

Proposal merupakan pintu masuk peserta menuju festival.

```text
Belum Mengikuti
        │
        ▼
Ikuti Festival
        │
        ▼
Submit Proposal
        │
        ▼
Menunggu Review
        │
        ├───────────────┐
        ▼               ▼
Disetujui          Ditolak
        │               │
        ▼               ▼
Masuk Tahap 1     Revisi Proposal
                        │
                        ▼
                  Submit Ulang
```

---

# 3. Tahapan Flow

Tahapan ditentukan oleh admin dan bersifat dinamis.

Contoh:

```text
Administrasi
        │
        ▼
Sketch
        │
        ▼
Line Art
        │
        ▼
Coloring
        │
        ▼
Finishing
```

atau

```text
Storyboard
        │
        ▼
Illustration
        │
        ▼
Final Artwork
```

Business Flow mengikuti urutan tahapan, bukan nama tahapan.

---

# 4. Submission Flow

Pada setiap tahapan peserta wajib mengirimkan hasil.

```text
Tahap Aktif
        │
        ▼
Upload Hasil
        │
        ▼
Menunggu Review
        │
        ├───────────────┐
        ▼               ▼
Disetujui          Revisi
        │               │
        ▼               ▼
Tahap Berikutnya   Upload Ulang
```

Peserta hanya dapat mengunggah hasil pada tahapan yang sedang aktif.

---

# 5. Progress Flow

Progress peserta dibentuk secara otomatis berdasarkan hasil validasi admin.

Contoh:

```text
✓ Proposal

🔄 Sketch

🔒 Line Art

🔒 Coloring

🔒 Finishing
```

Setelah Sketch selesai.

```text
✓ Proposal

✓ Sketch

🔄 Line Art

🔒 Coloring

🔒 Finishing
```

Progress tidak dapat diubah secara manual oleh peserta.

---

# 6. Publikasi Flow

Publikasi merupakan proses terpisah dari Progress.

```text
Finishing
        │
        ▼
Disetujui
        │
        ▼
Belum Dipublikasikan
        │
        ▼
Dipublikasikan
        │
        ▼
Tarik Publikasi
```

Keterangan:

**Belum Dipublikasikan**

Karya telah selesai tetapi belum tampil di Public.

**Dipublikasikan**

Karya tampil pada halaman Public.

**Tarik Publikasi**

Admin menyembunyikan karya dari halaman Public.

---

# 7. Public Flow

Public hanya melihat karya yang telah dipublikasikan.

```text
Beranda
        │
        ▼
Festival
        │
        ▼
Detail Festival
        │
        ▼
Daftar Karya
        │
        ▼
Detail Karya
        │
        ▼
Flipbook
```

---

# Ringkasan Business Flow

```text
Admin
    │
    ▼
Membuat Festival
    │
    ▼
Menentukan Tahapan
    │
    ▼
Festival Dipublikasikan
    │
    ▼
Peserta Mengikuti Festival
    │
    ▼
Submit Proposal
    │
    ▼
Proposal Disetujui
    │
    ▼
Mengikuti Tahapan
    │
    ▼
Upload Hasil
    │
    ▼
Review Admin
    │
    ▼
Finishing
    │
    ▼
Publikasi
    │
    ▼
Public Membaca Flipbook
```

---

# Business Rules

- Festival merupakan pusat seluruh sistem.
- Tahapan bersifat dinamis dan ditentukan oleh admin.
- Proposal harus disetujui sebelum peserta dapat mengikuti tahapan.
- Peserta hanya dapat mengunggah hasil pada tahapan yang sedang aktif.
- Progress peserta dihitung berdasarkan hasil validasi admin.
- Publikasi merupakan proses yang terpisah dari Progress.
- Flipbook hanya tersedia untuk karya yang telah dipublikasikan.
- Public hanya dapat melihat karya dengan status **Dipublikasikan**.