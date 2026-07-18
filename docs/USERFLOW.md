# User Flow - Kastuart

## Admin

### Flow 1 - Login

``` text
Login
↓
Dashboard
```

### Flow 2 - Kelola Kategori

``` text
Dashboard
↓
Kategori
↓
Tambah / Edit / Hapus Kategori
```

### Flow 3 - Kelola Acara

``` text
Dashboard
↓
Acara
↓
Tambah Acara
↓
Isi Informasi Acara
↓
Simpan
```

### Flow 4 - Kelola Tahapan

``` text
Daftar Acara
↓
Detail Acara
↓
Tahapan
↓
Tambah / Edit / Hapus Tahapan
```

### Flow 5 - Review Proposal

``` text
Detail Acara
↓
Peserta
↓
Detail Peserta
↓
Review Proposal
↓
Approve / Reject
```

### Flow 6 - Review Submission

``` text
Detail Acara
↓
Tahapan
↓
Submission Tahapan
↓
Review Submission
↓
Approve / Revisi
```

### Flow 7 - Publikasi

``` text
Detail Acara
↓
Publikasi
↓
Detail Karya
↓
Publikasikan / Tarik Publikasi
```

------------------------------------------------------------------------

## Peserta

### Flow 1 - Registrasi

``` text
Registrasi
↓
Login
↓
Lengkapi Biodata
```

### Flow 2 - Mengikuti Festival

``` text
Dashboard
↓
Daftar Acara
↓
Detail Acara
↓
Ikuti Festival
↓
Submit Proposal
```

### Flow 3 - Proposal

``` text
Submit Proposal
↓
Menunggu Review
↓
Disetujui / Ditolak
```

### Flow 4 - Tahapan

``` text
Progress
↓
Upload Hasil
↓
Menunggu Validasi
↓
Tahapan Berikutnya
```

### Flow 5 - Selesai

``` text
Semua Tahapan Selesai
↓
Menunggu Publikasi
↓
Lihat Karya
```

------------------------------------------------------------------------

## Public

### Flow 1 - Membaca Karya

``` text
Beranda
↓
Festival
↓
Detail Festival
↓
Daftar Karya
↓
Detail Karya
↓
Baca Flipbook
```

------------------------------------------------------------------------

# Catatan

-   Festival merupakan pusat seluruh alur sistem.
-   Detail Festival menggunakan konsep **One Event, One Page**.
-   Tahapan bersifat dinamis sesuai konfigurasi admin.
-   Peserta hanya dapat mengunggah pada tahapan yang sedang aktif.
-   Flipbook hanya tersedia setelah karya dipublikasikan.
