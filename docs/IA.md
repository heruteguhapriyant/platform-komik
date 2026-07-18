# Kastuart

# Information Architecture (IA)

## Admin

-   Dashboard
    -   Ringkasan
    -   Statistik
    -   Acara Berlangsung
    -   Aktivitas Terbaru
-   Kategori
    -   Daftar Kategori
-   Acara
    -   Daftar Acara
    -   Detail Acara
        -   Informasi
        -   Tahapan
            -   Daftar Tahapan
            -   Detail Tahapan
                -   Informasi Tahapan
                -   Submission Tahapan
        -   Peserta
            -   Daftar Peserta
            -   Detail Peserta
                -   Biodata
                -   Proposal
                -   Progress
                -   Karya
        -   Publikasi
            -   Daftar Karya
            -   Detail Karya
                -   Informasi Karya
                -   Status Publikasi
-   User
    -   Admin
    -   Peserta
    -   Detail User
-   Pengaturan
    -   Profil Admin
    -   Website
    -   Logo & Branding

## Peserta

-   Dashboard
    -   Ringkasan
    -   Acara Diikuti
    -   Aktivitas Terbaru
-   Acara
    -   Daftar Acara
    -   Detail Acara
        -   Informasi Festival
        -   Timeline
        -   Persyaratan
        -   Kategori
        -   Progress Peserta (Dynamic)
            -   Belum Mengikuti → Ikuti Festival
            -   Proposal Direview → Lihat Proposal
            -   Tahap Berjalan → Upload Hasil
            -   Menunggu Review → Menunggu Validasi
            -   Festival Selesai → Lihat Karya
-   Profil
    -   Biodata
    -   Akun
    -   Keamanan
-   Bantuan

## Public

-   Beranda
    -   Hero Banner
    -   Festival Berlangsung
    -   Festival Terbaru
    -   Kategori
    -   Komik Terbaru
-   Festival
    -   Daftar Festival
        -   Pencarian
        -   Filter Kategori
    -   Detail Festival
        -   Informasi Festival
        -   Timeline
        -   Kategori
        -   Pencarian Karya
        -   Daftar Karya
            -   Detail Karya
                -   Cover
                -   Sinopsis
                -   Author
                -   Kategori
                -   Baca Flipbook
-   Tentang
-   Login

# Catatan

-   Festival adalah pusat sistem.
-   Tahapan bersifat dinamis (tidak di-hardcode).
-   One Event, One Page untuk peserta.
-   Progress mengikuti tahapan yang dibuat admin.
-   Submission terkait dengan tahapan.
-   Publikasi terpisah dari progress.
-   Siklus publikasi: Belum Dipublikasikan → Dipublikasikan → Tarik
    Publikasi.
-   Flipbook hanya tersedia setelah Finishing disetujui dan karya
    dipublikasikan.
-   Public hanya melihat karya yang sudah dipublikasikan.
