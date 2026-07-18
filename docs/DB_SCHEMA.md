````markdown
# Database Schema v1.0

## users

```text
users
──────────────────────────
id
name
email
password
role
status
created_at
updated_at
```

### role

```text
admin
participant
```

### status

```text
active
inactive
banned
```

---

## participant_profiles

```text
participant_profiles
──────────────────────────
id
user_id
fullname
nickname
birth_date
gender
phone
address
photo
bio
created_at
updated_at
```

---

## categories

```text
categories
──────────────────────────
id
name
slug
description
created_at
updated_at
```

---

## festivals

```text
festivals
──────────────────────────
id
category_id
title
slug
description
poster
start_registration
end_registration
start_event
end_event
status
created_by
created_at
updated_at
```

### status

```text
draft

published

registration_closed

judging

finished

archived
```

---

## festival_stages

```text
festival_stages
──────────────────────────
id
festival_id
title
description
order_number
deadline
created_at
updated_at
```

Contoh:

```text
Administrasi

Sketch

Line Art

Coloring

Finishing
```

atau

```text
Storyboard

Illustration

Final Artwork
```

---

## festival_participants

```text
festival_participants
──────────────────────────
id
festival_id
user_id
status
joined_at
created_at
updated_at
```

### status

```text
registered

proposal_review

active

completed

disqualified
```

---

## proposals

```text
proposals
──────────────────────────
id
festival_participant_id
title
synopsis
story
cover
status
review_note
approved_at
created_at
updated_at
```

### status

```text
pending

approved

rejected
```

---

## works

Setelah proposal disetujui, sistem akan membuat satu data karya untuk peserta.

```text
works
──────────────────────────
id
festival_participant_id
title
author
description
cover
status
created_at
updated_at
```

### status

```text
draft

ongoing

finished
```

---

## submissions

Seluruh hasil upload peserta pada setiap tahapan disimpan pada tabel ini.

```text
submissions
──────────────────────────
id
work_id
festival_stage_id
file
file_name
file_size
status
review_note
submitted_at
reviewed_at
reviewed_by
created_at
updated_at
```

### status

```text
pending

approved

revision
```

---

## publications

Publikasi dipisahkan dari data karya agar proses publikasi dapat dikelola secara mandiri.

```text
publications
──────────────────────────
id
work_id
status
published_at
published_by
created_at
updated_at
```

### status

```text
unpublished

published

withdrawn
```

---

## activity_logs (Opsional)

Digunakan untuk mencatat aktivitas pengguna di dalam sistem.

```text
activity_logs
──────────────────────────
id
user_id
activity
reference_table
reference_id
ip_address
created_at
```

Contoh aktivitas:

```text
Login

Logout

Create Festival

Approve Proposal

Approve Submission

Publish Work
```

---

# Relasi Antar Tabel

```text
users
│
├── participant_profiles (1:1)
│
├── festivals (1:N)
│      created_by
│
├── festival_participants (1:N)
│
└── activity_logs (1:N)


categories
│
└── festivals (1:N)


festivals
│
├── festival_stages (1:N)
│
└── festival_participants (1:N)


festival_participants
│
├── proposals (1:1)
│
└── works (1:1)


works
│
├── submissions (1:N)
│
└── publications (1:1)


festival_stages
│
└── submissions (1:N)
```

---

# Alur Data

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
Peserta Mendaftar
        │
        ▼
festival_participants
        │
        ▼
Proposal
        │
        ▼
Disetujui
        │
        ▼
Work Dibuat
        │
        ▼
Upload Submission
        │
        ▼
Review Admin
        │
        ▼
Tahap Berikutnya
        │
        ▼
Semua Tahapan Selesai
        │
        ▼
Publication
        │
        ▼
Public
        │
        ▼
Flipbook
```

---

# Catatan Perancangan

- Festival merupakan pusat dari seluruh sistem.
- Setiap festival memiliki kategori dan tahapan yang bersifat dinamis.
- Peserta dapat mengikuti banyak festival, sehingga menggunakan tabel `festival_participants` sebagai relasi.
- Proposal digunakan sebagai proses pendaftaran peserta ke festival.
- Setelah proposal disetujui, sistem membuat satu data `work` sebagai objek utama yang akan dikerjakan peserta.
- Setiap tahapan menghasilkan satu `submission` yang akan direview oleh admin.
- Progress peserta dihitung berdasarkan status submission pada setiap tahapan.
- Setelah seluruh tahapan selesai, admin dapat mempublikasikan karya.
- Flipbook hanya mengambil data dari karya yang telah berstatus `published`.
- Struktur database dirancang agar mudah dikembangkan untuk fitur penilaian juri, komentar reviewer, notifikasi, maupun riwayat revisi di masa mendatang tanpa mengubah struktur utama.
````
