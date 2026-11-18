# Prompt Induk: Bangun Repository Rangkuman Kuliah

Dokumen ini berisi prompt yang dapat dipakai ulang untuk membangun repository catatan kuliah seperti ini. Isi blok **VARIABEL**, lampirkan PDF materi, lalu jalankan di agent yang punya akses berkas dan Git.

---

## Prompt (salin mulai dari sini)

```text
Kamu adalah asisten yang membangun repositori dokumentasi kuliah di GitHub.
Bangun SATU repositori lengkap dari PDF materi yang saya lampirkan, mengikuti
spesifikasi di bawah ini secara persis. Jangan bertanya; ambil keputusan terbaik
dan laporkan asumsi di akhir.

=== VARIABEL ===
MATA_KULIAH   = Sistem Terdistribusi dan Terdesentralisasi
KODE_MK       = FIF25002T
SKS           = 3
DOSEN         = Dr. Bambang Purnomosidi D. P.
PRODI         = Informatika
FAKULTAS      = Fakultas Teknologi Informasi, UTDI
NAMA          = <nama lengkap>
NIM           = <NIM>
SEMESTER      = <semester>
REPO          = rangkuman-sistem-terdistribusi
VISIBILITAS   = public
JUMLAH_MINGGU = 6
AI_LABEL      = <nama model AI yang dipakai>
LISENSI       = MIT
=== AKHIR VARIABEL ===

=== INPUT ===
PDF materi minggu 1..N dengan nama berkas NN--topik.pdf, plus arsip kode
pendamping (.zip/.tar.bz2) bila ada. Jika materi suatu minggu belum tersedia,
buat placeholder yang rapi dan tandai Status: menunggu materi.

=== STRUKTUR REPO (wajib) ===
README.md
LICENSE
.gitignore
.editorconfig
.markdownlint.json
docs/prompt-template.md        <- salinan prompt ini
tools/extract-pdf.mjs          <- skrip ekstraksi teks PDF
tools/package.json
01/README.md
02/README.md
...
NN/README.md
NN/kode/README.md              <- HANYA jika materi punya kode
NN/kode/...                    <- pertahankan struktur asli dari arsip

Jangan menyalin berkas PDF asli ke repo.
Jangan pernah commit .venv, venv, __pycache__, node_modules, .env, atau berkas > 5 MB.

=== ANATOMI BAKU tiap NN/README.md ===
1. Judul: "# Materi Minggu N: <Topik>"
2. Blok metadata dalam code fence "text":
   Materi Minggu N: <Topik>
   AI yang digunakan: <AI_LABEL>
   Prompt: <ringkasan prompt yang dipakai, 1-3 baris>
   Bagian yang disesuaikan dari keluaran prompt ada pada: <daftar singkat>
3. Blockquote: Mata kuliah, Program studi, Dosen, Sumber (nama berkas), Status, Kode (tautan)
4. "## Tujuan Pembelajaran" (bullet, sesuai slide)
5. Isi materi bernomor "## 1.", "## 2.", ... mengikuti urutan agenda slide
6. Tabel pembanding untuk setiap konsep yang punya >= 2 alternatif
7. Minimal 1 analogi per konsep abstrak + 1 contoh konkret/angka
8. Algoritma/protokol: langkah bernomor + contoh perhitungan manual
9. Kode: tabel fungsi/parameter + cara menjalankan + output yang diharapkan
10. "## Pembahasan Pertanyaan Diskusi" — hanya jika slide memuat pertanyaan diskusi; jawab dengan alasan, bukan salinan slide
11. "## Ringkasan Cepat" (7-10 bullet)
12. "## Daftar Istilah" (tabel >= 10 entri)
13. Footer navigasi:
    [← Minggu sebelumnya](../NN-1/README.md) · [Daftar materi](../README.md) · [Minggu berikutnya →](../NN+1/README.md)

=== ATURAN ISI ===
- Bahasa Indonesia baku dan teknis; tanpa basa-basi.
- JANGAN menyalin kalimat slide verbatim. Parafrase dan susun ulang.
- Jangan identik dengan repo/referensi lain; analogi dan contoh harus orisinal.
- Pertahankan istilah asing (dimiringkan) serta angka/fakta dari materi; jangan mengarang.
- Sebutkan versi perangkat lunak bila materi menyebutkannya (mis. PostgreSQL 18, Hadoop 3.5.0).
- Jika materi ambigu, tandai "(perlu konfirmasi)" alih-alih menebak.
- Panjang wajar 200-350 baris per minggu; konsisten antar minggu.

=== README.md UTAMA ===
- Judul + 4 badge statis (format, jumlah materi, lisensi, status)
- Ringkasan 2-3 kalimat
- "## Identitas Penulis" dalam tabel (Nama, NIM, Prodi, Fakultas, Mata Kuliah, Kode/SKS, Semester)
- "## Daftar Materi": tabel Minggu | Topik | Ringkasan | Kode
- "## Struktur Repository": code fence tree
- "## Cara Menjalankan Kode": tabel prasyarat + perintah per minggu
- "## Format Penulisan": blok metadata baku
- "## Sumber": dosen, lecture note, dokumentasi resmi
- "## Catatan Akademik": transparansi penggunaan AI
- "## Lisensi": tautan ke LICENSE

=== GIT ===
- git init -b main
- Satu commit per minggu: "Minggu N: <Judul Topik>" (tanpa prefix docs/chore)
- Commit Minggu 1 membawa: README.md, LICENSE, .gitignore, .editorconfig,
  .markdownlint.json, docs/, tools/, dan 01/
- Push ke origin main. Jangan pernah menaruh token/rahasia di repo.

=== SELESAIKAN DENGAN ===
1. Tabel status: minggu | file | jumlah baris | ada kode/tidak
2. Daftar asumsi yang diambil
3. Daftar hal yang perlu diisi manual (mis. identitas penulis)
```

## Catatan pemakaian

- **Satu prompt, satu repo.** Semua variabel diisi sekali di awal; prompt tidak perlu diulang per minggu.
- **PDF sebagai satu-satunya sumber fakta.** Jika model tidak bisa membaca PDF, jalankan `node tools/extract-pdf.mjs materi.pdf hasil.txt` lalu lampirkan/berikan isi `hasil.txt`.
- **Kode pendamping** sebaiknya diekstrak ke `NN/kode/` dengan struktur asli, tanpa `.venv` dan cache.
- **Konsistensi lebih penting daripada panjang.** Lebih baik 250 baris konsisten di enam minggu daripada 500 baris di satu minggu dan 120 di minggu lain.
