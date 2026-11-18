# Product Requirements Document (PRD)

## Kastuart

**Platform Festival Komik Digital dengan Flipbook**

## Latar Belakang

Platform ini dibuat untuk memfasilitasi penyelenggaraan festival atau lomba komik digital secara online. Sistem memungkinkan admin mengelola acara, peserta mengikuti setiap tahapan festival, dan karya final dipublikasikan dalam bentuk flipbook yang dapat dibaca oleh masyarakat.

## Tujuan

* Mempermudah penyelenggaraan festival atau lomba komik digital.
* Mempermudah peserta mengirim karya pada setiap tahapan.
* Memudahkan admin memonitor progres peserta.
* Menyediakan media publikasi karya dalam bentuk flipbook digital.
* Menampilkan karya terbaik kepada masyarakat melalui halaman publik.

## Jenis Pengguna

### Admin

* Login
* Mengelola kategori
* Membuat acara
* Menentukan tahapan acara
* Melihat pendaftaran peserta
* Menyetujui atau menolak proposal
* Melihat progres peserta
* Memvalidasi setiap tahapan
* Mempublikasikan karya final

### Peserta

* Registrasi akun
* Melengkapi biodata
* Memilih acara
* Mengirim proposal
* Melihat status proposal
* Melihat progres acara
* Mengunggah hasil pada setiap tahapan
* Melihat status validasi setiap tahap

### Public

* Melihat daftar festival
* Melihat daftar karya yang telah dipublikasikan
* Membaca komik dalam bentuk flipbook
* Melihat informasi karya

## Prinsip Sistem

* Festival merupakan pusat dari seluruh sistem.
* Setiap acara memiliki tahapan yang bersifat dinamis.
* Detail acara peserta menggunakan konsep **One Event, One Page**.
* Progress peserta dan publikasi merupakan dua proses yang berbeda.
* Flipbook hanya tersedia untuk karya yang telah dipublikasikan.

## Flow Sistem

### Admin

1. Login
2. Membuat Kategori
3. Membuat Acara
4. Menentukan Tahapan Acara
5. Membuka Pendaftaran
6. Review Proposal
7. Monitoring Progress Peserta
8. Validasi Tahapan
9. Publikasi Karya Final

### Peserta

1. Registrasi
2. Lengkapi Biodata
3. Pilih Acara
4. Submit Proposal
5. Menunggu Persetujuan
6. Proposal Diterima
7. Mengikuti Tahapan Acara
8. Upload Hasil Tahapan
9. Menunggu Validasi Admin
10. Melanjutkan ke Tahapan Berikutnya hingga Selesai

### Public

1. Melihat Daftar Festival
2. Memilih Festival
3. Melihat Daftar Karya
4. Memilih Karya
5. Membaca Flipbook

## Modul Sistem

### Kategori

Admin dapat membuat, mengubah, dan menghapus kategori.

### Acara

Admin dapat membuat dan mengelola acara beserta informasi festival.

### Tahapan

Tahapan dibuat oleh admin untuk setiap acara dan bersifat dinamis.

Contoh:

* Administrasi
* Sketch
* Line Art
* Coloring
* Finishing

atau

* Storyboard
* Final Artwork

### Proposal

Peserta mengirim:

* Sinopsis
* Cerita
* Cover

Admin:

* Approve
* Reject

### Progress Peserta

```text
✓ Proposal

🔄 Sketch

[ Upload Hasil ]

🔒 Line Art

🔒 Coloring

🔒 Finishing
```

Peserta hanya dapat mengunggah file pada tahapan yang sedang berjalan.

### Publikasi

Publikasi dilakukan setelah seluruh tahapan selesai dan tahap Finishing telah disetujui oleh admin.

Siklus publikasi:

```text
Belum Dipublikasikan
        │
        ▼
Dipublikasikan
        │
        ▼
Tarik Publikasi (jika diperlukan)
```

Hanya karya dengan status **Dipublikasikan** yang akan muncul pada halaman Public dan dapat dibaca dalam bentuk flipbook.

## Fitur Utama

### Admin

* Login
* CRUD Kategori
* CRUD Acara
* Kelola Tahapan
* Approve Proposal
* Monitoring Peserta
* Validasi Tahapan
* Kelola Publikasi Karya

### Peserta

* Registrasi
* Login
* Biodata
* Pilih Acara
* Submit Proposal
* Upload Hasil Tahapan
* Melihat Progress

### Public

* Beranda
* Daftar Festival
* Detail Festival
* Detail Karya
* Flipbook Reader

## Aturan Sistem

* Festival merupakan pusat dari seluruh sistem.
* **Poster & Cover Gambar:** Rasio disarankan 3:4 Portrait (contoh: 600 x 800 px atau 900 x 1200 px) agar tampilan poster/cover tidak terpotong.
* **Upload Berkas PDF Flipbook:** Berformat `.pdf` dengan ukuran maksimal 20 MB per file, disarankan rasio halaman Portrait A4 (1240 x 1754 px) atau 3:4 (1200 x 1600 px).
* **Pembersihan Draf Berkas:** Admin dapat menghapus draf berkas PDF dari tahapan awal (sebelum tahap akhir) dari server penyimpanan untuk menghemat ruang disk.
* Peserta harus memiliki akun.
* Peserta wajib melengkapi biodata.
* Peserta memilih satu acara sebelum mengirim proposal.
* Proposal harus disetujui admin sebelum mengikuti tahapan.
* Tahapan bersifat dinamis dan ditentukan oleh admin pada setiap acara.
* Peserta hanya dapat mengunggah file pada tahapan yang sedang berjalan.
* Tahapan berikutnya akan terbuka setelah tahapan sebelumnya divalidasi oleh admin.
* Progress peserta dan publikasi merupakan dua proses yang berbeda.
* Hanya karya yang telah menyelesaikan seluruh tahapan dan disetujui admin yang dapat dipublikasikan.
* Public hanya dapat melihat karya yang berstatus **Dipublikasikan**.
* Flipbook hanya tersedia untuk karya yang telah dipublikasikan.
